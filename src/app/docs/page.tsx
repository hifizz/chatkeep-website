import Link from "next/link";
import { MarketingShell } from "~/components/marketing/marketing-shell";

const docsSections = [
  {
    title: "Compatibility",
    description: "Supported AI platforms and browser support.",
    href: "/docs/compatibility",
  },
  {
    title: "Current Limitations",
    description: "Known constraints and what to expect right now.",
    href: "/docs/limitations",
  },
  {
    title: "Roadmap",
    description: "What we're building next and our target timelines.",
    href: "/docs/roadmap",
  },
];

export default function DocsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Docs</p>
          <h1 className="font-display text-4xl text-white">Product Documentation</h1>
          <p className="text-sm text-neutral-400">
            Everything you need to understand platform support, current limits, and planned updates.
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Last updated: March 22, 2026
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {docsSections.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:bg-neutral-900"
            >
              <h2 className="text-lg font-semibold text-white">{section.title}</h2>
              <p className="mt-2 text-sm text-neutral-400">{section.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
