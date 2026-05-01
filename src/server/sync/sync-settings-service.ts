import { eq } from "drizzle-orm";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import type { AuthSyncSettingsDTO } from "~/types/auth";
import type { SyncSettingsUpdateRequestDTO, SyncSettingsUpdateResponseDTO } from "~/types/sync";

type UserSyncRow = {
  syncEnabled: boolean;
  syncConsentedAt: Date | null;
  syncUpdatedAt: Date | null;
};

function toSyncSettingsDTO(row: UserSyncRow): AuthSyncSettingsDTO {
  return {
    enabled: row.syncEnabled,
    consentedAt: row.syncConsentedAt ? row.syncConsentedAt.toISOString() : null,
    updatedAt: row.syncUpdatedAt ? row.syncUpdatedAt.toISOString() : null,
  };
}

async function getUserSyncRow(userId: string): Promise<UserSyncRow> {
  const rows = await db
    .select({
      syncEnabled: user.syncEnabled,
      syncConsentedAt: user.syncConsentedAt,
      syncUpdatedAt: user.syncUpdatedAt,
    })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);
  return (
    rows[0] ?? {
      syncEnabled: false,
      syncConsentedAt: null,
      syncUpdatedAt: null,
    }
  );
}

export async function getSyncSettingsForUser(userId: string): Promise<AuthSyncSettingsDTO> {
  const row = await getUserSyncRow(userId);
  return toSyncSettingsDTO(row);
}

export async function updateSyncSettingsForUser(
  userId: string,
  patch: SyncSettingsUpdateRequestDTO,
): Promise<SyncSettingsUpdateResponseDTO> {
  const updates: Partial<{
    syncEnabled: boolean;
    syncConsentedAt: Date | null;
    syncUpdatedAt: Date;
  }> = {
    syncUpdatedAt: new Date(),
  };

  if (typeof patch.enabled === "boolean") {
    updates.syncEnabled = patch.enabled;
  }
  if (typeof patch.consentedAt === "string") {
    updates.syncConsentedAt = new Date(patch.consentedAt);
  }

  const rows = await db.update(user).set(updates).where(eq(user.id, userId)).returning({
    syncEnabled: user.syncEnabled,
    syncConsentedAt: user.syncConsentedAt,
    syncUpdatedAt: user.syncUpdatedAt,
  });

  const row = rows[0] ?? {
    syncEnabled: false,
    syncConsentedAt: null,
    syncUpdatedAt: null,
  };
  return toSyncSettingsDTO(row);
}
