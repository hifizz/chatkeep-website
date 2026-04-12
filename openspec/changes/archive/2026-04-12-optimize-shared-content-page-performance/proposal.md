## Why

Shared content pages become visibly laggy when a snapshot contains a large message history and long markdown blocks. The current page renders and highlights all messages at once, which causes long main-thread tasks and poor scroll/input responsiveness. We need a focused performance change now because share pages are public entry points and poor UX directly hurts adoption.

## What Changes

- Add incremental rendering for shared chat messages so only an initial slice is mounted on first paint.
- Add viewport-based lazy rendering so off-screen message content is not rendered until it approaches the viewport.
- Keep all optimization strictly in frontend rendering; do not change share DTOs, share APIs, or server-side payload behavior.
- Keep automatic progressive batches and stable placeholders to preserve readability while reducing initial work.
- Add lightweight client performance marks for regression observation.

## Capabilities

### New Capabilities
- `chat-share-performance`: Performance guarantees and progressive-render behavior for large shared chat snapshots.

### Modified Capabilities
- (none)

## Impact

- Affected code: `src/app/s/[shareId]/page.tsx`, `src/app/s/[shareId]/_components/*`, `src/components/share/share-markdown.tsx`.
- Affected APIs: none (no API contract changes).
- Dependencies/systems: no new third-party dependency required; optional use of browser `IntersectionObserver` and existing Next.js App Router patterns.
