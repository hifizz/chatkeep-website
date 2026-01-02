## ADDED Requirements
### Requirement: 统一订阅定价配置
系统 SHALL 提供前后端共享的定价配置，包含 `free/monthly/annual` 的金额、币种与试用期配置，后端 SHALL 以此配置生成支付请求而非信任前端金额。

#### Scenario: 后端使用共享配置
- **WHEN** 创建 monthly 订阅的支付请求
- **THEN** 结算金额使用配置中的 $9.9 USD

### Requirement: 订阅 Checkout 创建与提供方选择
系统 SHALL 根据 `planKey + provider` 创建订阅 Checkout，未指定 provider 时默认 Stripe，provider 无效时返回 400。

#### Scenario: Creem Checkout
- **WHEN** provider=creem 且 planKey=annual
- **THEN** 返回 Creem Checkout URL

#### Scenario: Provider 无效
- **WHEN** provider 不在允许列表
- **THEN** 返回 400 并拒绝创建支付

### Requirement: Checkout 回调地址安全
系统 SHALL 校验 successUrl 与 cancelUrl 必须为同源或白名单地址，非法 URL 需回退到默认安全地址。

#### Scenario: 非法回调地址被拒绝
- **WHEN** successUrl 或 cancelUrl 不在允许范围
- **THEN** 使用默认回调地址并记录安全日志

### Requirement: 订阅状态持久化与 Webhook 同步
系统 SHALL 通过 Stripe 与 Creem Webhook 更新本地订阅状态，并确保退款成功时立即降级。

#### Scenario: 退款立即降级
- **WHEN** 收到退款成功事件
- **THEN** 订阅状态更新为 refunded 且 `isPro=false`

### Requirement: 订阅身份绑定与回调解析
系统 SHALL 使用内部 userId 作为订阅绑定主键，并在 checkout metadata 中传递 referenceId；Webhook 回调解析用户时优先使用 referenceId，其次使用 providerCustomerId 映射，最后才允许 email 兜底匹配。

#### Scenario: metadata 绑定成功
- **WHEN** Webhook 事件包含 metadata.referenceId
- **THEN** 订阅记录绑定到对应 userId

#### Scenario: metadata 缺失走 providerCustomerId
- **WHEN** Webhook 事件缺少 metadata.referenceId 但包含 customer.id
- **THEN** 系统使用 providerCustomerId 映射到用户

#### Scenario: 仅 email 兜底匹配
- **WHEN** 既无 metadata.referenceId 也无 providerCustomerId 映射
- **THEN** 系统仅在存在 email 时执行兜底匹配

### Requirement: Webhook 签名校验与幂等处理
系统 SHALL 验证 Stripe 与 Creem Webhook 的签名，并对重复事件进行幂等处理，避免重复更新订阅状态。

#### Scenario: 签名无效
- **WHEN** Webhook 请求签名无效或缺失
- **THEN** 返回 401/400 并拒绝处理

#### Scenario: 重复事件
- **WHEN** 同一事件被重复投递
- **THEN** 仅处理一次，订阅状态不重复变更

### Requirement: 试用滥用防护
系统 SHALL 确保用户只可使用一次试用期（跨 provider 统一约束），再次尝试试用时必须拒绝或降级为无试用订阅。

#### Scenario: 二次试用请求
- **WHEN** 已使用过试用的用户再次创建试用订阅
- **THEN** 不再授予试用期

### Requirement: 试用期、补款宽限期与取消策略
系统 SHALL 支持可配置试用期（默认 7 天），并为 past_due 提供可配置的补款宽限期（默认 5 天）；取消订阅后在到期前进入宽限期，到期后降级。

#### Scenario: 取消订阅进入宽限期
- **WHEN** 用户取消订阅且当前周期未结束
- **THEN** 状态为 grace 且 `isPro=true`

#### Scenario: 到期后降级
- **WHEN** 宽限期结束
- **THEN** 状态为 canceled 且 `isPro=false`

#### Scenario: past_due 补款宽限期
- **WHEN** 订阅进入 past_due 且仍在补款宽限期内
- **THEN** `isPro=true`

#### Scenario: past_due 超时降级
- **WHEN** past_due 超出补款宽限期
- **THEN** 状态为 canceled 且 `isPro=false`

### Requirement: past_due 超时强制降级机制
系统 SHALL 在读取订阅或后台任务中强制判定 past_due 是否超时，超时后必须更新为 canceled 并移除权限。

#### Scenario: 读取时触发降级
- **WHEN** 读取订阅且 past_due 已超出宽限期
- **THEN** 订阅状态更新为 canceled 并返回 `isPro=false`
