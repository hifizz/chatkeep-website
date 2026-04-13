# Extension Release Sync Deployment Notes

## Required Environment Variables

- `RELEASE_SYNC_SECRET`: shared HMAC secret used by extension workflow and website API.
- `RELEASE_SYNC_ALLOWED_REPO`: optional allowlist (`owner/repo`) for the source release repository.
- `RELEASE_DISPLAY_CHANNEL`: optional, controls which channel is shown on homepage manual-download entry (`dev` or `stable`, default `stable`).

## Multi-Environment Configuration

Set values separately in your website deployment platform for `development` and `production`:

- `development`:
  - `RELEASE_SYNC_SECRET=<development-secret>`
  - `RELEASE_SYNC_ALLOWED_REPO=<owner/repo>`
  - `RELEASE_DISPLAY_CHANNEL=dev`
- `production`:
  - `RELEASE_SYNC_SECRET=<production-secret>`
  - `RELEASE_SYNC_ALLOWED_REPO=<owner/repo>`
  - `RELEASE_DISPLAY_CHANNEL=stable`

`RELEASE_SYNC_SECRET` should normally be different between development and production.

The extension repo must use the same environment-specific secret pair:

- extension `development` GitHub Environment `RELEASE_SYNC_SECRET` == website development `RELEASE_SYNC_SECRET`
- extension `production` GitHub Environment `RELEASE_SYNC_SECRET` == website production `RELEASE_SYNC_SECRET`

## Migration Steps

1. Generate migration from schema updates:
   - `pnpm db:generate`
2. Apply migration in target environment:
   - `pnpm db:migrate`
3. Verify new tables and indexes:
   - `chat_aside_extension_release`
   - `chat_aside_extension_release_artifact`
   - `chat_aside_extension_release_latest`

## API Endpoint

- Internal sync endpoint: `POST /api/internal/extension-release`
- Required headers:
  - `x-release-timestamp`
  - `x-release-signature`

## Rollback Plan

1. Temporarily disable extension sync calls in workflow (set workflow to dry-run only).
2. Restore previous stable release pointer in `chat_aside_extension_release_latest`.
3. Revalidate homepage/install/changelog pages to flush stale cache.
4. Re-enable sync after issue is fixed and replay release payload.
