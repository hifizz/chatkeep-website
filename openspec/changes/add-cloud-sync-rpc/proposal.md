# Change: Cloud Sync RPC 规范

## Why
扩展端云同步需要明确的后端 RPC 端点与鉴权规范，确保多端一致的同步行为与错误处理。

## What Changes
- 定义 /api/rpc/sync/pull 与 /api/rpc/sync/push 的请求/响应规范
- 定义 /api/rpc/sync/clear 的云端清除行为与返回结构
- 明确会话鉴权、参数校验与错误码约定

## Impact
- Affected specs: cloud-sync（新增）
- Affected code: 无（仅文档）
