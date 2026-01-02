"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import { notifyAuthRefresh } from "~/lib/extension";

export default function LogoutPage() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        await signOut();
      } finally {
        notifyAuthRefresh();
        setIsSigningOut(false);
        router.replace("/login");
      }
    };

    run();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground">
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-semibold">正在退出登录…</h1>
        <p className="text-sm text-muted-foreground">
          {isSigningOut ? "请稍候，正在处理" : "若未自动跳转，可手动返回登录页"}
        </p>
        {!isSigningOut && <Button onClick={() => router.replace("/login")}>返回登录</Button>}
      </div>
    </div>
  );
}
