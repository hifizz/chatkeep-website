import { MarketingShell } from "~/components/marketing/marketing-shell";

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
        <p className="mb-10 text-xl text-neutral-400">Clear terms for a focused product.</p>

        <article className="prose prose-neutral prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-400 prose-strong:text-white prose-a:text-white prose-a:underline hover:prose-a:text-neutral-200">
          <h2>Service overview</h2>
          <p>
            ChatKeep provides a local-first browser extension and companion website. Features may
            change or evolve as we improve the product.
          </p>

          <h2>Subscriptions and billing</h2>
          <p>
            Paid plans are billed in USD through Stripe or Creem. You can cancel anytime to stop
            future renewals.
          </p>

          <h2>7-day refund policy</h2>
          <p>
            You may request a full refund within 7 days of your initial purchase. After 7 days,
            payments are non-refundable except where required by law.
          </p>

          <h2>Acceptable use</h2>
          <p>
            You agree not to misuse the service or attempt to disrupt it. You are responsible for
            the data you store locally.
          </p>

          <h2>Third-party services</h2>
          <p>
            We rely on third-party providers such as Stripe, Creem, Google Analytics, and Microsoft
            Clarity. Their policies apply to the data they process.
          </p>

          <h2>Disclaimer and liability</h2>
          <p>
            ChatKeep is provided &quot;as is&quot; without warranties. To the maximum extent
            permitted by law, our liability is limited to the fees paid in the last 12 months.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms from time to time. Material changes will be posted on this
            page.
          </p>

          <h2>Contact</h2>
          <p>
            If you have questions, contact{" "}
            <a href="mailto:support@chatkeep.dev">support@chatkeep.dev</a>.
          </p>
        </article>
      </div>
    </MarketingShell>
  );
}
