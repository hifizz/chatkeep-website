# Change: 接入 Stripe + Creem 订阅支付与 Pro 权限管理

## Why
当前项目缺少完整的订阅支付与权限管理能力，无法根据订阅状态（含试用、宽限期、退款）准确授予或撤销 Pro 权限。需要引入 Stripe 与 Creem，统一订阅状态模型，并在 `/api/rpc/me` 返回 `isPro` 与订阅方案信息。

## What Changes
- 新增订阅支付模块：Stripe Checkout Session + Creem Better Auth 插件双通道接入，Stripe 优先但用户可选。
- 新增订阅状态模型（trial/active/grace/past_due/canceled/refunded），试用有权限但与付费区分，past_due 提供短暂补款宽限期（默认 5 天，可配置）。
- 订阅试用期默认 7 天且可配置；退款成功立即降级；取消订阅到期后降级。
- 统一定价配置：`free/月/年` 价格与币种从共享配置读取，后端不再接受前端金额。
- `/api/rpc/me` 返回 `isPro` + `plan`（含状态、周期、到期时间）。
- 增加 Stripe 与 Creem Webhook 处理与订阅持久化，保证权限同步。

## Impact
- Affected specs: `user-auth`（修改）、`billing-subscriptions`（新增）
- Affected code: `src/lib/auth.ts`, `src/lib/auth-client.ts`, `src/server/rpc/app.ts`, `src/server/db/schema.ts`, `src/lib/pricing.ts`, `src/env.js`, `src/app/api/auth`, `src/app/api`（新增 webhook/checkout）
