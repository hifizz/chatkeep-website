import { beforeEach, describe, expect, it, vi } from "vitest";
import { grantSignupTrialIfEligible } from "~/server/billing/billing-service";
import * as repo from "~/server/billing/subscription-repo";

vi.mock("~/server/billing/subscription-repo", () => ({
  hasUsedTrial: vi.fn(),
  getSubscriptionRecordForUser: vi.fn(),
  createSignupTrialSubscriptionIfAbsent: vi.fn(),
}));

describe("grantSignupTrialIfEligible", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips granting when subscription already exists", async () => {
    const existing = { userId: "user-1", status: "active" };
    vi.mocked(repo.getSubscriptionRecordForUser).mockResolvedValue(existing as never);

    const result = await grantSignupTrialIfEligible({ id: "user-1" });

    expect(repo.createSignupTrialSubscriptionIfAbsent).not.toHaveBeenCalled();
    expect(result).toEqual({ granted: false, record: existing });
  });

  it("grants a 30-day trial for new users", async () => {
    const now = new Date("2026-04-09T08:00:00.000Z");
    const record = { userId: "user-2", status: "trial" };

    vi.mocked(repo.getSubscriptionRecordForUser).mockResolvedValue(null);
    vi.mocked(repo.createSignupTrialSubscriptionIfAbsent).mockResolvedValue({
      created: true,
      record: record as never,
    });

    const result = await grantSignupTrialIfEligible({ id: "user-2" }, now);

    expect(repo.createSignupTrialSubscriptionIfAbsent).toHaveBeenCalledTimes(1);
    const input = vi.mocked(repo.createSignupTrialSubscriptionIfAbsent).mock.calls[0]?.[0];
    expect(input?.userId).toBe("user-2");
    expect(input?.provider).toBe("stripe");
    expect(input?.currentPeriodStart.toISOString()).toBe("2026-04-09T08:00:00.000Z");
    expect(input?.currentPeriodEnd.toISOString()).toBe("2026-05-09T08:00:00.000Z");
    expect(result).toEqual({ granted: true, record });
  });

  it("keeps idempotent result when record was inserted concurrently", async () => {
    const record = { userId: "user-3", status: "trial" };

    vi.mocked(repo.getSubscriptionRecordForUser).mockResolvedValue(null);
    vi.mocked(repo.createSignupTrialSubscriptionIfAbsent).mockResolvedValue({
      created: false,
      record: record as never,
    });

    const result = await grantSignupTrialIfEligible({ id: "user-3" });

    expect(result).toEqual({ granted: false, record });
  });
});
