import { afterEach, describe, expect, it, vi } from "vitest";

// Stubbed db module — the unit tests below exercise the pure-logic and
// Pro-short-circuit branches of quota.ts. The transactional / UPSERT paths
// are exercised by quota-concurrency.test.ts and quota-idempotency.test.ts
// against a real Postgres in §13.
vi.mock("~/server/db", () => ({ db: undefined }));

import {
  FREE_ACTIVE_SHARE_LIMIT,
  FREE_DAILY_PREMIUM_EXPORT_LIMIT,
  getDailyPremiumExportQuota,
  getShareQuota,
  incrementPremiumExport,
} from "./quota";

afterEach(() => {
  vi.useRealTimers();
});

describe("getDailyPremiumExportQuota", () => {
  it("returns Infinity quota for Pro users without touching db", async () => {
    const now = new Date("2026-05-09T12:00:00.000Z");
    const result = await getDailyPremiumExportQuota("user-1", true, now);

    expect(result.used).toBe(0);
    expect(result.limit).toBe(Number.POSITIVE_INFINITY);
    expect(result.remaining).toBe(Number.POSITIVE_INFINITY);
    expect(result.resetsAt).toBe("2026-05-10T00:00:00.000Z");
  });

  it("returns FREE limit for Free users when db is unavailable", async () => {
    const now = new Date("2026-05-09T23:59:59.000Z");
    const result = await getDailyPremiumExportQuota("user-2", false, now);

    expect(result.used).toBe(0);
    expect(result.limit).toBe(FREE_DAILY_PREMIUM_EXPORT_LIMIT);
    expect(result.remaining).toBe(FREE_DAILY_PREMIUM_EXPORT_LIMIT);
    // Resets at the next UTC midnight, not the next local-time midnight.
    expect(result.resetsAt).toBe("2026-05-10T00:00:00.000Z");
  });

  it("computes resetsAt as next UTC midnight even when caller is in different timezone", async () => {
    // 2026-12-31T16:00 UTC == 2027-01-01T00:00 UTC+8. Reset window must follow UTC.
    const now = new Date("2026-12-31T16:00:00.000Z");
    const result = await getDailyPremiumExportQuota("user-3", false, now);

    expect(result.resetsAt).toBe("2027-01-01T00:00:00.000Z");
  });
});

describe("incrementPremiumExport", () => {
  it("returns ok=true when db is unavailable (test env fallback)", async () => {
    const now = new Date("2026-05-09T12:00:00.000Z");
    const result = await incrementPremiumExport("user-4", "key-abc-123", now);

    expect(result.ok).toBe(true);
    expect(result.remaining).toBe(FREE_DAILY_PREMIUM_EXPORT_LIMIT - 1);
    expect(result.resetsAt).toBe("2026-05-10T00:00:00.000Z");
  });
});

describe("getShareQuota", () => {
  it("returns Infinity quota for Pro users", async () => {
    const result = await getShareQuota("user-5", true);

    expect(result.limit).toBe(Number.POSITIVE_INFINITY);
    expect(result.remaining).toBe(Number.POSITIVE_INFINITY);
    expect(result.used).toBe(0); // db unavailable in unit-test env, not 'pro magic'
  });

  it("returns FREE_ACTIVE_SHARE_LIMIT for Free users with no db", async () => {
    const result = await getShareQuota("user-6", false);

    expect(result.used).toBe(0);
    expect(result.limit).toBe(FREE_ACTIVE_SHARE_LIMIT);
    expect(result.remaining).toBe(FREE_ACTIVE_SHARE_LIMIT);
  });
});

describe("UTC date math", () => {
  it("stays on the same UTC day across local-timezone boundaries", async () => {
    // 23:59 in UTC+8 (= 15:59 UTC) → still 'today' in UTC
    const lateLocal = new Date("2026-05-09T15:59:00.000Z");
    const before = await getDailyPremiumExportQuota("user-7", false, lateLocal);

    // 00:01 in UTC+8 (= 16:01 UTC) → still 'today' in UTC
    const earlyNextLocal = new Date("2026-05-09T16:01:00.000Z");
    const after = await getDailyPremiumExportQuota("user-7", false, earlyNextLocal);

    // Both reset to the same UTC midnight (2026-05-10T00:00:00Z)
    expect(before.resetsAt).toBe(after.resetsAt);
    expect(before.resetsAt).toBe("2026-05-10T00:00:00.000Z");
  });

  it("rolls over at UTC midnight, not local midnight", async () => {
    const justBefore = new Date("2026-05-09T23:59:59.999Z");
    const justAfter = new Date("2026-05-10T00:00:00.001Z");

    const beforeQuota = await getDailyPremiumExportQuota("user-8", false, justBefore);
    const afterQuota = await getDailyPremiumExportQuota("user-8", false, justAfter);

    expect(beforeQuota.resetsAt).toBe("2026-05-10T00:00:00.000Z");
    expect(afterQuota.resetsAt).toBe("2026-05-11T00:00:00.000Z");
  });
});
