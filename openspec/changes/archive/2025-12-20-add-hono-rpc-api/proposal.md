# Change: Add Hono RPC API with Zod validation and better-auth sessions

## Why
We need type-safe API contracts between Next.js frontend and backend while keeping runtime input validation and authenticated access consistent.

## What Changes
- Add a Hono-powered RPC API mounted on Next.js App Router route handlers.
- Provide a typed hc client helper for frontend consumption.
- Add a shared client error handling helper and usage example for 400/401 responses.
- Enforce Zod validation for request payloads and return structured validation errors.
- Require better-auth sessions for protected RPC routes.
- Keep the `/api` base path now, with a documented path migration plan to `/api/rpc` if needed.

## Impact
- Affected specs: rpc-api
- Affected code: src/app/api, src/server, src/lib
- Dependencies: hono, @hono/zod-validator (zod already present)
