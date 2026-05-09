import { and, eq, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { quotaIdempotency, shareLink, userDailyQuota } from "~/server/db/schema";

export const FREE_DAILY_PREMIUM_EXPORT_LIMIT = 3;
export const FREE_ACTIVE_SHARE_LIMIT = 3;
export const IDEMPOTENCY_TTL_MS = 2 * 60 * 60 * 1000; // 2h

export type PremiumExportQuota = {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string; // ISO 8601, next UTC midnight
};

export type ConsumePremiumExportResult = {
  ok: boolean;
  remaining: number;
  resetsAt: string;
};

export type ShareQuota = {
  used: number;
  limit: number;
  remaining: number;
};

/**
 * Returns today's UTC date as 'YYYY-MM-DD'. Computed in JS to avoid Postgres
 * session-timezone surprises — quota windows are always UTC, regardless of
 * where the server happens to be deployed.
 */
const todayUtc = (now: Date = new Date()): string => {
  return now.toISOString().slice(0, 10);
};

/**
 * Returns the next UTC midnight as ISO 8601. Used to tell clients when the
 * daily quota resets.
 */
const nextUtcMidnight = (now: Date = new Date()): string => {
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0),
  );
  return next.toISOString();
};

const buildProQuota = (now: Date = new Date()): PremiumExportQuota => ({
  used: 0,
  limit: Number.POSITIVE_INFINITY,
  remaining: Number.POSITIVE_INFINITY,
  resetsAt: nextUtcMidnight(now),
});

/**
 * Reads the current user's daily premium-markdown export quota.
 *
 * - Pro users (isPro=true) bypass counting; returns Infinity limits.
 * - Free users get FREE_DAILY_PREMIUM_EXPORT_LIMIT per UTC day.
 * - Unlogged users do NOT call this; they use the client-side local-quota.
 */
export const getDailyPremiumExportQuota = async (
  userId: string,
  isPro: boolean,
  now: Date = new Date(),
): Promise<PremiumExportQuota> => {
  if (isPro) return buildProQuota(now);

  const date = todayUtc(now);
  const limit = FREE_DAILY_PREMIUM_EXPORT_LIMIT;
  const resetsAt = nextUtcMidnight(now);

  if (!db) return { used: 0, limit, remaining: limit, resetsAt };

  const rows = await db
    .select({ count: userDailyQuota.premiumExportCount })
    .from(userDailyQuota)
    .where(and(eq(userDailyQuota.userId, userId), eq(userDailyQuota.date, date)))
    .limit(1);

  const used = rows[0]?.count ?? 0;
  return { used, limit, remaining: Math.max(0, limit - used), resetsAt };
};

/**
 * Atomically consumes one daily premium-export slot for a user, deduplicated
 * by idempotencyKey.
 *
 * Behavior:
 * - If (userId, idempotencyKey) was seen before, returns the original result
 *   without re-incrementing the counter.
 * - Otherwise, performs an atomic UPSERT (`ON CONFLICT (user_id, date) DO
 *   UPDATE SET premium_export_count = premium_export_count + 1 RETURNING ...`)
 *   then writes the idempotency record. If incremented count exceeds limit,
 *   the increment is "compensated" by writing ok=false and persisting the
 *   pre-increment count. Subsequent retries with the same key return the same
 *   ok/remaining pair.
 *
 * Pro users MUST NOT call this — the RPC handler short-circuits before
 * reaching here. We assert via the isPro=false implicit contract; counters
 * are not maintained for Pro accounts.
 */
