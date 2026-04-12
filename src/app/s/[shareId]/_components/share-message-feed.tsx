"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ShareDeferredMarkdown } from "./share-deferred-markdown";
import { cn } from "~/lib/utils";
import type { ShareSnapshotMessageDTO } from "~/types/share";

type ShareMessageFeedProps = {
  messages: ShareSnapshotMessageDTO[];
};

const INITIAL_MESSAGE_COUNT = 20;
const MESSAGE_BATCH_SIZE = 20;
const EAGER_RENDER_COUNT = 6;
const PREFETCH_ROOT_MARGIN = "600px 0px";

export function ShareMessageFeed({ messages }: ShareMessageFeedProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_MESSAGE_COUNT, messages.length),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isAppendingRef = useRef(false);
  const previousVisibleCountRef = useRef(visibleCount);

  const hasMore = visibleCount < messages.length;

  const appendBatch = useCallback(() => {
    if (!hasMore || isAppendingRef.current) return;
    isAppendingRef.current = true;

    if (typeof performance !== "undefined") {
      performance.mark("share-feed-batch-start");
    }

    window.requestAnimationFrame(() => {
      setVisibleCount((current) => Math.min(current + MESSAGE_BATCH_SIZE, messages.length));
      isAppendingRef.current = false;
    });
  }, [hasMore, messages.length]);

  useEffect(() => {
    if (typeof performance === "undefined") return;
    performance.mark("share-feed-start");
    const rafId = window.requestAnimationFrame(() => {
      performance.mark("share-feed-mounted");
      try {
        performance.measure("share-feed-initial-render", "share-feed-start", "share-feed-mounted");
      } catch {
        // no-op: ignore missing mark errors in non-standard browsers
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  useEffect(() => {
    if (previousVisibleCountRef.current === visibleCount) return;
    if (typeof performance !== "undefined") {
      performance.mark("share-feed-batch-end");
      try {
        performance.measure(
          "share-feed-batch-render",
          "share-feed-batch-start",
          "share-feed-batch-end",
        );
      } catch {
        // no-op: ignore missing mark errors in non-standard browsers
      }
    }
    previousVisibleCountRef.current = visibleCount;
  }, [visibleCount]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target || !hasMore) return;

    if (typeof IntersectionObserver === "undefined") {
      appendBatch();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const shouldAppend = entries.some((entry) => entry.isIntersecting);
        if (shouldAppend) appendBatch();
      },
      { rootMargin: PREFETCH_ROOT_MARGIN },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [appendBatch, hasMore]);

  const visibleMessages = useMemo(() => messages.slice(0, visibleCount), [messages, visibleCount]);

  return (
    <section className="space-y-8">
      <article className="space-y-8">
        {visibleMessages.map((message, index) => {
          const shouldDeferMarkdown = index >= EAGER_RENDER_COUNT;

          return (
            <section
              key={message.id}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  message.role === "user"
                    ? "w-[80%] min-w-[16rem] rounded-2xl border border-neutral-700/10 bg-neutral-800/85 px-4 py-3 md:w-[72%] lg:w-[64%]"
                    : "w-full",
                )}
              >
                <ShareDeferredMarkdown content={message.content} defer={shouldDeferMarkdown} />
              </div>
            </section>
          );
        })}
      </article>

      {hasMore ? (
        <>
          <div ref={sentinelRef} aria-hidden className="h-1 w-full" />
        </>
      ) : null}
    </section>
  );
}
