import { MarketingShell } from "~/components/marketing/marketing-shell";

const faqs = [
  {
    question: "What is ChatKeep?",
    answer:
      "ChatKeep is the missing OS for AI chats. It saves conversations locally and adds highlight, search, TOC, and export.",
  },
  {
    question: "Is ChatKeep safe?",
    answer: "Yes. It is local-first. Your data stays on your device.",
  },
  {
    question: "Which platforms are supported?",
    answer: "Gemini is supported now. ChatGPT and Deepseek are coming soon.",
  },
  {
    question: "Can I export conversations?",
    answer: "Yes. You can export to Markdown now. PDF/HTML/JSON are coming soon.",
  },
  {
    question: "Does ChatKeep provide cloud sync?",
    answer: "Not yet. Cloud sync is planned for paid plans.",
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
          <p className="text-sm text-neutral-400">
            These answers are designed for clarity and direct responses.
          </p>
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
