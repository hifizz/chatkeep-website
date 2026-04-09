## ADDED Requirements

### Requirement: 注册赠送 Pro 体验
系统 SHALL 在用户首次完成注册时，自动授予一个月（30 天）的 Pro trial，并将该状态写入本地订阅数据。

#### Scenario: 新用户注册后自动获得 trial
- **WHEN** 用户通过 `/signup` 完成首次注册并建立有效会话
- **THEN** 系统创建一条 `monthly` 方案的 `trial` 订阅记录，且 trial 结束时间为注册时间后 30 天

#### Scenario: 注册后置逻辑重复触发时保持幂等
- **WHEN** 同一用户的注册后置发放逻辑被重复执行
- **THEN** 系统不得创建重复 trial 记录，也不得延长已存在 trial 的结束时间

#### Scenario: trial 到期后自动降级
- **WHEN** 用户的 trial 结束时间早于当前时间
- **THEN** 系统在读取订阅状态时将其降级为非 Pro 状态
