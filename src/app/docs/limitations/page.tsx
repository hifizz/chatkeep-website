import { MarketingShell } from "~/components/marketing/marketing-shell";

const limitations = [
  "Cloud sync is not live yet. It is planned for paid plans as an opt-in feature.",
  "Markdown export is available now. PDF, HTML, and JSON exports are planned.",
  "TOC minimap navigation is still in rollout.",
  "The primary install flow is Chrome-first. Firefox and Safari are not supported yet.",
  "Team collaboration features, including share links, are not available yet.",
];

export default function LimitationsDocsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Docs / Limitations
          </p>
          <h1 className="font-display text-4xl text-white">Current Limitations</h1>
          <p className="text-sm text-neutral-400">
            Known constraints so you can evaluate fit before adopting ChatKeep in your workflow.
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Last updated: March 22, 2026
          </p>
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="space-y-3">
            {limitations.map((item) => (
              <div
                key={item}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
              >
                <p className="text-sm text-neutral-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
