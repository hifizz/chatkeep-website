import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import type Stripe from "stripe";
import { __test__ as stripeTest } from "~/server/billing/stripe";
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

const { mapStripeStatus, resolveUserId } = stripeTest;

const buildItems = (
  overrides: Partial<Stripe.SubscriptionItem> = {},
): Stripe.ApiList<Stripe.SubscriptionItem> => {
  const now = Math.floor(new Date("2025-01-01T00:00:00Z").getTime() / 1000);
  return {
    object: "list",
    data: [
      {
        current_period_start: now,
        current_period_end: now + 10 * 24 * 60 * 60,
        price: { recurring: { interval: "month" } },
        ...overrides,
      } as Stripe.SubscriptionItem,
    ],
    has_more: false,
    url: "/v1/subscription_items",
  };
};

const buildSubscription = (
  status: Stripe.Subscription.Status,
  overrides: Partial<Stripe.Subscription> = {},
): Stripe.Subscription => {
  const now = Math.floor(new Date("2025-01-01T00:00:00Z").getTime() / 1000);
  return {
    id: "sub_1",
    status,
    items: buildItems(),
    cancel_at_period_end: false,
    created: now,
    metadata: {},
    customer: "cus_1",
    ...overrides,
  } as Stripe.Subscription;
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("stripe status mapping", () => {
  it("returns trial for trialing", () => {
    const now = new Date("2025-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const result = mapStripeStatus(buildSubscription("trialing"));
    expect(result).toBe("trial");
  });

  it("returns grace when active and cancel_at_period_end", () => {
    const now = new Date("2025-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const result = mapStripeStatus(
      buildSubscription("active", {
        cancel_at_period_end: true,
        items: buildItems({
          current_period_start: Math.floor(now.getTime() / 1000),
          current_period_end: Math.floor(new Date("2025-01-05T00:00:00Z").getTime() / 1000),
        }),
      }),
    );
    expect(result).toBe("grace");
  });

  it("returns past_due for past_due", () => {
    const now = new Date("2025-01-01T00:00:00Z");
    vi.useFakeTimers();
    vi.setSystemTime(now);
    const result = mapStripeStatus(buildSubscription("past_due"));
    expect(result).toBe("past_due");
  });
});

describe("stripe identity resolution", () => {
  it("uses metadata userId first", async () => {
    const subscription = buildSubscription("active", {
      metadata: { userId: "user-1" },
    });
    const userId = await resolveUserId(subscription, undefined);
    expect(userId).toBe("user-1");
  });

  it("falls back to client_reference_id", async () => {
    const subscription = buildSubscription("active");
    const session = { client_reference_id: "user-2" } as Stripe.Checkout.Session;
    const userId = await resolveUserId(subscription, session);
    expect(userId).toBe("user-2");
  });

  it("falls back to provider customer mapping", async () => {
    const record = { userId: "user-3" } as SubscriptionRecord;
    vi.mocked(repo.getSubscriptionByCustomerId).mockResolvedValue(record);
    const subscription = buildSubscription("active", {
      customer: "cus_2",
    });
    const userId = await resolveUserId(subscription, undefined);
    expect(userId).toBe("user-3");
  });

  it("falls back to email lookup", async () => {
    vi.mocked(repo.getSubscriptionByCustomerId).mockResolvedValue(null);
    vi.mocked(repo.findUserIdByEmail).mockResolvedValue("user-4");
    const subscription = buildSubscription("active", {
      customer: { id: "cus_3", email: "user4@example.com" } as Stripe.Customer,
    });
    const userId = await resolveUserId(subscription, undefined);
    expect(userId).toBe("user-4");
  });
});
