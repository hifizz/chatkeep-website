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
  trial: "试用中",
  active: "已激活",
  grace: "宽限期",
  past_due: "逾期",
  canceled: "已取消",
  refunded: "已退款",
};

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("zh-CN", {
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
  const statusLabel = plan?.status ? STATUS_LABELS[plan.status] : "未订阅";

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-8 px-6 pb-16 pt-12">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">Profile</p>
        <h1 className="font-display text-3xl text-white">账号与订阅状态</h1>
        <p className="text-sm text-neutral-400">查看你的基础信息与当前会员状态。</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-white">账号信息</CardTitle>
            <CardDescription className="text-neutral-400">用于登录与同步状态展示。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-400">
            <div className="flex items-center justify-between">
              <span>邮箱</span>
              <span className="font-medium text-white">{session.user.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>昵称</span>
              <span className="font-medium text-white">{session.user.name ?? "未设置"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>会员类型</span>
              <span className="font-medium text-white">{profile.isPro ? "Pro" : "Free"}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-800 bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="text-white">订阅状态</CardTitle>
            <CardDescription className="text-neutral-400">当前订阅计划与周期信息。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-neutral-400">
            <div className="flex items-center justify-between">
              <span>方案</span>
              <span className="font-medium text-white">{planName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>状态</span>
              <span className="font-medium text-white">{statusLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>支付渠道</span>
              <span className="font-medium text-white">{plan?.provider ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>到期时间</span>
              <span className="font-medium text-white">{formatDate(plan?.currentPeriodEnd)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>到期后取消</span>
              <span className="font-medium text-white">
                {plan?.cancelAtPeriodEnd ? "是" : "否"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-white text-neutral-950 hover:bg-neutral-200">
          <Link href="/pricing">管理订阅</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="border-neutral-800 text-white hover:bg-neutral-800 hover:text-white"
        >
          <Link href="/logout">退出登录</Link>
        </Button>
      </div>
    </section>
  );
}

export default function ProfilePage() {
  return (
    <MarketingShell>
      <Suspense
        fallback={<div className="px-6 pb-16 pt-12 text-sm text-muted-foreground">正在加载…</div>}
      >
        <ProfileContent />
      </Suspense>
    </MarketingShell>
  );
}
