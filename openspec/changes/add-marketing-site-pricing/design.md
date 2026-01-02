## Context
我们计划面向海外用户推出英文官网与 Chrome Web Store 上架材料，突出 ChatKeep 作为“Chatbot 助手”的定位与产品差异。当前实现侧以本地能力为主，需在对外文案中明确“可用能力”与“Coming soon”，避免夸大未完成特性（尤其是同步与分享）。官网将落地在 `~/side/chat-aside-user-system` 仓库。

## Goals / Non-Goals
- Goals:
  - 建立统一英文定位语与品牌叙事。
  - 定义官网页面结构与内容块，覆盖安装、定价、FAQ、隐私等关键信息。
  - 输出可直接用于 Chrome Web Store 的文案与截图说明。
  - 设计 SEO/AEO 关键内容，便于搜索与 AI 引擎索引。
  - 明确 Free/Pro/Team 结构，并要求计划名称集中配置为常量。
- Non-Goals:
  - 不实现任何产品功能或后台服务。
  - 不宣传 Notion 同步。
  - 不在本仓库写官网代码。
  - 不给出具体价格数值（TBD）。

## Decisions
- 定位语：
  - "ChatKeep: The missing OS for your AI chats. Aggregate, Highlight, Search, and Export your conversations locally."
- 官网语言：全英文对外内容。
- 平台支持：Gemini 已支持；ChatGPT 与 Deepseek 标注为 Coming soon。
- 导出能力：当前仅承诺 Markdown，其他格式（PDF/HTML/JSON）标注 Coming soon。
- 未来能力：Prompt Library、Share Link、Cloud Sync 以 Coming soon 呈现。
- 定价结构：Free / Monthly / Annual，计划名称需为可配置常量；定价美元，Stripe 收款并允许按国家差异化定价；年付包含优惠说明。

## Risks / Trade-offs
- 过度承诺风险：若未清晰标注 Coming soon，可能导致商店审核问题或用户预期偏差。
- 转化与准确性的权衡：保守标注可能降低转化，但可避免早期信任损失。

## Migration Plan
- N/A（为内容与文案层面的变更，不涉及存量迁移）。

## Open Questions
- 最终定价区间与试用策略（后续确定后补充）。
- 官网技术栈与部署方式（由 `chat-aside-user-system` 决定）。
