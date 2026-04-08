import Link from "next/link";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { publishedPosts, upcomingPosts } from "./posts";

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
          {publishedPosts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-white">{post.title}</p>
                    <p className="mt-2 text-sm text-neutral-400">{post.description}</p>
                  </div>
                </div>
                <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-wide text-blue-200">
                  {post.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Coming soon
          </p>
          <div className="grid gap-4">
            {upcomingPosts.map((post) => (
              <div
                key={post.title}
                className="flex items-center justify-between rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:bg-neutral-900"
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
        </div>
      </section>
    </MarketingShell>
  );
}
