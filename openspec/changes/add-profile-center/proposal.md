# Change: Add profile center and billing success page

## Why
用户登录后需要一个稳定的用户中心查看个人信息与订阅状态，并在支付完成后有明确的成功承载页面。

## What Changes
- 新增 `/profile` 用户中心页面展示用户信息与订阅状态
- 登录/注册页在已有会话时重定向到 `/profile`
- 新增 `/billing/success` 作为支付成功页并引导至 `/profile`
- 默认支付成功跳转路径更新为 `/billing/success`

## Impact
- Affected specs: user-auth
- Affected code: src/app/profile/page.tsx, src/app/billing/success/page.tsx, src/app/(auth)/login/page.tsx, src/app/(auth)/signup/page.tsx, src/server/billing/billing-service.ts, src/lib/auth.ts
