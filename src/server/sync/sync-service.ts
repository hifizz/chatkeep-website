import { and, desc, eq, gt, isNotNull, or } from "drizzle-orm";
import { db } from "~/server/db";
import { syncRecord } from "~/server/db/schema";
import type { SyncPushResponseDTO, SyncRecordDTO } from "~/types/sync";

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

export async function pullSyncRecords(options: {
  userId: string;
  since?: string;
}): Promise<{ serverTime: string; records: SyncRecordDTO[] }> {
  const sinceDate = toDate(options.since);
  const conditions = [eq(syncRecord.userId, options.userId)];

  if (sinceDate) {
    const sinceCondition = or(
      gt(syncRecord.updatedAt, sinceDate),
      and(isNotNull(syncRecord.deletedAt), gt(syncRecord.deletedAt, sinceDate)),
    );
    if (sinceCondition) {
      conditions.push(sinceCondition);
    }
  }

  const rows = await db
    .select()
    .from(syncRecord)
    .where(and(...conditions))
    .orderBy(desc(syncRecord.serverOrder), desc(syncRecord.updatedAt));

  return {
    serverTime: new Date().toISOString(),
    records: rows.map(rowToDto),
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
  if (options.records.length === 0) {
    return {
      serverTime: new Date().toISOString(),
      accepted: 0,
      skipped: 0,
      rejected: 0,
    };
  }

  const counters = await db.transaction(async (tx) => {
    let accepted = 0;
    let skipped = 0;
    let rejected = 0;
    const latestOrderRow = await tx
      .select({ serverOrder: syncRecord.serverOrder })
      .from(syncRecord)
      .where(eq(syncRecord.userId, options.userId))
      .orderBy(desc(syncRecord.serverOrder))
      .limit(1);
    // serverOrder 为“按用户维度”的单调序列，用于客户端最终顺序收敛。
    // 仅在本次记录被 accepted（实际写入）时递增分配。
    let nextServerOrder = latestOrderRow[0]?.serverOrder ?? 0;

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
    }

    return { accepted, skipped, rejected };
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
  };
}

export async function clearSyncRecords(options: {
  userId: string;
}): Promise<{ serverTime: string; deleted: number }> {
  const removed = await db
    .delete(syncRecord)
    .where(eq(syncRecord.userId, options.userId))
    .returning({ recordId: syncRecord.recordId });

  return {
    serverTime: new Date().toISOString(),
    deleted: removed.length,
  };
}
