import Stripe from "stripe";
import { env } from "~/env";
import type { BillingProvider, PlanKey } from "~/lib/billing/types";
import { getBillingCurrency, getPlanConfig, getTrialDays } from "./config";
import {
  findUserIdByEmail,
  getSubscriptionByCustomerId,
  getSubscriptionByProviderId,
  recordWebhookEvent,
  updateSubscriptionStatus,
  upsertSubscription,
} from "./subscription-repo";

const PROVIDER: BillingProvider = "stripe";

const getStripeClient = () => {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error("Stripe is not configured");
  }
  return new Stripe(env.STRIPE_SECRET_KEY, {
    apiVersion: Stripe.API_VERSION as Stripe.LatestApiVersion,
    typescript: true,
  });
};

const mapStripeStatus = (subscription: Stripe.Subscription) => {
  const status = subscription.status;
  const item = subscription.items.data[0];
  const currentPeriodEnd = item
    ? new Date(item.current_period_end * 1000)
    : new Date(subscription.created * 1000);

  if (status === "trialing") return "trial" as const;
  if (status === "active") {
    if (subscription.cancel_at_period_end && currentPeriodEnd > new Date()) {
      return "grace" as const;
    }
    return "active" as const;
  }
  if (status === "past_due") return "past_due" as const;
  if (status === "canceled") {
    if (subscription.cancel_at_period_end && currentPeriodEnd > new Date()) {
      return "grace" as const;
    }
    return "canceled" as const;
  }
  if (status === "unpaid") return "past_due" as const;
  if (status === "paused") return "past_due" as const;
  if (status === "incomplete" || status === "incomplete_expired") {
    return "past_due" as const;
  }
  return "canceled" as const;
};

const resolvePlanKey = (subscription: Stripe.Subscription): PlanKey | null => {
  const metadataPlanKey = subscription.metadata?.planKey;
  if (metadataPlanKey === "monthly" || metadataPlanKey === "annual" || metadataPlanKey === "free") {
    return metadataPlanKey;
  }

  const item = subscription.items.data[0];
  const interval = item?.price?.recurring?.interval;
  if (interval === "month") return "monthly";
  if (interval === "year") return "annual";
  return null;
};

const resolveUserId = async (
  subscription: Stripe.Subscription,
  session?: Stripe.Checkout.Session,
) => {
  const metadataUserId =
    subscription.metadata?.userId ||
    session?.metadata?.userId ||
    subscription.metadata?.referenceId;
  if (metadataUserId) return String(metadataUserId);
  if (session?.client_reference_id) return session.client_reference_id;
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id;
  if (customerId) {
    const record = await getSubscriptionByCustomerId(PROVIDER, customerId);
    if (record) return record.userId;
  }
  const customer =
    typeof subscription.customer === "string" ? null : (subscription.customer ?? null);
  const customerEmail = customer && "email" in customer ? (customer.email ?? undefined) : undefined;
  const email = session?.customer_details?.email ?? session?.customer_email ?? customerEmail;
  if (email) {
    return await findUserIdByEmail(email);
  }
  return null;
};

export const createStripeCheckout = async (input: {
  userId: string;
  email?: string | null;
  planKey: PlanKey;
  successUrl: string;
  cancelUrl: string;
  trialAllowed: boolean;
}) => {
  const stripe = getStripeClient();
  const plan = getPlanConfig(input.planKey);

  if (!plan.interval) {
    throw new Error("Free plan does not support checkout");
  }

  const unitAmount = Math.round(plan.amount * 100);
  const trialDays = input.trialAllowed ? getTrialDays() : undefined;
  const currency = getBillingCurrency().toLowerCase();

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: input.email ?? undefined,
    client_reference_id: input.userId,
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    line_items: [
      {
        price_data: {
          currency,
          unit_amount: unitAmount,
          recurring: {
            interval: plan.interval,
          },
          product_data: {
            name: `ChatKeep ${plan.name}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      userId: input.userId,
      planKey: input.planKey,
      referenceId: input.userId,
    },
    subscription_data: {
      trial_period_days: trialDays,
      metadata: {
        userId: input.userId,
        planKey: input.planKey,
        referenceId: input.userId,
      },
    },
  });

  if (!session.url) {
    throw new Error("Stripe checkout URL not available");
  }

  return session.url;
};

const syncStripeSubscription = async (
  subscription: Stripe.Subscription,
  session?: Stripe.Checkout.Session,
) => {
  const userId = await resolveUserId(subscription, session);
  if (!userId) return;

  const planKey = resolvePlanKey(subscription);
  if (!planKey || planKey === "free") return;

  const status = mapStripeStatus(subscription);
  const item = subscription.items.data[0];
  const currentPeriodStart = item
    ? new Date(item.current_period_start * 1000)
    : new Date(subscription.created * 1000);
  const currentPeriodEnd = item
    ? new Date(item.current_period_end * 1000)
    : new Date(subscription.created * 1000);
  const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1000) : null;

  await upsertSubscription({
    userId,
    planKey,
    provider: PROVIDER,
    status,
    currentPeriodStart,
    currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
    trialEndsAt: trialEndsAt ?? undefined,
    providerCustomerId:
      typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id,
    providerSubscriptionId: subscription.id,
    trialUsed: status === "trial",
  });
};

export const __test__ = {
  mapStripeStatus,
  resolvePlanKey,
  resolveUserId,
};

const handleRefundEvent = async (
  charge: Stripe.Charge & { invoice?: string | Stripe.Invoice | null },
) => {
  const stripe = getStripeClient();
  if (!charge.invoice) return;

  const invoiceId = typeof charge.invoice === "string" ? charge.invoice : charge.invoice.id;
  const invoice = (await stripe.invoices.retrieve(invoiceId)) as Stripe.Invoice & {
    subscription?: string | Stripe.Subscription | null;
  };
  const subscriptionId =
    typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;

  if (!subscriptionId || typeof subscriptionId !== "string") return;

  const record = await getSubscriptionByProviderId(PROVIDER, subscriptionId);
  if (!record) return;

  await updateSubscriptionStatus(record.userId, "refunded", {
    pastDueAt: null,
  });
};

export const handleStripeWebhook = async (input: {
  payload: string | Buffer;
  signature: string;
}) => {
  const stripe = getStripeClient();
  if (!env.STRIPE_WEBHOOK_SECRET) {
    throw new Error("Stripe webhook secret not configured");
  }

  const event = stripe.webhooks.constructEvent(
    input.payload,
    input.signature,
    env.STRIPE_WEBHOOK_SECRET,
  );

  const recorded = await recordWebhookEvent(PROVIDER, event.id, event.type);
  if (!recorded) {
    return { received: true, skipped: true };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (typeof session.subscription === "string") {
        const subscription = await stripe.subscriptions.retrieve(session.subscription);
        await syncStripeSubscription(subscription, session);
      }
      break;
    }
    case "invoice.payment_failed":
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | Stripe.Subscription | null;
      };
      const subscriptionId =
        typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription?.id;
      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncStripeSubscription(subscription);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await syncStripeSubscription(subscription);
      break;
    }
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge & {
        invoice?: string | Stripe.Invoice | null;
      };
      await handleRefundEvent(charge);
      break;
    }
    default:
      break;
  }

  return { received: true };
};
