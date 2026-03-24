import { MarketingShell } from "~/components/marketing/marketing-shell";

const aiPlatforms = [
  { name: "Gemini", status: "Supported" },
  { name: "ChatGPT", status: "Supported" },
  { name: "DeepSeek", status: "Supported" },
  { name: "Grok", status: "Supported" },
];

const browsers = [
  { name: "Chrome", status: "Supported" },
  { name: "Edge", status: "May work via Chromium extension support (not officially tested)" },
  {
    name: "Brave",
    status: "May work via Chromium extension support (not officially tested)",
  },
  { name: "Firefox", status: "Not supported yet" },
  { name: "Safari", status: "Not supported yet" },
];

export default function CompatibilityDocsPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Docs / Compatibility
          </p>
          <h1 className="font-display text-4xl text-white">Compatibility</h1>
          <p className="text-sm text-neutral-400">
            Current support status for AI platforms and browsers.
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Last updated: March 22, 2026
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="text-lg font-semibold text-white">AI Platforms</h2>
            <div className="mt-4 space-y-3">
              {aiPlatforms.map((platform) => (
                <div
                  key={platform.name}
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
                >
                  <span className="text-sm text-white">{platform.name}</span>
                  <span className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                    {platform.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6">
            <h2 className="text-lg font-semibold text-white">Browsers</h2>
            <div className="mt-4 space-y-3">
              {browsers.map((browser) => (
                <div
                  key={browser.name}
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
                >
                  <span className="text-sm text-white">{browser.name}</span>
                  <span className="text-right text-xs text-neutral-400">{browser.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
