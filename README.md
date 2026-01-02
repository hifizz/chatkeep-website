# Fullstack Starter

This is a starter project bootstrapped with the [T3 Stack](https://create.t3.gg/). It provides a solid foundation for building modern, full-stack web applications.

## Design Philosophy

This starter is designed to be **minimalist and production-ready**. The goal is to provide just enough structure to get you started quickly, without imposing rigid design choices or unnecessary complexity.

- **Ready to Use**: Comes with a complete authentication system (sign-up, login, password reset), database integration, and email services pre-configured.
- **Easy to Customize**: Includes only essential pages and components. No extra UI libraries are bundled, allowing you to bring your own or build from scratch.
- **Fully Type-Safe**: End-to-end type safety from your database to your frontend, powered by TypeScript and Zod.
- **Modern Stack**: Built on the Next.js App Router, ensuring you start with the latest web development standards.
- **Dark Mode Included**: A pre-configured, theme-able dark mode is ready to go.

## Core Technologies

- [Next.js](https://nextjs.org) (App Router)
- [better-auth](https://www.better-auth.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)
- [Resend](https://resend.com/) for email delivery
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Zod](https://zod.dev/) for environment and schema validation

## Getting Started

1. **Clone the repository:**

   ```bash
   git clone https://github.com/your-repo/fullstack-starter.git
   ```

2. **Install dependencies:**

   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy `.env.example` to `.env`.
   - Fill in the required variables (database URL, auth secret, Resend API key).
4. **Push the database schema:**（[Detail](./docs/DATABASE_zh.md)）

   ```bash
   pnpm db:push
   ```

5. **Run the development server:**

   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Scripts

- `pnpm dev` - Start the Next.js dev server.
- `pnpm build` - Build for production.
- `pnpm start` - Start the production server.
- `pnpm preview` - Build and start locally.
- `pnpm lint` - Run ESLint checks.
- `pnpm lint:fix` - Fix ESLint issues where possible.
- `pnpm format` - Format with Prettier.
- `pnpm format:check` - Check formatting with Prettier.
- `pnpm typecheck` - Run TypeScript type checks.

## Quality Gates

- Husky pre-commit runs `pnpm lint`, `pnpm format:check`, and `pnpm typecheck`.
- CI runs lint, format check, typecheck, and build.

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
