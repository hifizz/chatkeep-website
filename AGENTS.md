<!-- OPENSPEC:START -->
# OpenSpec Instructions

必须输出中文[Must]

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# Repository Guidelines

## Project Structure & Module Organization
- `src/app` holds Next.js App Router routes and layouts. Route groups live under folders like `(auth)` and API routes under `src/app/api`.
- `src/components` contains shared UI and feature components; `src/components/ui` is the shadcn/ui layer.
- `src/server/db` contains Drizzle schema and database wiring. Update `src/server/db/schema.ts` and use the db scripts to sync.
- `src/lib` includes auth, email, and utility helpers. `src/styles` holds global CSS. Static assets live in `public`.
- `docs` stores database and internal guides.

## Build, Test, and Development Commands
- `pnpm dev` runs the Next.js dev server with Turbo.
- `pnpm build` creates a production build; `pnpm start` serves it. `pnpm preview` does build + start in one command.
- `pnpm lint` runs ESLint; `pnpm lint:fix` applies ESLint fixes; `pnpm format` uses Prettier; `pnpm typecheck` runs `tsc --noEmit`.
- Database: `pnpm db:push` (dev sync), `pnpm db:generate` + `pnpm db:migrate` (migrations), `pnpm db:studio` (GUI). `./start-database.sh` boots a local Postgres container from `.env`.

## Drizzle Workflow (Must)

### 日常开发（feature 分支）
- MUST: 功能开发阶段只允许在本地开发数据库执行 pnpm db:push 做 schema 同步。
- MUST NOT: 在 feature 分支对共享开发库、测试库、生产库执行
  db:push、db:generate、db:migrate。
- MUST NOT: 在 feature 分支执行 pnpm db:generate 或 pnpm db:migrate。

### 提交 PR 前（schema 有变化时）
- MUST: 先确认 schema.ts 相比 origin/main 有实质变化；
  若无变化，跳过以下步骤，不提交任何迁移文件。
- MUST: 执行 git fetch origin && git rebase origin/main。
- MUST: 若 rebase 后 drizzle/meta/ 出现 Git 冲突，
  始终 accept main 的版本（git checkout --theirs drizzle/），
  删除本分支 rebase 前已生成的迁移文件，再继续。
- MUST: 执行 pnpm db:generate。
- MUST: 执行 pnpm db:check，确认无错误后再提交。
- MUST: 将 drizzle/*.sql 与 drizzle/meta/* 一并提交。

### PR 等待合并期间
- MUST: 若等待期间 main 有新 commit 进入，
  必须重新执行上方"提交 PR 前"的完整流程，用新文件覆盖旧的再次提交。

### 迁移文件规范
- MUST NOT: 修改已提交的历史迁移文件（0000~00xx.sql）；只允许追加新 migration。

### 部署
- MUST: 合并到 main 后，仅允许由 main 的 CI/CD 或发布流程
  执行 pnpm db:migrate 到共享环境。
- MUST: 若需验证迁移可重复执行性，在干净数据库执行 pnpm db:migrate，
  不要在被 db:push 改写过的数据库直接验证。

## Coding guideline
必须遵守以下软件工程开发原则：
1. DRY (Don't Repeat Yourself - 不重复): 发现任何形式的代码重复，都应立即将其抽象为可复用的函数、组件或类。杜绝复制粘贴。
2. KISS (Keep It Simple, Stupid - 保持简单): 永远选择最简单、最清晰的实现路径。避免为了炫技或过度优化而引入不必要的复杂性。
3. 可读性优先 (Readability First): 代码首先是写给人看的。务必使用表意清晰的变量和函数名，并对复杂的业务逻辑或“为什么这么做”提供必要的注释。
4. 遵守SOLID设计原则
5.YAGNI (You Ain't Gonna Need It - 你不会需要它): 抵制过度设计。只实现当前需求所必需的功能，不要为“未来可能”的需求提前编写代码。
6.组合优于继承 (Composition over Inheritance): 优先使用组合（像搭积木一样，将小功能组合成大功能）的方式来复用代码和扩展行为，而不是通过创建复杂的继承链。如无共享状态，不要创建Class。
7.约定优于配置 (Convention over Configuration): 充分理解并利用你所使用框架 （比如 nextjs16） 的内置约定，这能帮你减少大量重复的配置工作，并保持项目的一致性。

## Coding Style & Naming Conventions
- TypeScript + React (Next.js App Router). Keep components in PascalCase and hooks prefixed with `use`.
- Use `.editorconfig` defaults (2-space indent, max line length 100) and let Prettier handle formatting.
- Keep route segments lowercase (kebab-case when needed) and colocate UI components in `src/components`.

## Testing Guidelines
- No dedicated test runner is configured yet. Use `pnpm lint`, `pnpm format:check`, and `pnpm typecheck` as the current quality gates.
- If you add tests, use `*.test.ts`/`*.test.tsx` and introduce a `pnpm test` script alongside the chosen framework.
- Husky pre-commit and CI both run lint, format check, and typecheck.

## Commit & Pull Request Guidelines
- Commit messages follow a Conventional Commits style like `feat: ...` or `fix: ...` with short, clear summaries.
- PRs should include a brief description, linked issues if any, and screenshots for UI changes. Call out DB schema changes and the migration or push command used.

## Security & Configuration Tips
- Copy `.env.example` to `.env` and keep secrets out of version control.
- Never edit the database manually; update `src/server/db/schema.ts` and apply changes via the provided scripts.

## Agent-Specific Instructions
- For proposals or significant changes, consult `openspec/AGENTS.md` and follow the OpenSpec workflow.
- MUST: 仅实现用户当前明确请求范围内的需求与代码修改。
- MUST NOT: 禁止“顺手补交”“顺手多做一个需求”或“顺手补充额外代码”（包括未明确要求的重构、功能扩展、额外脚本、额外迁移）。
