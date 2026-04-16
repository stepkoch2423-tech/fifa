import { startTransition, useEffect, useMemo, useRef, useState } from "react";

interface UseInfiniteSliceOptions {
  initialCount?: number;
  step?: number;
  rootMargin?: string;
}

export function useInfiniteSlice<T>(
  items: T[],
  {
    initialCount = 12,
    step = 12,
    rootMargin = "280px 0px",
  }: UseInfiniteSliceOptions = {},
) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(items.length, initialCount),
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleCount(Math.min(items.length, initialCount));
  }, [items, initialCount]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || visibleCount >= items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          startTransition(() => {
            setVisibleCount((current) => Math.min(items.length, current + step));
          });
        }
      },
      {
        root: null,
        rootMargin,
        threshold: 0.01,
      },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [items.length, rootMargin, step, visibleCount]);

  const visibleItems = useMemo(
    () => items.slice(0, visibleCount),
    [items, visibleCount],
  );

  return {
    hasMore: visibleCount < items.length,
    sentinelRef,
    visibleCount,
    visibleItems,
  };
}
