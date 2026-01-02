import type { FlatRefundCreated, FlatSubscriptionEvent } from "@creem_io/better-auth";
import type { BillingProvider, PlanKey } from "~/lib/billing/types";
import { getCreemProductId } from "./config";
import {
  findUserIdByEmail,
  getSubscriptionByCustomerId,
  getSubscriptionByProviderId,
  recordWebhookEvent,
  updateSubscriptionStatus,
  upsertSubscription,
} from "./subscription-repo";

const PROVIDER: BillingProvider = "creem";

const mapPlanKeyFromProductId = (productId: string): PlanKey | null => {
  const monthlyId = getCreemProductId("monthly");
  const annualId = getCreemProductId("annual");
  if (monthlyId && productId === monthlyId) return "monthly";
  if (annualId && productId === annualId) return "annual";
  return null;
};

const resolveUserId = async (
  metadata: Record<string, unknown> | undefined,
  customerId: string | null | undefined,
  customerEmail: string | null | undefined,
) => {
  const ref = metadata?.referenceId ?? metadata?.userId ?? metadata?.user_id;
  if (ref) return String(ref);
  if (customerId) {
    const record = await getSubscriptionByCustomerId(PROVIDER, customerId);
    if (record) return record.userId;
  }
  return await findUserIdByEmail(customerEmail);
};

const mapCreemStatus = (
  status: "active" | "canceled" | "unpaid" | "paused" | "trialing",
  currentPeriodEnd: Date,
  canceledAt: Date | null,
) => {
  if (status === "trialing") return "trial" as const;
  if (status === "active") {
    if (canceledAt && currentPeriodEnd > new Date()) return "grace" as const;
    return "active" as const;
  }
  if (status === "unpaid") return "past_due" as const;
  if (status === "paused") return "past_due" as const;
  if (status === "canceled") {
    if (currentPeriodEnd > new Date()) return "grace" as const;
    return "canceled" as const;
  }
  return "canceled" as const;
};

const toDate = (value: unknown) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  const date = new Date(value as string);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

export const __test__ = {
  mapPlanKeyFromProductId,
  resolveUserId,
  mapCreemStatus,
  toDate,
};

export const syncCreemSubscriptionEvent = async (event: FlatSubscriptionEvent<string>) => {
  const eventRecorded = await recordWebhookEvent(PROVIDER, event.webhookId, event.webhookEventType);
  const existingSubscription = await getSubscriptionByProviderId(PROVIDER, event.id);
  if (!eventRecorded && existingSubscription) return;

  const planKeyFromMetaRaw = event.metadata?.planKey;
  const planKeyFromMeta =
    planKeyFromMetaRaw === "monthly" ||
    planKeyFromMetaRaw === "annual" ||
    planKeyFromMetaRaw === "free"
      ? planKeyFromMetaRaw
      : null;
  const planKeyFromProduct = mapPlanKeyFromProductId(event.product.id);
  const planKey = (planKeyFromMeta as PlanKey | null) ?? planKeyFromProduct;

  if (!planKey) return;

  const userId = await resolveUserId(event.metadata, event.customer.id, event.customer.email);
  if (!userId) return;

  const currentPeriodStart = toDate(event.current_period_start_date);
  const currentPeriodEnd = toDate(event.current_period_end_date);
  if (!currentPeriodStart || !currentPeriodEnd) return;

  const canceledAt = toDate(event.canceled_at);
  const status = mapCreemStatus(event.status, currentPeriodEnd, canceledAt);

  await upsertSubscription({
    userId,
    planKey,
    provider: PROVIDER,
    status,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: canceledAt !== null,
    trialEndsAt: status === "trial" ? currentPeriodEnd : undefined,
    providerCustomerId: event.customer.id,
    providerSubscriptionId: event.id,
    trialUsed: status === "trial",
  });
};

export const syncCreemRefundEvent = async (event: FlatRefundCreated) => {
  const eventRecorded = await recordWebhookEvent(PROVIDER, event.webhookId, event.webhookEventType);
  if (!eventRecorded) return;

  const subscriptionId = event.transaction.subscription;
  if (!subscriptionId) return;

  const record = await getSubscriptionByProviderId(PROVIDER, subscriptionId);
  if (!record) return;

  await updateSubscriptionStatus(record.userId, "refunded", {
    pastDueAt: null,
  });
};
