## ADDED Requirements

### Requirement: 同步 Pull/Push RPC
后端 SHALL 提供 `POST /api/rpc/sync/pull` 与 `POST /api/rpc/sync/push` 端点用于增量同步。
端点 MUST 使用 better-auth 会话鉴权，未授权请求返回 401 Unauthorized。
请求体 MUST 携带 `deviceId`，且参数不合法时返回 400 Validation Error。
Pull 端点 MUST 返回 `serverTime` 与增量记录（`updatedAt` 或 `deletedAt` 大于 `since`）。
Push 端点 MUST 按 `updatedAt` 执行 LWW 合并，并保留 `deletedAt` 墓碑。
字段命名 MUST 与扩展侧同步 DTO 保持一致（`recordId`、`recordType`、`payload`、`updatedAt`、`deletedAt`）。

请求/响应数据结构：
```ts
export interface SyncPullRequestDTO {
  since?: string
  deviceId: string
}

export type SyncRecordType = 'chat' | 'note'

export interface SyncRecordDTO {
  recordId: string
  recordType: SyncRecordType
  payload: string
  updatedAt: string
  deletedAt?: string
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
```

#### Scenario: Pull 成功
- **WHEN** 客户端携带有效会话调用 `/api/rpc/sync/pull`
- **THEN** 服务端返回 `serverTime` 与增量记录

#### Scenario: Push 成功
- **WHEN** 客户端携带有效会话调用 `/api/rpc/sync/push`
- **THEN** 服务端返回 `accepted` 数量与 `serverTime`

#### Scenario: 未授权
- **WHEN** 客户端请求同步端点且无有效会话
- **THEN** 服务端返回 401 Unauthorized（会话缺失或失效）

#### Scenario: 参数校验失败
- **WHEN** 客户端提交不符合 DTO 的请求体或缺失必填字段（如 `deviceId`）
- **THEN** 服务端返回 400 Validation Error（参数校验失败）

### Requirement: 设备标识记录
服务端 MUST 使用 `deviceId` 进行同步归因与诊断记录。
`deviceId` MUST NOT 作为鉴权凭证或权限判断依据。

#### Scenario: 记录设备标识
- **WHEN** 服务端处理已鉴权的同步请求
- **THEN** 诊断日志包含 `userId` 与 `deviceId`

### Requirement: 同步清除 RPC
后端 SHALL 提供 `POST /api/rpc/sync/clear` 用于清除用户云端同步数据。
端点 MUST 使用 better-auth 会话鉴权，未授权请求返回 401 Unauthorized。
请求体 MUST 携带 `deviceId`，且参数不合法时返回 400 Validation Error。
端点 MUST 返回删除数量与 `serverTime`。

请求/响应数据结构：
```ts
export interface SyncClearRequestDTO {
  deviceId: string
}

export interface SyncClearResponseDTO {
  serverTime: string
  deleted: number
}
```

#### Scenario: 清除成功
- **WHEN** 客户端携带有效会话调用 `/api/rpc/sync/clear`
- **THEN** 服务端删除该用户云端记录并返回删除数量与 `serverTime`

#### Scenario: 清除未授权
- **WHEN** 客户端请求 `/api/rpc/sync/clear` 且无有效会话
- **THEN** 服务端返回 401 Unauthorized（会话缺失或失效）