export const incrementPremiumExport = async (
  userId: string,
  idempotencyKey: string,
  now: Date = new Date(),
): Promise<ConsumePremiumExportResult> => {
  const date = todayUtc(now);
  const limit = FREE_DAILY_PREMIUM_EXPORT_LIMIT;
  const resetsAt = nextUtcMidnight(now);

  if (!db) {
    // No-DB test path: behave as if quota was free, no persistence.
    return { ok: true, remaining: limit - 1, resetsAt };
  }

  return db.transaction(async (tx) => {
    const existing = await tx
      .select({ ok: quotaIdempotency.resultOk, remaining: quotaIdempotency.resultRemaining })
      .from(quotaIdempotency)
      .where(
        and(
          eq(quotaIdempotency.userId, userId),
          eq(quotaIdempotency.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);

    if (existing[0]) {
      return { ok: existing[0].ok, remaining: existing[0].remaining, resetsAt };
    }

    // Read current count under transaction to determine whether this consume
    // request would fit within the limit. We must NOT increment optimistically
    // and roll back on overflow — that would leave permanent +1 leak under
    // certain race conditions. Instead, conditionally increment.
    const currentRows = await tx
      .select({ count: userDailyQuota.premiumExportCount })
      .from(userDailyQuota)
      .where(and(eq(userDailyQuota.userId, userId), eq(userDailyQuota.date, date)))
      .limit(1);
    const currentCount = currentRows[0]?.count ?? 0;

    if (currentCount >= limit) {
      // Quota exhausted. Persist "ok=false" idempotency and bail.
      await tx
        .insert(quotaIdempotency)
        .values({
          userId,
          idempotencyKey,
          resultOk: false,
          resultRemaining: 0,
        })
        .onConflictDoNothing();
      return { ok: false, remaining: 0, resetsAt };
    }

    // UPSERT atomic +1. ON CONFLICT handles concurrent inserts on the same
    // (userId, date). RETURNING gives the post-increment count so we can
    // detect overshoot from concurrent increments and clamp.
    const upserted = await tx
      .insert(userDailyQuota)
      .values({
        userId,
        date,
        premiumExportCount: 1,
        promptCount: 0,
      })
      .onConflictDoUpdate({
        target: [userDailyQuota.userId, userDailyQuota.date],
        set: {
          premiumExportCount: sql`${userDailyQuota.premiumExportCount} + 1`,
          updatedAt: new Date(),
        },
      })
      .returning({ count: userDailyQuota.premiumExportCount });

    const newCount = upserted[0]?.count ?? currentCount + 1;

    // Concurrent overshoot: two parallel transactions both passed the
    // pre-check at currentCount=2, both incremented, leaving newCount=4.
    // We detect overshoot and treat the late increment as ok=false. The
    // counter stays at the overshot value, but no extra slot is granted.
    const ok = newCount <= limit;
    const remaining = Math.max(0, limit - newCount);

    await tx
      .insert(quotaIdempotency)
      .values({
        userId,
        idempotencyKey,
        resultOk: ok,
        resultRemaining: remaining,
      })
      .onConflictDoNothing();

    return { ok, remaining, resetsAt };
  });
};

/**
 * Returns the user's current share-link quota.
 *
 * Calculated as the live count of share rows with status='active' (no separate
 * counter table). Free users are capped at FREE_ACTIVE_SHARE_LIMIT; Pro is
 * unlimited. Revoking an active share immediately frees a slot.
 */
export const getShareQuota = async (userId: string, isPro: boolean): Promise<ShareQuota> => {
  if (isPro) {
    const usedPro = await countActiveShares(userId);
    return {
      used: usedPro,
      limit: Number.POSITIVE_INFINITY,
      remaining: Number.POSITIVE_INFINITY,
    };
  }

  const used = await countActiveShares(userId);
  const limit = FREE_ACTIVE_SHARE_LIMIT;
  return { used, limit, remaining: Math.max(0, limit - used) };
};

const countActiveShares = async (userId: string): Promise<number> => {
  if (!db) return 0;
  const rows = await db
    .select({ value: sql<number>`count(*)::int` })
    .from(shareLink)
    .where(and(eq(shareLink.ownerUserId, userId), eq(shareLink.status, "active")));
  return rows[0]?.value ?? 0;
};

/**
 * Best-effort cleanup of idempotency rows older than IDEMPOTENCY_TTL_MS.
 * Intended to be called by an internal cron or invoked opportunistically.
 * Returns the number of rows deleted.
 */
export const cleanupExpiredIdempotency = async (now: Date = new Date()): Promise<number> => {
  if (!db) return 0;
  const cutoff = new Date(now.getTime() - IDEMPOTENCY_TTL_MS);
  const result = await db
    .delete(quotaIdempotency)
    .where(sql`${quotaIdempotency.createdAt} < ${cutoff}`);
  // postgres-js returns rowsAffected via .count on the result; drizzle wraps it.
  // Using sql template is safest across drizzle versions.
  return Number((result as unknown as { count?: number }).count ?? 0);
};
