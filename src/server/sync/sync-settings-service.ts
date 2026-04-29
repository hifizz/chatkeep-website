import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { syncUserSettings } from "~/server/db/schema";
import type {
  SyncPolicySettingsDTO,
  SyncSettingsUpdateRequestDTO,
  SyncSettingsUpdateResponseDTO,
} from "~/types/sync";
import { SyncPolicyError } from "./sync-errors";

const DEFAULT_SYNC_POLICY: SyncPolicySettingsDTO = {
  enabled: false,
};

function toIso(value: Date | null | undefined): string | undefined {
  return value ? value.toISOString() : undefined;
}

function normalizeConsentTimestamp(value: string): string {
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) {
    throw new Error("SYNC_SETTINGS_INVALID_CONSENTED_AT");
  }
  return parsed.toISOString();
}

function rowToPolicy(row: {
  enabled: boolean;
  consentedAt: Date | null;
  updatedAt: Date;
}): SyncPolicySettingsDTO {
  return {
    enabled: row.enabled,
    consentedAt: toIso(row.consentedAt),
    updatedAt: toIso(row.updatedAt),
  };
}

async function readSyncUserSettingsRow(userId: string): Promise<SyncPolicySettingsDTO | null> {
  const rows = await db
    .select({
      enabled: syncUserSettings.enabled,
      consentedAt: syncUserSettings.consentedAt,
      updatedAt: syncUserSettings.updatedAt,
    })
    .from(syncUserSettings)
    .where(eq(syncUserSettings.userId, userId))
    .limit(1);

  const row = rows[0];
  return row ? rowToPolicy(row) : null;
}

export async function getSyncUserSettings(userId: string): Promise<SyncPolicySettingsDTO> {
  return (await readSyncUserSettingsRow(userId)) ?? DEFAULT_SYNC_POLICY;
}

export async function updateSyncUserSettings(
  userId: string,
  patch: SyncSettingsUpdateRequestDTO,
): Promise<SyncSettingsUpdateResponseDTO> {
  const current = await getSyncUserSettings(userId);
  const now = new Date();
  const nextEnabled = patch.enabled ?? current.enabled;

  let nextConsentedAt = patch.consentedAt ?? current.consentedAt;
  if (nextConsentedAt) {
    nextConsentedAt = normalizeConsentTimestamp(nextConsentedAt);
  } else if (nextEnabled) {
    // 首次启用必须原子补齐 consentedAt，避免 enabled=true 但 consentedAt 为空。
    nextConsentedAt = now.toISOString();
  }

  await db
    .insert(syncUserSettings)
    .values({
      userId,
      enabled: nextEnabled,
      consentedAt: nextConsentedAt ? new Date(nextConsentedAt) : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: syncUserSettings.userId,
      set: {
        enabled: nextEnabled,
        consentedAt: nextConsentedAt ? new Date(nextConsentedAt) : null,
        updatedAt: now,
      },
    });

  return {
    enabled: nextEnabled,
    consentedAt: nextConsentedAt,
    updatedAt: now.toISOString(),
  };
}

export async function assertSyncPolicyAllowsTransfer(userId: string): Promise<void> {
  const settings = await getSyncUserSettings(userId);
  if (!settings.enabled) {
    throw new SyncPolicyError("SYNC_DISABLED");
  }
  if (!settings.consentedAt) {
    throw new SyncPolicyError("SYNC_CONSENT_REQUIRED");
  }
}
