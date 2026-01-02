## 1. Implementation
- [x] 1.1 扩展 `src/lib/pricing.ts` 为前后端共享配置（金额、币种、trialDays、provider 映射），并移除前端金额输入依赖。
- [x] 1.2 增加订阅环境变量校验（Stripe/Creem/TrialDays/PastDueGraceDays/ProductIds），更新 `src/env.js` 与 `.env.example`。
- [x] 1.3 新增订阅数据表与 Drizzle 迁移（统一存储 Stripe 与 Creem 状态）。
- [x] 1.4 实现 Billing 模块（Checkout 创建、provider 校验、DTO 转换、订阅状态计算）。
- [x] 1.5 Stripe Checkout Session 与 Webhook（订阅/退款/取消事件 -> 订阅表更新）。
- [x] 1.6 Creem Better Auth 插件接入（server/client）并通过回调同步订阅表。
- [x] 1.7 `/api/rpc/me` 返回 `isPro + plan`（含 trial/grace/past_due 等状态）。
- [x] 1.8 前端订阅入口加入 provider 选择并传递 `planKey + provider`。
- [x] 1.9 订阅身份绑定逻辑（metadata.referenceId -> providerCustomerId -> email 兜底）。

## 2. Validation
- [x] 2.1 `pnpm lint`
- [x] 2.2 `pnpm typecheck`
- [ ] 2.3 手工验证：Stripe/Creem 的创建 Checkout、webhook 更新订阅、退款立即降级、取消到期后降级。
