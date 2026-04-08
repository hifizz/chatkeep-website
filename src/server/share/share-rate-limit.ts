type CounterState = {
  count: number;
  resetAt: number;
};

const RATE_STATE = new Map<string, CounterState>();
const CLEANUP_INTERVAL_MS = 30_000;
const MAX_STATE_SIZE = 10_000;
let nextCleanupAt = 0;

const now = () => Date.now();

const trimToMaxSize = () => {
  if (RATE_STATE.size <= MAX_STATE_SIZE) return;

  const candidates = Array.from(RATE_STATE.entries()).sort(
    (left, right) => left[1].resetAt - right[1].resetAt,
  );
  const overflow = RATE_STATE.size - MAX_STATE_SIZE;
  for (let index = 0; index < overflow; index += 1) {
    const key = candidates[index]?.[0];
    if (key) RATE_STATE.delete(key);
  }
};

const cleanupRateState = (currentTime: number) => {
  if (currentTime < nextCleanupAt && RATE_STATE.size <= MAX_STATE_SIZE) return;

  for (const [key, state] of RATE_STATE) {
    if (state.resetAt <= currentTime) {
      RATE_STATE.delete(key);
    }
  }

  trimToMaxSize();

  nextCleanupAt = currentTime + CLEANUP_INTERVAL_MS;
};

export const takeRateLimit = (key: string, limit: number, windowMs: number) => {
  const currentTime = now();
  cleanupRateState(currentTime);
  const current = RATE_STATE.get(key);

  if (!current || current.resetAt <= currentTime) {
    RATE_STATE.set(key, { count: 1, resetAt: currentTime + windowMs });
    trimToMaxSize();
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
  reset: () => {
    RATE_STATE.clear();
    nextCleanupAt = 0;
  },
  size: () => RATE_STATE.size,
};
