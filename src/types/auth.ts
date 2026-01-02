import type { BillingProvider, PlanKey, SubscriptionStatus } from "~/lib/billing/types";

export type AuthUserDTO = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isPro?: boolean;
  plan?: {
    key: PlanKey;
    status: SubscriptionStatus | null;
    currentPeriodEnd?: string | null;
    cancelAtPeriodEnd?: boolean;
    provider?: BillingProvider | null;
  } | null;
};

export type AuthSessionDTO = {
  id: string;
  expiresAt: string;
};

export type AuthMeResponseDTO = {
  user: AuthUserDTO;
  session: AuthSessionDTO;
};

export type AuthErrorDTO = {
  status: number;
  message: string;
};
