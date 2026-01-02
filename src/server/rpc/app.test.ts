import { beforeEach, describe, expect, it, vi } from "vitest";
import { app } from "~/server/rpc/app";
import { auth } from "~/lib/auth";
import { clearSyncRecords, pullSyncRecords, pushSyncRecords } from "~/server/sync/sync-service";

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
});

describe("rpc sync endpoints", () => {
  it("returns 401 when session is missing", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const res = await postJson("/api/rpc/sync/pull", { deviceId: "device-1" });

    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
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
    const response = { serverTime: "2025-01-01T00:00:00.000Z", accepted: 1 };
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
});
