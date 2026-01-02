## ADDED Requirements
### Requirement: 认证刷新通知
Web 认证页面 SHALL 在登录/注册/登出完成后，通过 `window.postMessage("AUTH_REFRESH")` 提示扩展刷新会话。

#### Scenario: 登录完成触发刷新
- **WHEN** 用户完成登录或注册
- **THEN** 页面发送 `AUTH_REFRESH`，扩展收到后刷新 `/api/rpc/me`

#### Scenario: 登出完成触发刷新
- **WHEN** 用户完成登出
- **THEN** 页面发送 `AUTH_REFRESH`，扩展收到后刷新 `/api/rpc/me`

### Requirement: 默认允许来源
后端 SHALL 在未提供环境变量时使用内置的默认允许来源列表。

#### Scenario: 默认包含官方域名
- **WHEN** 未设置 `AUTH_ALLOWED_ORIGINS`
- **THEN** 默认列表包含 `https://chatkeep.dev` 与 `https://dev.chatkeep.dev`
