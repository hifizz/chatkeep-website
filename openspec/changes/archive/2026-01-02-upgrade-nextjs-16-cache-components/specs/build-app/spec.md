## ADDED Requirements
### Requirement: Next.js 16 基线
系统 MUST 依赖最新稳定版 Next.js 16，并使用兼容的 React/React DOM 版本，运行于 Node.js 20.9+。

#### Scenario: 在受支持运行时下可开发与构建
- **WHEN** 在 Node.js 20.9+ 安装依赖后运行
- **THEN** `pnpm dev` 与 `pnpm build` 不出现 Next.js 版本错误

### Requirement: Next.js 16 默认脚本
系统 MUST 使用 Next.js 16 默认 CLI 命令，不再包含 `--turbo` 旧参数。

#### Scenario: 开发脚本符合默认配置
- **WHEN** 开发者执行 `pnpm dev`
- **THEN** 脚本调用 `next dev` 且不包含额外 bundler 标志

### Requirement: 异步请求 API 使用规范
系统 MUST 以异步方式访问请求 API（`cookies`、`headers`）及 App Router 的 `params`/`searchParams`，符合 Next.js 16 要求。

#### Scenario: 路由入口严格使用异步访问
- **WHEN** 路由入口读取 `cookies`、`headers`、`params` 或 `searchParams`
- **THEN** 访问方式为 async（`await` 或等价方式），不依赖已移除的同步行为
