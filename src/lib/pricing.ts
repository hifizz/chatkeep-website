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

export const PRICING_PLANS = [
  {
    key: "free",
    name: PLAN_CONFIG.free.name,
    summary: "Local-first basics for individual workflows.",
    priceLabel: "Free",
    cta: "Get started",
    amount: PLAN_CONFIG.free.amount,
    interval: PLAN_CONFIG.free.interval,
    features: [
      { label: "Auto-save chat history", status: "available" },
      { label: "Export to Markdown (PDF/HTML/JSON coming soon)", status: "available" },
      { label: "Highlight & Memo", status: "available" },
      { label: "Instant search", status: "available" },
      { label: "TOC minimap navigation", status: "coming" },
    ],
  },
  {
    key: "monthly",
    name: PLAN_CONFIG.monthly.name,
    summary: "Unlock pro tools and keep everything in sync.",
    priceLabel: `$${PLAN_CONFIG.monthly.amount.toFixed(2)} / month`,
    cta: "Start monthly",
    amount: PLAN_CONFIG.monthly.amount,
    interval: PLAN_CONFIG.monthly.interval,
    features: [
      { label: "Auto-save chat history", status: "available" },
      {
        label: "Export to Markdown (PDF/HTML/JSON coming soon)",
        status: "available",
        highlight: true,
      },
      { label: "Highlight & Memo", status: "available" },
      { label: "Instant search", status: "available" },
      { label: "Advanced search with preview snippets", status: "available", highlight: true },
      { label: "Cloud sync", status: "available", highlight: true },
      { label: "TOC minimap navigation", status: "coming" },
      { label: "Prompt Library button", status: "coming" },
      { label: "Share links", status: "available", highlight: true },
    ],
  },
  {
    key: "annual",
    name: PLAN_CONFIG.annual.name,
    summary: "Best value for pro tools and cloud sync.",
    priceLabel: `$${PLAN_CONFIG.annual.amount.toFixed(2)} / year`,
    cta: "Start annual",
    amount: PLAN_CONFIG.annual.amount,
    interval: PLAN_CONFIG.annual.interval,
    features: [
      { label: "Auto-save chat history", status: "available" },
      {
        label: "Export to Markdown (PDF/HTML/JSON coming soon)",
        status: "available",
        highlight: true,
      },
      { label: "Highlight & Memo", status: "available" },
      { label: "Instant search", status: "available" },
      { label: "Advanced search with preview snippets", status: "available", highlight: true },
      { label: "Cloud sync", status: "available", highlight: true },
      { label: "TOC minimap navigation", status: "coming" },
      { label: "Prompt Library button", status: "coming" },
      { label: "Share links", status: "available", highlight: true },
    ],
  },
] as const;
