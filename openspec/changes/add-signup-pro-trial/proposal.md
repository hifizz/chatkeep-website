## Why

当前新用户注册后默认是 Free，必须主动进入定价流程才能体验 Pro 能力，首日激活率偏低。
将“注册即送 1 个月 Pro 体验”内置到注册流程，可降低首次体验门槛并提高付费转化前的功能触达。

## What Changes

- 在用户首次注册成功后，系统自动为该用户创建一条 `monthly` 的试用订阅记录，状态为 `trial`。
- 试用期时长固定为 30 天（按注册时间起算），到期后自动按现有规则降级为非 Pro。
- 仅对“新注册用户”生效；既有用户不会被批量补发体验。
- 保持现有付费订阅、Webhook 同步与试用防滥用逻辑兼容，不引入新的支付流程。

## Capabilities

### New Capabilities
- 无

### Modified Capabilities
- `user-auth`: 扩展注册成功后的系统行为，要求自动授予 30 天 Pro trial，并可通过会话查询链路反映到用户状态。

## Impact

- Affected code:
  - `src/lib/auth.ts`（注册成功后的自动授予入口）
  - `src/server/billing/subscription-repo.ts`（试用记录写入/幂等）
  - `src/server/billing/profile-service.ts` 与 `/api/rpc/me` 相关链路（状态读取校验）
- Affected data:
  - `chat_aside_user_subscription` 会在新用户注册时新增 trial 记录
- Affected behavior:
  - 新用户首次登录后在 `/profile` 和依赖 `isPro` 的能力中直接获得 Pro 体验
