## Context
We need a minimal, type-safe RPC layer that integrates with existing Next.js App Router and better-auth session handling. The solution must stay within Node.js runtime constraints for Hono.

## Goals / Non-Goals
- Goals: typed RPC via hc, runtime validation with Zod, session-based auth for protected routes, minimal integration footprint.
- Non-Goals: multi-service architecture, Edge runtime support, custom RPC protocol beyond Hono + hc defaults.

## Decisions
- Decision: Mount Hono on App Router route handler (app/api/[[...route]]/route.ts) using hono/vercel.
- Decision: Use `/api` as the base path to align with existing API routes and keep URLs short.
- Decision: Define Hono app and route modules under src/server to keep API logic separate from route handlers.
- Decision: Use @hono/zod-validator for request validation and surface 400 errors with validation details.
- Decision: Add an auth middleware that reads better-auth session on the server using the official server-side API and guards protected routes.

## Alternatives considered
- Pages Router adapter: more config, not aligned with current App Router structure.
- Standalone Hono server: higher operational complexity and deployment overhead.

## Risks / Trade-offs
- Node.js runtime required for Hono; Edge runtime is not supported in this setup.
- Auth middleware depends on better-auth server APIs; exact helper import needs confirmation.

## Migration Plan
- Add dependencies and create Hono app and route handler.
- Add RPC routes with Zod validators and auth middleware.
- Add hc client helper and update usage docs.

## Open Questions
- None.

## Notes: Base Path Trade-offs and Migration
Using `/api` keeps RPC URLs short and consistent with existing API routes. Using `/api/rpc` provides clearer separation and a dedicated prefix for RPC-only middleware.

If a future migration to `/api/rpc` is desired, we can:
- Change the Hono base path to `/api/rpc` and update the hc client base URL.
- Optionally keep the old `/api` path with a temporary redirect or proxy to avoid breaking clients.
