import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "~/server/rpc/app";
import { auth } from "~/lib/auth";
import { clearSyncRecords, pullSyncRecords, pushSyncRecords } from "~/server/sync/sync-service";
import { getProfileForUser } from "~/server/billing/profile-service";
import { createShare, listShares } from "~/server/share/share-service";
import { getDailyPremiumExportQuota, incrementPremiumExport } from "~/server/billing/quota";
import { __test__ as rateLimitTestApi } from "~/server/share/share-rate-limit";
import {
  getSyncSettingsForUser,
  updateSyncSettingsForUser,
} from "~/server/sync/sync-settings-service";

vi.mock("~/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock("~/server/sync/sync-service", () => ({
  pullSyncRecords: vi.fn(),
  pushSyncRecords: vi.fn(),
  clearSyncRecords: vi.fn(),
}));

vi.mock("~/server/billing/profile-service", () => ({
  getProfileForUser: vi.fn(),
}));

vi.mock("~/server/share/share-service", () => ({
  createShare: vi.fn(),
  listShares: vi.fn(),
  revokeShareByOwner: vi.fn(),
  deleteShareByOwner: vi.fn(),
}));

vi.mock("~/server/billing/quota", () => ({
  getDailyPremiumExportQuota: vi.fn(),
  incrementPremiumExport: vi.fn(),
}));

vi.mock("~/server/sync/sync-settings-service", () => ({
  getSyncSettingsForUser: vi.fn(),
  updateSyncSettingsForUser: vi.fn(),
}));

const session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>> = {
  user: {
    id: "user-1",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    email: "user@example.com",
    emailVerified: true,
    name: "Test User",
    image: "/avatar.png",
  },
  session: {
    id: "session-1",
    createdAt: new Date("2025-01-01T00:00:00.000Z"),
    updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    userId: "user-1",
    expiresAt: new Date("2025-01-01T00:00:00.000Z"),
    token: "token-1",
    ipAddress: null,
    userAgent: null,
  },
};

const postJson = (path: string, body: unknown) =>
  app.request(path, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });

const allowSyncPolicy = () => {
  vi.mocked(getSyncSettingsForUser).mockResolvedValue({
    enabled: true,
    consentedAt: "2026-04-30T00:00:00.000Z",
    updatedAt: "2026-04-30T00:00:01.000Z",
  });
};

beforeEach(() => {
  vi.clearAllMocks();
  // share-rate-limit holds a process-wide Map keyed by `<route>:<userId>`.
  // Without this reset, consume budget bleeds across tests and makes the
  // 10/min assertion order-dependent.
  rateLimitTestApi.reset();
  vi.mocked(auth.api.getSession).mockResolvedValue(session);
  vi.mocked(getProfileForUser).mockResolvedValue({
    isPro: true,
    plan: null,
  });
  vi.mocked(getSyncSettingsForUser).mockResolvedValue({
    enabled: false,
    consentedAt: null,
    updatedAt: null,
  });
});

describe("rpc me endpoint", () => {
  it("returns me payload with settings.sync", async () => {
    vi.mocked(getSyncSettingsForUser).mockResolvedValue({
      enabled: true,
      consentedAt: "2026-04-30T00:00:00.000Z",
      updatedAt: "2026-04-30T00:00:00.000Z",
    });

    const res = await app.request("/api/rpc/me");
    const payload = await res.json();

    expect(res.status).toBe(200);
    expect(payload).toMatchObject({
      user: { id: "user-1" },
      session: { id: "session-1" },
      settings: {
        sync: {
          enabled: true,
          consentedAt: "2026-04-30T00:00:00.000Z",
          updatedAt: "2026-04-30T00:00:00.000Z",
        },
      },
    });
    expect(getSyncSettingsForUser).toHaveBeenCalledWith("user-1");
  });
});

