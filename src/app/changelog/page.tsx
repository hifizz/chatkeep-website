import { MarketingShell } from "~/components/marketing/marketing-shell";

const updates = [
  {
    date: "April 7, 2026",
    title: "Claude platform support",
    description:
      "Added Claude conversation support across sync and export flows, including note locate and highlight recovery in Claude chats.",
  },
  {
    date: "March 18, 2026",
    title: "Sync consistency upgrade",
    description:
      "Introduced weak-realtime + strong eventual ordering so multi-device sync converges more reliably.",
  },
  {
    date: "March 4, 2026",
    title: "Canonical URL merge for chats",
    description:
      "Chats from the same canonical URL are merged into one thread to reduce fragmented history and missing messages.",
  },
  {
    date: "February 15, 2026",
    title: "Session-aware auto sync",
    description:
      "Added standardized auto sync after session content loads, reducing the need for repeated manual sync.",
  },
  {
    date: "February 15, 2026",
    title: "Image export",
    description:
      "You can now export selected chat content as images for sharing and documentation.",
  },
  {
    date: "January 5, 2026",
    title: "Expanded language support",
    description: "Added i18n foundations and shipped Chinese, Japanese, and Korean language packs.",
  },
  {
    date: "January 3, 2026",
    title: "More platform support for notes and locate",
    description:
      "Note and locate workflows now support ChatGPT, DeepSeek, and Grok across platform contexts.",
  },
  {
    date: "December 30, 2025",
    title: "Cloud sync",
    description: "Released cloud sync to keep chat data aligned across sessions and devices.",
  },
  {
    date: "December 29, 2025",
    title: "Manual import and export",
    description:
      "Added manual import/export so users can back up data and migrate between environments.",
  },
  {
    date: "December 27, 2025",
    title: "Persistent highlight and locate",
    description:
      "Shipped cross-element text highlight persistence and note-to-chat locate navigation.",
  },
  {
    date: "December 20, 2025",
    title: "Notes with tags and full CRUD",
    description:
      "Added note tags, aggregated note views, and complete create/read/update/delete flows.",
  },
  {
    date: "December 18, 2025",
    title: "Search and in-place detail preview",
    description:
      "Launched chat search with drawer-based detail preview, so users can inspect results without page jumps.",
  },
  {
    date: "December 17, 2025",
    title: "Mark note",
    description: "Introduced mark note to capture key points directly from chat context.",
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
