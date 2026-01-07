import Link from "next/link";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function BillingSuccessPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-12">
        <Card className="border-[color:var(--marketing-border)] bg-white">
          <CardHeader>
            <CardTitle>Payment successful</CardTitle>
            <CardDescription>Your subscription status will update shortly.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[color:var(--marketing-muted)]">
            <p>You can review your subscription status and plan details in your profile.</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/profile">Go to profile</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing">Back to pricing</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
