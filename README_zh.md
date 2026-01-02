# 全栈入门模板

这是一个使用 [T3 Stack](https://create.t3.gg/) 启动的入门项目，为构建现代化的全栈 Web 应用提供了坚实的基础。

## 设计理念

此模板旨在做到 **"开箱即用"且"极简主义"**。我们的目标是提供足够的基础设施让您快速启动项目，同时避免引入僵化的设计选择或不必要的复杂性。

- **功能完备**: 集成了完整的认证系统（注册、登录、密码重置）、数据库和邮件发送服务，无需额外配置。
- **易于定制**: 只包含最核心的页面和组件，没有捆绑额外的UI库，方便您引入自己的组件库或从头构建。
- **完全类型安全**: 从数据库到前端，由 TypeScript 和 Zod 提供端到端的类型安全保障。
- **技术栈现代化**: 基于最新的 Next.js App Router 构建，确保您从最新的 Web 开发标准起步。
- **内置暗黑模式**: 已预先配置好暗黑模式，支持主题切换。

## 核心技术

- [Next.js](https://nextjs.org) (App Router)
- [better-auth](https://www.better-auth.com/) (认证)
- [Drizzle ORM](https://orm.drizzle.team/) (数据库ORM)
- [PostgreSQL](https://www.postgresql.org/) (数据库)
- [Resend](https://resend.com/) (邮件服务)
- [Tailwind CSS](https://tailwindcss.com/) (CSS 框架)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/) (环境变量及 Schema 校验)

## 快速上手

1. **克隆仓库:**

   ```bash
   git clone https://github.com/your-repo/fullstack-starter.git
   ```

2. **安装依赖:**

   ```bash
   pnpm install
   ```

3. **配置环境变量:**
   - 将 `.env.example` 复制为 `.env`。
   - 填入必要的变量 (数据库连接字符串、Auth密钥、Resend API密钥)。
   - 若需扩展跨域访问，请配置 `AUTH_ALLOWED_ORIGINS`（逗号分隔）。
4. **推送数据库 Schema:**（[详细说明文档](./docs/DATABASE_zh.md)）

   ```bash
   # 通过 docker 起一个数据库服务。
   ./start-database.sh
   ```

   ```bash
   pnpm db:push
   ```

5. **运行开发服务器:**

   ```bash
   pnpm dev
   ```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看效果。

## 常用脚本

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 生产构建
- `pnpm start` - 启动生产服务
- `pnpm preview` - 本地构建并启动
- `pnpm lint` - ESLint 检查
- `pnpm lint:fix` - ESLint 自动修复
- `pnpm format` - Prettier 格式化
- `pnpm format:check` - Prettier 格式检查
- `pnpm typecheck` - TypeScript 类型检查

## 质量门禁

- Husky 在 pre-commit 中执行 `pnpm lint`、`pnpm format:check`、`pnpm typecheck`。
- CI 会执行 lint、format check、typecheck 和 build。
