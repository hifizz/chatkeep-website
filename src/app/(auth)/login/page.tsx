import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "../_components/login-form";
import { AuthPageShell } from "../_components/auth-page-shell";
import { getServerSession } from "~/lib/session";

async function LoginGate() {
  const session = await getServerSession();
  if (session) redirect("/profile");
  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<div className="text-sm text-muted-foreground">正在加载…</div>}>
        <LoginGate />
      </Suspense>
    </AuthPageShell>
  );
}
