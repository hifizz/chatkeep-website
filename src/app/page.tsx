import { Icon } from "@iconify/react";
import Link from "next/link";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { DeepSeek, Doubao, Gemini, OpenAI, Grok } from "@lobehub/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

const featureCards = [
  {
    title: "Save anything from anywhere",
    description:
      "One click to save chats from Gemini. ChatGPT and Deepseek coming soon. Your knowledge base grows automatically.",
    icon: "lucide:save",
    color: "bg-blue-100 text-blue-600",
  },
  {
    title: "Your insights, highlighted",
    description:
      "Select text to leave memos. Don't just save the chat, keep the context and your thoughts attached to it.",
    icon: "lucide:highlighter",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    title: "Search is just the beginning",
    description:
      "Find any conversation in milliseconds. Jump back to the exact moment and restore context instantly.",
    icon: "lucide:search",
    color: "bg-purple-100 text-purple-600",
  },
  {
    title: "Everything connected locally",
    description:
      "Export to Markdown, navigate via TOC minimap, and own your data. Local-first by default.",
    icon: "lucide:link",
    color: "bg-green-100 text-green-600",
  },
];

const useCases = [
  {
    role: "For Developers",
    description:
      "Save code snippets, debug logs, and architecture discussions. Search back when you hit the same error months later.",
    icon: "lucide:code-2",
  },
  {
    role: "For Researchers",
    description:
      "Aggregate summaries, citations, and brainstorming sessions. Export to Markdown to weave into your papers.",
    icon: "lucide:flask-conical",
  },
  {
    role: "For Students",
    description:
      "Keep track of explanations, study guides, and language practice. Review highlighted memos before exams.",
    icon: "lucide:graduation-cap",
  },
];

const browsers = [
  { name: "Chrome", icon: "logos:chrome" },
  { name: "Firefox", icon: "logos:firefox" },
  { name: "Safari", icon: "logos:safari" },
  { name: "Edge", icon: "logos:microsoft-edge" },
  { name: "Brave", icon: "logos:brave" },
];

const aiPlatforms = [
  { name: "Gemini", icon: Gemini, status: "available" },
  { name: "ChatGPT", icon: OpenAI, status: "available" },
  { name: "Deepseek", icon: DeepSeek, status: "coming", eta: "Coming in 5 days" },
  { name: "Grok", icon: Grok, status: "coming", eta: "Coming in 10 days" },
  { name: "Doubao", icon: Doubao, status: "coming", eta: "Coming in 15 days" },
];

