## MODIFIED Requirements
### Requirement: 会话查询端点
后端 SHALL 通过 `/api/rpc/me` 返回用户、会话与订阅概况数据（包含 `isPro` 与 `plan` 信息）。

#### Scenario: 有效会话
- **WHEN** 请求携带有效会话 Cookie
- **THEN** 返回用户与会话数据，并包含 `isPro` 与 `plan.status`

#### Scenario: 无效会话
- **WHEN** 请求没有有效会话
- **THEN** 返回 401 Unauthorized
