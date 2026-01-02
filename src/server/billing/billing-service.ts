import { createCheckout as createCreemCheckout } from "@creem_io/better-auth/server";
import { env } from "~/env";
import type { CheckoutRequestDTO, CheckoutResponseDTO } from "~/lib/billing/types";
import type { PlanKey } from "~/lib/billing/types";
import {
  getCreemProductId,
  getDefaultProvider,
  getPlanConfig,
  isCreemEnabled,
  isStripeEnabled,
} from "./config";
import { resolveRedirectUrl } from "./redirects";
import { createStripeCheckout } from "./stripe";
import { hasUsedTrial } from "./subscription-repo";

const DEFAULT_SUCCESS_PATH = "/billing/success";
const DEFAULT_CANCEL_PATH = "/pricing?checkout=cancel";

const assertPlanKey = (planKey: PlanKey) => {
  const plan = getPlanConfig(planKey);
  if (planKey === "free" || plan.amount <= 0) {
    throw new Error("Free plan does not support checkout");
  }
  return plan;
};

const assertProvider = (provider: string): "stripe" | "creem" => {
  if (provider !== "stripe" && provider !== "creem") {
    throw new Error("Unsupported provider");
  }
  return provider;
};

export const createCheckout = async (
  input: CheckoutRequestDTO,
  user: { id: string; email?: string | null },
): Promise<CheckoutResponseDTO> => {
  const provider = assertProvider(input.provider ?? getDefaultProvider());
  const plan = assertPlanKey(input.planKey);

  const successUrl = resolveRedirectUrl(input.successUrl, DEFAULT_SUCCESS_PATH);
  const cancelUrl = resolveRedirectUrl(input.cancelUrl, DEFAULT_CANCEL_PATH);

  if (provider === "stripe") {
    if (!isStripeEnabled()) {
      throw new Error("Stripe is not available");
    }

    const trialAllowed = !(await hasUsedTrial(user.id));
    const url = await createStripeCheckout({
      userId: user.id,
      email: user.email ?? undefined,
      planKey: input.planKey,
      successUrl,
      cancelUrl,
      trialAllowed,
    });

    return { provider, url };
  }

  if (!isCreemEnabled()) {
    throw new Error("Creem is not available");
  }

  const productId = getCreemProductId(input.planKey);
  if (!productId) {
    throw new Error("Creem productId not configured");
  }

  const customer = user.email ? { email: user.email } : { id: user.id };

  const checkout = await createCreemCheckout(
    {
      apiKey: env.CREEM_API_KEY ?? "",
      testMode: env.NODE_ENV !== "production",
    },
    {
      productId,
      customer: {
        ...customer,
      },
      successUrl,
      metadata: {
        referenceId: user.id,
        userId: user.id,
        planKey: plan.key,
      },
    },
  );

  return { provider, url: checkout.url };
};
