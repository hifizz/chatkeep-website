## Context
扩展侧云同步需要一组受会话鉴权保护的 RPC 端点完成增量拉取/推送与云端清除，同时保持与扩展 DTO 命名一致以便复用与维护。

## Goals / Non-Goals
- Goals:
  - 定义 `/api/rpc/sync/pull`、`/api/rpc/sync/push`、`/api/rpc/sync/clear` 的协议与鉴权
  - 明确会话 Cookie 鉴权、参数校验与错误码
  - 保持 DTO 字段命名与扩展侧一致
- Non-Goals:
  - 实现接口与数据库迁移
  - 实时协作或 CRDT
  - 新增 status/dry-run 等扩展端点

## Decisions
- Decision: 使用 Hono RPC 路由挂载在 `/api/rpc/*`
  - Why: 与现有 `/api/rpc/me` 一致，保持调用方式统一
- Decision: 认证采用 better-auth 会话 Cookie（`credentials: include`）
  - Why: 复用现有认证体系，避免新增 Token 体系
- Decision: 以 `serverTime` 作为客户端 `lastSyncAt` 游标
  - Why: 规避客户端时间漂移导致的增量错位
- Decision: 服务端执行 LWW 合并并保留 tombstone
  - Why: MVP 简单可控，符合扩展端合并策略
- Decision: 所有同步请求必须携带 `deviceId`
  - Why: 支撑诊断与后续多端追踪

## Data Contracts
```ts
export type SyncRecordType = 'chat' | 'note'

export interface SyncRecordDTO {
  recordId: string
  recordType: SyncRecordType
  payload: string
  updatedAt: string
  deletedAt?: string
}

export interface SyncPullRequestDTO {
  since?: string
  deviceId: string
}

export interface SyncPullResponseDTO {
  serverTime: string
  records: SyncRecordDTO[]
}

export interface SyncPushRequestDTO {
  deviceId: string
  records: SyncRecordDTO[]
}

export interface SyncPushResponseDTO {
  serverTime: string
  accepted: number
}

export interface SyncClearRequestDTO {
  deviceId: string
}

export interface SyncClearResponseDTO {
  serverTime: string
  deleted: number
}
```

## Error Handling
- 未授权：401 Unauthorized
- 参数校验失败：400 Validation Error

## 日志与审计建议
- 记录字段：`userId`、`deviceId`、`endpoint`、`serverTime`、`accepted/deleted`、`errorCode`
- 记录目的：问题归因、同步失败排障、跨端一致性追踪
- 安全边界：日志字段不作为鉴权或权限判断依据

## 图示
### 时序图（失败与重试）
```marmaid
sequenceDiagram
  participant U as 用户
  participant SM as Sync Manager
  participant API as /api/rpc/sync/*
  participant Auth as better-auth
  participant DB as Postgres

  U->>SM: 触发同步/重试
  SM->>API: POST /api/rpc/sync/pull
  API->>Auth: 校验会话 Cookie
  Auth-->>API: 无效会话/错误
  API-->>SM: 401/400/5xx
  SM->>SM: 记录 lastError
  SM-->>U: 显示失败 + 重试入口
  U->>SM: 点击重试
  SM->>API: 重新请求 pull/push
  API->>DB: 正常处理
  API-->>SM: serverTime + records/accepted
```

## Risks / Trade-offs
- Cookie 跨域鉴权依赖 CORS 白名单与 SameSite 配置，需与扩展域名一致。
- `deviceId` 仅用于诊断与归因，不能作为安全边界。

## Open Questions
- 是否需要为同步端点增加速率限制或配额策略。
