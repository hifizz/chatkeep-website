import { MarketingShell } from "~/components/marketing/marketing-shell";

export default function PrivacyPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-20">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-white">Privacy Policy</h1>
        <p className="mb-10 text-xl text-neutral-400">Local-first, clear, and transparent.</p>

        <article className="prose prose-neutral prose-invert max-w-none prose-headings:text-white prose-p:text-neutral-400 prose-strong:text-white prose-a:text-white prose-a:underline hover:prose-a:text-neutral-200">
          <h2>Who we are</h2>
          <p>
            ChatKeep is operated by an independent developer. If you have questions, contact{" "}
            <a href="mailto:support@chatkeep.dev">support@chatkeep.dev</a>.
          </p>

          <h2>What we collect</h2>
          <p>
            We use Google Analytics and Microsoft Clarity to measure usage across our website and
            extension. This may include device and browser data, pages visited, interactions,
            approximate location derived from IP, and session replay data from Clarity.
          </p>

          <h2>What we do not collect</h2>
          <p>
            We do not collect or upload your chat content. ChatKeep stores chat history locally in
            your browser. Cloud sync is not available yet and will require opt-in when it launches.
          </p>

          <h2>Payments</h2>
          <p>
            Payments are processed by Stripe and Creem. We do not store your full payment card
            details on our servers.
          </p>

          <h2>Cookies and analytics choices</h2>
          <p>
            You can accept or reject analytics cookies through the cookie banner. If you reject,
            analytics scripts will not load. You can change your choice by clearing site data and
            revisiting the site.
          </p>

          <h2>Data retention</h2>
          <p>
            Analytics data is retained according to the policies of Google Analytics and Microsoft
            Clarity. We keep operational data only as long as necessary for product improvement.
          </p>

          <h2>Your rights</h2>
          <p>
            You can request access, deletion, or clarification of analytics data tied to your usage
            by contacting <a href="mailto:support@chatkeep.dev">support@chatkeep.dev</a>.
          </p>

          <h2>Changes</h2>
          <p>
            We will update this policy as the product evolves. Material changes will be posted on
            this page.
          </p>
        </article>
      </div>
    </MarketingShell>
  );
}
