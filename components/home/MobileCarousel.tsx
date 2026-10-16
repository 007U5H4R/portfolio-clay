"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Phone-only one-card-per-screen carousel (TASK-228). The server-rendered `<ul>` (children) stays the single source of
 * markup; below 640 px CSS turns it into a scroll-snap row (native swipe, vertical page scroll untouched), and this client
 * leaf adds the pagination: one real button per slide plus a "liquid worm" pill whose stretch is driven by the live scroll
 * position, so the indicator can never disagree with the card. At >= 640 px the wrapper is `display: contents` and the
 * pagination is `display: none`, so tablet and desktop render exactly as before.
 */

/** Distance between dot centres, the dot size and the pill's resting overhang; mirrored in `.hs-dots` CSS. */
const PITCH = 28;
const HALF = 14;
const REACH = 12;

const easeIn = (t: number) => t * t;
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

export function MobileCarousel({
  noun,
  label,
  count,
  onActiveChange,
  children,
}: {
  noun: string;
  label: string;
  count: number;
  /** Optional (TASK-233): told the settled slide index whenever it changes, so a section can tidy per-slide state. */
  onActiveChange?: (index: number) => void;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);
  const reduced = useRef(false);

  const scroller = useCallback(() => rootRef.current?.querySelector<HTMLElement>(":scope > ul, :scope > ol") ?? null, []);

  useEffect(() => {
    const list = scroller();
    if (!list) return;
    // Guarded like lib/motion.ts: environments without matchMedia (jsdom unit renders of /about and Home) get
    // no reduced-motion or phone listeners instead of a crash.
    const media = (query: string) => (typeof window.matchMedia === "function" ? window.matchMedia(query) : null);
    const mq = media("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduced.current = mq?.matches ?? false;
    };
    sync();
    mq?.addEventListener("change", sync);
    // phones only: the scroll row is a keyboard-focusable region (arrow keys scroll it; axe scrollable-region-focusable)
    const phone = media("(max-width: 639px)");
    const focusable = () => (phone?.matches ? list.setAttribute("tabindex", "0") : list.removeAttribute("tabindex"));
    focusable();
    phone?.addEventListener("change", focusable);
    const slides = () => [...list.children] as HTMLElement[];

    let raf = 0;
    const paint = () => {
      raf = 0;
      const s = slides();
      if (s.length < 2) return;
      const stride = s[1]!.offsetLeft - s[0]!.offsetLeft;
      if (stride <= 0) return;
      const max = s.length - 1;
      const p = Math.min(max, Math.max(0, list.scrollLeft / stride));
      let tail = p;
      let head = p;
      if (reduced.current) {
        tail = head = Math.round(p);
      } else {
        const i = Math.min(max - 1, Math.floor(p));
        const f = p - i;
        tail = i + easeIn(f);
        head = i + easeOut(f);
      }
      const pill = pillRef.current;
      if (pill) {
        const left = HALF + PITCH * tail - REACH;
        pill.style.transform = `translateX(${left}px)`;
        pill.style.width = `${PITCH * (head - tail) + REACH * 2}px`;
      }
      setActive(Math.round(p));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    list.addEventListener("scroll", onScroll, { passive: true });
    // jsdom (unit renders) has no ResizeObserver either: skip the resize resync there, like matchMedia above.
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(onScroll) : null;
    ro?.observe(list);
    paint();
    return () => {
      list.removeEventListener("scroll", onScroll);
      ro?.disconnect();
      mq?.removeEventListener("change", sync);
      phone?.removeEventListener("change", focusable);
      list.removeAttribute("tabindex");
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scroller]);

  useEffect(() => {
    onActiveChange?.(active);
  }, [active, onActiveChange]);

  const goTo = (i: number) => {
    const list = scroller();
    if (!list) return;
    const s = [...list.children] as HTMLElement[];
    const target = s[i];
    if (!target) return;
    list.scrollTo({ left: target.offsetLeft - s[0]!.offsetLeft, behavior: reduced.current ? "auto" : "smooth" });
  };

  return (
    <div ref={rootRef} className="hs-carousel" role="group" aria-roledescription="carousel" aria-label={label}>
      {children}
      {count > 1 ? (
        <div className="hs-dots" style={{ width: PITCH * count }}>
          <span ref={pillRef} className="hs-dots-pill" aria-hidden="true" style={{ transform: `translateX(${HALF - REACH}px)`, width: REACH * 2 }} />
          {Array.from({ length: count }, (_, i) => (
            <button
              key={i}
              type="button"
              className="hs-dot focus-ring"
              aria-label={`Go to ${noun} ${i + 1} of ${count}`}
              aria-current={i === active ? "true" : undefined}
              onClick={() => goTo(i)}
            >
              <span aria-hidden="true" />
            </button>
          ))}
          <span className="sr-only" role="status" aria-live="polite">
            {`${noun[0]!.toUpperCase()}${noun.slice(1)} ${active + 1} of ${count}`}
          </span>
        </div>
      ) : null}
    </div>
  );
}
