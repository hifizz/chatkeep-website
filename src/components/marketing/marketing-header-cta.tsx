"use client";

import Link from "next/link";
import { useSession } from "~/lib/auth-client";

export function MarketingHeaderCta() {
  const { data: session, isPending } = useSession();
  const href = session ? "/profile" : "/install";
  const label = session ? "Profile" : "Install";

  return (
    <Link
      href={href}
      aria-busy={isPending}
      className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-neutral-200 active:scale-95"
    >
      {label}
    </Link>
  );
}
