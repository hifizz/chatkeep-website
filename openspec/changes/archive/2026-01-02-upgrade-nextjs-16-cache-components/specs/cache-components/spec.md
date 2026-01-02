## ADDED Requirements
### Requirement: 启用 Cache Components
系统 MUST 在 Next.js 配置中启用 `cacheComponents: true`。

#### Scenario: Cache Components 配置生效
- **WHEN** 应用运行于 Next.js 16
- **THEN** `next.config.js` 包含 `cacheComponents: true`

### Requirement: 显式处理动态与运行时数据
系统 MUST 通过添加 `use cache` 指令或 `<Suspense>` 边界解决 Cache Components 的未缓存数据错误。

#### Scenario: 未缓存数据错误被消除
- **WHEN** 路由存在数据获取或运行时数据读取
- **THEN** 路由提供 `use cache` 或 `<Suspense>` 边界以避免未缓存数据错误

### Requirement: 路由段配置迁移
系统 MUST 移除或替换与 Cache Components 不兼容的路由段配置（`dynamic`、`revalidate`、`fetchCache` 或 `runtime = 'edge'`）。

#### Scenario: 不兼容配置被移除或替换
- **WHEN** 路由文件使用旧的段配置
- **THEN** 这些配置被移除或替换为 Cache Components 的等效模式（例如 `use cache` + `cacheLife`）
