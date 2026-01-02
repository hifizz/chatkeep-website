"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

const triggerClassName =
  "rounded-full border border-neutral-800 px-4 py-2 text-sm text-neutral-400 transition hover:text-white hover:border-neutral-700 focus:outline-none";

export function MarketingMobileMenu({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={triggerClassName}>Menu</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[12rem] rounded-2xl border border-neutral-800 bg-neutral-900 p-2 text-sm text-neutral-400 shadow-xl"
      >
        {items.map((item) => (
          <DropdownMenuItem
            key={item.href}
            asChild
            className="rounded-lg px-3 py-2 text-neutral-400 focus:bg-neutral-800 focus:text-white cursor-pointer"
          >
            <Link href={item.href}>{item.label}</Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
