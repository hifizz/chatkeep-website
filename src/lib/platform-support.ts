export const SUPPORTED_AI_PLATFORMS = [
  "Gemini",
  "ChatGPT",
  "Claude",
  "DeepSeek",
  "Grok",
  "Yuanbao",
] as const;

export function formatSupportedPlatformsList(platforms: readonly string[]): string {
  if (platforms.length === 0) return "";
  if (platforms.length === 1) return platforms[0] ?? "";
  if (platforms.length === 2) return `${platforms[0]} and ${platforms[1]}`;

  const head = platforms.slice(0, -1).join(", ");
  const tail = platforms[platforms.length - 1];
  return `${head}, and ${tail}`;
}

export const SUPPORTED_AI_PLATFORMS_TEXT = formatSupportedPlatformsList(SUPPORTED_AI_PLATFORMS);
