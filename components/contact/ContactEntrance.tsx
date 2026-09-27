"use client";

/**
 * ContactEntrance (TASK-113, Tushar's contact spec 2026-09-27 §20) — the `/contact` section's one-off
 * entrance, the same arm-then-reveal pattern as the Home Ask Tushky stage (`HomeAskTushkyStage`).
 * After mount it sets `data-armed` (the CSS pre-reveal state exists only then, so with JavaScript off
 * everything is visible, EVAL-015). When the grid is 20% in view, or focus enters it, it sets
 * `data-in` and the CSS in the TASK-113 block of `app/globals.css` plays once: head up 10 px, collage
 * fades and settles its rotation, card in from 20 px right, sticky rotates 1° into place (~700 ms in
 * all). The hidden state is declared only under `prefers-reduced-motion: no-preference`; with reduced
 * motion nothing moves. The pre-reveal state is visual only — the content is always in the
 * accessibility tree. No motion library: CSS transitions only (bundle budget).
 */
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";

const noopSubscribe = () => () => {};
const useMounted = () =>
  useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

export function ContactEntrance({ className, children }: { className?: string; children: ReactNode }) {
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
