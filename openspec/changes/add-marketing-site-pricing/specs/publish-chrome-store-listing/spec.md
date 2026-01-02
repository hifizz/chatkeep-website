# Capability: Publish Chrome Web Store Listing

## ADDED Requirements

### Requirement: Listing language and positioning
Chrome Web Store 上架内容 MUST 为英文，并使用官方定位语（"The missing OS for your AI chats"）作为核心叙事。

#### Scenario: 语言与定位一致
- **WHEN** 用户查看商店详情
- **THEN** 内容为英文且包含定位语。

### Requirement: Title, short description, and long description must align with availability
上架文案 MUST 明确标注可用能力与 Coming soon 项，并不得提及 Notion 同步。

Required copy (English):

Title:
"ChatKeep – AI Chat Manager & Export Tool"

Short description:
"The missing OS for your AI chats. Aggregate, highlight, search, and export conversations locally."

Long description:
"ChatKeep is the missing OS for your AI chats.\n\nStop losing important answers. ChatKeep saves your chats locally, lets you highlight memos, adds a TOC minimap for long threads, and enables lightning-fast search.\n\nFEATURES\n- Local-First Auto Save (Gemini now; ChatGPT & Deepseek coming soon)\n- Highlight & Memo on selected text (coming soon)\n- TOC Minimap Navigation (coming soon)\n- Lightning Search across saved chats (coming soon)\n- Export to Markdown (PDF/HTML/JSON coming soon)\n\nPRIVACY\nYour data stays on your device. No selling, no training, no tracking.\n\nCOMING SOON\n- Prompt Library button in the input box\n- Share links\n- Cloud sync (Pro)"

#### Scenario: 文案可用性一致
- **WHEN** 文案引用功能
- **THEN** 仅 Markdown 标注为可用，其余能力标为 Coming soon，且不出现 Notion 同步。

### Requirement: Screenshot captions must match feature status
商店截图文案 MUST 与功能状态一致（Coming soon 必须标注）。

Required captions (English):
1) "The missing OS for your AI chats."
2) "Highlight & Memo while you read. (Coming soon)"
3) "TOC minimap for long conversations. (Coming soon)"
4) "Lightning search in milliseconds. (Coming soon)"
5) "Export your chats locally." (Markdown now)

#### Scenario: 截图不误导
- **WHEN** 用户浏览截图
- **THEN** 能明确区分已上线与 Coming soon 能力。
