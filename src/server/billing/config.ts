import { env } from "~/env";
import { BILLING_CURRENCY, PLAN_CONFIG } from "~/lib/pricing";
import type { BillingProvider, PlanKey } from "~/lib/billing/types";

const DEFAULT_TRIAL_DAYS = 7;
const DEFAULT_PAST_DUE_GRACE_DAYS = 5;

export const getTrialDays = () => env.SUBSCRIPTION_TRIAL_DAYS ?? DEFAULT_TRIAL_DAYS;

export const getPastDueGraceDays = () => env.PAST_DUE_GRACE_DAYS ?? DEFAULT_PAST_DUE_GRACE_DAYS;

export const getBillingCurrency = () => BILLING_CURRENCY;

export const getPlanConfig = (planKey: PlanKey) => {
  const plan = PLAN_CONFIG[planKey];
  if (!plan) {
    throw new Error(`Unknown planKey: ${planKey}`);
  }
  return plan;
};

export const getDefaultProvider = (): BillingProvider => "stripe";

export const isStripeEnabled = () => !!env.STRIPE_SECRET_KEY;

export const isCreemEnabled = () => !!env.CREEM_API_KEY;

export const getCreemProductId = (planKey: PlanKey) => {
  if (planKey === "monthly") return env.CREEM_PRODUCT_ID_MONTHLY;
  if (planKey === "annual") return env.CREEM_PRODUCT_ID_ANNUAL;
  return undefined;
};

export const getBillingOrigin = () => {
  return new URL(env.BETTER_AUTH_URL).origin;
};
