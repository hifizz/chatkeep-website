import { MarketingShell } from "~/components/marketing/marketing-shell";

const updates = [
  {
    date: "March 22, 2026",
    title: "Messaging and docs consistency update",
    description:
      "Updated website copy so platform support is consistently listed as Gemini, ChatGPT, DeepSeek, and Grok.",
  },
  {
    date: "Q1 2026 target",
    title: "Documentation expansion",
    description:
      "Added dedicated docs pages for compatibility, current limitations, and roadmap updates.",
  },
];

export default function ChangelogPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Changelog
          </p>
          <h1 className="font-display text-4xl text-white">Product updates and progress.</h1>
          <p className="text-sm text-neutral-400">
            Follow along as ChatKeep ships new features and platform support.
          </p>
        </div>

        <div className="space-y-4">
          {updates.map((update) => (
            <div
              key={update.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 hover:bg-neutral-900 transition-colors"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{update.date}</p>
              <h2 className="mt-2 text-lg font-semibold text-white">{update.title}</h2>
              <p className="mt-2 text-sm text-neutral-400">{update.description}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
