## Why

官网当前没有“扩展发布元数据”接收与管理能力，安装页/变更页的版本信息是静态内容，无法在扩展发布后自动更新。
为实现“发布后立即同步版本号与下载地址”，需要网站后端提供可验证、可幂等的发布同步入口，并驱动页面实时刷新。

## What Changes

- 新增官网内部发布同步接口（建议：`POST /api/internal/extension-release`），仅供扩展仓库 GitHub Action 调用。
- 接口接收标准化 DTO（渠道、版本、tag、commit、产物 URL/校验和），并做签名校验、时间窗校验与幂等处理。
- 新增发布元数据存储模型（发布记录、产物明细、各渠道 latest 游标）。
- 新增查询服务供安装页/更新页读取最新发布版本，发布成功后触发 `revalidate` 立即更新。
- 明确渠道语义：`dev`（develop）、`rc`（master）、`stable`（tag）。

## Capabilities

### New Capabilities
- `extension-release-registry`: 网站后端接收扩展发布事件、持久化版本元数据、提供渠道最新版本读取与即时刷新能力。

### Modified Capabilities
- 无

## Impact

- Affected code:
  - `src/app/api/...` 新增内部发布同步路由
  - `src/server/...` 新增发布 service/repository/validation
  - `src/server/db/schema.ts` 与迁移（新增发布相关表）
  - `src/app/install`、`src/app/changelog`（从静态改为服务端读取最新版本数据）
- Runtime impact:
  - 发布事件写库 + 页面缓存刷新
  - 内部接口新增签名鉴权与幂等约束
- Collaboration impact:
  - 与扩展仓库共享同一 DTO 契约与签名协议