describe("rpc sync endpoints", () => {
  it("returns 401 when session is missing", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const res = await postJson("/api/rpc/sync/pull", { deviceId: "device-1" });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized", code: "UNAUTHORIZED" });
    expect(pullSyncRecords).not.toHaveBeenCalled();
  });

  it("handles pull requests", async () => {
    allowSyncPolicy();
    const response = { serverTime: "2025-01-01T00:00:00.000Z", records: [] };
    vi.mocked(pullSyncRecords).mockResolvedValue(response);

    const res = await postJson("/api/rpc/sync/pull", {
      deviceId: "device-1",
      since: "2025-01-01T00:00:00.000Z",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(response);
    expect(pullSyncRecords).toHaveBeenCalledWith({
      userId: "user-1",
      since: "2025-01-01T00:00:00.000Z",
    });
  });

  it("handles push requests", async () => {
    allowSyncPolicy();
    const response = {
      serverTime: "2025-01-01T00:00:00.000Z",
      accepted: 1,
      skipped: 0,
      rejected: 0,
    };
    vi.mocked(pushSyncRecords).mockResolvedValue(response);

    const res = await postJson("/api/rpc/sync/push", {
      deviceId: "device-1",
      records: [
        {
          recordId: "record-1",
          recordType: "chat",
          payload: '{"message":"hi"}',
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(response);
    expect(pushSyncRecords).toHaveBeenCalledWith({
      userId: "user-1",
      records: [
        {
          recordId: "record-1",
          recordType: "chat",
          payload: '{"message":"hi"}',
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    });
  });

  it("handles clear requests even when sync is disabled", async () => {
    const response = { serverTime: "2025-01-01T00:00:00.000Z", deleted: 2 };
    vi.mocked(clearSyncRecords).mockResolvedValue(response);

    const res = await postJson("/api/rpc/sync/clear", { deviceId: "device-1" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(response);
    expect(clearSyncRecords).toHaveBeenCalledWith({ userId: "user-1" });
    expect(getSyncSettingsForUser).not.toHaveBeenCalled();
  });

  it("rejects pull when sync is disabled", async () => {
    vi.mocked(getSyncSettingsForUser).mockResolvedValue({
      enabled: false,
      consentedAt: "2026-04-30T00:00:00.000Z",
      updatedAt: "2026-04-30T00:00:01.000Z",
    });

    const res = await postJson("/api/rpc/sync/pull", { deviceId: "device-1" });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "Cloud sync is disabled",
      code: "SYNC_DISABLED",
    });
    expect(getSyncSettingsForUser).toHaveBeenCalledWith("user-1");
    expect(pullSyncRecords).not.toHaveBeenCalled();
  });

  it("rejects push when sync consent is missing", async () => {
    vi.mocked(getSyncSettingsForUser).mockResolvedValue({
      enabled: true,
      consentedAt: null,
      updatedAt: "2026-04-30T00:00:01.000Z",
    });

    const res = await postJson("/api/rpc/sync/push", {
      deviceId: "device-1",
      records: [
        {
          recordId: "record-1",
          recordType: "chat",
          payload: "{}",
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    });

    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({
      error: "Cloud sync consent is required",
      code: "SYNC_CONSENT_REQUIRED",
    });
    expect(getSyncSettingsForUser).toHaveBeenCalledWith("user-1");
    expect(pushSyncRecords).not.toHaveBeenCalled();
  });

  it("returns 500 when pullSyncRecords throws", async () => {
    allowSyncPolicy();
    vi.mocked(pullSyncRecords).mockRejectedValue(new Error("db error"));

    const res = await postJson("/api/rpc/sync/pull", { deviceId: "device-1" });

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ code: "INTERNAL_ERROR" });
  });

  it("returns 500 when pushSyncRecords throws", async () => {
    allowSyncPolicy();
    vi.mocked(pushSyncRecords).mockRejectedValue(new Error("db error"));

    const res = await postJson("/api/rpc/sync/push", {
      deviceId: "device-1",
      records: [
        {
          recordId: "record-1",
          recordType: "chat",
          payload: '{"message":"hi"}',
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ code: "INTERNAL_ERROR" });
  });

  it("returns 500 when clearSyncRecords throws", async () => {
    vi.mocked(clearSyncRecords).mockRejectedValue(new Error("db error"));

    const res = await postJson("/api/rpc/sync/clear", { deviceId: "device-1" });

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ code: "INTERNAL_ERROR" });
  });

  it("returns 400 when records array exceeds 200 items", async () => {
    const records = Array.from({ length: 201 }, (_, i) => ({
      recordId: `record-${i}`,
      recordType: "chat" as const,
      payload: "{}",
      updatedAt: "2025-01-01T00:00:00.000Z",
    }));

    const res = await postJson("/api/rpc/sync/push", {
      deviceId: "device-1",
      records,
    });

    expect(res.status).toBe(400);
    expect(pushSyncRecords).not.toHaveBeenCalled();
  });

  it("returns 400 when a record payload exceeds 5 MB", async () => {
    const res = await postJson("/api/rpc/sync/push", {
      deviceId: "device-1",
      records: [
        {
          recordId: "record-oversized",
          recordType: "chat",
          payload: "x".repeat(5_000_001),
          updatedAt: "2025-01-01T00:00:00.000Z",
        },
      ],
    });

    expect(res.status).toBe(400);
    expect(pushSyncRecords).not.toHaveBeenCalled();
  });
});

describe("rpc sync settings endpoint", () => {
  it("updates sync settings", async () => {
    vi.mocked(updateSyncSettingsForUser).mockResolvedValue({
      enabled: true,
      consentedAt: "2026-04-30T00:00:00.000Z",
      updatedAt: "2026-04-30T00:00:01.000Z",
    });

    const res = await postJson("/api/rpc/settings/sync/update", {
      enabled: true,
      consentedAt: "2026-04-30T00:00:00.000Z",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      enabled: true,
      consentedAt: "2026-04-30T00:00:00.000Z",
      updatedAt: "2026-04-30T00:00:01.000Z",
    });
    expect(updateSyncSettingsForUser).toHaveBeenCalledWith("user-1", {
      enabled: true,
      consentedAt: "2026-04-30T00:00:00.000Z",
    });
    expect(getSyncSettingsForUser).not.toHaveBeenCalled();
  });

  it("returns 401 when session is missing", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const res = await postJson("/api/rpc/settings/sync/update", { enabled: true });

    expect(res.status).toBe(401);
    expect(updateSyncSettingsForUser).not.toHaveBeenCalled();
  });

  it("returns 400 when request body is invalid", async () => {
    const res = await postJson("/api/rpc/settings/sync/update", {});

    expect(res.status).toBe(400);
    expect(updateSyncSettingsForUser).not.toHaveBeenCalled();
  });

  it("rejects old update path", async () => {
    const res = await postJson("/api/rpc/sync/settings/update", { enabled: true });
    expect(res.status).toBe(404);
  });
});

describe("rpc share endpoints", () => {
  it("Free user can list their own shares (regression: requirePro removed)", async () => {
    // share/list no longer looks up profile (requirePro middleware removed).
    // The mere fact that the request returns 200 with the user's shares is
    // the regression we're guarding — under the old code path Free users
    // would have received 403 here.
    vi.mocked(listShares).mockResolvedValue({ items: [] });

    const res = await postJson("/api/rpc/share/list", {});

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ items: [] });
  });

  it("handles share create with isPro passed to service (Pro user)", async () => {
    vi.mocked(createShare).mockResolvedValue({
      shareId: "share-1",
      shareUrl: "http://localhost:3030/s/share-1",
      accessMode: "password",
      expiresAt: null,
      status: "active",
    });

    const res = await postJson("/api/rpc/share/create", {
      source: "sidepanel",
      chatUrl: "https://chat.example/c/1",
      accessMode: "password",
      expiryMode: "permanent",
      password: "secret123",
      disclosureConfirmed: true,
      snapshot: {
        schemaVersion: 1,
        title: "Demo",
        sourceUrl: "https://chat.example/c/1",
        platform: "ChatGPT",
        exportedAt: "2026-04-07T00:00:00.000Z",
        messages: [{ id: "m1", role: "user", content: "hello" }],
      },
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      shareId: "share-1",
      accessMode: "password",
    });
    expect(createShare).toHaveBeenCalledTimes(1);
    const call = vi.mocked(createShare).mock.calls[0];
    expect(call?.[0]).toBe("user-1");
    expect(call?.[1]).toBe(true); // isPro from default mock
    expect(call?.[2]).toMatchObject({ chatUrl: "https://chat.example/c/1" });
  });

  it("Free user share/create propagates QUOTA_EXCEEDED 403 from service", async () => {
    vi.mocked(getProfileForUser).mockResolvedValueOnce({
      isPro: false,
      plan: null,
    });
    const quotaErr = Object.assign(
      new Error("已达 Free 免费 share 上限（3 个），升级 Pro 解锁无限分享"),
      {
        code: "QUOTA_EXCEEDED",
        status: 403,
        details: { used: 3, limit: 3 },
      },
    );
    Object.setPrototypeOf(
      quotaErr,
      (await import("~/server/share/share-errors")).ShareError.prototype,
    );
    vi.mocked(createShare).mockRejectedValue(quotaErr);

    const res = await postJson("/api/rpc/share/create", {
      source: "sidepanel",
      chatUrl: "https://chat.example/c/1",
      accessMode: "public",
      expiryMode: "permanent",
      disclosureConfirmed: true,
      snapshot: {
        schemaVersion: 1,
        title: "Demo",
        sourceUrl: "https://chat.example/c/1",
        platform: "ChatGPT",
        exportedAt: "2026-04-07T00:00:00.000Z",
        messages: [{ id: "m1", role: "user", content: "hello" }],
      },
    });

    expect(res.status).toBe(403);
    expect(createShare).toHaveBeenCalledWith("user-1", false, expect.anything());
  });

  it("accepts yuanbao platform in share snapshot payload", async () => {
    vi.mocked(createShare).mockResolvedValue({
      shareId: "share-yuanbao",
      shareUrl: "http://localhost:3030/s/share-yuanbao",
      accessMode: "public",
      expiresAt: null,
      status: "active",
    });

    const res = await postJson("/api/rpc/share/create", {
      source: "content",
      chatUrl: "https://yuanbao.tencent.com/chat/naQivTmsDa/c41d091b-8ec9-4130-854d-5bd970bc127f",
      accessMode: "public",
      expiryMode: "permanent",
      disclosureConfirmed: true,
      snapshot: {
        schemaVersion: 1,
        title: "Yuanbao Demo",
        sourceUrl:
          "https://yuanbao.tencent.com/chat/naQivTmsDa/c41d091b-8ec9-4130-854d-5bd970bc127f",
        platform: "yuanbao",
        exportedAt: "2026-04-18T00:00:00.000Z",
        messages: [{ id: "m1", role: "assistant", content: "hello from yuanbao" }],
      },
    });

    expect(res.status).toBe(200);
    expect(createShare).toHaveBeenCalledWith(
      "user-1",
      true,
      expect.objectContaining({
        snapshot: expect.objectContaining({
          platform: "yuanbao",
        }),
      }),
    );
  });

  it("handles share list", async () => {
    vi.mocked(listShares).mockResolvedValue({
      items: [
        {
          shareId: "share-1",
          title: "Demo",
          sourceChatUrl: "https://chat.example/c/1",
          sourcePlatform: "ChatGPT",
          accessMode: "public",
          expiryMode: "permanent",
          expiresAt: null,
          status: "active",
          createdAt: "2026-04-07T00:00:00.000Z",
          revokedAt: null,
        },
      ],
    });

    const res = await postJson("/api/rpc/share/list", {});
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ items: [{ shareId: "share-1" }] });
  });
});

describe("rpc quota endpoints", () => {
  it("Pro user check returns unlimited (no db touch)", async () => {
    vi.mocked(getProfileForUser).mockResolvedValueOnce({
      isPro: true,
      plan: null,
    });
    vi.mocked(getDailyPremiumExportQuota).mockResolvedValueOnce({
      used: 0,
      limit: Number.POSITIVE_INFINITY,
      remaining: Number.POSITIVE_INFINITY,
      resetsAt: "2026-05-10T00:00:00.000Z",
    });

    const res = await postJson("/api/rpc/quota/checkPremiumExport", {});

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.allow).toBe(true);
    expect(body.unlimited).toBe(true);
    expect(body.limit).toBe(null); // Infinity serialized as null
    expect(body.remaining).toBe(null);
  });

  it("Free user check returns finite quota", async () => {
    vi.mocked(getProfileForUser).mockResolvedValueOnce({
      isPro: false,
      plan: null,
    });
    vi.mocked(getDailyPremiumExportQuota).mockResolvedValueOnce({
      used: 1,
      limit: 3,
      remaining: 2,
      resetsAt: "2026-05-10T00:00:00.000Z",
    });

    const res = await postJson("/api/rpc/quota/checkPremiumExport", {});

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({
      allow: true,
      used: 1,
      limit: 3,
      remaining: 2,
      unlimited: false,
    });
  });

  it("Free user exhausted check returns allow=false", async () => {
    vi.mocked(getProfileForUser).mockResolvedValueOnce({
      isPro: false,
      plan: null,
    });
    vi.mocked(getDailyPremiumExportQuota).mockResolvedValueOnce({
      used: 3,
      limit: 3,
      remaining: 0,
      resetsAt: "2026-05-10T00:00:00.000Z",
    });

    const res = await postJson("/api/rpc/quota/checkPremiumExport", {});

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ allow: false, remaining: 0 });
  });

  it("Pro user consume returns unlimited without calling incrementPremiumExport", async () => {
    vi.mocked(getProfileForUser).mockResolvedValueOnce({
      isPro: true,
      plan: null,
    });
    vi.mocked(getDailyPremiumExportQuota).mockResolvedValueOnce({
      used: 0,
      limit: Number.POSITIVE_INFINITY,
      remaining: Number.POSITIVE_INFINITY,
      resetsAt: "2026-05-10T00:00:00.000Z",
    });

    const res = await postJson("/api/rpc/quota/consumePremiumExport", {
      idempotencyKey: "11111111-1111-1111-1111-111111111111",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, unlimited: true });
    expect(incrementPremiumExport).not.toHaveBeenCalled();
  });

  it("Free user consume calls incrementPremiumExport with idempotencyKey", async () => {
    vi.mocked(getProfileForUser).mockResolvedValueOnce({
      isPro: false,
      plan: null,
    });
    vi.mocked(incrementPremiumExport).mockResolvedValueOnce({
      ok: true,
      remaining: 2,
      resetsAt: "2026-05-10T00:00:00.000Z",
    });

    const res = await postJson("/api/rpc/quota/consumePremiumExport", {
      idempotencyKey: "22222222-2222-2222-2222-222222222222",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, remaining: 2, unlimited: false });
    expect(incrementPremiumExport).toHaveBeenCalledWith(
      "user-1",
      "22222222-2222-2222-2222-222222222222",
    );
  });

  it("consume rejects malformed idempotencyKey (not UUID)", async () => {
    const res = await postJson("/api/rpc/quota/consumePremiumExport", {
      idempotencyKey: "not-a-uuid",
    });

    expect(res.status).toBe(400);
    expect(incrementPremiumExport).not.toHaveBeenCalled();
  });

  it("requires session for both quota endpoints", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

    const checkRes = await postJson("/api/rpc/quota/checkPremiumExport", {});
    expect(checkRes.status).toBe(401);

    vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);
    const consumeRes = await postJson("/api/rpc/quota/consumePremiumExport", {
      idempotencyKey: "33333333-3333-3333-3333-333333333333",
    });
    expect(consumeRes.status).toBe(401);
  });

  it("consume is rate-limited at 10 requests/min/user", async () => {
    // Bound writes to quota_idempotency. An exhausted Free client without
    // this gate could fire infinite POSTs with random UUIDs and each one
    // would persist a row before getting ok:false. The 11th call in a 60s
    // window from one user must be 429, not even reaching the service.
    vi.mocked(getProfileForUser).mockResolvedValue({
      isPro: false,
      plan: null,
    });
    vi.mocked(incrementPremiumExport).mockResolvedValue({
      ok: true,
      remaining: 2,
      resetsAt: "2026-05-10T00:00:00.000Z",
    });

    for (let i = 0; i < 10; i += 1) {
      const res = await postJson("/api/rpc/quota/consumePremiumExport", {
        idempotencyKey: `44444444-4444-4444-4444-44444444444${i}`,
      });
      expect(res.status).toBe(200);
    }

    const overflowRes = await postJson("/api/rpc/quota/consumePremiumExport", {
      idempotencyKey: "44444444-4444-4444-4444-444444444499",
    });
    expect(overflowRes.status).toBe(429);
    expect(await overflowRes.json()).toMatchObject({ code: "RATE_LIMITED" });
    // Service must NOT be invoked on the rate-limited request.
    expect(incrementPremiumExport).toHaveBeenCalledTimes(10);
  });
});
