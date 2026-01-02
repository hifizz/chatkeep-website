import type { ReactNode } from "react";

type AuthPageShellProps = {
  children: ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return <div className="flex min-h-screen items-center justify-center">{children}</div>;
}
