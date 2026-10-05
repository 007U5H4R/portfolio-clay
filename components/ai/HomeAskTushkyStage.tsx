"use client";

/**
 * HomeAskTushkyStage (TKT-113, spec §23) — the Home Ask Tushky entrance, played once. After mount it
 * sets `data-armed` (the CSS pre-reveal state exists only then, so with JavaScript off everything is
 * visible, EVAL-015). When the grid is 20% in view, or focus enters it, it sets `data-in` and the CSS
 * in the TKT-113 block runs: title up 12 px, Tushky 0.97 → 1, notebook in from 20 px right, cards
 * staggered 80 ms, about 850 ms in all. The hidden state is declared only under
 * `prefers-reduced-motion: no-preference`, so with reduced motion everything is simply visible.
 * The pre-reveal state is visual only: the content is always in the accessibility tree.
 */
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const noopSubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

export function HomeAskTushkyStage({ className, children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!mounted || !el || inView) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [mounted, inView]);

  return (
    <div
      ref={ref}
      className={className}
      data-armed={mounted ? "" : undefined}
      data-in={inView ? "" : undefined}
      onFocus={() => setInView(true)}
    >
      {children}
    </div>
  );
}
