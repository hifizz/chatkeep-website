# Share Rollout Checklist

## 1. Launch Scope

- Share create/list/revoke/delete RPC is enabled.
- Public share route `/s/:shareId` is reachable.
- Password verify endpoint `/api/share/:shareId/verify-password` is reachable.
- Profile page shows share management panel.

## 2. Guardrails

- Non-Pro users get `403 FORBIDDEN` for share management RPC.
- Unauthorized users get `401 UNAUTHORIZED` for share management RPC.
- Share pages return noindex/no-follow metadata and `X-Robots-Tag`.
- Sitemap and robots policy do not expose `/s/*`.

## 3. Monitoring KPIs

- Share create success rate.
- Share create `403` ratio (non-Pro blocked ratio).
- Password verify failure ratio.
- Invalid link hit ratio (expired/revoked access).
- Share revoke success ratio.

## 4. Incident Rollback

- Disable share creation in RPC layer behind feature flag or route short-circuit.
- Keep existing shared pages readable if still active.
- Force all new accesses to invalid state only if data incident requires hard stop.
