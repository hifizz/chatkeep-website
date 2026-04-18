## Context

`website` 承担官网文案、安装引导、兼容性说明与部分 RPC 服务入口。当前多个页面明确列出支持平台，但尚未包含 Yuanbao；如果主仓扩展先上线而官网未更新，会造成用户预期偏差。同时，RPC 层当前对 `platform` 字段是宽松字符串校验，缺少“Yuanbao 透传兼容”这一规范化约束。

## Goals / Non-Goals

**Goals:**
- 让 website 中所有“支持平台”入口对 Yuanbao 的展示保持一致。
- 明确 RPC 链路对 `platform/sourcePlatform` 的兼容要求，避免后续回归把 `yuanbao` 误判为非法值。
- 在子仓规格中记录与主仓同名 change 的联动关系，满足跨仓发布要求。

**Non-Goals:**
- 不在本次变更中重构整套营销内容架构或引入 CMS。
- 不在本次变更中限制 `platform` 字段为枚举（保持向后兼容）。
- 不新增数据库字段或迁移。

## Decisions

### Decision 1: 使用“集中常量 + 页面引用”统一平台文案
- 方案：在 website 内抽取统一的平台展示常量（或复用现有集中数组），由首页/安装页/FAQ/兼容性页引用，新增 Yuanbao 一次生效。
- 原因：降低重复修改风险，符合 DRY。
- 备选方案：逐页手工修改。
- 不采纳原因：后续新增平台时容易漏改。

### Decision 2: RPC 维持字符串输入，但补充规范性要求与测试
- 方案：保持 `z.string().min(1)` 兼容性，不引入 breaking enum；新增测试覆盖 `platform: "yuanbao"` 的入参与持久化透传。
- 原因：最小改动，不影响现有客户端。
- 备选方案：改成枚举并严格校验。
- 不采纳原因：会引入潜在破坏性变更，需要额外迁移策略。

### Decision 3: 通过 OpenSpec 文档双向引用主仓变更
- 方案：在 website proposal/design/tasks 中标注主仓 change-id、联调顺序、回滚方法。
- 原因：满足子仓 OpenSpec 宪法中的跨仓可追溯性要求。
- 备选方案：只在 PR 描述中记录。
- 不采纳原因：信息容易丢失，不利于长期维护。

## Risks / Trade-offs

- [Risk] 页面文案分散导致遗漏某个入口 → Mitigation: 任务清单逐页核对并添加回归检查点。
- [Risk] `platform` 宽松字符串导致未来出现拼写漂移 → Mitigation: 在服务层加入归一化辅助或最小校验日志，并补充测试样例。
- [Risk] 主仓与子仓上线顺序颠倒 → Mitigation: 发布流程固定“先 website 后主仓”，主仓 PR 必须引用子仓 commit。

## Migration Plan

1. 完成 website 文案与 RPC 兼容测试更新，合并并记录 commit hash。
2. 主仓实现引用该 commit，更新 submodule 指针。
3. 联调验证官网文案、安装说明、分享/同步链路平台字段显示。

Rollback:
- website 回滚至前一版本文案与测试；不涉及数据库迁移，回滚风险低。

## Open Questions

- 是否需要在 changelog 页面同步增加“Yuanbao 支持”条目？
- 官网平台展示是否统一采用中文“腾讯元宝”还是英文“Yuanbao”命名？
