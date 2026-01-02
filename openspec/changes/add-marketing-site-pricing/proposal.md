# Change: 发布英文官网与定价体系文案（含 Chrome 商店与 SEO/AEO）

## Why
我们需要面向海外用户建立清晰一致的对外叙事，突出 ChatKeep 作为“Chatbot 助手”的定位与差异化能力，并在官网与 Chrome Web Store 中统一表达能力边界与“coming soon”计划，避免误导与功能错配。

## What Changes
- 新增英文官网信息架构与页面文案（Home/Install/Pricing/Blog/FAQ/Changelog/Privacy/Terms）。
- 明确品牌定位语："ChatKeep: The missing OS for your AI chats. Aggregate, Highlight, Search, and Export your conversations locally."
- 定义 Free/Monthly/Annual 三档定价文案，并要求在站点实现中将计划名称配置为常量，便于后续更名。
- 准备 Chrome Web Store 的标题/短描述/长描述与截图文案，并标注功能可用性与“Coming soon”。
- 设计 SEO/AEO 内容（Meta、关键词、FAQ 直答），全部英文。

## Impact
- 影响的 specs：`publish-marketing-site`、`define-pricing-plans`、`publish-chrome-store-listing`、`optimize-seo-aeo`
- 影响的代码：官网将落地在 `~/side/chat-aside-user-system` 仓库（本变更不包含实现代码）
- 风险：若未标注功能状态，可能造成商店审核或用户预期偏差
