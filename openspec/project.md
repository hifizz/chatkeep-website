# Project Context

## Purpose
Provide a minimal, production-ready full-stack starter built on Next.js App Router with auth, database, and email integrations.

## Tech Stack
- Next.js (App Router)
- TypeScript
- React
- Drizzle ORM + PostgreSQL
- Tailwind CSS
- better-auth
- Resend

## Project Conventions

### Code Style
- ESLint for linting; Prettier for formatting.
- Follow `.editorconfig` (2-space indent, max line length 100).
- Prefer clear, readable names and simple composition over inheritance.

### Architecture Patterns
- Routes and layouts live under `src/app`.
- Shared components live under `src/components` and `src/components/ui`.
- Database schema and wiring live under `src/server/db`.
- Utilities live under `src/lib`.

### Testing Strategy
- No dedicated test runner yet.
- Quality gates: `pnpm lint`, `pnpm format:check`, `pnpm typecheck`.

### Git Workflow
- Conventional Commits (e.g., `feat: ...`, `fix: ...`).
- PRs include a short description and screenshots for UI changes.

## Commands & Maintenance

### Development
- `pnpm dev` - Start the dev server.
- `pnpm preview` - Build and start locally.

### Build & Run
- `pnpm build` - Production build.
- `pnpm start` - Run production server.

### Lint / Format / Types
- `pnpm lint` - ESLint checks.
- `pnpm lint:fix` - ESLint fixes.
- `pnpm format` - Prettier format (write).
- `pnpm format:check` - Prettier check.
- `pnpm typecheck` - TypeScript type checks.

### Database
- `pnpm db:push` - Sync schema in dev.
- `pnpm db:generate` + `pnpm db:migrate` - Migrations.
- `pnpm db:studio` - Drizzle Studio.
- `./start-database.sh` - Start local Postgres container.

## Domain Context
- Authentication, user management, and email workflows are part of the starter.

## Important Constraints
- Keep secrets out of version control; use `.env`.
- Update database via Drizzle schema and scripts only.

## External Dependencies
- PostgreSQL
- Resend
