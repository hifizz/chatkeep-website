const DEFAULT_ALLOWED_ORIGINS = [
  "https://chat-aside.zilin.im",
  "https://dev-chat-aside.zilin.im",
  "https://chatkeep.dev",
  "https://dev.chatkeep.dev",
  "chrome-extension://ajmlmkmckibkifaofppjellodbfmhkkb",
  "chrome-extension://idlamgiieejhfmhgnpppdekpbdkfappe",
  "http://localhost:3030",
  "http://localhost:3000",
  "http://localhost:3040",
];

export function normalizeOrigin(origin: string): string {
  return origin.replace(/\/+$/, "");
}

function uniqOrigins(origins: string[]): string[] {
  return Array.from(new Set(origins.map(normalizeOrigin)));
}

export function getAllowedOrigins(rawOrigins: string | undefined, nodeEnv: string): string[] {
  const list = rawOrigins
    ? rawOrigins
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

  const normalized = uniqOrigins(list);
  if (nodeEnv === "production") {
    return normalized.filter((origin) => !origin.startsWith("http://localhost"));
  }

  return normalized;
}

export function isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
  const normalizedOrigin = normalizeOrigin(origin);

  return allowedOrigins.some((item) => {
    const normalizedAllowed = normalizeOrigin(item);
    if (normalizedAllowed.endsWith("*")) {
      const prefix = normalizedAllowed.slice(0, -1);
      return normalizedOrigin.startsWith(prefix);
    }
    return normalizedAllowed === normalizedOrigin;
  });
}

export function isExtensionOrigin(origin: string): boolean {
  const normalized = normalizeOrigin(origin);
  return normalized.startsWith("chrome-extension://") || normalized.startsWith("moz-extension://");
}
