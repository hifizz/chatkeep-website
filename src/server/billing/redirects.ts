import { getBillingOrigin } from "./config";

export const resolveRedirectUrl = (input: string | undefined, fallbackPath: string) => {
  const origin = getBillingOrigin();
  const fallback = new URL(fallbackPath, origin).toString();

  if (!input) return fallback;

  try {
    const candidate = new URL(input, origin);
    if (candidate.origin !== origin) return fallback;
    return candidate.toString();
  } catch {
    return fallback;
  }
};
