import { MarketingShell } from "~/components/marketing/marketing-shell";

export default function TermsPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">Terms of Service</h1>
        <p className="mb-10 text-xl text-neutral-400">Clear terms for a focused product.</p>

        <article className="prose prose-neutral prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-400 prose-strong:text-white prose-a:text-white prose-a:underline hover:prose-a:text-neutral-200">
          <h2>Service overview</h2>
          <p>
            ChatKeep provides a local-first browser extension and companion website. Features may
            change or evolve as we improve the product.
          </p>

          <h2>Optional cloud sync</h2>
          <p>
            Cloud sync is optional. If you turn it on, you authorize ChatKeep to store and process
            your synced chats, notes, and sync metadata so they can be available across devices
            signed in to the same account. You are responsible for the content you choose to sync.
          </p>
          <p>
            Cloud sync is not a permanent backup service. We work to keep synced data available, but
            you should keep separate copies of important information. Turning sync off stops future
            syncing; clearing cloud data deletes the cloud copy without deleting local browser data.
          </p>

          <h2>Plans, features, and quotas</h2>
          <p>
            ChatKeep is offered on a Free plan and Pro plans (Monthly or Annual). Some features are
            metered on the Free plan and unmetered on Pro:
          </p>
          <ul>
            <li>
              <strong>High-fidelity Markdown export</strong> means an export that preserves code
              blocks, tables, math expressions, images, and structured reasoning (e.g., Deep
              Research / thinking traces) using platform-aware conversion. The Free plan allows
              <strong> 1 high-fidelity export per UTC day for signed-out users</strong> and{" "}
              <strong>3 high-fidelity exports per UTC day for signed-in users</strong>; once the
              daily quota is consumed, additional exports on Free fall back to plain text. Pro users
              get unlimited high-fidelity exports.
            </li>
            <li>
              <strong>Multi-format export</strong> (PDF / HTML / JSON) and{" "}
              <strong>batch export</strong> are Pro-only.
            </li>
            <li>
              <strong>Share links</strong>: Free users may have up to 3 active share links at any
              time; revoking or letting an existing share expire frees a slot. Already-issued share
              URLs continue to work even when at the limit. Pro users get unlimited active share
              links.
            </li>
            <li>
              <strong>Cloud sync across devices</strong> and{" "}
              <strong>advanced search with preview snippets</strong> are Pro-only.
            </li>
          </ul>
          <p>
            Daily quotas reset at <strong>00:00 UTC</strong>. We may adjust quota values, feature
            availability, or plan features with at least <strong>30 days&apos; notice</strong> for
            material reductions affecting active subscribers.
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
