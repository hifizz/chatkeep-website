## 1. Frontend Rendering Strategy

- [x] 1.1 Refactor `/s/[shareId]/page.tsx` message list rendering to mount only an initial message window.
- [x] 1.2 Implement deterministic viewport-triggered auto batch loading (no manual "load more" action) without changing message order.
- [x] 1.3 Keep all optimization within frontend components; do not change server DTOs or share service behavior.

## 2. Viewport Lazy Rendering

- [x] 2.1 Introduce a deferred markdown wrapper with lightweight placeholders for off-screen content.
- [x] 2.2 Use `IntersectionObserver` to hydrate deferred message content when it approaches viewport.
- [x] 2.3 Ensure in-viewport content keeps the same final markdown rendering output as the original implementation.

## 3. Verification

- [x] 3.1 Add lightweight client performance marks/measures around initial and batch render.
- [x] 3.2 Validate large-content page behavior in frontend flow (auto progressive reveal + viewport lazy hydration).
- [x] 3.3 Run `pnpm lint`, `pnpm typecheck`, and `pnpm format:check` before handoff.
