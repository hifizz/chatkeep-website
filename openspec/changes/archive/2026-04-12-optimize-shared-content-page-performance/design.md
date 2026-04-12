## Context

The shared chat page (`/s/[shareId]`) currently renders every message and runs full markdown parse + syntax highlight for each assistant block during initial page load. Snapshot payloads can approach the current 500 KB upper bound, and large histories produce long scripting tasks, slow first interaction, and janky scrolling on mid-range devices.

This change focuses on client rendering strategy:
- Client: reduce initial mounted nodes and defer expensive markdown work until needed.

Constraints:
- Preserve existing share link semantics (public/password, expiry, revoked behavior).
- Keep current UI style and message ordering unchanged.
- Avoid introducing heavy new dependencies.
- Do not modify server DTO/API/service behavior for this change.

## Goals / Non-Goals

**Goals:**
- Bound initial render cost for very large shared snapshots.
- Keep content fidelity while progressively revealing heavy sections.
- Provide measurable performance signals to detect regressions.
- Keep optimization fully frontend-only.

**Non-Goals:**
- Redesigning share page visual layout.
- Changing access-control, expiry, or password flows.
- Building a generalized virtualized list framework for all app pages.
- Rewriting markdown rendering engine.

## Decisions

1. Decision: Split snapshot rendering into initial window + incremental auto batches.
- Rationale: Rendering the first N messages (e.g., 20) minimizes first paint cost and main-thread pressure.
- Alternative considered: Full virtualization for all messages.
- Why not now: Adds significantly higher implementation complexity for markdown height estimation and anchor behavior; batched progressive loading is sufficient for current payload profile.

2. Decision: Defer heavy markdown hydration using viewport detection.
- Rationale: `IntersectionObserver` allows rendering lightweight placeholders for off-screen long assistant content, then upgrades to `ReactMarkdown` near viewport.
- Alternative considered: Server-side pre-render to static HTML for all messages.
- Why not now: Pre-rendering all blocks still pushes large DOM to client and does not solve mount pressure.

3. Decision: Keep all changes in frontend and avoid server changes.
- Rationale: Current bottleneck is render timing on client; optimizing mount/hydration order addresses the issue directly with lower scope and risk.
- Alternative considered: Add server metadata/truncation for optimization hints.
- Why not now: It expands API surface, requires backend coordination, and is unnecessary for the current lazy-render objective.

4. Decision: Add lightweight instrumentation (`performance.mark/measure`) in client feed component.
- Rationale: Enables objective regression checks without adding new analytics SDKs.
- Alternative considered: No instrumentation.
- Why not now: Lacks feedback loop for performance-oriented changes.

## Risks / Trade-offs

- [Deferred hydration may cause brief placeholder flashes] → Use deterministic skeleton sizing and fade-in to reduce visual shift.
- [Progressive batches can affect find-in-page expectations for unloaded content] → Use viewport-triggered auto-loading with prefetch margin so content appears before users reach the end.
- [Aggressive lazy strategy can hurt perceived continuity] → Keep first screen messages eager-rendered and defer only off-screen content.

## Migration Plan

1. Implement progressive message rendering + deferred markdown in share page components.
2. Add client-side instrumentation and verify on large synthetic snapshots.
3. Roll out default-on behavior (no schema/API migration required).
4. Rollback strategy: revert share page component changes to legacy full render path.

## Open Questions

- What should be the default initial render count and batch size across mobile/desktop?
- Should code block highlighting be fully disabled for very large blocks, or delayed only?
- Do we need a hard UI cap for maximum messages shown on shared pages (with download/full-view fallback)?
