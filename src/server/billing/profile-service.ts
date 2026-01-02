import type { ProfileDTO, ProfilePlanDTO, SubscriptionStatus } from "~/lib/billing/types";
import { getSubscriptionForUser } from "./subscription-repo";

const PRO_STATUSES: SubscriptionStatus[] = ["trial", "active", "grace", "past_due"];

export const getProfileForUser = async (userId: string): Promise<ProfileDTO> => {
  const record = await getSubscriptionForUser(userId);

  if (!record) {
    return { isPro: false, plan: null };
  }

  const status = record.status as SubscriptionStatus;
  const isPro = PRO_STATUSES.includes(status);

  const plan: ProfilePlanDTO = {
    key: record.planKey as ProfilePlanDTO["key"],
    status,
    currentPeriodEnd: record.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: record.cancelAtPeriodEnd ?? false,
    provider: record.provider as ProfilePlanDTO["provider"],
  };

  return { isPro, plan };
};
