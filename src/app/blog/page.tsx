import { MarketingShell } from "~/components/marketing/marketing-shell";

const upcomingPosts = [
  {
    title: "How to build a local-first AI chat library",
    label: "Coming soon",
  },
  {
    title: "From prompt to workflow: organizing AI conversations",
    label: "Coming soon",
  },
  {
    title: "Why TOC minimaps change long chat navigation",
    label: "Coming soon",
  },
];

export default function BlogPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Blog</p>
          <h1 className="font-display text-4xl text-white">
            Product updates, workflows, and field notes.
          </h1>
          <p className="text-sm text-neutral-400">
            We share how we build ChatKeep, plus practical workflows for power users.
          </p>
        </div>

        <div className="grid gap-4">
          {upcomingPosts.map((post) => (
            <div
              key={post.title}
              className="flex items-center justify-between rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 hover:bg-neutral-900 transition-colors"
            >
              <div>
                <p className="text-lg font-semibold text-white">{post.title}</p>
                <p className="text-xs text-neutral-400">Stay tuned.</p>
              </div>
              <span className="rounded-full border border-neutral-800 px-3 py-1 text-xs uppercase tracking-wide text-neutral-500">
                {post.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
