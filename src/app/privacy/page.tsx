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

          <h2>Local data and cloud sync (Pro)</h2>
          <p>
            ChatKeep is local-first by default. Your saved chats and notes stay in your browser
            unless you are on a <strong>Pro plan</strong>, sign in, review the sync privacy notice,
            and turn on cloud sync. Cloud sync is not available on the Free plan.
          </p>
          <p>
            If you are on a Pro plan and opt in to cloud sync, ChatKeep uploads the chats, notes,
            record identifiers, timestamps, deletion markers, device identifiers, and sync metadata
            needed to keep your signed-in devices aligned. Synced data is associated with your
            ChatKeep account so the same account can read and update it across devices.
          </p>
          <p>
            Turning cloud sync off stops future uploads and pulls for that account, but it does not
            automatically delete data that was already synced. Use the clear cloud data action to
            delete the cloud copy; your local browser data is not deleted by that action.
          </p>

          <h2>Quota tracking</h2>
          <p>
            To enforce daily limits on the Free plan (high-fidelity Markdown exports) and active
            limits on share links, we record <strong>counters</strong> tied to your account: the UTC
            date and the count of high-fidelity exports for that day, and the count of your active
            share links. <strong>We do not record the chat content</strong> being exported or shared
            as part of quota tracking, only the count and timestamp.
          </p>
          <p>
            For signed-out users, a small counter is stored locally in{" "}
            <code>chrome.storage.local</code> on your device to enforce the 1-export-per-day
            allowance; this counter is not transmitted to our servers. To prevent double-billing on
            retries, a short-lived idempotency record (key + result) is kept on our servers and
            pruned after about 2 hours.
          </p>

          <h2>Payments</h2>
          <p>
            Payments are processed by Stripe and Creem. We share your account email and a
            subscription identifier with the chosen processor so they can create and manage your
            subscription. <strong>We do not store your full payment card details</strong> on our
            servers; that data lives with Stripe / Creem under their own privacy practices.
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
            You can request access, export, deletion, or clarification of data tied to your account
            by contacting <a href="mailto:support@chatkeep.dev">support@chatkeep.dev</a>. On request
            we will provide a copy of the data we hold for your account (chats and notes you chose
            to sync, share-link metadata, and quota counters) in a portable machine-readable format.
            Account deletion removes your synced data, share-link rows, and quota counters;
            locally-stored chats in your browser are not affected and remain under your control.
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
