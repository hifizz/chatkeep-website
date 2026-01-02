# Capability: Publish Marketing Site (English)

## ADDED Requirements

### Requirement: English-only marketing site with defined IA
系统 SHALL 发布全英文官网，并提供以下导航与页面：Home / Install / Pricing / Blog / FAQ / Changelog / Privacy / Terms。

#### Scenario: 用户访问官网导航
- **WHEN** 用户打开官网导航
- **THEN** 能看到上述页面入口且内容为英文。

### Requirement: Home page uses the official positioning and feature promise
官网 Home 页面 MUST 使用以下定位语并呈现核心价值与功能模块：

Positioning (exact):
"ChatKeep: The missing OS for your AI chats. Aggregate, Highlight, Search, and Export your conversations locally."

Required sections (English):
- Hero (H1 + Subhead + CTA)
- Why ChatKeep / Problem-Solution
- Key Features (local save, highlight & memo, TOC minimap, lightning search, export)
- Supported Platforms
- Privacy (local-first)
- Final CTA

#### Scenario: 首屏定位一致
- **WHEN** 用户访问 Home
- **THEN** 首屏展示上述定位语与清晰 CTA。

### Requirement: Feature availability and platform status must be explicit
官网 MUST 明确标注功能与平台状态，避免误导：
- Available now: Gemini support, Markdown export
- Coming soon: ChatGPT support, Deepseek support, Prompt Library, Share links, Cloud sync, Export to PDF/HTML/JSON
- 如果出现 Highlight/Memo/TOC/Lightning Search 的描述，必须标注为 Coming soon（除非实现已上线并明确升级状态）。
- 禁止提及 Notion 同步。

#### Scenario: 功能状态清晰
- **WHEN** 用户阅读功能模块
- **THEN** 能明确区分 Available now 与 Coming soon，并且不出现 Notion 同步。

### Requirement: Privacy statement must emphasize local-first
官网 MUST 明确说明数据默认保存在本地设备，且不用于训练或出售。

#### Scenario: 隐私声明一致
- **WHEN** 用户查看隐私相关文案
- **THEN** 看到“local-first / data stays on your device”类表达。
