import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { __test__, takeRateLimit } from "~/server/share/share-rate-limit";

describe("share-rate-limit", () => {
  beforeEach(() => {
    __test__.reset();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T00:00:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
    __test__.reset();
  });

  it("cleans expired keys on next cleanup window", () => {
    for (let index = 0; index < 5; index += 1) {
      takeRateLimit(`expired:${index}`, 2, 10);
    }
    expect(__test__.size()).toBe(5);

    vi.setSystemTime(new Date("2026-04-08T00:00:40.000Z"));
    takeRateLimit("fresh", 2, 10);

    expect(__test__.size()).toBe(1);
  });

  it("caps state size under key-flood traffic", () => {
    for (let index = 0; index < 10_050; index += 1) {
      takeRateLimit(`key:${index}`, 2, 60_000);
    }

    expect(__test__.size()).toBeLessThanOrEqual(10_000);
  });
});
