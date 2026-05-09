import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createShare,
  getShareForRender,
  verifySharePassword,
  listShares,
} from "~/server/share/share-service";
import * as repo from "~/server/share/share-repo";
import * as security from "~/server/share/share-security";
import * as quota from "~/server/billing/quota";
import { ShareError } from "~/server/share/share-errors";

vi.mock("~/server/share/share-repo", () => ({
  insertShare: vi.fn(),
  listSharesByOwner: vi.fn(),
  getShareById: vi.fn(),
  getShareByIdForOwner: vi.fn(),
  getSharePublicById: vi.fn(),
  markShareRevoked: vi.fn(),
  markShareExpired: vi.fn(),
  deleteShare: vi.fn(),
}));

vi.mock("~/server/billing/quota", () => ({
  getShareQuota: vi.fn(),
  FREE_ACTIVE_SHARE_LIMIT: 3,
}));

const mockShareQuotaAvailable = (used = 0) => {
  vi.mocked(quota.getShareQuota).mockResolvedValue({
    used,
    limit: 3,
    remaining: 3 - used,
  });
};

const mockShareQuotaProUnlimited = (used = 5) => {
  vi.mocked(quota.getShareQuota).mockResolvedValue({
    used,
    limit: Number.POSITIVE_INFINITY,
    remaining: Number.POSITIVE_INFINITY,
  });
};

const mockShareQuotaExhausted = () => {
  vi.mocked(quota.getShareQuota).mockResolvedValue({
    used: 3,
    limit: 3,
    remaining: 0,
  });
};

const buildRecord = (overrides: Partial<repo.ShareLinkRecord> = {}): repo.ShareLinkRecord =>
  ({
    id: "share-1",
    ownerUserId: "user-1",
    title: "Demo Chat",
    sourceChatUrl: "https://chat.example/c/1",
    sourcePlatform: "ChatGPT",
    accessMode: "public",
    expiryMode: "permanent",
    expiresAt: null,
    passwordHash: null,
    passwordSalt: null,
    status: "active",
    snapshotJson: JSON.stringify({
      schemaVersion: 1,
      title: "Demo Chat",
      sourceUrl: "https://chat.example/c/1",
      platform: "ChatGPT",
      exportedAt: "2026-04-07T00:00:00.000Z",
      messages: [{ id: "m1", role: "user", content: "hello" }],
    }),
    createdAt: new Date("2026-04-07T00:00:00.000Z"),
    updatedAt: new Date("2026-04-07T00:00:00.000Z"),
    revokedAt: null,
    ...overrides,
  }) satisfies repo.ShareLinkRecord;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createShare", () => {
  it("uses password mode by default", async () => {
    mockShareQuotaAvailable(0);
    vi.mocked(repo.insertShare).mockResolvedValue(buildRecord({ accessMode: "password" }));

    const result = await createShare("user-1", false, {
      source: "sidepanel",
      chatUrl: "https://chat.example/c/1",
      expiryMode: "permanent",
      password: "secret123",
      disclosureConfirmed: true,
      snapshot: {
        schemaVersion: 1,
        title: "Demo Chat",
        sourceUrl: "https://chat.example/c/1",
        platform: "ChatGPT",
        exportedAt: "2026-04-07T00:00:00.000Z",
        messages: [{ id: "m1", role: "user", content: "hello" }],
      },
    });

    expect(result.accessMode).toBe("password");
    expect(result.shareUrl).toContain("/s/");
    expect(repo.insertShare).toHaveBeenCalled();
  });

  it("rejects too-large snapshot payload", async () => {
    mockShareQuotaAvailable(0);
    await expect(
      createShare("user-1", false, {
        source: "sidepanel",
        chatUrl: "https://chat.example/c/1",
        expiryMode: "permanent",
        accessMode: "public",
        disclosureConfirmed: true,
        snapshot: {
          schemaVersion: 1,
          title: "Big Chat",
          sourceUrl: "https://chat.example/c/1",
          platform: "ChatGPT",
          exportedAt: "2026-04-07T00:00:00.000Z",
          messages: [{ id: "m1", role: "user", content: "a".repeat(600_000) }],
        },
      }),
    ).rejects.toThrow("Snapshot too large");
  });

  it("persists yuanbao platform as sourcePlatform", async () => {
    mockShareQuotaAvailable(0);
    vi.mocked(repo.insertShare).mockResolvedValue(buildRecord({ sourcePlatform: "yuanbao" }));

    await createShare("user-1", false, {
      source: "content",
      chatUrl: "https://yuanbao.tencent.com/chat/naQivTmsDa/c41d091b-8ec9-4130-854d-5bd970bc127f",
      expiryMode: "permanent",
      accessMode: "public",
      disclosureConfirmed: true,
      snapshot: {
        schemaVersion: 1,
        title: "Yuanbao Chat",
        sourceUrl:
          "https://yuanbao.tencent.com/chat/naQivTmsDa/c41d091b-8ec9-4130-854d-5bd970bc127f",
        platform: "yuanbao",
        exportedAt: "2026-04-18T00:00:00.000Z",
        messages: [{ id: "m1", role: "assistant", content: "hello from yuanbao" }],
      },
    });

    expect(repo.insertShare).toHaveBeenCalledWith(
      expect.objectContaining({
        sourcePlatform: "yuanbao",
      }),
    );
  });
});

