## 1. 实施
- [x] 1.1 运行 `upgrade_nextjs_16`（Next.js DevTools MCP）更新依赖并应用 codemod。
- [x] 1.2 更新 `package.json` 脚本为 Next.js 16 默认（`next dev`、`next build`），并确认 Node.js 20.9+ 兼容。
- [x] 1.3 复查 codemod 输出的异步请求 API（`cookies`、`headers`、`params`、`searchParams`），修复标记的 TODO。
- [x] 1.4 在 `next.config.js` 启用 `cacheComponents: true`，并移除不兼容的路由段配置（如存在）。
- [x] 1.5 运行 `enable_cache_components`（Next.js DevTools MCP），根据报错添加 `<Suspense>` 边界并修复 `/chat` 的 `Math.random()` 报错。

## 2. 验证
- [x] 2.1 运行 `pnpm typecheck` 和 `pnpm check`（`pnpm check` 因现有格式问题失败）。
- [x] 2.2 运行 `pnpm build`（因 Google Fonts 拉取失败而中断）。
- [x] 2.3 启动 `pnpm dev`，通过浏览器验证关键路由（首页、认证、聊天）。
