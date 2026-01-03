import { Icon } from "@iconify/react";
import Link from "next/link";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { DeepSeek, Gemini, OpenAI, Grok } from "@lobehub/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";
import { HeroImage } from "~/components/marketing/hero-image";

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

function InstallChromeButton() {
  return (
    <Link
      href="/install"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-white p-3 text-base font-bold text-neutral-950 shadow-lg transition hover:bg-neutral-200 hover:scale-105"
    >
      <Icon icon="logos:chrome" width={28} height={28} aria-hidden="true" className="shrink-0" />
      <span>Install for Chrome</span>
    </Link>
  );
}

export default function HomePage() {
  return (
    <MarketingShell>
      {/* Hero Section */}
      <section className="relative mx-auto max-w-5xl px-6 pt-12 pb-16 text-center md:pt-20 animate-rise overflow-hidden">
        {/* Background Stickers */}
        <div className="absolute top-10 left-6 md:top-20 md:left-20 lg:left-32">
          <Gemini.Color
            size={48}
            className="-rotate-12 opacity-50 transition-all hover:scale-110 hover:rotate-0 hover:opacity-100 md:h-16 md:w-16"
          />
        </div>

        <div className="absolute right-6 top-16 md:right-20 md:top-24 lg:right-32">
          <OpenAI
            size={48}
            className="rotate-12 opacity-50 transition-all hover:scale-110 hover:rotate-0 hover:opacity-100 md:h-16 md:w-16"
          />
        </div>

        <div className="absolute bottom-40 left-8 md:bottom-48 md:left-24 lg:left-40">
          <DeepSeek.Color
            size={56}
            className="rotate-6 opacity-50 transition-all hover:scale-110 hover:rotate-0 hover:opacity-100 md:h-20 md:w-20"
          />
        </div>

        <div className="absolute bottom-44 right-8 md:bottom-52 md:right-24 lg:right-40">
          <Grok
            size={56}
            className="-rotate-12 opacity-50 transition-all hover:scale-110 hover:rotate-0 hover:opacity-100 md:h-20 md:w-20"
          />
        </div>

        {/* Content Wrapper */}
        <div className="relative z-10 flex flex-col items-center gap-6">
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
              href="/pricing"
              className="inline-flex items-center justify-center rounded-full border border-neutral-800 bg-neutral-900/50 px-8 py-4 text-base font-bold text-white shadow-sm transition hover:bg-neutral-800 hover:scale-105"
            >
              Free start
            </Link>
          </div>

          {/* Browser Icons */}
          <div className="mt-4 flex items-center gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 opacity-70">
              Available on
            </p>
            <div className="flex items-center gap-4">
              {browsers.map((b) => (
                <Tooltip key={b.name}>
                  <TooltipTrigger asChild>
                    <div className="cursor-pointer hover:scale-110 will-change opacity-60 transition-all duration-300 hover:opacity-100">
                      <Icon icon={b.icon} width={32} height={32} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{b.name}</p>
                  </TooltipContent>
                </Tooltip>
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
      <HeroImage />

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="font-display text-4xl font-bold text-white">
            Everything you need to manage context.
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            ChatKeep bridges the gap between fleeting chats and permanent knowledge.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900/50 p-8 transition hover:border-neutral-700 hover:bg-neutral-900"
            >
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color.replace(
                  "bg-",
                  "bg-opacity-20 bg-",
                )}`}
              >
                <Icon icon={feature.icon} width={28} height={28} />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">{feature.title}</h3>
              <p className="text-base text-neutral-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
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
        <div className="relative z-10 mx-auto max-w-4xl px-6">
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
