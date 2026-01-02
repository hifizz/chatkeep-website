import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { billingWebhookEvent, user, userSubscription } from "~/server/db/schema";
import type { BillingProvider, PlanKey, SubscriptionStatus } from "~/lib/billing/types";
import { getPastDueGraceDays } from "./config";

export type SubscriptionRecord = typeof userSubscription.$inferSelect;

export type UpsertSubscriptionInput = {
  userId: string;
  planKey: PlanKey;
  provider: BillingProvider;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  trialEndsAt?: Date | null;
  trialUsed?: boolean;
  pastDueAt?: Date | null;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
};

const getWebhookEventId = (provider: BillingProvider, eventId: string) => `${provider}:${eventId}`;

export const hasProcessedWebhookEvent = async (provider: BillingProvider, eventId: string) => {
  if (!db) return false;
  const id = getWebhookEventId(provider, eventId);
  const existing = await db
    .select({ id: billingWebhookEvent.id })
    .from(billingWebhookEvent)
    .where(eq(billingWebhookEvent.id, id))
    .limit(1);
  return existing.length > 0;
};

export const recordWebhookEvent = async (
  provider: BillingProvider,
  eventId: string,
  eventType: string,
) => {
  if (!db) return false;
  const id = getWebhookEventId(provider, eventId);
  const existing = await db
    .select({ id: billingWebhookEvent.id })
    .from(billingWebhookEvent)
    .where(eq(billingWebhookEvent.id, id))
    .limit(1);
  if (existing.length > 0) return false;
  await db.insert(billingWebhookEvent).values({
    id,
    provider,
    eventType,
    receivedAt: new Date(),
  });
  return true;
};

export const getSubscriptionForUser = async (userId: string) => {
  if (!db) return null;
  const rows = await db
    .select()
    .from(userSubscription)
    .where(eq(userSubscription.userId, userId))
    .limit(1);
  if (rows.length === 0) return null;

  const record = rows[0];
  if (!record) return null;
  if (record.status === "past_due" && !record.pastDueAt) {
    const updated = await db
      .update(userSubscription)
      .set({ pastDueAt: record.updatedAt ?? new Date(), updatedAt: new Date() })
      .where(eq(userSubscription.userId, userId))
      .returning();
    return updated[0] ?? record;
  }

  if (record.status === "past_due" && record.pastDueAt) {
    const graceDays = getPastDueGraceDays();
    const deadline = new Date(record.pastDueAt.getTime());
    deadline.setDate(deadline.getDate() + graceDays);

    if (new Date() > deadline) {
      const updated = await db
        .update(userSubscription)
        .set({
          status: "canceled",
          updatedAt: new Date(),
        })
        .where(eq(userSubscription.userId, userId))
        .returning();
      return updated[0] ?? record;
    }
  }

  return record;
};

export const getSubscriptionByProviderId = async (
  provider: BillingProvider,
  providerSubscriptionId: string,
) => {
  if (!db) return null;
  const rows = await db
    .select()
    .from(userSubscription)
    .where(
      and(
        eq(userSubscription.provider, provider),
        eq(userSubscription.providerSubscriptionId, providerSubscriptionId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
};

export const getSubscriptionByCustomerId = async (
  provider: BillingProvider,
  providerCustomerId: string,
) => {
  if (!db) return null;
  const rows = await db
    .select()
    .from(userSubscription)
    .where(
      and(
        eq(userSubscription.provider, provider),
        eq(userSubscription.providerCustomerId, providerCustomerId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
};

export const findUserIdByEmail = async (email: string | null | undefined) => {
  if (!db || !email) return null;
  const rows = await db.select({ id: user.id }).from(user).where(eq(user.email, email)).limit(1);
  return rows[0]?.id ?? null;
};

export const hasUsedTrial = async (userId: string) => {
  if (!db) return false;
  const rows = await db
    .select({ trialUsed: userSubscription.trialUsed })
    .from(userSubscription)
    .where(eq(userSubscription.userId, userId))
    .limit(1);
  return rows[0]?.trialUsed ?? false;
};

export const upsertSubscription = async (input: UpsertSubscriptionInput) => {
  if (!db) return null;
  const existing = await db
    .select({
      userId: userSubscription.userId,
      trialUsed: userSubscription.trialUsed,
      pastDueAt: userSubscription.pastDueAt,
    })
    .from(userSubscription)
    .where(eq(userSubscription.userId, input.userId))
    .limit(1);

  const existingRecord = existing[0];
  const trialUsedValue = existingRecord?.trialUsed ?? input.trialUsed ?? input.status === "trial";
  const pastDueAtValue =
    input.status === "past_due"
      ? (input.pastDueAt ?? existingRecord?.pastDueAt ?? new Date())
      : null;
  const payload = {
    planKey: input.planKey,
    provider: input.provider,
    status: input.status,
    currentPeriodStart: input.currentPeriodStart,
    currentPeriodEnd: input.currentPeriodEnd,
    cancelAtPeriodEnd: input.cancelAtPeriodEnd,
    trialEndsAt: input.trialEndsAt ?? null,
    trialUsed: trialUsedValue,
    pastDueAt: pastDueAtValue,
    providerCustomerId: input.providerCustomerId ?? null,
    providerSubscriptionId: input.providerSubscriptionId ?? null,
    updatedAt: new Date(),
  };

  if (existingRecord) {
    const updated = await db
      .update(userSubscription)
      .set(payload)
      .where(eq(userSubscription.userId, input.userId))
      .returning();
    return updated[0] ?? null;
  }

  const created = await db
    .insert(userSubscription)
    .values({
      userId: input.userId,
      ...payload,
      createdAt: new Date(),
    })
    .returning();
  return created[0] ?? null;
};

export const updateSubscriptionStatus = async (
  userId: string,
  status: SubscriptionStatus,
  updates: Partial<Omit<UpsertSubscriptionInput, "userId" | "status">> = {},
) => {
  if (!db) return null;
  const payload = {
    status,
    updatedAt: new Date(),
    ...updates,
  };
  const updated = await db
    .update(userSubscription)
    .set(payload)
    .where(eq(userSubscription.userId, userId))
    .returning();
  return updated[0] ?? null;
};
