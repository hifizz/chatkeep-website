import { MarketingShell } from "~/components/marketing/marketing-shell";
import { SUPPORTED_AI_PLATFORMS_TEXT } from "~/lib/platform-support";

const faqs = [
  {
    question: "What is ChatKeep?",
    answer:
      "ChatKeep is the missing OS for AI chats. It helps you aggregate, organize, search, and export conversations across platforms.",
  },
  {
    question: "Is ChatKeep safe?",
    answer: "Yes. ChatKeep is local-first, and your chat content stays on your device.",
  },
  {
    question: "Which platforms are supported?",
    answer: `ChatKeep currently supports ${SUPPORTED_AI_PLATFORMS_TEXT}.`,
  },
  {
    question: "Can I export conversations?",
    answer:
      "Yes. Markdown export is available now. PDF, HTML, and JSON exports are on the roadmap.",
  },
  {
    question: "Does ChatKeep provide cloud sync?",
    answer: "Not yet. Cloud sync is planned for paid plans.",
  },
  {
    question: "Where can I check compatibility, limitations, and roadmap updates?",
    answer:
      "Visit the docs pages for compatibility details, current limitations, and roadmap targets.",
  },
];

export default function FAQPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">FAQ</p>
          <h1 className="font-display text-4xl text-white">
            Answers to the most common questions.
          </h1>
          <p className="text-sm text-neutral-400">Quick, direct answers to help you get started.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 hover:bg-neutral-900 transition-colors"
            >
              <h2 className="text-lg font-semibold text-white">{faq.question}</h2>
              <p className="mt-2 text-sm text-neutral-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </MarketingShell>
  );
}
