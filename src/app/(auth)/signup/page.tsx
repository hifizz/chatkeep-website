import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignUpForm } from "../_components/signup-form";
import { AuthPageShell } from "../_components/auth-page-shell";
import { getServerSession } from "~/lib/session";

async function SignupGate() {
  const session = await getServerSession();
  if (session) redirect("/profile");
  return <SignUpForm />;
}

export default function SignUpPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<div className="text-sm text-muted-foreground">正在加载…</div>}>
        <SignupGate />
      </Suspense>
    </AuthPageShell>
  );
}