describe("createShare quota enforcement", () => {
  const validRequest = {
    source: "sidepanel" as const,
    chatUrl: "https://chat.example/c/1",
    expiryMode: "permanent" as const,
    accessMode: "public" as const,
    disclosureConfirmed: true as const,
    snapshot: {
      schemaVersion: 1 as const,
      title: "Demo Chat",
      sourceUrl: "https://chat.example/c/1",
      platform: "ChatGPT",
      exportedAt: "2026-04-07T00:00:00.000Z",
      messages: [{ id: "m1", role: "user" as const, content: "hello" }],
    },
  };

  it("allows Free user when activeCount=0/1/2", async () => {
    vi.mocked(repo.insertShare).mockResolvedValue(buildRecord());

    for (const used of [0, 1, 2]) {
      mockShareQuotaAvailable(used);
      vi.mocked(repo.insertShare).mockClear();

      const result = await createShare("user-1", false, validRequest);

      expect(result.shareId).toBeDefined();
      expect(repo.insertShare).toHaveBeenCalledTimes(1);
    }
  });

  it("rejects Free user when activeCount=3 with QUOTA_EXCEEDED", async () => {
    mockShareQuotaExhausted();

    await expect(createShare("user-1", false, validRequest)).rejects.toThrow(ShareError);

    try {
      await createShare("user-1", false, validRequest);
    } catch (err) {
      expect(err).toBeInstanceOf(ShareError);
      expect((err as ShareError).code).toBe("QUOTA_EXCEEDED");
      expect((err as ShareError).status).toBe(403);
    }

    expect(repo.insertShare).not.toHaveBeenCalled();
  });

  it("allows Pro user regardless of activeCount", async () => {
    mockShareQuotaProUnlimited(100);
    vi.mocked(repo.insertShare).mockResolvedValue(buildRecord());

    const result = await createShare("user-1", true, validRequest);

    expect(result.shareId).toBeDefined();
    expect(quota.getShareQuota).toHaveBeenCalledWith("user-1", true);
    expect(repo.insertShare).toHaveBeenCalledTimes(1);
  });

  it("checks quota BEFORE validation (fast-fail on quota even with bad payload)", async () => {
    mockShareQuotaExhausted();

    // Snapshot is invalid (will trigger size check), but quota check runs first
    await expect(
      createShare("user-1", false, {
        ...validRequest,
        snapshot: {
          ...validRequest.snapshot,
          messages: [{ id: "m1", role: "user", content: "a".repeat(600_000) }],
        },
      }),
    ).rejects.toThrow(/Free 免费 share 上限/);
  });
});

describe("public render and password verification", () => {
  it("returns public share data for public mode", async () => {
    vi.mocked(repo.getSharePublicById).mockResolvedValue({
      share: buildRecord({ accessMode: "public" }),
      owner: { name: "Alice", image: null },
    });

    const result = await getShareForRender("share-1");
    expect(result.state).toBe("ok");
    if (result.state === "ok") {
      expect(result.data.author.name).toBe("Alice");
    }
  });

  it("requires password for password mode", async () => {
    vi.mocked(repo.getSharePublicById).mockResolvedValue({
      share: buildRecord({ accessMode: "password" }),
      owner: { name: "Alice", image: null },
    });

    const result = await getShareForRender("share-1");
    expect(result.state).toBe("requires-password");
  });

  it("returns invalid when share missing", async () => {
    vi.mocked(repo.getSharePublicById).mockResolvedValue(null);
    const result = await getShareForRender("share-1");
    expect(result.state).toBe("invalid");
  });

  it("marks expired record as invalid", async () => {
    vi.mocked(repo.getSharePublicById).mockResolvedValue({
      share: buildRecord({
        status: "active",
        expiresAt: new Date("2024-01-01T00:00:00.000Z"),
      }),
      owner: null,
    });
    vi.mocked(repo.markShareExpired).mockResolvedValue(
      buildRecord({ status: "expired", expiresAt: new Date("2024-01-01T00:00:00.000Z") }),
    );

    const result = await getShareForRender("share-1");
    expect(result.state).toBe("invalid");
    expect(repo.markShareExpired).toHaveBeenCalledWith("share-1");
  });

  it("verifies password and rejects wrong input", async () => {
    const hashed = security.hashPasswordWithSalt("secret123");
    vi.mocked(repo.getShareById).mockResolvedValue(
      buildRecord({
        accessMode: "password",
        passwordHash: hashed.hash,
        passwordSalt: hashed.salt,
      }),
    );

    await expect(verifySharePassword("share-1", "secret123")).resolves.toEqual({ ok: true });
    await expect(verifySharePassword("share-1", "wrong")).rejects.toBeInstanceOf(ShareError);
  });
});

describe("listShares", () => {
  it("returns normalized list", async () => {
    vi.mocked(repo.listSharesByOwner).mockResolvedValue([buildRecord()]);
    const result = await listShares("user-1");
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.shareId).toBe("share-1");
  });
});
