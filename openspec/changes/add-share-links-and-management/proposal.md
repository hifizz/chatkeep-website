## Why

网站仓库当前仅具备认证、订阅与云同步 RPC，尚未提供“聊天分享链接”的服务端能力与管理界面，无法承接扩展端新增加的 Share 入口。需要在本仓库补齐分享创建、访问控制、失效处理和管理能力，形成端到端闭环。

## What Changes

- 新增分享数据模型与服务层：支持结构化聊天快照存储、访问模式（`password`/`public`）、过期策略、状态管理（active/revoked/expired）。
- 新增 RPC 能力：创建分享、获取分享列表、撤销分享、删除分享。
- 新增公开访问能力：`/s/:shareId` 分享页与密码校验接口，支持失效页返回。
- 分享页渲染规则：展示作者头像昵称、ChatKeep 品牌头（左上 logo）、底部网站信息与信息披露文案。
- 安全与 SEO：禁止索引（meta + header + sitemap 排除）、password 哈希存储、基础限流防护。
- 分享管理面板：在 `/profile` 下新增分享管理区，支持复制链接、撤销、删除；分享快照不可编辑（撤销后重建）。
- 订阅策略：分享能力仅 Pro 用户可用，非 Pro 返回权限不足并提供升级引导。

## Capabilities

### New Capabilities
- `chat-share-links`: 提供分享创建、访问控制、失效处理与页面渲染能力。
- `chat-share-management`: 提供用户侧分享管理面板与撤销/删除流程。

### Modified Capabilities
- `rpc-api`: 新增 share 相关 RPC 端点并纳入统一错误语义。
- `user-auth`: 分享创建与管理操作引入“已登录且 Pro”鉴权约束。

## Impact

- 受影响代码：`src/server/db/schema.ts`、`src/server/rpc/app.ts`、`src/server/*` 服务层、`src/app/profile/page.tsx`、新增分享页面路由。
- 受影响契约：新增 share DTO（create/list/revoke/delete/public-view/password-verify）。
- 受影响配置：CORS/安全头/robots/sitemap 策略。
- 依赖与迁移：需要新增 Drizzle migration 并进行数据库变更发布。
