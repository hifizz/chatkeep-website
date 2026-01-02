# user-auth Specification

## Purpose
TBD - created by archiving change add-extension-auth. Update Purpose after archive.
## Requirements
### Requirement: 认证与会话跨域
后端 SHALL 允许来自配置白名单的跨域请求访问 `/api/auth` 与 `/api/rpc`，并允许携带凭证。

#### Scenario: 允许来源
- **WHEN** 请求来自允许来源
- **THEN** 响应包含对应的 CORS 头并允许 credentials

#### Scenario: 不允许来源
- **WHEN** 请求来自未允许来源
- **THEN** 响应不包含 CORS 允许头

### Requirement: 会话查询端点
后端 SHALL 通过 `/api/rpc/me` 返回用户与会话数据。

#### Scenario: 有效会话
- **WHEN** 请求携带有效会话 Cookie
- **THEN** 返回用户与会话数据

#### Scenario: 无效会话
- **WHEN** 请求没有有效会话
- **THEN** 返回 401 Unauthorized

### Requirement: 认证刷新通知
Web 认证页面 SHALL 在登录/注册/登出完成后，通过 `window.postMessage("AUTH_REFRESH")` 提示扩展刷新会话。

#### Scenario: 登录完成触发刷新
- **WHEN** 用户完成登录或注册
- **THEN** 页面发送 `AUTH_REFRESH`，扩展收到后刷新 `/api/rpc/me`

#### Scenario: 登出完成触发刷新
- **WHEN** 用户完成登出
- **THEN** 页面发送 `AUTH_REFRESH`，扩展收到后刷新 `/api/rpc/me`

### Requirement: Web 登出流程
后端 SHALL 提供一个 Web 登出页面以清除会话并跳转。

#### Scenario: 登出成功
- **WHEN** 用户访问登出页面
- **THEN** 会话被清除并跳转到安全页面

### Requirement: 允许来源配置
后端 SHALL 允许通过环境变量配置跨域白名单。

#### Scenario: 环境覆盖
- **WHEN** 环境变量设置允许来源
- **THEN** CORS 校验使用该列表

### Requirement: 默认允许来源
后端 SHALL 在未提供环境变量时使用内置的默认允许来源列表。

#### Scenario: 默认包含官方域名
- **WHEN** 未设置 `AUTH_ALLOWED_ORIGINS`
- **THEN** 默认列表包含 `https://chatkeep.dev` 与 `https://dev.chatkeep.dev`

### Requirement: 用户中心页面
系统 SHALL 提供 `/profile` 页面展示用户基本信息与订阅状态。

#### Scenario: 已登录访问用户中心
- **WHEN** 已登录用户访问 `/profile`
- **THEN** 页面展示用户信息与订阅状态

#### Scenario: 未登录访问用户中心
- **WHEN** 未登录用户访问 `/profile`
- **THEN** 页面重定向到 `/login`

### Requirement: 认证页重定向
系统 SHALL 在用户已登录时，将 `/login` 与 `/signup` 重定向到 `/profile`。

#### Scenario: 已登录访问登录页
- **WHEN** 已登录用户访问 `/login`
- **THEN** 页面重定向到 `/profile`

#### Scenario: 已登录访问注册页
- **WHEN** 已登录用户访问 `/signup`
- **THEN** 页面重定向到 `/profile`

### Requirement: 支付成功承载页
系统 SHALL 提供 `/billing/success` 作为支付完成后的承载页面。

#### Scenario: 支付成功跳转
- **WHEN** 支付完成后跳转到 `/billing/success`
- **THEN** 页面展示成功提示并引导至 `/profile`
