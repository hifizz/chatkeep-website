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
    <div className="relative min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Sticky Header */}

      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-neutral-950/80 backdrop-blur-md transition-all duration-200 hover:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-neutral-950 shadow-sm shadow-white/10">
              <span className="text-lg font-bold">CK</span>
            </div>

            <span className="text-xl font-bold tracking-tight text-white">ChatKeep</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-neutral-400 lg:flex">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
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
              className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-neutral-200 active:scale-95"
            >
              Install
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">{children}</main>

      <footer className="relative z-10 border-t border-neutral-800 bg-neutral-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 text-sm text-neutral-400 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <div className="h-6 w-6 rounded-md bg-white"></div>
              ChatKeep
            </div>

            <p className="max-w-xs leading-relaxed">
              The missing OS for your AI chats. Local-first, private, and built for knowledge
              preservation.
            </p>
          </div>

          <div className="flex flex-wrap gap-12">
            <div className="flex flex-col gap-4">
              <span className="font-semibold text-white">Product</span>

              <Link href="/pricing" className="hover:text-white">
                Pricing
              </Link>

              <Link href="/install" className="hover:text-white">
                Install
              </Link>

              <Link href="/changelog" className="hover:text-white">
                Changelog
              </Link>
            </div>

            <div className="flex flex-col gap-4">
              <span className="font-semibold text-white">Legal</span>

              <Link href="/privacy" className="hover:text-white">
                Privacy
              </Link>

              <Link href="/terms" className="hover:text-white">
                Terms
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-800 bg-neutral-900/50">
          <div className="mx-auto max-w-6xl px-6 py-6 text-xs text-center text-neutral-500">
            © 2025 ChatKeep. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
