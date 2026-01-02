import { MarketingShell } from "~/components/marketing/marketing-shell";
import { PricingCheckoutGrid } from "~/components/marketing/pricing-checkout";

export default function PricingPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Pricing
          </p>
          <h1 className="font-display text-4xl text-white">
            Choose the plan that fits your workflow.
          </h1>
          <p className="text-sm text-neutral-400">
            All plans are billed in USD via Stripe or Creem. Regional pricing may apply based on
            your location. Annual plans include two months free.
          </p>
        </div>

        <PricingCheckoutGrid />

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/30 p-6 text-sm text-neutral-400">
          <p>
            Local-first by default. Cloud sync and share links will be opt-in features for paid
            plans once available.
          </p>
        </div>
      </section>
    </MarketingShell>
  );
}
