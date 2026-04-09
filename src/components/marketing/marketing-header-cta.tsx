"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "~/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { notifyAuthRefresh } from "~/lib/extension";

export function MarketingHeaderCta() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    notifyAuthRefresh();
    router.push("/");
  };

  const displayName = session?.user?.name?.trim() || session?.user?.email || "User";
  const avatarFallback = displayName.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/install"
        aria-busy={isPending}
        className="inline-flex h-9 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-neutral-200 active:scale-95"
      >
        Install
      </Link>

      {session ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full ring-1 ring-white/15 transition hover:ring-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label="Open account menu"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image ?? undefined} alt={displayName} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 border-white/10 bg-neutral-900 text-neutral-100"
          >
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/10" />
            <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}
