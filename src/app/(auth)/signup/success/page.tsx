import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { AuthPageShell } from "../../_components/auth-page-shell";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { getServerSession } from "~/lib/session";

async function SignupSuccessGate() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="space-y-3">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 className="size-6" />
          <span className="text-sm font-semibold uppercase tracking-[0.18em]">Success</span>
        </div>
        <CardTitle className="text-3xl font-semibold tracking-tight">
          Your account is ready
        </CardTitle>
        <CardDescription className="text-base leading-relaxed">
          Welcome to ChatKeep. Your account has been created successfully, and we&apos;ve added a{" "}
          <strong>1-month Trial</strong> so you can start exploring Pro features right away.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="h-11 w-full text-base font-medium">
          <Link href="/profile">Go to Profile</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function SignupSuccessPage() {
  return (
    <AuthPageShell>
      <SignupSuccessGate />
    </AuthPageShell>
  );
}
