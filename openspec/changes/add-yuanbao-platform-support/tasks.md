## 1. 平台文案统一

- [x] 1.1 抽取或复用统一的平台展示数据源，加入 `Yuanbao`。
- [x] 1.2 更新首页、安装页、FAQ、兼容性页文案，确保支持平台列表一致。
- [x] 1.3 检查 metadata/SEO 文案中涉及平台列表的字段并同步更新。

## 2. RPC 兼容与测试

- [x] 2.1 在 RPC 相关 handler/服务层确认 `platform/sourcePlatform` 可透传 `yuanbao`。
- [x] 2.2 为 RPC 与 share service 增加 `yuanbao` 场景测试，覆盖校验与持久化。
- [x] 2.3 执行 `pnpm lint`、`pnpm format:check`、`pnpm typecheck` 并修复问题。

## 3. 跨仓联动交付

- [x] 3.1 在子仓变更文档中回填主仓 change 链接与联调说明。
- [ ] 3.2 合并后输出 website commit hash，供主仓更新 submodule 指针。
- [ ] 3.3 按“先 website、后 chat-aside”顺序完成发布验证。
