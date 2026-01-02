# Capability: Define Pricing Plans

## ADDED Requirements

### Requirement: Pricing tiers and scope
官网与对外文案 SHALL 使用三档定价结构：Free / Monthly / Annual，并在 Pricing 页面明确展示功能矩阵与差异化。

#### Scenario: 定价页展示分层
- **WHEN** 用户访问 Pricing
- **THEN** 能看到 Free/Monthly/Annual 三档与各自权益。

### Requirement: Plan names must be configurable constants
官网实现 MUST 将计划名称与权益配置集中为常量（或等价配置），以支持后续快速更名。

#### Scenario: 计划名称可统一变更
- **WHEN** 修改计划名称常量
- **THEN** 站点中所有引用同步更新。

### Requirement: Pricing copy reflects USD billing, annual savings, and regional pricing
Pricing 文案 MUST 使用美元计价，并说明通过 Stripe 收款、年付优惠与按国家差异化定价策略。

#### Scenario: 计费策略清晰
- **WHEN** 用户查看定价说明
- **THEN** 看到 USD 计价、年付优惠与按国家/地区差异化价格的解释。

### Requirement: Coming soon markers for paid plan features
对于尚未上线的付费能力（Prompt Library / Share Links / Cloud Sync），Pricing 页面 MUST 标注为 Coming soon。

#### Scenario: 未上线能力标注
- **WHEN** 用户查看 Monthly/Annual 权益
- **THEN** 能识别哪些功能为 Coming soon。
