type CounterState = {
  count: number;
  resetAt: number;
};

const RATE_STATE = new Map<string, CounterState>();

const now = () => Date.now();

export const takeRateLimit = (key: string, limit: number, windowMs: number) => {
  const current = RATE_STATE.get(key);
  const currentTime = now();

  if (!current || current.resetAt <= currentTime) {
    RATE_STATE.set(key, { count: 1, resetAt: currentTime + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: current.resetAt - currentTime };
  }

  current.count += 1;
  RATE_STATE.set(key, current);
  return { allowed: true, remaining: limit - current.count };
};

export const __test__ = {
  reset: () => RATE_STATE.clear(),
};
