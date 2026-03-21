import { Icon } from "@iconify/react";
import Link from "next/link";
import { cn } from "~/lib/utils";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { DeepSeek, Gemini, OpenAI, Grok } from "@lobehub/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { HeroImage } from "~/components/marketing/hero-image";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "~/components/ui/hover-card";
import { FeatureImageDialog } from "~/components/marketing/feature-image-dialog";

const features = [
  {
    title: "Pro-grade Markdown exports",
    description:
      "Your data stays yours. Export chats to standard Markdown with code and formatting intact, then move them into Notion or Obsidian.",
    image: "/fa-export-markdown.png",
  },
  {
    title: "Automatic local chat history saving",
    description:
      "Sync chats from Gemini, ChatGPT, DeepSeek, and more in one click. No more scattered history; manage your AI knowledge base in one place.",
    image: "/fa-sync-save.png",
    note: "Supported platforms: Gemini, ChatGPT, DeepSeek, Grok",
  },
  {
    title: "Highlights and context memos",
    description:
      "Select text to add highlights and memos. Capture not just the conversation, but the thinking and context behind it.",
    image: "/fa-memos.png",
  },
  {
    title: "Instant full-text search",
    description:
      "Powered by a local high-performance search engine. Find yesterday's insight or last month's snippet in milliseconds with fuzzy search.",
    image: "/fa-search.png",
  },
  {
    title: "Mermaid diagram rendering",
    description:
      "Fill the gap: ChatKeep adds Mermaid diagram rendering to Gemini and ChatGPT so complex logic is visual at a glance.",
    image: "/fa-mermaid.png",
    note: "Note: Mermaid rendering is only needed for Gemini and ChatGPT (other platforms like DeepSeek already support it natively).",
  },
  {
    title: "Gemini Deep Research export",
    description:
      "Export Gemini Deep Research reports into your local archive, so long-form findings stay reusable, searchable, and easy to reference later.",
    image: "/fa-export-dr.png",
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
  { name: "Gemini", icon: Gemini.Color, status: "available" },
  { name: "ChatGPT", icon: OpenAI, status: "available" },
  { name: "DeepSeek", icon: DeepSeek.Color, status: "available" },
  { name: "Grok", icon: Grok, status: "available" },
];

function InstallChromeButton() {
  return (
    <div className="flex items-center rounded-full bg-white p-3 shadow-lg transition hover:bg-neutral-200 hover:scale-105">
      <Link
        href="/install"
        className="flex items-center justify-center gap-2 text-base font-bold text-neutral-950"
      >
        <Icon icon="logos:chrome" width={28} height={28} aria-hidden="true" className="shrink-0" />
        <span>Install for Chrome</span>
      </Link>
      <div className="mx-3 h-6 w-px bg-neutral-300" />
      <HoverCard openDelay={0} closeDelay={150}>
        <HoverCardTrigger asChild>
          <button type="button" className="text-neutral-500 focus:outline-none">
            <Icon icon="lucide:chevron-down" width={20} height={20} />
          </button>
        </HoverCardTrigger>
        <HoverCardContent
          align="end"
          className="w-56 border-neutral-800 bg-neutral-900 p-2 text-neutral-200 shadow-xl"
        >
          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Other Browsers
          </div>
          <div className="space-y-1">
            {browsers
              .filter((b) => b.name !== "Chrome")
              .map((b) => (
                <div
                  key={b.name}
                  className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-neutral-800 hover:text-white"
                >
                  <Icon icon={b.icon} width={16} height={16} />
                  <span>{b.name}</span>
                </div>
              ))}
          </div>
          <div className="my-2 h-px bg-neutral-800" />
          <div className="flex cursor-not-allowed items-center gap-3 rounded-md px-2 py-2 text-sm opacity-50">
            <Icon icon="lucide:download" width={16} height={16} />
            <span>Manual Install (Soon)</span>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
}

export default function HomePage() {
  return (
    <MarketingShell>
      {/* Hero Section */}
      <section className="relative mx-auto max-w-6xl px-6 pt-12 pb-16 text-center animate-rise overflow-visible md:pt-20">
        <div className="flex flex-col items-center gap-6">
          <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-7xl">
            Chat smarter. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-400 to-teal-500">
              Keep everything.
            </span>
          </h1>
          <p className="max-w-2xl text-xl text-neutral-400 md:text-2xl">
            The missing OS for your AI chats. Auto-save, aggregate, highlight, and search your
            conversations locally.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <InstallChromeButton />
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50 px-8 py-4 text-base font-bold text-white shadow-sm transition hover:bg-neutral-800 hover:scale-105"
            >
              Killer features
            </Link>
          </div>

          {/* AI Platforms - Replaces Browsers Row */}
          <div className="mt-2 flex flex-col items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 opacity-70">
              Works with
            </p>
            <div className="flex items-center gap-6">
              {aiPlatforms.map((platform) => (
                <TooltipProvider key={platform.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="cursor-pointer transition hover:scale-110">
                        <platform.icon
                          size={32}
                          className={platform.name === "Grok" ? "text-white" : ""}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{platform.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 text-sm text-neutral-500">
            <Icon icon="lucide:check-circle" className="text-green-500" />
            <span>Free plan available</span>
            <span className="mx-2 opacity-30">|</span>
            <Icon icon="lucide:shield-check" className="text-green-500" />
            <span>Local-first & Private</span>
          </div>
        </div>
      </section>

      {/* Hero Image / UI Placeholder */}
      <HeroImage src="/fa-main.png" alt="ChatKeep product screenshot" />

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-12 md:py-24">
        <div className="mb-16 md:mb-24 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white">
            The missing toolkit for AI chatbots
          </h2>
          <p className="mt-4 text-base md:text-lg text-neutral-400">
            The missing toolkit for turning AI chats into lasting knowledge.
          </p>
        </div>

        <div className="flex flex-col gap-16 md:gap-32">
          {features.map((feature, i) => {
            const isEven = i % 2 === 0;
            return (
              <div
                key={feature.title}
                className="flex flex-col md:flex-row items-center gap-8 md:gap-24"
              >
                {/* Image Section */}
                <div className={cn("flex-1 w-full", isEven ? "md:order-1" : "md:order-2")}>
                  <div className="relative">
                    <FeatureImageDialog
                      image={feature.image}
                      title={feature.title}
                      description={feature.description}
                    />
                  </div>
                </div>

                {/* Text Section */}
                <div
                  className={cn(
                    "flex-1 space-y-4 md:space-y-6",
                    isEven ? "md:order-2" : "md:order-1",
                  )}
                >
                  <h3 className="text-2xl md:text-3xl font-bold text-white">{feature.title}</h3>
                  <p className="text-base md:text-lg text-neutral-400 leading-relaxed">
                    {feature.description}
                  </p>
                  {feature.note && (
                    <div className="rounded-xl bg-neutral-900/80 border border-neutral-800 p-4 text-sm text-neutral-500">
                      {feature.note}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* User Scenarios */}
      <section className="bg-neutral-900/30 py-24 border-y border-neutral-800">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-16 md:text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-2">
              Use Cases
            </p>
            <h2 className="font-display text-4xl font-bold text-white">
              How people are using ChatKeep
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {useCases.map((useCase) => (
              <div
                key={useCase.role}
                className="flex flex-col gap-4 rounded-3xl bg-neutral-900 p-8 border border-neutral-800"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-800 shadow-sm text-white">
                    <Icon icon={useCase.icon} width={20} height={20} />
                  </div>
                  <h3 className="font-bold text-lg text-white">{useCase.role}</h3>
                </div>
                <p className="text-sm text-neutral-400 leading-relaxed">{useCase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial / Trust Placeholder */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="mb-8 text-sm font-semibold uppercase tracking-widest text-neutral-600">
          Trusted by early adopters
        </p>
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-30 grayscale invert">
          {/* Logo placeholders using text for now */}
          <span className="text-xl font-bold text-white">Acme Corp</span>
          <span className="text-xl font-bold text-white">GlobalTech</span>
          <span className="text-xl font-bold text-white">Nebula AI</span>
          <span className="text-xl font-bold text-white">FoxRun</span>
          <span className="text-xl font-bold text-white">Circle</span>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative overflow-hidden bg-neutral-900 py-24 text-center text-white border-t border-neutral-800">
        <div className="relative z-10 mx-auto max-w-6xl px-6">
          <h2 className="mb-6 font-display text-4xl font-bold md:text-5xl">
            Ready to reclaim your chats?
          </h2>
          <p className="mb-10 text-lg text-neutral-400">
            Join thousands of users who are building their personal AI knowledge base today.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/install"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-4 text-base font-bold text-neutral-950 transition hover:bg-neutral-200"
            >
              <Icon icon="logos:chrome" width={32} height={32} aria-hidden="true" />
              <span>Install for Chrome</span>
            </Link>
          </div>
          <p className="mt-8 text-sm text-neutral-600">No credit card required for free plan.</p>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -translate-x-1/4 -translate-y-1/4 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl"></div>
      </section>
    </MarketingShell>
  );
}
