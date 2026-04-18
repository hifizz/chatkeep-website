import { Suspense } from "react";
import Link from "next/link";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { getChannelLatest } from "~/server/release/release-service";
import type { BrowserTarget } from "~/types/release-sync";
import { SUPPORTED_AI_PLATFORMS_TEXT } from "~/lib/platform-support";

const steps = [
  {
    title: "Add ChatKeep to Chrome",
    description: "Install the extension and pin it to your toolbar for quick access.",
  },
  {
    title: "Open your chat platform",
    description: `Use ${SUPPORTED_AI_PLATFORMS_TEXT}, and ChatKeep will save each conversation locally.`,
  },
  {
    title: "Organize as you chat",
    description: "Highlight text, add notes, and search across everything you've saved.",
  },
];

const otherBrowserOrder: BrowserTarget[] = ["firefox", "edge", "safari"];

const browserLabelMap: Record<BrowserTarget, string> = {
  chrome: "Chrome",
  firefox: "Firefox",
  edge: "Edge",
  safari: "Safari",
};

async function LatestStableReleaseSection() {
  const stableRelease = await getChannelLatest("stable");
  const artifactsByBrowser = new Map(
    (stableRelease?.artifacts ?? []).map((artifact) => [artifact.browser, artifact]),
  );
  const chromeArtifact = artifactsByBrowser.get("chrome");

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-6">
      <h2 className="text-lg font-semibold text-white">Download Extension Packages</h2>
      {stableRelease ? (
        <>
          <p className="text-sm text-neutral-400">
            Version {stableRelease.version}
            {stableRelease.tag ? ` (${stableRelease.tag})` : ""}
            {" · "}
            {new Date(stableRelease.releasedAt).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-300">Chrome</p>
            {chromeArtifact ? (
              <a
                href={chromeArtifact.downloadUrl}
                className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Download for Chrome
              </a>
            ) : (
              <span className="inline-flex items-center justify-center rounded-full border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-500">
                Download for Chrome (Preparing)
              </span>
            )}
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-300">Other Browsers</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {otherBrowserOrder.map((browser) => {
                const artifact = artifactsByBrowser.get(browser);
                return artifact ? (
                  <a
                    key={browser}
                    href={artifact.downloadUrl}
                    className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
                  >
                    Download for {browserLabelMap[browser]}
                  </a>
                ) : (
                  <span
                    key={browser}
                    className="inline-flex items-center justify-center rounded-full border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-500"
                  >
                    Download for {browserLabelMap[browser]} (Preparing)
                  </span>
                );
              })}
            </div>
          </div>
          <div className="pt-1">
            <Link
              href="/install/beta"
              className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Download for Chrome
            </Link>
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-neutral-400">
            Stable release metadata is not available yet. Please check back after the next tagged
            release.
          </p>
          <div className="space-y-2">
            <p className="text-sm font-medium text-neutral-300">Other Browsers</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {otherBrowserOrder.map((browser) => (
                <span
                  key={browser}
                  className="inline-flex items-center justify-center rounded-full border border-neutral-800 px-4 py-2 text-sm font-medium text-neutral-500"
                >
                  Download for {browserLabelMap[browser]} (Preparing)
                </span>
              ))}
            </div>
          </div>
          <div>
            <Link
              href="/install/beta"
              className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
            >
              Download for Chrome
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function InstallPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Install
          </p>
          <h1 className="font-display text-4xl text-white">Install ChatKeep in under a minute.</h1>
          <p className="text-sm text-neutral-400">
            ChatKeep runs locally in your browser and currently supports{" "}
            {SUPPORTED_AI_PLATFORMS_TEXT}.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 hover:bg-neutral-900 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-sm font-semibold text-neutral-950">
                {index + 1}
              </div>
              <h2 className="mt-4 text-lg font-semibold text-white">{step.title}</h2>
              <p className="mt-2 text-sm text-neutral-400">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6">
          <h2 className="text-lg font-semibold text-white">Permissions</h2>
          <p className="mt-2 text-sm text-neutral-400">
            ChatKeep requests only the permissions needed to read and save chat content. Your data
            stays on your device.
          </p>
        </div>

        <section id="other-browsers" className="scroll-mt-24">
          <Suspense
            fallback={
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-white">Latest Stable Release</h2>
                <p className="text-sm text-neutral-400">Loading latest release metadata...</p>
              </div>
            }
          >
            <LatestStableReleaseSection />
          </Suspense>
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-neutral-200"
          >
            Back to Home
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
