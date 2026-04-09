## ADDED Requirements

### Requirement: 官网 MUST 接收已签名的扩展发布同步请求
系统 SHALL 提供内部发布同步接口，接收扩展仓库发送的标准发布 DTO，并校验请求签名与时间窗。

#### Scenario: 签名校验通过时接收发布请求
- **WHEN** 请求携带合法 `x-release-timestamp` 与 `x-release-signature`
- **THEN** 系统接受 `ExtensionReleaseSyncRequestDTO` 并进入持久化流程

#### Scenario: 签名或时间窗校验失败时拒绝请求
- **WHEN** 请求签名不正确或超出允许时间窗
- **THEN** 系统 MUST 返回 401 或 403
- **AND** 不写入任何发布数据

### Requirement: 发布写入 MUST 幂等并维护渠道最新版本
系统 SHALL 基于 `releaseId` 做幂等处理，并在新发布写入后更新对应渠道 latest 游标。

#### Scenario: 重复 releaseId 请求返回幂等结果
- **WHEN** 同一 `releaseId` 的请求重复到达
- **THEN** 系统返回已存在记录
- **AND** 不重复插入发布主记录与产物明细

#### Scenario: 新发布写入后更新 channel latest
- **WHEN** 接收到新的有效发布记录
- **THEN** 系统更新该 `channel` 的 latest 版本、发布时间与关联产物信息

### Requirement: 版本信息 MUST 在发布后立即可见
系统 SHALL 在发布同步成功后触发页面缓存刷新，使安装页与更新页可立即读取到最新版本数据。

#### Scenario: 发布成功后安装页立即读取新版本
- **WHEN** 发布同步接口返回成功
- **THEN** 系统触发 `install` 与 `changelog` 相关页面 revalidate
- **AND** 后续请求可读到新的 channel latest 版本信息
