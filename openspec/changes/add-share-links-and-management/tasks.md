## 1. 数据模型与契约

- [x] 1.1 在 `src/server/db/schema.ts` 新增 share_link 表与必要索引（owner/status/expires_at）
- [x] 1.2 生成并提交 Drizzle migration，确保可创建/回滚 share_link 结构
- [x] 1.3 新增分享领域 TS 类型与 DTO（mode/expiry/status/snapshot/request/response）并在服务端统一复用
- [x] 1.4 为分享快照增加 schemaVersion 与 payload 大小上限校验

## 2. 分享服务与安全能力

- [x] 2.1 实现 `share-repo`（create/list/getById/revoke/delete）与 owner 约束查询
- [x] 2.2 实现 `share-service`（创建、状态判定、过期判定、失效语义）
- [x] 2.3 实现 `share-security` 密码哈希与校验（scrypt + salt + constant-time compare）
- [x] 2.4 在分享创建流程中落实默认 `password`、可切换 `public`、两种模式都支持过期策略
- [x] 2.5 确保分享快照不可编辑且不包含评论字段

## 3. RPC 与鉴权集成

- [x] 3.1 在 RPC 路由新增 `share/create` 接口并接入参数校验与统一错误输出
- [x] 3.2 在 RPC 路由新增 `share/list`、`share/revoke`、`share/delete` 接口
- [x] 3.3 为 share RPC 统一串联 `requireSession + requirePro` 鉴权中间件
- [x] 3.4 实现分享错误码映射（UNAUTHORIZED/FORBIDDEN/NOT_FOUND/EXPIRED_OR_REVOKED/RATE_LIMITED/VALIDATION_ERROR）
- [x] 3.5 为分享创建与密码校验接口接入基础限流策略

## 4. 公开分享页与管理面板

- [x] 4.1 新增 `GET /s/:shareId` 页面路由，支持有效分享渲染与失效页（链接已失效）
- [x] 4.2 新增 `POST /api/share/:shareId/verify-password` 接口与会话外密码验证流程
- [x] 4.3 分享页渲染作者头像昵称、左上 ChatKeep 品牌区、底部网站信息与信息披露文案
- [x] 4.4 在 `/profile` 增加分享管理区，支持复制链接、撤销、删除与不可编辑提示
- [x] 4.5 非 Pro 用户在分享入口与管理区展示升级引导并禁用管理动作

## 5. SEO、测试与发布准备

- [x] 5.1 为分享页补齐 noindex/nofollow 与 `X-Robots-Tag`，并从 sitemap 排除分享链接
- [x] 5.2 增加服务层与 RPC 的单元/集成测试（创建、权限、密码校验、撤销、过期、删除）
- [x] 5.3 增加公开分享页 E2E 测试（public/password/invalid link）
- [x] 5.4 更新产品文案与定价说明，明确“Share 为 Pro 功能”
- [x] 5.5 输出灰度发布与监控检查项（创建成功率、403 比例、密码失败率、410 命中率）
