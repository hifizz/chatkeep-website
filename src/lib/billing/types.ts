import type { PlanKey } from "~/lib/pricing";

export type { PlanKey };

export type BillingProvider = "stripe" | "creem";

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "grace"
  | "past_due"
  | "canceled"
  | "refunded";

export type CheckoutRequestDTO = {
  planKey: PlanKey;
  provider?: BillingProvider;
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutResponseDTO = {
  provider: BillingProvider;
  url: string;
};

export type ProfilePlanDTO = {
  key: PlanKey;
  status: SubscriptionStatus | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  provider?: BillingProvider | null;
};

export type ProfileDTO = {
  isPro: boolean;
  plan: ProfilePlanDTO | null;
};
