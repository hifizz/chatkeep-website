# 订阅身份绑定决策记录

## 背景
随着接入 Creem / Stripe 以及未来可能的 Google / GitHub / Apple 登录，支付系统需要稳定、可追溯的用户标识。仅依赖 email 会遇到缺失、变更或匿名邮箱等问题，导致订阅状态无法正确回写到用户。

## 目标
- 支付回调能稳定定位到内部用户。
- 支持多登录提供商且不依赖 email。
- 保持最小化改动和可扩展性。

## 备选方案与权衡

### 方案 A：Email 作为主键
做法：checkout 时以 email 创建 customer，webhook 通过 customer.email 匹配用户。  
优点：实现简单，开发成本低。  
缺点：
- GitHub / Apple 可能不给邮箱或给匿名邮箱。
- 用户可改邮箱，历史订单难以回溯。
- 邮箱并非唯一且容易被误用。

### 方案 B：支付平台 customerId 作为主键
做法：创建 customer 后保存 providerCustomerId；webhook 通过 customer.id 反查用户。  
优点：稳定、可跨邮箱变更。  
缺点：第一次 checkout 仍需要关联用户，必须先把 customerId 写入本地数据库。

### 方案 C：内部 userId 作为主键（metadata 传递）
做法：checkout 时将 userId 写入 metadata（referenceId），webhook 用 metadata 反查用户。  
优点：最稳妥，可跨所有登录方式。  
缺点：依赖 metadata 正确传递；需要处理旧事件或缺失 metadata 的回调。

### 方案 D：组合方案（行业最佳实践）
做法：内部 userId 为主键，支付平台 customerId 为稳定映射，email 仅作兜底和通知用途。  
优点：可靠、可扩展、兼容多登录提供商。  
缺点：实现复杂度略高，需要维护映射表。

## 结论与决策
采用方案 D：  
1) 内部 userId 作为主身份标识。  
2) 在 checkout metadata 中写入 referenceId = userId。  
3) 本地保存 providerCustomerId / providerSubscriptionId。  
4) email 仅做展示与兜底，不作为唯一绑定依据。

## 概念说明：providerCustomerId
- 含义：支付平台生成的客户 ID（Customer ID）。
- 谁定义：支付平台（Creem / Stripe）。
- 谁提供：checkout 创建/完成后返回，或通过 webhook 回调携带。
- 谁保存：我们后端保存到订阅表，用于后续对账与订阅管理。
- 是否支持：Creem 与 Stripe 均提供 `customer.id`。

## 为什么这样做
- 登录提供商差异（尤其 Apple / GitHub）导致 email 不可靠。
- userId 不变，能稳定关联历史订单与订阅状态。
- providerCustomerId 可用于二次对账与客服场景。

## 实施方式（当前系统）
- checkout 时：metadata 中写入 `referenceId` 与 `userId`。
- webhook 时：优先使用 metadata 里的 userId；若缺失，用 customer.email 兜底匹配用户。
- 数据库字段：`providerCustomerId`、`providerSubscriptionId` 作为支付平台映射。

## 未来扩展建议
- 新增 `billing_email` 字段（可选）：与登录邮箱解耦，用于开票/收据。
- 当用户更新邮箱时，同步更新支付平台 customer email（仅用于通知，不作为绑定依据）。
- webhook 入库仍保持幂等（基于 webhookId + provider）。

## 风险与缓解
- metadata 缺失：提供 email 兜底 + 客服可手动绑定。
- webhook 重放：使用 webhookId 幂等记录，避免重复写入。
- 邮箱变化：不影响订阅绑定，仅影响通知。
