## 背景
- 当前应用使用 Next.js 15.x（App Router），`next.config.js` 基本为空，开发脚本使用 `next dev --turbo`。
- Next.js 16 要求 Node.js 20.9+，并强制异步请求 API（`cookies`、`headers`、`params`、`searchParams`）。
- Cache Components 需通过 `cacheComponents: true` 启用，并要求显式处理动态/运行时数据。

## 目标 / 非目标
- 目标：
  - 升级到最新稳定版 Next.js 16 与兼容的 React/React DOM。
  - 启用 Cache Components 并解决相关运行时/构建错误。
  - 变更最小化，仅覆盖兼容性与缓存要求。
- 非目标：
  - 不新增功能、不重构、不做视觉改版。
  - 不默认启用 React Compiler（除非另有要求）。

## 决策
- 先使用 Next.js DevTools MCP 的 `upgrade_nextjs_16`（codemod + 依赖更新）。
- 将脚本更新为 Next.js 16 默认（`next dev` / `next build`），依赖默认的 Turbopack 行为。
- 在 `next.config.js` 启用 `cacheComponents: true`，按官方规范处理 `use cache` 与 `<Suspense>`。
- 优先将运行时数据提取后作为参数传入缓存函数，避免使用 `use cache: private`。

## 风险 / 取舍
- Cache Components 可能改变数据新鲜度；动态/运行时数据需要显式处理。
- 异步请求 API 迁移可能留下 codemod 标记，需要人工修复。
- 若存在隐藏的 `webpack` 配置（插件注入），Next.js 16 默认构建可能报错。

## 迁移计划
1. 运行 `upgrade_nextjs_16` 更新依赖与 codemod。
2. 更新脚本为 Next.js 16 默认，并确认 Node.js 20.9+ 运行时。
3. 启用 `cacheComponents: true`，移除不兼容的路由段配置。
4. 使用 MCP 诊断未缓存数据错误，补充 `use cache` 或 `<Suspense>`。
5. 运行 `pnpm typecheck`、`pnpm check`、`pnpm build` 验证。

## 待确认问题
- 目标运行环境是否已是 Node.js 20.9+？
- 启用 Cache Components 后，是否有特定路由需要保持完全动态（每次请求渲染）？
