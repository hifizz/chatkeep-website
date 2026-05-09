export const BILLING_CURRENCY = "USD" as const;

export const PLAN_NAMES = {
  free: "Free",
  monthly: "Monthly",
  annual: "Annual",
} as const;

export type PlanKey = keyof typeof PLAN_NAMES;

export const PLAN_CONFIG = {
  free: {
    key: "free",
    name: PLAN_NAMES.free,
    amount: 0,
    interval: null,
  },
  monthly: {
    key: "monthly",
    name: PLAN_NAMES.monthly,
    amount: 9.9,
    interval: "month",
  },
  annual: {
    key: "annual",
    name: PLAN_NAMES.annual,
    amount: 99,
    interval: "year",
  },
} as const;

/**
 * Annual savings vs paying monthly: 12 * 9.9 = 118.80; annual is 99.
 * Customers save about $20/year on annual.
 */
export const ANNUAL_SAVINGS_USD = Number(
  (PLAN_CONFIG.monthly.amount * 12 - PLAN_CONFIG.annual.amount).toFixed(2),
);

/**
 * Pricing structure follows a Wedge → Hook → Hit progression:
 *
 *   WEDGE (Free, gets people to install)
 *     - cross-platform capture, plain-text export unlimited
 *     - high-fidelity markdown is gated by a daily quota that lets the
 *       user feel the value before hitting the wall
 *
 *   HOOK (Free limited, Pro unlimited — gets people to keep using)
 *     - high-fidelity markdown export (3/day signed-in, 1/day anonymous)
 *     - share links (3 active for Free)
 *     - prompt library (v1.2)
 *
 *   HIT (Pro only — what people pay for once they depend on it)
 *     - cloud sync across devices
 *     - multi-format export (PDF / HTML / JSON)
 *     - batch export of all conversations
 *     - advanced search with preview snippets
 *     - unlimited share links + prompt sync
 */
export const PRICING_PLANS = [
  {
    key: "free",
    name: PLAN_CONFIG.free.name,
    summary: "Capture every chat across 6 AI platforms. Local-first.",
    priceLabel: "Free",
    cta: "Get started",
    amount: PLAN_CONFIG.free.amount,
    interval: PLAN_CONFIG.free.interval,
    features: [
      { label: "Save chats from 6 AI platforms (auto)", status: "available" },
      { label: "Plain-text export (unlimited)", status: "available" },
      {
        label: "High-fidelity Markdown export — 1/day signed-out, 3/day signed-in",
        status: "available",
        highlight: true,
      },
      { label: "Share links — 3 free shares", status: "available", highlight: true },
      { label: "Highlight & Memo", status: "available" },
      { label: "Instant search", status: "available" },
      { label: "Message navigation minimap", status: "coming" },
      { label: "Prompt library", status: "coming" },
    ],
  },
  {
    key: "monthly",
    name: PLAN_CONFIG.monthly.name,
    summary: "Unlimited fidelity, sync, and sharing for power users.",
    priceLabel: `$${PLAN_CONFIG.monthly.amount.toFixed(2)} / month`,
    cta: "Start monthly",
    amount: PLAN_CONFIG.monthly.amount,
    interval: PLAN_CONFIG.monthly.interval,
    features: [
      { label: "Everything in Free", status: "available" },
      {
        label: "Unlimited high-fidelity Markdown export",
        status: "available",
        highlight: true,
      },
      {
        label: "Multi-format export — PDF / HTML / JSON",
        status: "available",
        highlight: true,
      },
      { label: "Batch export (one-click export all)", status: "available", highlight: true },
      { label: "Cloud sync across devices", status: "available", highlight: true },
      { label: "Advanced search with preview snippets", status: "available" },
      { label: "Unlimited share links", status: "available", highlight: true },
      { label: "Unlimited Prompt library + sync", status: "coming" },
    ],
  },
  {
    key: "annual",
    name: PLAN_CONFIG.annual.name,
    summary: `Best value — save $${ANNUAL_SAVINGS_USD.toFixed(2)} per year.`,
    priceLabel: `$${PLAN_CONFIG.annual.amount.toFixed(2)} / year`,
    cta: "Start annual",
    amount: PLAN_CONFIG.annual.amount,
    interval: PLAN_CONFIG.annual.interval,
    features: [
      { label: "Everything in Free", status: "available" },
      {
        label: "Unlimited high-fidelity Markdown export",
        status: "available",
        highlight: true,
      },
      {
        label: "Multi-format export — PDF / HTML / JSON",
        status: "available",
        highlight: true,
      },
      { label: "Batch export (one-click export all)", status: "available", highlight: true },
      { label: "Cloud sync across devices", status: "available", highlight: true },
      { label: "Advanced search with preview snippets", status: "available" },
      { label: "Unlimited share links", status: "available", highlight: true },
      { label: "Unlimited Prompt library + sync", status: "coming" },
    ],
  },
] as const;
