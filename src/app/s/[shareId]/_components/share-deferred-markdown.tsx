"use client";

import { useEffect, useRef, useState } from "react";
import { ShareMarkdown } from "~/components/share/share-markdown";
import { cn } from "~/lib/utils";

type ShareDeferredMarkdownProps = {
  content: string;
  className?: string;
  defer?: boolean;
};

const VIEWPORT_MARGIN = "360px 0px";

export function ShareDeferredMarkdown({
  content,
  className,
  defer = false,
}: ShareDeferredMarkdownProps) {
  const [hydrated, setHydrated] = useState(!defer);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!defer) return;
    if (hydrated) return;

    const target = anchorRef.current;
    if (!target) return;

    if (typeof IntersectionObserver === "undefined") {
      const timerId = window.setTimeout(() => setHydrated(true), 0);
      return () => window.clearTimeout(timerId);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const shouldHydrate = entries.some((entry) => entry.isIntersecting);
        if (shouldHydrate) {
          setHydrated(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: VIEWPORT_MARGIN,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [defer, hydrated]);

  if (hydrated || !defer) {
    return <ShareMarkdown content={content} className={className} />;
  }

  return (
    <div ref={anchorRef} className={cn("space-y-2", className)}>
      <div className="h-4 w-4/5 rounded bg-neutral-800/80" />
      <div className="h-4 w-3/5 rounded bg-neutral-800/70" />
      <div className="h-4 w-2/3 rounded bg-neutral-800/60" />
    </div>
  );
}
