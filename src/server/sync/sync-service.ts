import { randomUUID } from "node:crypto";
import { and, desc, eq, gte, isNotNull, or } from "drizzle-orm";
import { db } from "~/server/db";
import { syncRecord, syncUserState } from "~/server/db/schema";
import type { SyncAcceptedRecordDTO, SyncPushResponseDTO, SyncRecordDTO } from "~/types/sync";
import { assertSyncPolicyAllowsTransfer } from "./sync-settings-service";

type SyncDbTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function toDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed;
}

function toMillis(value: string | null | undefined): number {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function getRecordTimestamp(record: { updatedAt: string; deletedAt?: string }): number {
  return Math.max(toMillis(record.updatedAt), toMillis(record.deletedAt));
}

function getRowTimestamp(row: { updatedAt: Date; deletedAt: Date | null }): number {
  const updated = row.updatedAt?.getTime?.() ?? 0;
  const deleted = row.deletedAt?.getTime?.() ?? 0;
  return Math.max(updated, deleted);
}

function rowToDto(row: {
  recordId: string;
  recordType: string;
  payload: string;
  updatedAt: Date;
  deletedAt: Date | null;
  serverOrder: number;
}): SyncRecordDTO {
  return {
    recordId: row.recordId,
    recordType: row.recordType as SyncRecordDTO["recordType"],
    payload: row.payload,
    updatedAt: row.updatedAt.toISOString(),
    ...(row.deletedAt ? { deletedAt: row.deletedAt.toISOString() } : {}),
    serverOrder: row.serverOrder,
  };
}

async function ensureSyncUserStateRow(
  userId: string,
): Promise<{ epoch: string; lastServerOrder: number }> {
  await db
    .insert(syncUserState)
    .values({
      userId,
      epoch: randomUUID(),
      lastServerOrder: 0,
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  const rows = await db
    .select({
      epoch: syncUserState.epoch,
      lastServerOrder: syncUserState.lastServerOrder,
    })
    .from(syncUserState)
    .where(eq(syncUserState.userId, userId))
    .limit(1);

  const row = rows[0];
  if (!row) {
    throw new Error("SYNC_USER_STATE_NOT_FOUND");
  }

  return {
    epoch: row.epoch,
    lastServerOrder: row.lastServerOrder,
  };
}

async function ensureLockedSyncUserState(
  tx: SyncDbTransaction,
  userId: string,
): Promise<{ epoch: string; lastServerOrder: number }> {
  await tx
    .insert(syncUserState)
    .values({
      userId,
      epoch: randomUUID(),
      lastServerOrder: 0,
      updatedAt: new Date(),
    })
    .onConflictDoNothing();

  // 用一次无语义变更的 UPDATE 获取用户行锁，保证并发 push 串行分配 serverOrder。
  const lockedRows = await tx
    .update(syncUserState)
    .set({ updatedAt: new Date() })
    .where(eq(syncUserState.userId, userId))
    .returning({
      epoch: syncUserState.epoch,
      lastServerOrder: syncUserState.lastServerOrder,
    });

  const row = lockedRows[0];
  if (!row) {
    throw new Error("SYNC_USER_STATE_LOCK_FAILED");
  }

  return {
    epoch: row.epoch,
    lastServerOrder: row.lastServerOrder,
  };
}

export async function pullSyncRecords(options: {
  userId: string;
  since?: string;
}): Promise<{ serverTime: string; records: SyncRecordDTO[]; syncEpoch: string }> {
  await assertSyncPolicyAllowsTransfer(options.userId);

  const sinceDate = toDate(options.since);
  const conditions = [eq(syncRecord.userId, options.userId)];

  if (sinceDate) {
    const sinceCondition = or(
      gte(syncRecord.updatedAt, sinceDate),
      and(isNotNull(syncRecord.deletedAt), gte(syncRecord.deletedAt, sinceDate)),
    );
    if (sinceCondition) {
      conditions.push(sinceCondition);
    }
  }

  const [state, rows] = await Promise.all([
    ensureSyncUserStateRow(options.userId),
    db
      .select()
      .from(syncRecord)
      .where(and(...conditions))
      .orderBy(desc(syncRecord.serverOrder), desc(syncRecord.updatedAt)),
  ]);

  return {
    serverTime: new Date().toISOString(),
    records: rows.map(rowToDto),
    syncEpoch: state.epoch,
  };
}

/**
 * push 结果语义（强约束）：
 * - accepted: 成功写入（insert/update）条数。
 * - skipped: 合法但被判定为 no-op 的条数（例如时间戳不新）。
 * - rejected: 本批次被拒绝处理的条数（单条记录语义无效等）。
 *
 * 不变量：accepted + skipped + rejected === options.records.length
 */
export async function pushSyncRecords(options: {
  userId: string;
  records: SyncRecordDTO[];
}): Promise<SyncPushResponseDTO> {
  await assertSyncPolicyAllowsTransfer(options.userId);

  if (options.records.length === 0) {
    return {
      serverTime: new Date().toISOString(),
      accepted: 0,
      skipped: 0,
      rejected: 0,
      acceptedRecords: [],
    };
  }

  const counters = await db.transaction(async (tx) => {
    let accepted = 0;
    let skipped = 0;
    let rejected = 0;
    const acceptedRecords: SyncAcceptedRecordDTO[] = [];

    const state = await ensureLockedSyncUserState(tx, options.userId);
    let nextServerOrder = state.lastServerOrder;

    for (const record of options.records) {
      const updatedAt = toDate(record.updatedAt);
      const deletedAt = toDate(record.deletedAt);

      // 兜底校验：即使上层绕过 schema，也保证语义一致地计入 rejected。
      if (!updatedAt || (record.deletedAt && !deletedAt)) {
        rejected += 1;
        continue;
      }

      const existing = await tx
        .select()
        .from(syncRecord)
        .where(
          and(
            eq(syncRecord.userId, options.userId),
            eq(syncRecord.recordType, record.recordType),
            eq(syncRecord.recordId, record.recordId),
          ),
        )
        .limit(1);

      const incomingTimestamp = getRecordTimestamp(record);
      const row = existing[0];
      const shouldApply = !row || incomingTimestamp > getRowTimestamp(row);

      if (!shouldApply) {
        skipped += 1;
        continue;
      }

      nextServerOrder += 1;

      if (row) {
        await tx
          .update(syncRecord)
          .set({
            payload: record.payload,
            updatedAt,
            deletedAt,
            serverOrder: nextServerOrder,
          })
          .where(
            and(
              eq(syncRecord.userId, options.userId),
              eq(syncRecord.recordType, record.recordType),
              eq(syncRecord.recordId, record.recordId),
            ),
          );
      } else {
        await tx.insert(syncRecord).values({
          userId: options.userId,
          recordType: record.recordType,
          recordId: record.recordId,
          payload: record.payload,
          updatedAt,
          deletedAt,
          serverOrder: nextServerOrder,
        });
      }

      accepted += 1;
      acceptedRecords.push({
        recordId: record.recordId,
        recordType: record.recordType,
        serverOrder: nextServerOrder,
      });
    }

    await tx
      .update(syncUserState)
      .set({
        lastServerOrder: nextServerOrder,
        updatedAt: new Date(),
      })
      .where(eq(syncUserState.userId, options.userId));

    return { accepted, skipped, rejected, acceptedRecords };
  });

  const total = counters.accepted + counters.skipped + counters.rejected;
  if (total !== options.records.length) {
    throw new Error("SYNC_PUSH_COUNTER_INVARIANT_VIOLATION");
  }

  return {
    serverTime: new Date().toISOString(),
    accepted: counters.accepted,
    skipped: counters.skipped,
    rejected: counters.rejected,
    acceptedRecords: counters.acceptedRecords,
  };
}

export async function clearSyncRecords(options: {
  userId: string;
}): Promise<{ serverTime: string; deleted: number }> {
  const deleted = await db.transaction(async (tx) => {
    const removed = await tx
      .delete(syncRecord)
      .where(eq(syncRecord.userId, options.userId))
      .returning({ recordId: syncRecord.recordId });

    await tx
      .insert(syncUserState)
      .values({
        userId: options.userId,
        epoch: randomUUID(),
        lastServerOrder: 0,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: syncUserState.userId,
        set: {
          epoch: randomUUID(),
          lastServerOrder: 0,
          updatedAt: new Date(),
        },
      });

    return removed.length;
  });

  return {
    serverTime: new Date().toISOString(),
    deleted,
  };
}
