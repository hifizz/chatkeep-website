## ADDED Requirements

### Requirement: 分享创建登录约束
系统 SHALL 要求用户在已登录状态下才能创建分享链接，未登录请求必须被拒绝。

#### Scenario: 未登录创建分享
- **WHEN** 未登录用户调用分享创建能力
- **THEN** 系统返回 `UNAUTHORIZED` 错误

### Requirement: 分享管理登录约束
系统 SHALL 要求用户在已登录状态下才能查询、撤销、删除自己的分享记录。

#### Scenario: 未登录访问分享管理能力
- **WHEN** 未登录用户调用分享列表或管理操作
- **THEN** 系统返回 `UNAUTHORIZED` 错误

### Requirement: 分享能力 Pro 鉴权
系统 SHALL 将分享创建与管理能力限制为 Pro 用户，非 Pro 用户请求必须返回权限不足并提供升级引导信息。

#### Scenario: 非 Pro 用户调用分享创建
- **WHEN** 已登录但非 Pro 用户调用分享创建
- **THEN** 系统返回 `FORBIDDEN` 错误并包含升级说明

#### Scenario: 非 Pro 用户调用分享管理
- **WHEN** 已登录但非 Pro 用户调用分享管理接口
- **THEN** 系统返回 `FORBIDDEN` 错误并包含升级说明

### Requirement: 分享公开访问匿名可读
系统 SHALL 允许未登录访问者打开有效分享链接（受模式与密码约束），且不要求访问者具备站点账号。

#### Scenario: 匿名访问公开分享
- **WHEN** 未登录访问者打开有效 `public` 分享链接
- **THEN** 系统允许读取分享内容

#### Scenario: 匿名访问密码分享
- **WHEN** 未登录访问者打开有效 `password` 分享链接并完成密码校验
- **THEN** 系统允许读取分享内容
