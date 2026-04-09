import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { limitMock, selectMock, returningMock, setMock, updateMock } = vi.hoisted(() => {
  const limit = vi.fn();
  const where = vi.fn(() => ({ limit }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));

  const returning = vi.fn();
  const updateWhere = vi.fn(() => ({ returning }));
  const set = vi.fn(() => ({ where: updateWhere }));
  const update = vi.fn(() => ({ set }));

  return {
    limitMock: limit,
    whereMock: where,
    fromMock: from,
    selectMock: select,
    returningMock: returning,
    updateWhereMock: updateWhere,
    setMock: set,
    updateMock: update,
  };
});

vi.mock("~/server/db", () => ({
  db: {
    select: selectMock,
    update: updateMock,
  },
}));

vi.mock("~/server/billing/config", () => ({
  getPastDueGraceDays: vi.fn(() => 5),
}));

import { getSubscriptionForUser } from "~/server/billing/subscription-repo";

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getSubscriptionForUser - trial expiry", () => {
  it("downgrades expired trial to canceled", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-10T00:00:00.000Z"));

    const record = {
      userId: "user-1",
      status: "trial",
      trialEndsAt: new Date("2026-05-01T00:00:00.000Z"),
      cancelAtPeriodEnd: false,
      updatedAt: new Date("2026-05-01T00:00:00.000Z"),
      pastDueAt: null,
    };
    const downgraded = {
      ...record,
      status: "canceled",
      cancelAtPeriodEnd: true,
    };

    limitMock.mockResolvedValueOnce([record]);
    returningMock.mockResolvedValueOnce([downgraded]);

    const result = await getSubscriptionForUser("user-1");

    expect(updateMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({
        status: "canceled",
        cancelAtPeriodEnd: true,
      }),
    );
    expect(result).toEqual(downgraded);
  });

  it("keeps active trial when not expired", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-01T00:00:00.000Z"));

    const record = {
      userId: "user-2",
      status: "trial",
      trialEndsAt: new Date("2026-05-10T00:00:00.000Z"),
      cancelAtPeriodEnd: false,
      updatedAt: new Date("2026-05-01T00:00:00.000Z"),
      pastDueAt: null,
    };

    limitMock.mockResolvedValueOnce([record]);

    const result = await getSubscriptionForUser("user-2");

    expect(updateMock).not.toHaveBeenCalled();
    expect(result).toEqual(record);
  });
});
