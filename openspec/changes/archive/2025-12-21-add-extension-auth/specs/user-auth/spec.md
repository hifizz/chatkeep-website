## ADDED Requirements
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
