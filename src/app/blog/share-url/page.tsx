import type { Metadata } from "next";
import Link from "next/link";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { publishedPosts } from "../posts";

const post = publishedPosts.find((item) => item.slug === "share-url");

export const metadata: Metadata = {
  title: "Share URL: the first piece of ChatKeep Share",
  description:
    "How ChatKeep turns AI conversations into controlled, shareable links with access modes and expiration.",
};

export default function ShareUrlBlogPostPage() {
  return (
    <MarketingShell>
      <article className="mx-auto flex max-w-4xl flex-col gap-10 px-6 pb-16 pt-12 text-neutral-100">
        <header className="space-y-5">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
            <span>Blog</span>
            <span>{post?.date}</span>
            <span>{post?.readTime}</span>
          </div>
          <div className="space-y-4">
            <h1 className="font-display text-4xl leading-tight text-white md:text-5xl">
              Share URL: the first piece of ChatKeep Share
            </h1>
            <p className="max-w-3xl text-base leading-7 text-neutral-300">
              Share is ChatKeep&apos;s collaboration layer for AI conversations. This first post
              focuses on Share URL, previews Share Image, and sets the structure for the broader
              Share feature family.
            </p>
          </div>
        </header>

        <section className="rounded-3xl border border-blue-500/20 bg-blue-500/10 p-6">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-200">TL;DR</p>
          <div className="mt-4 space-y-2 text-sm leading-7 text-blue-50/90">
            <p>Share URL turns a chat snapshot into a controlled link you can send immediately.</p>
            <p>Share Image is next and gets a separate deep-dive article later.</p>
            <p>Share Malware remains a roadmap item and is not covered in this post.</p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Why Share exists</h2>
          <div className="space-y-4 text-sm leading-7 text-neutral-300">
            <p>
              Teams regularly need to pass around useful AI outputs, but copy-paste loses context,
              screenshots lose structure, and raw links often have no access control.
            </p>
            <p>
              Share is built to make collaboration direct: preserve the conversation shape, control
              who can open it, and manage its lifecycle after it is sent.
            </p>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-white">The Share feature family</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-5">
              <p className="text-sm font-semibold text-white">1. Share URL</p>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Create a stable share link with access control and expiration.
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-5">
              <p className="text-sm font-semibold text-white">2. Share Image</p>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                Turn selected chat content into a polished visual asset for async distribution.
              </p>
            </div>
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-5">
              <p className="text-sm font-semibold text-white">3. Share Malware</p>
              <p className="mt-2 text-sm leading-6 text-neutral-400">
                A roadmap item for now. This post does not define or expand it yet.
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-2xl font-semibold text-white">Share URL</h2>
          <div className="space-y-4 text-sm leading-7 text-neutral-300">
            <p>
              Share URL is the first production-ready part of Share. It solves a specific job:
              sending a readable AI chat snapshot without giving up control over who can access it
              and how long it stays live.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-5">
              <p className="text-sm font-semibold text-white">What you can do</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-400">
                <li>Create a shareable link from a chat snapshot.</li>
                <li>Choose between public access and access-code protection.</li>
                <li>Set expiration rules from short-lived to permanent.</li>
                <li>Copy, revoke, and manage links later from one place.</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-5">
              <p className="text-sm font-semibold text-white">Why it matters</p>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-400">
                <li>It preserves context better than screenshots or pasted fragments.</li>
                <li>It keeps sharing intentional through access modes and expiration.</li>
                <li>It gives teams lifecycle control after a link has been sent.</li>
              </ul>
            </div>
          </div>
          <p className="text-sm leading-7 text-neutral-300">
            Share URL is a ChatKeep capability. It is independent of third-party chat platforms and
            their providers, and it does not imply endorsement from them.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Share Image preview</h2>
          <div className="space-y-4 text-sm leading-7 text-neutral-300">
            <p>
              Some outcomes are better distributed visually, especially for social posts, reports,
              summaries, and project updates. Share Image is being shaped for that use case.
            </p>
            <p>
              It will get its own dedicated article. That post will cover visual output style,
              export quality, and the tradeoffs behind image-first sharing.
            </p>
          </div>
        </section>

        <section className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-500">
            Next step
          </p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-neutral-300">
              Try Share URL on ChatKeep now. The Share Image deep dive will follow as a separate
              post.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-white px-5 py-2 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
              >
                Visit ChatKeep
              </Link>
              <Link
                href="/blog"
                className="rounded-full border border-neutral-700 px-5 py-2 text-sm font-medium text-neutral-200 transition hover:border-neutral-500 hover:text-white"
              >
                Back to blog
              </Link>
            </div>
          </div>
        </section>
      </article>
    </MarketingShell>
  );
}
