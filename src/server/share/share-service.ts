import { randomUUID } from "node:crypto";
import { env } from "~/env";
import { db } from "~/server/db";
import { acquireUserShareLock, getShareQuota } from "~/server/billing/quota";
import type {
  ShareAccessMode,
  ShareActionResponseDTO,
  ShareChatSnapshotDTO,
  ShareCreateRequestDTO,
  ShareCreateResponseDTO,
  ShareListItemDTO,
  ShareListResponseDTO,
  SharePublicViewDTO,
  ShareStatus,
} from "~/types/share";
import { ShareError } from "./share-errors";
import { hashPasswordWithSalt, verifyPassword } from "./share-security";
import {
  deleteShare,
  getShareById,
  getShareByIdForOwner,
  getSharePublicById,
  insertShare,
  listSharesByOwner,
  markShareExpired,
  markShareRevoked,
  type ShareLinkRecord,
} from "./share-repo";

const MAX_SNAPSHOT_BYTES = 500_000;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 64;

const toIso = (value: Date | null) => (value ? value.toISOString() : null);

const parseSnapshot = (raw: string): ShareChatSnapshotDTO => {
  const parsed = JSON.parse(raw) as ShareChatSnapshotDTO;
  return parsed;
};

const sanitizeSnapshot = (snapshot: ShareCreateRequestDTO["snapshot"]): ShareChatSnapshotDTO => {
  if (snapshot.schemaVersion !== 1) {
    throw new ShareError("VALIDATION_ERROR", "Unsupported snapshot schemaVersion", 400);
  }

  const messages = snapshot.messages.map((item) => ({
    id: item.id,
    role: item.role,
    content: item.content,
  }));

  const sanitized: ShareChatSnapshotDTO = {
    schemaVersion: 1,
    title: snapshot.title,
    sourceUrl: snapshot.sourceUrl,
    platform: snapshot.platform,
    exportedAt: snapshot.exportedAt,
    messages,
  };

  const serialized = JSON.stringify(sanitized);
  if (Buffer.byteLength(serialized, "utf8") > MAX_SNAPSHOT_BYTES) {
    throw new ShareError(
      "VALIDATION_ERROR",
      `Snapshot too large (max ${MAX_SNAPSHOT_BYTES} bytes)`,
      400,
    );
  }

  return sanitized;
};

const isPasswordMode = (mode: ShareAccessMode) => mode === "password";

const ensurePassword = (password: string | undefined) => {
  if (!password) {
    throw new ShareError("VALIDATION_ERROR", "Password is required in password mode", 400);
  }
  if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
    throw new ShareError(
      "VALIDATION_ERROR",
      `Password length must be ${PASSWORD_MIN}-${PASSWORD_MAX}`,
      400,
    );
  }
};

const applyStatusByExpiry = async (record: ShareLinkRecord) => {
  if (record.status !== "active") return record;
  if (!record.expiresAt) return record;
  if (record.expiresAt.getTime() > Date.now()) return record;
  const expired = await markShareExpired(record.id);
  return expired ?? { ...record, status: "expired", updatedAt: new Date() };
};

const assertActive = (record: ShareLinkRecord) => {
  if (record.status !== "active") {
    throw new ShareError("EXPIRED_OR_REVOKED", "Share link has expired or revoked", 410);
  }
};

const toListItem = (record: ShareLinkRecord): ShareListItemDTO => ({
  shareId: record.id,
  title: record.title,
  sourceChatUrl: record.sourceChatUrl,
  sourcePlatform: record.sourcePlatform,
  accessMode: record.accessMode as ShareAccessMode,
  expiryMode: record.expiryMode as ShareListItemDTO["expiryMode"],
  expiresAt: toIso(record.expiresAt),
  status: record.status as ShareStatus,
  createdAt: record.createdAt.toISOString(),
  revokedAt: toIso(record.revokedAt),
});

/**
 * Free users are capped at 3 active (non-expired) share links. Pro users are
 * unlimited. Revoked/deleted/expired shares do not count against the quota —
 * revoking or letting a share expire frees a slot. Already issued share links
 * remain accessible regardless of quota state; only NEW creation is blocked.
 *
 * MUST be called inside a transaction that already holds
 * `acquireUserShareLock(tx, userId)` — otherwise the count→insert sequence has
 * a TOCTOU race where two concurrent /share/create from the same Free user
 * both see remaining=1 and both insert.
 */
import type { QuotaDbClient } from "~/server/billing/quota";

const throwIfShareQuotaExhausted = async (
  client: QuotaDbClient,
  userId: string,
  isPro: boolean,
) => {
  const quota = await getShareQuota(userId, isPro, client);
  if (quota.remaining <= 0) {
    throw new ShareError(
      "QUOTA_EXCEEDED",
      `已达 Free 免费 share 上限（${quota.limit} 个），升级 Pro 解锁无限分享`,
      403,
      { used: quota.used, limit: quota.limit },
    );
  }
};

