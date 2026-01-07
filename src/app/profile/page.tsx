import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import type { SubscriptionStatus } from "~/lib/billing/types";
import { PLAN_NAMES } from "~/lib/pricing";
import { getServerSession } from "~/lib/session";
import { getProfileForUser } from "~/server/billing/profile-service";

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  trial: "Trial",
  active: "Active",
  grace: "Grace period",
  past_due: "Past due",
  canceled: "Canceled",
  refunded: "Refunded",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

async function ProfileContent() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }

  const profile = await getProfileForUser(session.user.id);
  const plan = profile.plan;
  const planName = plan ? PLAN_NAMES[plan.key] : "Free";
  const statusLabel = plan?.status ? STATUS_LABELS[plan.status] : "Not subscribed";

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 px-6 pb-16 pt-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Profile</p>
        <h1 className="font-display text-3xl text-white">Account and subscription</h1>
        <p className="text-sm text-neutral-400">Review your profile details and current plan.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-white">Account</CardTitle>
            <CardDescription className="text-neutral-400">
              Primary details used for sign-in and syncing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-400">
            <div className="flex items-center justify-between">
              <span>Email</span>
              <span className="font-medium text-white">{session.user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Name</span>
              <span className="font-medium text-white">{session.user.name ?? "Not set"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Plan</span>
              <span className="font-medium text-white">{profile.isPro ? "Pro" : "Free"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-white">Subscription</CardTitle>
            <CardDescription className="text-neutral-400">
              Current plan and billing cycle details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-400">
            <div className="flex items-center justify-between">
              <span>Plan</span>
              <span className="font-medium text-white">{planName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Status</span>
              <span className="font-medium text-white">{statusLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Provider</span>
              <span className="font-medium text-white">{plan?.provider ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Renews on</span>
              <span className="font-medium text-white">{formatDate(plan?.currentPeriodEnd)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Cancel at period end</span>
              <span className="font-medium text-white">
                {plan?.cancelAtPeriodEnd ? "Yes" : "No"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-white text-neutral-950 hover:bg-neutral-200">
          <Link href="/pricing">Manage subscription</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-neutral-800 text-white hover:bg-neutral-800 hover:text-white"
        >
          <Link href="/logout">Sign out</Link>
        </Button>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <MarketingShell>
      <Suspense
        fallback={<div className="px-6 pb-16 pt-12 text-sm text-muted-foreground">Loading...</div>}
      >
        <ProfileContent />
      </Suspense>
    </MarketingShell>
  );
}
