# 变更：升级到 Next.js 16 并启用 Cache Components

## 为什么
- 对齐最新稳定版 Next.js 16 及其运行时/API 要求。
- 启用 Cache Components 以获得部分预渲染和显式缓存能力。

## 变更内容
- 按官方升级指南更新 Next.js、React、React DOM 到最新稳定版。
- 运行 Next.js 16 升级 codemod，迁移异步请求 API 等变更。
- 更新 `package.json` 脚本为 Next.js 16 默认（移除 `--turbo`）。
- 在 `next.config.js` 启用 `cacheComponents: true`，移除不兼容的路由段配置。
- 审核 App Router 路由，按需添加 `use cache` 或 `<Suspense>` 边界。

## 影响范围
- 受影响 specs：`build-app`、`cache-components`（新增）。
- 受影响代码：`package.json`、`pnpm-lock.yaml`、`next.config.js`、`src/app/**`。
- 风险：缓存语义可能改变数据新鲜度；异步请求 API 迁移在部分场景需要人工修正。
