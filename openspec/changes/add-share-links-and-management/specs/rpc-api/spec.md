## ADDED Requirements

### Requirement: 分享创建 RPC 契约
系统 SHALL 提供创建分享的 RPC 能力，输入包含聊天快照、访问模式、过期配置与可选密码，输出包含 `shareId`、`shareUrl`、`mode`、`expiresAt` 与 `status`。

#### Scenario: 创建分享成功
- **WHEN** 已授权用户提交合法创建参数
- **THEN** RPC 返回创建成功结果和可访问分享链接

#### Scenario: 创建参数非法
- **WHEN** 请求参数不满足 DTO 校验规则
- **THEN** RPC 返回 400 校验错误并包含字段级错误信息

### Requirement: 分享管理 RPC 契约
系统 SHALL 提供分享列表查询、撤销分享、删除分享 RPC 能力，并保证仅能操作当前用户自己的分享记录。

#### Scenario: 查询当前用户分享列表
- **WHEN** 用户调用分享列表 RPC
- **THEN** RPC 返回该用户可见的分享记录集合

#### Scenario: 操作非本人分享记录
- **WHEN** 用户尝试撤销或删除不属于自己的分享
- **THEN** RPC 返回 404 或权限错误且不改变目标记录

### Requirement: 分享错误语义标准化
系统 SHALL 对分享相关 RPC 返回统一错误语义，包括至少 `UNAUTHORIZED`、`FORBIDDEN`、`NOT_FOUND`、`EXPIRED_OR_REVOKED`、`RATE_LIMITED` 与 `VALIDATION_ERROR`。

#### Scenario: 非 Pro 用户创建分享
- **WHEN** 非 Pro 用户调用创建分享 RPC
- **THEN** RPC 返回 `FORBIDDEN` 错误并包含升级引导信息

#### Scenario: 高频调用触发限流
- **WHEN** 同一主体在窗口期内超出分享接口调用阈值
- **THEN** RPC 返回 `RATE_LIMITED` 错误

### Requirement: 分享公开访问接口契约
系统 SHALL 提供公开访问接口用于获取分享页面数据，并在 `password` 模式下提供独立密码校验接口。

#### Scenario: 公开模式直接读取
- **WHEN** 访问者请求 `public` 模式分享
- **THEN** 接口返回页面渲染所需的分享数据

#### Scenario: 密码模式先校验再读取
- **WHEN** 访问者请求 `password` 模式分享且未完成密码校验
- **THEN** 接口返回需要密码校验的响应，不直接返回分享内容
