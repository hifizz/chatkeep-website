## Why

主仓 `chat-aside` 将新增腾讯元宝平台支持；若 `website` 子仓不同时更新支持平台文案与相关契约描述，用户会在官网与扩展实际能力之间看到不一致信息。为满足跨仓协作约定，需要在子仓同步建立同名变更并明确与主仓的联动边界。

## What Changes

- 更新官网与文档中“已支持平台”文案，将 Yuanbao 纳入平台列表（首页、安装页、兼容性页、FAQ 等）。
- 明确分享快照/同步相关 RPC 载荷中的 `platform`/`sourcePlatform` 字段应可透传 `yuanbao`，保持后端兼容。
- 在子仓 OpenSpec 中记录与主仓 `add-yuanbao-platform-support` 的对应关系、发布顺序与回滚策略。

## Capabilities

### New Capabilities
- `platform-support-content`: 定义 website 对外展示的“支持平台”信息在各页面中的一致性要求。

### Modified Capabilities
- `rpc-api`: 明确 RPC 接口在校验与存储链路中对 `yuanbao` 平台字段的兼容与透传要求。

## Impact

- Affected code:
  - `src/app/page.tsx`
  - `src/app/install/page.tsx`
  - `src/app/docs/compatibility/page.tsx`
  - `src/app/faq/page.tsx`
  - `src/app/layout.tsx`（如需同步 metadata）
  - `src/server/rpc/app.ts`、`src/server/share/share-service.ts`（如需补充平台归一化/透传约束）
- Affected docs/specs:
  - `website/openspec/changes/add-yuanbao-platform-support/*`
  - 主仓 `openspec/changes/add-yuanbao-platform-support/*`（互相引用）
- Dependencies:
  - 与主仓同名 change 保持一致的发布时间线；先 website 后主仓发布。
