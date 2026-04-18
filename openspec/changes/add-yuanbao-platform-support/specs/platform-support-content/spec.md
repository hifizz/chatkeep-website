## ADDED Requirements

### Requirement: 支持平台文案一致性
Website SHALL 在公开页面（首页、安装页、兼容性页、FAQ）使用一致的“已支持平台”集合，并将 Yuanbao 纳入展示列表。

#### Scenario: 首页与兼容性页一致
- **WHEN** 用户分别查看首页与兼容性页的平台列表
- **THEN** 两处均包含 Yuanbao
- **AND** 平台集合保持一致。

#### Scenario: 安装页与 FAQ 一致
- **WHEN** 用户查看安装页和 FAQ 的支持平台描述
- **THEN** 两处文案均明确包含 Yuanbao。

### Requirement: 平台文案集中维护
Website SHALL 将支持平台文案来源集中管理，页面渲染 MUST 基于统一数据源，避免硬编码散落。

#### Scenario: 新增平台只需单点更新
- **WHEN** 维护者新增一个支持平台到统一数据源
- **THEN** 各平台展示页面可同步反映更新而不需要多处重复改动。
