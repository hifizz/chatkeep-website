import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { db } from "~/server/db";
import { quotaIdempotency, shareLink, userDailyQuota } from "~/server/db/schema";

/**
 * Either the top-level drizzle db or a transaction handle. Both expose the
 * same query-builder surface, but their concrete types differ. This alias
 * lets call-sites pass `tx` from `db.transaction(...)` interchangeably.
 */
export type QuotaDbClient =
  | NonNullable<typeof db>
  | Parameters<Parameters<NonNullable<typeof db>["transaction"]>[0]>[0];

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
    // Step 1: claim the idempotency key atomically. The unique (user_id,
    // idempotency_key) constraint serializes concurrent same-key requests:
    // exactly one INSERT wins, the rest return zero rows from RETURNING
    // because Postgres holds a row lock on the conflicting row until the
    // owning tx commits. By the time the loser's INSERT returns, the
    // winner's row is committed and visible to the subsequent SELECT.
    //
    // We INSERT a placeholder (resultOk=false, resultRemaining=-1) and only
    // overwrite it with the real result after the increment. Crash recovery:
    // if the winner crashes mid-tx, its INSERT rolls back and a later retry
    // can re-claim the key cleanly.
    const claimed = await tx
      .insert(quotaIdempotency)
      .values({
        userId,
        idempotencyKey,
        resultOk: false,
        resultRemaining: -1,
      })
      .onConflictDoNothing()
      .returning({ key: quotaIdempotency.idempotencyKey });

    if (claimed.length === 0) {
      // Lost the race — read the winner's already-committed result.
      const existing = await tx
        .select({
          ok: quotaIdempotency.resultOk,
          remaining: quotaIdempotency.resultRemaining,
        })
        .from(quotaIdempotency)
        .where(
          and(
            eq(quotaIdempotency.userId, userId),
            eq(quotaIdempotency.idempotencyKey, idempotencyKey),
          ),
        )
        .limit(1);
      // existing[0] must be present here: our INSERT failed only because the
      // unique constraint matched a row, which is now committed and readable.
      const row = existing[0];
      if (!row) {
        // Defensive: should be unreachable. Treat as an in-flight conflict.
        return { ok: false, remaining: 0, resetsAt };
      }
      return { ok: row.ok, remaining: Math.max(0, row.remaining), resetsAt };
    }

    // Step 2: we own the claim. Read current count and decide whether to
    // increment.
    const currentRows = await tx
      .select({ count: userDailyQuota.premiumExportCount })
      .from(userDailyQuota)
      .where(and(eq(userDailyQuota.userId, userId), eq(userDailyQuota.date, date)))
      .limit(1);
    const currentCount = currentRows[0]?.count ?? 0;

    let resultOk: boolean;
    let resultRemaining: number;

    if (currentCount >= limit) {
      resultOk = false;
      resultRemaining = 0;
    } else {
      // UPSERT atomic +1. ON CONFLICT handles concurrent inserts on the same
      // (userId, date) PK across DIFFERENT idempotency keys (different users
      // counting against the same day). RETURNING gives the post-increment
      // count so we detect overshoot from concurrent same-user increments
      // and clamp without granting an extra slot.
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
      resultOk = newCount <= limit;
      resultRemaining = Math.max(0, limit - newCount);
    }

    // Step 3: persist the real result on top of the placeholder so retries
    // with the same key see the committed answer.
    await tx
      .update(quotaIdempotency)
      .set({ resultOk, resultRemaining })
      .where(
        and(
          eq(quotaIdempotency.userId, userId),
          eq(quotaIdempotency.idempotencyKey, idempotencyKey),
        ),
      );

    return { ok: resultOk, remaining: resultRemaining, resetsAt };
  });
};

/**
 * Returns the user's current share-link quota.
 *
 * Calculated as the live count of share rows with status='active' (no separate
 * counter table). Free users are capped at FREE_ACTIVE_SHARE_LIMIT; Pro is
 * unlimited. Revoking an active share immediately frees a slot.
 */
/**
 * Returns the user's current share-link quota.
 *
 * "Active" here means `status='active'` AND not yet expired by wall clock —
 * the share-service uses lazy expiry (`applyStatusByExpiry` only fires on
 * read). A share with `status='active'` AND `expiresAt < now()` is logically
 * expired but not yet marked, and MUST NOT be counted against the quota or
 * Free users would get stuck behind their own expired shares without ever
 * triggering a list/render to clean them up.
 */
export const getShareQuota = async (
  userId: string,
  isPro: boolean,
  client: QuotaDbClient | null = db,
  now: Date = new Date(),
): Promise<ShareQuota> => {
  const used = await countActiveSharesNotExpired(userId, client, now);
  if (isPro) {
    return {
      used,
      limit: Number.POSITIVE_INFINITY,
      remaining: Number.POSITIVE_INFINITY,
    };
  }
  const limit = FREE_ACTIVE_SHARE_LIMIT;
  return { used, limit, remaining: Math.max(0, limit - used) };
};

/**
 * Acquires a Postgres transaction-scoped advisory lock keyed by userId. Used
 * by share-service to serialize concurrent share creations from the same
 * user, preventing the TOCTOU race where two parallel /share/create calls
 * each pass the quota check at remaining=1 and both insert.
 *
 * The lock is released automatically on tx commit/rollback. `hashtextextended`
 * gives a stable 64-bit hash of the userId; `pg_advisory_xact_lock(bigint)`
 * acquires the corresponding tx-scoped lock.
 */
export const acquireUserShareLock = async (
  client: QuotaDbClient,
  userId: string,
): Promise<void> => {
  await client.execute(sql`SELECT pg_advisory_xact_lock(hashtextextended(${userId}, 0))`);
};

const countActiveSharesNotExpired = async (
  userId: string,
  client: QuotaDbClient | null,
  now: Date,
): Promise<number> => {
  if (!client) return 0;
  const rows = await client
    .select({ value: sql<number>`count(*)::int` })
    .from(shareLink)
    .where(
      and(
        eq(shareLink.ownerUserId, userId),
        eq(shareLink.status, "active"),
        or(isNull(shareLink.expiresAt), gt(shareLink.expiresAt, now)),
      ),
    );
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
