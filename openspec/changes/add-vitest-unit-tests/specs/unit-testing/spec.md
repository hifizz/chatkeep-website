## ADDED Requirements
### Requirement: 单元测试框架
项目 MUST 提供可执行的单元测试框架与脚本入口。

#### Scenario: 运行测试
- **WHEN** 执行 `pnpm test`
- **THEN** 使用 Vitest 运行单元测试并输出结果

### Requirement: 计费核心逻辑单测覆盖
计费订阅状态映射与身份解析逻辑 MUST 具备基础单元测试覆盖。

#### Scenario: 校验订阅状态映射
- **WHEN** 针对计费订阅状态输入构造用例
- **THEN** 映射结果与预期状态一致

#### Scenario: 校验身份解析回退
- **WHEN** 针对身份解析的不同来源构造用例
- **THEN** 能优先命中 metadata，次选 providerCustomerId，再回退到 email
