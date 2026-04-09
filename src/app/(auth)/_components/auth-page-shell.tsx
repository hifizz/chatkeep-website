import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";

type AuthPageShellProps = {
  children: ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="relative flex min-h-screen flex-col bg-neutral-950 px-4 py-10 text-neutral-50">
      <div className="absolute left-6 top-6">
        <Link href="/" className="inline-flex items-center gap-2 transition hover:opacity-85">
          <Image
            src="/logo.png"
            alt="ChatKeep logo"
            width={32}
            height={32}
            className="h-8 w-8 rounded-lg object-cover"
          />
          <span className="text-base font-semibold tracking-tight">ChatKeep</span>
        </Link>
      </div>

      <div className="flex flex-1 items-center justify-center">{children}</div>

      <p className="text-center text-xs leading-relaxed text-neutral-400">
        ChatKeep helps you preserve and organize AI conversations with a local-first workflow.
      </p>
    </div>
  );
}
