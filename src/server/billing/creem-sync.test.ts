import { describe, expect, it, beforeEach, vi, afterEach } from "vitest";
import { __test__ as creemTest } from "~/server/billing/creem-sync";
import * as repo from "~/server/billing/subscription-repo";
import type { SubscriptionRecord } from "~/server/billing/subscription-repo";

vi.mock("~/server/billing/subscription-repo", () => ({
  getSubscriptionByCustomerId: vi.fn(),
  findUserIdByEmail: vi.fn(),
  getSubscriptionByProviderId: vi.fn(),
  recordWebhookEvent: vi.fn(),
  updateSubscriptionStatus: vi.fn(),
  upsertSubscription: vi.fn(),
}));

const { mapCreemStatus, resolveUserId } = creemTest;

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("creem status mapping", () => {
  it("returns trial for trialing", () => {
    const now = new Date("2025-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const result = mapCreemStatus("trialing", new Date("2025-01-08T00:00:00Z"), null);
    expect(result).toBe("trial");
  });

  it("returns grace when active but canceled with remaining time", () => {
    const now = new Date("2025-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const result = mapCreemStatus(
      "active",
      new Date("2025-01-05T00:00:00Z"),
      new Date("2024-12-31T00:00:00Z"),
    );
    expect(result).toBe("grace");
  });

  it("returns canceled when period already ended", () => {
    const now = new Date("2025-01-10T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const result = mapCreemStatus(
      "canceled",
      new Date("2025-01-05T00:00:00Z"),
      new Date("2025-01-01T00:00:00Z"),
    );
    expect(result).toBe("canceled");
  });

  it("returns past_due for unpaid", () => {
    const now = new Date("2025-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const result = mapCreemStatus("unpaid", new Date("2025-01-05T00:00:00Z"), null);
    expect(result).toBe("past_due");
  });
});

describe("creem identity resolution", () => {
  it("uses metadata referenceId first", async () => {
    const userId = await resolveUserId({ referenceId: "user-1" }, "cust_1", "a@b.com");
    expect(userId).toBe("user-1");
    expect(repo.getSubscriptionByCustomerId).not.toHaveBeenCalled();
  });

  it("falls back to provider customer mapping", async () => {
    const record = { userId: "user-2" } as SubscriptionRecord;
    vi.mocked(repo.getSubscriptionByCustomerId).mockResolvedValue(record);
    const userId = await resolveUserId({}, "cust_2", "b@b.com");
    expect(userId).toBe("user-2");
    expect(repo.findUserIdByEmail).not.toHaveBeenCalled();
  });

  it("falls back to email lookup", async () => {
    vi.mocked(repo.getSubscriptionByCustomerId).mockResolvedValue(null);
    vi.mocked(repo.findUserIdByEmail).mockResolvedValue("user-3");
    const userId = await resolveUserId({}, "cust_3", "c@b.com");
    expect(userId).toBe("user-3");
  });
});
