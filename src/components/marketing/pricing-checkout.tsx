"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rpcClient, parseRpcResponse } from "~/lib/rpc-client";
import { PRICING_PLANS } from "~/lib/pricing";
import { useSession } from "~/lib/auth-client";
import type { CheckoutResponseDTO, PlanKey } from "~/lib/billing/types";

export function PricingCheckoutGrid() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async (planKey: PlanKey) => {
    if (!session) {
      router.push("/login?callbackUrl=/pricing");
      return;
    }

    setError(null);
    setLoadingPlan(planKey);

    try {
      const response = await rpcClient.rpc.billing.checkout.$post({
        json: {
          planKey,
          provider: "creem",
        },
      });
      const { data, error: rpcError } = await parseRpcResponse<CheckoutResponseDTO>(response);

      if (rpcError || !data?.url) {
        setError(rpcError?.message ?? "Checkout failed");
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      setError(message);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {PRICING_PLANS.map((plan) => (
          <div
            key={plan.key}
            className={`relative flex h-full flex-col justify-between rounded-3xl border p-6 shadow-sm transition hover:bg-neutral-900 ${
              plan.key === "monthly"
                ? "border-emerald-500/60 bg-emerald-500/5"
                : "border-neutral-800 bg-neutral-900/50"
            }`}
          >
            {plan.key === "monthly" ? (
              <div className="absolute left-6 top-0 z-10 -translate-y-1/2 rounded-full border border-emerald-500 bg-emerald-950 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-100 shadow-sm">
                Most popular
              </div>
            ) : null}
            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-neutral-400">{plan.name}</p>
                <p className="mt-2 text-3xl font-semibold text-white">{plan.priceLabel}</p>
                {plan.key === "annual" ? (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    Get 2 months free
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-neutral-400">{plan.summary}</p>
              </div>

              <ul className="space-y-3 text-sm text-neutral-400">
                {plan.features.map((feature) => {
                  const isHighlight = "highlight" in feature && feature.highlight;
                  return (
                    <li key={feature.label} className="flex items-start gap-2">
                      <span
                        className={`mt-1 h-2.5 w-2.5 rounded-full ${
                          feature.status === "available" ? "bg-white" : "border border-neutral-700"
                        }`}
                      />
                      <span
                        className={
                          isHighlight ? "font-semibold text-emerald-200" : "text-neutral-400"
                        }
                      >
                        {feature.label}
                        {feature.status === "coming" && (
                          <span className="ml-2 rounded-full border border-neutral-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                            Coming soon
                          </span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {plan.key === "free" ? (
              <Link
                href="/install"
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-neutral-200 hover:cursor-pointer"
              >
                {plan.cta}
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => handleCheckout(plan.key)}
                disabled={loadingPlan === plan.key}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-neutral-200 hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingPlan === plan.key ? "Redirecting..." : plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
