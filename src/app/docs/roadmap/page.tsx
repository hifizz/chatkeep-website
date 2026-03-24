import { MarketingShell } from "~/components/marketing/marketing-shell";

const roadmapItems = [
  {
    target: "Q1 2026 target",
    title: "Cloud sync for paid plans",
    description: "Launch opt-in cloud sync for users who want multi-device continuity.",
  },
  {
    target: "Q1 2026 target",
    title: "Additional export formats",
    description: "Add PDF, HTML, and JSON export options alongside Markdown.",
  },
  {
    target: "Q1 2026 target",
    title: "TOC minimap rollout completion",
    description: "Complete rollout and tuning for long-thread navigation support.",
  },
  {
    target: "Q1 2026 target",
    title: "Share links",
    description: "Introduce controlled share links for selected conversations.",
  },
];

export default function RoadmapDocsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Docs / Roadmap
          </p>
          <h1 className="font-display text-4xl text-white">Roadmap</h1>
          <p className="text-sm text-neutral-400">
            Planned product milestones and target windows. Timelines may shift with development
            progress and user feedback.
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Last updated: March 22, 2026
          </p>
        </div>

        <div className="space-y-4">
          {roadmapItems.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:bg-neutral-900"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">{item.target}</p>
              <h2 className="mt-2 text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-neutral-400">{item.description}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