export const createShare = async (
  userId: string,
  isPro: boolean,
  request: ShareCreateRequestDTO,
): Promise<ShareCreateResponseDTO> => {
  // Validation runs OUTSIDE the transaction — pure CPU work, no DB calls,
  // no point holding a lock for it.
  if (!request.disclosureConfirmed) {
    throw new ShareError("VALIDATION_ERROR", "Disclosure confirmation is required", 400);
  }

  const accessMode: ShareAccessMode = request.accessMode ?? "password";
  if (!["password", "public"].includes(accessMode)) {
    throw new ShareError("VALIDATION_ERROR", "Invalid accessMode", 400);
  }

  const expiresAt =
    request.expiryMode === "expires_at"
      ? request.expiresAt
        ? new Date(request.expiresAt)
        : null
      : null;

  if (request.expiryMode === "expires_at") {
    if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
      throw new ShareError(
        "VALIDATION_ERROR",
        "expiresAt is required when expiryMode=expires_at",
        400,
      );
    }
    if (expiresAt.getTime() <= Date.now()) {
      throw new ShareError("VALIDATION_ERROR", "expiresAt must be in the future", 400);
    }
  }

  let passwordHash: string | null = null;
  let passwordSalt: string | null = null;
  if (isPasswordMode(accessMode)) {
    ensurePassword(request.password);
    const hashed = hashPasswordWithSalt(request.password!);
    passwordHash = hashed.hash;
    passwordSalt = hashed.salt;
  }

  const snapshot = sanitizeSnapshot(request.snapshot);
  const shareId = randomUUID();

  // Quota check + insert MUST be atomic. Without the per-user advisory lock,
  // two concurrent Free /share/create requests can both pass remaining=1 and
  // each insert, leaving the user with 4 active shares. The lock is released
  // at tx commit/rollback; throughput cost is negligible since concurrent
  // share creation from the same user is rare.
  const record = await db.transaction(async (tx) => {
    await acquireUserShareLock(tx, userId);
    await throwIfShareQuotaExhausted(tx, userId, isPro);
    return insertShare(
      {
        id: shareId,
        ownerUserId: userId,
        title: snapshot.title || "Untitled Chat",
        sourceChatUrl: request.chatUrl,
        sourcePlatform: snapshot.platform || "unknown",
        accessMode,
        expiryMode: request.expiryMode,
        expiresAt,
        passwordHash,
        passwordSalt,
        status: "active",
        snapshotJson: JSON.stringify(snapshot),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      tx,
    );
  });

  if (!record) {
    throw new ShareError("VALIDATION_ERROR", "Failed to create share", 400);
  }

  const shareUrl = new URL(`/s/${shareId}`, env.BETTER_AUTH_URL).toString();
  return {
    shareId,
    shareUrl,
    accessMode,
    expiresAt: toIso(record.expiresAt),
    status: record.status as ShareStatus,
  };
};

export const listShares = async (userId: string): Promise<ShareListResponseDTO> => {
  const rows = await listSharesByOwner(userId);
  const mapped = await Promise.all(rows.map(applyStatusByExpiry));
  return { items: mapped.map(toListItem) };
};

export const revokeShareByOwner = async (
  userId: string,
  shareId: string,
): Promise<ShareActionResponseDTO> => {
  const existing = await getShareByIdForOwner(shareId, userId);
  if (!existing) {
    throw new ShareError("NOT_FOUND", "Share not found", 404);
  }

  if (existing.status !== "active") {
    return { shareId, status: existing.status as ShareStatus };
  }

  const updated = await markShareRevoked(shareId, userId);
  if (!updated) {
    throw new ShareError("NOT_FOUND", "Share not found", 404);
  }

  return { shareId, status: "revoked" };
};

export const deleteShareByOwner = async (
  userId: string,
  shareId: string,
): Promise<ShareActionResponseDTO> => {
  const deleted = await deleteShare(shareId, userId);
  if (!deleted) {
    throw new ShareError("NOT_FOUND", "Share not found", 404);
  }
  return { shareId, status: "deleted" };
};

export const getShareForRender = async (
  shareId: string,
  options?: { passwordVerified?: boolean },
): Promise<
  { state: "invalid" } | { state: "requires-password" } | { state: "ok"; data: SharePublicViewDTO }
> => {
  const publicRecord = await getSharePublicById(shareId);
  if (!publicRecord) return { state: "invalid" };
  const record = publicRecord.share;

  const normalized = await applyStatusByExpiry(record);
  if (normalized.status !== "active") {
    return { state: "invalid" };
  }

  if (normalized.accessMode === "password" && !options?.passwordVerified) {
    return { state: "requires-password" };
  }

  const snapshot = parseSnapshot(normalized.snapshotJson);
  return {
    state: "ok",
    data: {
      shareId: normalized.id,
      title: normalized.title,
      accessMode: normalized.accessMode as ShareAccessMode,
      author: {
        name: publicRecord.owner?.name ?? null,
        image: publicRecord.owner?.image ?? null,
      },
      snapshot,
      expiresAt: toIso(normalized.expiresAt),
    },
  };
};

export const verifySharePassword = async (shareId: string, password: string) => {
  const record = await getShareById(shareId);
  if (!record) {
    throw new ShareError("NOT_FOUND", "Share not found", 404);
  }

  const normalized = await applyStatusByExpiry(record);
  assertActive(normalized);

  if (normalized.accessMode !== "password") {
    return { ok: true };
  }

  if (!normalized.passwordHash || !normalized.passwordSalt) {
    throw new ShareError("VALIDATION_ERROR", "Password is not configured", 400);
  }

  const ok = verifyPassword(password, normalized.passwordHash, normalized.passwordSalt);
  if (!ok) {
    throw new ShareError("FORBIDDEN", "Password is incorrect", 403);
  }

  return { ok: true };
};
