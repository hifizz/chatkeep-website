import Link from "next/link";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function BillingSuccessPage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-16 pt-12">
        <Card className="border-[color:var(--marketing-border)] bg-white">
          <CardHeader>
            <CardTitle>支付成功</CardTitle>
            <CardDescription>我们已收到你的付款，会员状态将在短时间内更新。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[color:var(--marketing-muted)]">
            <p>你可以前往用户中心查看订阅状态与会员信息。</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/profile">前往用户中心</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/pricing">返回定价页</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </MarketingShell>
  );
}
