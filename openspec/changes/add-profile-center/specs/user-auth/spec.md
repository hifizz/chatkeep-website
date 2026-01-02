## ADDED Requirements
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
