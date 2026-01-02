# Change: Update auth refresh bridge and allowed origins

## Why
Sidepanel 登录状态无法在 Web 认证完成后即时刷新，需要提供明确的刷新信号并覆盖新官方域名。

## What Changes
- Web 认证页面在登录/注册/登出完成后触发 `AUTH_REFRESH` 通知
- 后端默认允许来源列表新增 chatkeep 域名

## Impact
- Affected specs: user-auth
- Affected code: src/app/(auth)/_components/login-form.tsx, src/app/(auth)/_components/signup-form.tsx, src/app/logout/page.tsx, src/proxy.ts