function InstallChromeButton() {
  return (
    <Link
      href="/install"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--marketing-ink)] px-8 py-4 text-base font-bold text-white shadow-lg transition hover:opacity-90 hover:scale-105"
    >
      <Icon icon="logos:chrome" width={24} height={24} aria-hidden="true" className="shrink-0" />
      <span>Install for Chrome</span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <MarketingShell>
      {/* Hero Section */}
      <section className="mx-auto flex max-w-5xl flex-col items-center gap-8 px-6 pt-20 pb-16 text-center md:pt-32 animate-rise">
        <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-[color:var(--marketing-ink)] md:text-7xl">
          Chat smarter. <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Keep everything.
          </span>
        </h1>
        <p className="max-w-2xl text-xl text-[color:var(--marketing-muted)] md:text-2xl">
          The missing OS for your AI chats. Aggregate, highlight, and search your conversations with
          Gemini (and soon ChatGPT).
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <InstallChromeButton />
          <Link
            href="/pricing"
            className="inline-flex items-center justify-center rounded-full border border-[color:var(--marketing-border)] bg-white px-8 py-4 text-base font-bold text-[color:var(--marketing-ink)] shadow-sm transition hover:bg-gray-50"
          >
            View Pricing
          </Link>
        </div>

        {/* Browser Icons */}
        <div className="flex flex-col items-center gap-3 mt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--marketing-muted)] opacity-70">
            Available on
          </p>
          <div className="flex items-center gap-6 opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0">
            {browsers.map((b) => (
              <Tooltip key={b.name}>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer hover:scale-110 transition-transform">
                    <Icon icon={b.icon} width={24} height={24} />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{b.name}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* AI Platforms */}
        <div className="mt-8 flex flex-col items-center gap-6 w-full max-w-3xl">
          <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-[color:var(--marketing-border)] to-transparent opacity-50"></div>
          <p className="text-sm font-semibold text-[color:var(--marketing-muted)]">
            Support for your favorite AI models
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 items-center">
            {aiPlatforms.map((platform) => (
              <div
                key={platform.name}
                className={`relative transition-all duration-300 ${platform.status === "coming" ? "opacity-30 grayscale hover:opacity-60" : "hover:scale-110"}`}
              >
                {platform.status === "coming" ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-help">
                        <platform.icon size={48} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{platform.eta}</p>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-pointer">
                        <platform.icon size={48} />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{platform.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-[color:var(--marketing-muted)] mt-4">
          <Icon icon="lucide:check-circle" className="text-green-500" />
          <span>Free plan available</span>
          <span className="mx-2 opacity-30">|</span>
          <Icon icon="lucide:shield-check" className="text-green-500" />
          <span>Local-first & Private</span>
        </div>
      </section>

      {/* Hero Image / UI Placeholder */}
      <div className="mx-auto max-w-6xl px-6 pb-20 animate-fade">
        <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-[color:var(--marketing-border)] bg-white shadow-2xl">
          {/* Placeholder for the actual app screenshot. Using a simple UI representation. */}
          <div className="absolute inset-0 bg-gray-50">
            <div className="absolute top-0 left-0 right-0 h-12 border-b border-gray-200 bg-white flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
              </div>
              <div className="mx-auto w-1/3 h-6 bg-gray-100 rounded-md"></div>
            </div>
            <div className="absolute top-12 bottom-0 left-0 w-64 border-r border-gray-200 bg-white p-4 space-y-3 hidden md:block">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-4 w-5/6 bg-gray-200 rounded"></div>
            </div>
            <div className="absolute top-12 bottom-0 right-0 left-0 md:left-64 p-8 flex flex-col gap-6 items-center justify-center text-[color:var(--marketing-muted)]">
              <div className="text-center space-y-2">
                <Icon
                  icon="lucide:message-square"
                  width={48}
                  height={48}
                  className="mx-auto opacity-20"
                />
                <p className="text-lg font-medium">Your Chat Knowledge Base</p>
                <p className="text-sm opacity-60">Visual placeholder for app screenshot</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl font-bold text-[color:var(--marketing-ink)]">
            Everything you need to manage context.
          </h2>
          <p className="mt-4 text-lg text-[color:var(--marketing-muted)]">
            ChatKeep bridges the gap between fleeting chats and permanent knowledge.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-[color:var(--marketing-border)] bg-white p-8 transition hover:shadow-lg"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}
              >
                <Icon icon={feature.icon} width={28} height={28} />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[color:var(--marketing-ink)]">
                {feature.title}
              </h3>
              <p className="text-base text-[color:var(--marketing-muted)] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* User Scenarios */}
      <section className="bg-white py-24 border-y border-[color:var(--marketing-border)]">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 md:text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-600 mb-2">
              Use Cases
            </p>
            <h2 className="font-display text-4xl font-bold text-[color:var(--marketing-ink)]">
              How people are using ChatKeep
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {useCases.map((useCase) => (
              <div key={useCase.role} className="flex flex-col gap-4 rounded-3xl bg-gray-50 p-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-[color:var(--marketing-ink)]">
                    <Icon icon={useCase.icon} width={20} height={20} />
                  </div>
                  <h3 className="font-bold text-lg text-[color:var(--marketing-ink)]">
                    {useCase.role}
                  </h3>
                </div>
                <p className="text-sm text-[color:var(--marketing-muted)] leading-relaxed">
                  {useCase.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Trust Placeholder */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="mb-8 text-sm font-semibold uppercase tracking-widest text-[color:var(--marketing-muted)]">
          Trusted by early adopters
        </p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-50 grayscale">
          {/* Logo placeholders using text for now */}
          <span className="text-xl font-bold">Acme Corp</span>
          <span className="text-xl font-bold">GlobalTech</span>
          <span className="text-xl font-bold">Nebula AI</span>
          <span className="text-xl font-bold">FoxRun</span>
          <span className="text-xl font-bold">Circle</span>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-[color:var(--marketing-ink)] py-24 text-center text-white">
        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <h2 className="mb-6 font-display text-4xl font-bold md:text-5xl">
            Ready to reclaim your chats?
          </h2>
          <p className="mb-10 text-lg text-gray-400">
            Join thousands of users who are building their personal AI knowledge base today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/install"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-[color:var(--marketing-ink)] transition hover:bg-gray-100"
            >
              <Icon icon="logos:chrome" width={24} height={24} aria-hidden="true" />
              <span>Install for Chrome</span>
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-500">No credit card required for free plan.</p>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 rounded-full bg-purple-500/20 blur-3xl"></div>
      </section>
    </MarketingShell>
  );
}
