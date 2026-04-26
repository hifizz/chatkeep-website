import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "~/server/rpc/app";
import { auth } from "~/lib/auth";
import { clearSyncRecords, pullSyncRecords, pushSyncRecords } from "~/server/sync/sync-service";
import { getProfileForUser } from "~/server/billing/profile-service";
import { createShare, listShares } from "~/server/share/share-service";

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

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(auth.api.getSession).mockResolvedValue(session);
  vi.mocked(getProfileForUser).mockResolvedValue({
    isPro: true,
    plan: null,
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

  it("handles clear requests", async () => {
    const response = { serverTime: "2025-01-01T00:00:00.000Z", deleted: 2 };
    vi.mocked(clearSyncRecords).mockResolvedValue(response);

    const res = await postJson("/api/rpc/sync/clear", { deviceId: "device-1" });

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(response);
    expect(clearSyncRecords).toHaveBeenCalledWith({ userId: "user-1" });
  });

  it("returns 500 when pullSyncRecords throws", async () => {
    vi.mocked(pullSyncRecords).mockRejectedValue(new Error("db error"));

    const res = await postJson("/api/rpc/sync/pull", { deviceId: "device-1" });

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ code: "INTERNAL_ERROR" });
  });

  it("returns 500 when pushSyncRecords throws", async () => {
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

describe("rpc share endpoints", () => {
  it("rejects non-pro user with 403", async () => {
    vi.mocked(getProfileForUser).mockResolvedValueOnce({
      isPro: false,
      plan: null,
    });

    const res = await postJson("/api/rpc/share/list", {});
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ code: "FORBIDDEN" });
  });

  it("handles share create", async () => {
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
