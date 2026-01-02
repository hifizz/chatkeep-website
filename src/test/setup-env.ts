import { vi } from "vitest";

vi.mock("~/env", () => ({
  env: {
    DATABASE_URL: "postgres://localhost:5432/test",
    NODE_ENV: "test",
    BETTER_AUTH_SECRET: "test-secret",
    BETTER_AUTH_URL: "http://localhost:3030",
    RESEND_API_KEY: "test-resend",
    AUTH_ALLOWED_ORIGINS: undefined,
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_WEBHOOK_SECRET: "whsec_test_123",
    CREEM_API_KEY: "creem_test",
    CREEM_WEBHOOK_SECRET: "creem_whsec_test",
    CREEM_PRODUCT_ID_MONTHLY: "creem_monthly_test",
    CREEM_PRODUCT_ID_ANNUAL: "creem_annual_test",
    SUBSCRIPTION_TRIAL_DAYS: 7,
    PAST_DUE_GRACE_DAYS: 5,
    NEXT_PUBLIC_GA_ID: undefined,
    NEXT_PUBLIC_CLARITY_ID: undefined,
  },
}));
