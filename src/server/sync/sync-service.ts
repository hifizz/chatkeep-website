import { and, eq, gt, isNotNull, or } from "drizzle-orm";
import { db } from "~/server/db";
import { syncRecord } from "~/server/db/schema";
import type { SyncRecordDTO } from "~/types/sync";

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
}): SyncRecordDTO {
  return {
    recordId: row.recordId,
    recordType: row.recordType as SyncRecordDTO["recordType"],
    payload: row.payload,
    updatedAt: row.updatedAt.toISOString(),
    ...(row.deletedAt ? { deletedAt: row.deletedAt.toISOString() } : {}),
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
    .where(and(...conditions));

  return {
    serverTime: new Date().toISOString(),
    records: rows.map(rowToDto),
  };
}

export async function pushSyncRecords(options: {
  userId: string;
  records: SyncRecordDTO[];
}): Promise<{ serverTime: string; accepted: number }> {
  if (options.records.length === 0) {
    return { serverTime: new Date().toISOString(), accepted: 0 };
  }

  const accepted = await db.transaction(async (tx) => {
    let applied = 0;

    for (const record of options.records) {
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

      if (!shouldApply) continue;

      const updatedAt = toDate(record.updatedAt) ?? new Date();
      const deletedAt = toDate(record.deletedAt);

      if (row) {
        await tx
          .update(syncRecord)
          .set({
            payload: record.payload,
            updatedAt,
            deletedAt,
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
        });
      }

      applied += 1;
    }

    return applied;
  });

  return { serverTime: new Date().toISOString(), accepted };
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
