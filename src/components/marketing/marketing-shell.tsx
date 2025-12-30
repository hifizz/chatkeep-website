import Link from "next/link";
import { MarketingMobileMenu } from "~/components/marketing/marketing-mobile-menu";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Install", href: "/install" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Changelog", href: "/changelog" },
];

export function MarketingShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-[color:var(--marketing-surface)] text-[color:var(--marketing-ink)] font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-transparent bg-white/80 backdrop-blur-md transition-all duration-200 hover:border-[color:var(--marketing-border)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[color:var(--marketing-ink)] text-white shadow-sm">
              <span className="text-lg font-bold">CK</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[color:var(--marketing-ink)]">
              ChatKeep
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[color:var(--marketing-muted)] lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-[color:var(--marketing-ink)]"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="lg:hidden">
              <MarketingMobileMenu items={navItems} />
            </div>
            <Link
              href="/install"
              className="inline-flex h-9 items-center justify-center rounded-full bg-[color:var(--marketing-ink)] px-4 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 active:scale-95"
            >
              Install
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-[color:var(--marketing-border)] bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 text-sm text-[color:var(--marketing-muted)] md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-[color:var(--marketing-ink)]">
              <div className="h-6 w-6 rounded-md bg-[color:var(--marketing-ink)]"></div>
              ChatKeep
            </div>
            <p className="max-w-xs leading-relaxed">
              The missing OS for your AI chats. Local-first, private, and built for knowledge
              preservation.
            </p>
          </div>
          <div className="flex flex-wrap gap-12">
            <div className="flex flex-col gap-4">
              <span className="font-semibold text-[color:var(--marketing-ink)]">Product</span>
              <Link href="/pricing" className="hover:text-[color:var(--marketing-ink)]">
                Pricing
              </Link>
              <Link href="/install" className="hover:text-[color:var(--marketing-ink)]">
                Install
              </Link>
              <Link href="/changelog" className="hover:text-[color:var(--marketing-ink)]">
                Changelog
              </Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-semibold text-[color:var(--marketing-ink)]">Legal</span>
              <Link href="/privacy" className="hover:text-[color:var(--marketing-ink)]">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[color:var(--marketing-ink)]">
                Terms
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-[color:var(--marketing-border)] bg-gray-50/50">
          <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-center text-gray-400">
            © 2025 ChatKeep. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
