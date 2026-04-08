import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SharePasswordForm } from "./_components/share-password-form";
import { ShareMarkdown } from "~/components/share/share-markdown";
import { cn } from "~/lib/utils";
import { getShareAccessCookieName } from "~/server/share/share-access";
import { getShareForRender } from "~/server/share/share-service";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-snippet": 0,
      "max-image-preview": "none",
      "max-video-preview": 0,
    },
  },
};

function SharePageFallback() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-12 text-neutral-100">
      <section className="w-full text-center">
        <h1 className="text-2xl font-semibold">Loading shared chat...</h1>
      </section>
    </main>
  );
}

async function SharePageContent({ shareId }: { shareId: string }) {
  const cookieStore = await cookies();
  const accessCookie = cookieStore.get(getShareAccessCookieName(shareId));
  const passwordVerified = accessCookie?.value === "1";

  const share = await getShareForRender(shareId, { passwordVerified });

  if (share.state === "invalid") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-12 text-neutral-100">
        <section className="w-full text-center">
          <h1 className="text-2xl font-semibold">Share link unavailable</h1>
          <p className="mt-3 text-sm text-neutral-400">
            This share link is expired or revoked. Please ask the author to create a new one.
          </p>
        </section>
      </main>
    );
  }

  if (share.state === "requires-password") {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-12 text-neutral-100">
        <section className="w-full max-w-xl space-y-4">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold">Access Code Protected Share</h1>
            <p className="text-sm text-neutral-400">
              Enter an access code to view this shared chat snapshot.
            </p>
          </div>
          <SharePasswordForm shareId={shareId} />
        </section>
      </main>
    );
  }

  const data = share.data;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ChatKeep logo"
              width={36}
              height={36}
              className="h-9 w-9 rounded-lg object-cover"
            />
            <span className="text-lg font-semibold text-white">Chat Keep</span>
          </Link>
          <Link
            href="/"
            className="rounded-full bg-white px-4 py-2 text-sm font-medium text-neutral-950 transition hover:bg-neutral-200"
          >
            I want to share too
          </Link>
        </div>
      </header>
      <div className="mx-auto w-full max-w-4xl px-6 py-8">
        <section className="mb-8">
          <h1 className="text-xl font-semibold leading-8 text-white md:text-2xl">{data.title}</h1>
          <div className="mt-4 flex items-center gap-3">
            {data.author.image ? (
              <Image
                src={data.author.image}
                alt={data.author.name ?? "Author avatar"}
                width={16}
                height={16}
                unoptimized
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-700 text-xs text-white">
                {(data.author.name ?? "A").slice(0, 1).toUpperCase()}
              </div>
            )}
            <p className="text-sm font-medium text-neutral-200">
              {data.author.name ?? "Anonymous"}
            </p>
          </div>
        </section>

        <article className="space-y-8">
          {data.snapshot.messages.map((message) => (
            <section
              key={message.id}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  message.role === "user"
                    ? "w-[80%] min-w-[16rem] rounded-2xl border border-neutral-700/90 bg-neutral-900/85 px-4 py-3 md:w-[72%] lg:w-[64%]"
                    : "w-full",
                )}
              >
                <ShareMarkdown content={message.content} />
              </div>
            </section>
          ))}
        </article>

        <footer className="mt-10 space-y-3 border-t border-neutral-800/80 pt-6 text-xs text-neutral-400">
          <p>
            ChatKeep helps users preserve AI conversations. Shared content is provided by the author
            and may include personal information.
          </p>
          <p>
            Share URL is a ChatKeep feature and is independent of third-party chat platforms and
            their providers.{" "}
            <Link
              href="/blog/share-url"
              className="text-neutral-200 underline underline-offset-2 hover:text-white"
            >
              Learn how it works.
            </Link>
          </p>
          <p>
            By viewing this page, you acknowledge the content was uploaded by the author and should
            be handled responsibly.
          </p>
          <p>© {new Date().getFullYear()} ChatKeep. All rights reserved.</p>
        </footer>
      </div>
    </main>
  );
}

export default async function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
  return (
    <Suspense fallback={<SharePageFallback />}>
      <SharePageWithParams params={params} />
    </Suspense>
  );
}

async function SharePageWithParams({ params }: { params: Promise<{ shareId: string }> }) {
  const { shareId } = await params;
  return <SharePageContent shareId={shareId} />;
}
