## ADDED Requirements

### Requirement: 平台字段透传兼容
RPC 服务在处理聊天快照相关请求时 SHALL 接受并透传 `platform/sourcePlatform` 为 `yuanbao` 的输入，不得因平台值为 Yuanbao 返回校验错误。

#### Scenario: Yuanbao 平台请求通过校验
- **WHEN** 客户端提交 `platform` 为 `yuanbao` 的有效请求
- **THEN** RPC 校验通过并继续执行业务处理。

#### Scenario: Yuanbao 平台写入分享记录
- **WHEN** 分享快照请求中的平台字段为 `yuanbao`
- **THEN** 服务端持久化记录中的 `sourcePlatform` 保持为 `yuanbao`。
