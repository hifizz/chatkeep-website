import { beforeEach, describe, expect, it, vi } from "vitest";

type SyncSettingsRow = {
  enabled: boolean;
  consentedAt: Date | null;
  updatedAt: Date;
};

const rows = new Map<string, SyncSettingsRow>();

vi.mock("drizzle-orm", () => ({
  eq: (_column: unknown, value: string) => ({ userId: value }),
}));

vi.mock("~/server/db/schema", () => ({
  syncUserSettings: {
    userId: "user_id",
    enabled: "enabled",
    consentedAt: "consented_at",
    updatedAt: "updated_at",
  },
}));

vi.mock("~/server/db", () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (condition: { userId: string }) => ({
          limit: async (_count: number) => {
            const row = rows.get(condition.userId);
            return row ? [row] : [];
          },
        }),
      }),
    }),
    insert: () => ({
      values: (value: {
        userId: string;
        enabled: boolean;
        consentedAt: Date | null;
        updatedAt: Date;
      }) => ({
        onConflictDoUpdate: async (_arg: unknown) => {
          rows.set(value.userId, {
            enabled: value.enabled,
            consentedAt: value.consentedAt,
            updatedAt: value.updatedAt,
          });
        },
      }),
    }),
  },
}));

import {
  assertSyncPolicyAllowsTransfer,
  getSyncUserSettings,
  updateSyncUserSettings,
} from "./sync-settings-service";

describe("sync-settings-service", () => {
  beforeEach(() => {
    rows.clear();
    vi.clearAllMocks();
  });

  it("returns disabled default when user has no settings row", async () => {
    await expect(getSyncUserSettings("user-1")).resolves.toEqual({
      enabled: false,
    });
  });

  it("writes enabled and consentedAt atomically on first enable", async () => {
    const updated = await updateSyncUserSettings("user-1", { enabled: true });

    expect(updated.enabled).toBe(true);
    expect(typeof updated.consentedAt).toBe("string");
    expect(typeof updated.updatedAt).toBe("string");

    await expect(getSyncUserSettings("user-1")).resolves.toMatchObject({
      enabled: true,
      consentedAt: updated.consentedAt,
    });
  });

  it("keeps account-wide consistency on subsequent reads", async () => {
    await updateSyncUserSettings("user-1", {
      enabled: true,
      consentedAt: "2026-04-29T00:00:00.000Z",
    });

    await expect(getSyncUserSettings("user-1")).resolves.toEqual({
      enabled: true,
      consentedAt: "2026-04-29T00:00:00.000Z",
      updatedAt: expect.any(String),
    });

    await updateSyncUserSettings("user-1", { enabled: false });
    await expect(getSyncUserSettings("user-1")).resolves.toEqual({
      enabled: false,
      consentedAt: "2026-04-29T00:00:00.000Z",
      updatedAt: expect.any(String),
    });
  });

  it("rejects transfer when policy is disabled", async () => {
    await expect(assertSyncPolicyAllowsTransfer("user-1")).rejects.toMatchObject({
      code: "SYNC_DISABLED",
    });
  });

  it("rejects transfer when consent is missing", async () => {
    await updateSyncUserSettings("user-1", { enabled: true, consentedAt: undefined });
    // 手动篡改：模拟 enabled=true 但 consentedAt 丢失的异常行。
    rows.set("user-1", {
      enabled: true,
      consentedAt: null,
      updatedAt: new Date(),
    });

    await expect(assertSyncPolicyAllowsTransfer("user-1")).rejects.toMatchObject({
      code: "SYNC_CONSENT_REQUIRED",
    });
  });
});
