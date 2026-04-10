import Link from "next/link";
import Image from "next/image";
import { MarketingMobileMenu } from "~/components/marketing/marketing-mobile-menu";
import { MarketingHeaderCta } from "~/components/marketing/marketing-header-cta";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Install", href: "/install" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
];

type MarketingShellProps = {
  children: React.ReactNode;
  brandBadge?: string;
};

export function MarketingShell({ children, brandBadge }: MarketingShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-neutral-950 text-neutral-50 font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-neutral-950/80 backdrop-blur-md transition-all duration-200 hover:border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2 transition hover:opacity-80">
              <Image
                src="/logo.png"
                alt="ChatKeep logo"
                width={36}
                height={36}
                className="h-9 w-9 rounded-xl object-cover shadow-sm shadow-white/10"
              />
              <span className="text-xl font-bold tracking-tight text-white">ChatKeep</span>
            </Link>
            {brandBadge ? (
              <span className="inline-flex items-center rounded-full border border-emerald-400/45 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-200">
                {brandBadge}
              </span>
            ) : null}
          </div>

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
            <MarketingHeaderCta />
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1">{children}</main>

      <footer className="relative z-10 border-t border-neutral-800 bg-neutral-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-12 text-sm text-neutral-400 md:flex-row md:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-bold text-white">
              <Image
                src="/logo.png"
                alt="ChatKeep logo"
                width={24}
                height={24}
                className="h-6 w-6 rounded-md object-cover"
              />
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

              <Link href="/docs" className="hover:text-white">
                Docs
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
