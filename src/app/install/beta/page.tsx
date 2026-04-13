import { Suspense } from "react";
import Link from "next/link";
import { MarketingShell } from "~/components/marketing/marketing-shell";
import { getChannelLatest } from "~/server/release/release-service";

const installSteps = [
  {
    title: "Step 1: 下载 Beta Chrome ZIP",
    description: "先下载最新 Beta 版本的 Chrome 手动安装包（zip）。",
  },
  {
    title: "Step 2: 打开 Chrome 扩展页",
    description: "在地址栏输入 chrome://extensions 并回车。",
  },
  {
    title: "Step 3: 启用开发者模式",
    description: "打开右上角 Developer mode（开发者模式）。",
  },
  {
    title: "Step 4: 加载已解压的扩展程序",
    description: "先解压 zip，再点击 Load unpacked，选择解压后的目录。",
  },
  {
    title: "Step 5: 固定 ChatKeep 并验证",
    description: "将 ChatKeep 固定到工具栏，打开任意支持平台确认功能可用。",
  },
];

async function LatestBetaDownloadSection() {
  const betaRelease = await getChannelLatest("dev");
  const chromeArtifact = betaRelease?.artifacts.find((artifact) => artifact.browser === "chrome");

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
      <h2 className="text-lg font-semibold text-white">最新 Beta 下载</h2>
      {chromeArtifact ? (
        <div className="space-y-3">
          <p className="text-sm text-neutral-400">
            当前版本：{betaRelease?.version}
            {betaRelease?.tag ? ` (${betaRelease.tag})` : ""}
          </p>
          <a
            href={chromeArtifact.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200"
          >
            下载 Beta Chrome ZIP
          </a>
        </div>
      ) : (
        <p className="text-sm text-neutral-400">
          暂未检测到 Beta Chrome 安装包，请先完成一次 dev 渠道发布。
        </p>
      )}
    </div>
  );
}

export default function BetaInstallGuidePage() {
  return (
    <MarketingShell>
      <section className="mx-auto flex max-w-4xl flex-col gap-8 px-6 pb-16 pt-12">
        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
            Beta Guide
          </p>
          <h1 className="font-display text-4xl text-white">ChatKeep Beta 手动安装指南（Chrome）</h1>
          <p className="text-sm text-neutral-400">
            本页面会自动读取最新 Beta 发布记录。每次扩展仓库发布到 dev
            渠道并同步成功后，这里的下载按钮会自动更新。
          </p>
        </div>

        <Suspense
          fallback={
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-4">
              <h2 className="text-lg font-semibold text-white">最新 Beta 下载</h2>
              <p className="text-sm text-neutral-400">正在加载最新 Beta 发布信息...</p>
            </div>
          }
        >
          <LatestBetaDownloadSection />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-2">
          {installSteps.map((step) => (
            <div
              key={step.title}
              className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 hover:bg-neutral-900 transition-colors"
            >
              <h2 className="text-lg font-semibold text-white">{step.title}</h2>
              <p className="mt-2 text-sm text-neutral-400">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 space-y-3">
          <h2 className="text-lg font-semibold text-white">截图占位建议</h2>
          <p className="text-sm text-neutral-400">
            你可以把安装过程截图放在网站仓库的 public 目录，然后在 Markdown 手册里引用这些截图链接。
          </p>
          <p className="text-sm text-neutral-400">
            已为你准备模板：
            <a
              href="/install/beta-install-guide.md"
              target="_blank"
              rel="noreferrer"
              className="ml-1 text-emerald-400 hover:text-emerald-300"
            >
              /install/beta-install-guide.md
            </a>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-neutral-200"
          >
            返回首页
          </Link>
          <Link
            href="/install"
            className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            查看安装页
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
