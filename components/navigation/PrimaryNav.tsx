"use client";

import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";

/** Keep a scrolled-to tab this far clear of the strip's edges (the right-edge fade is 32 px). */
const EDGE_CLEARANCE_PX = 40;

/**
 * The primary nav (Design.md §4.1; TKT-71, TASK-112): Fraunces 18, ≥ 44 px hit areas, a physical terracotta paper strip
 * (`.hn-strip`, TASK-145.1) under the `aria-current="page"` tab. Every width shows the tabs — there is no
 * hamburger (Tushar 2026-09-27, TASK-112). ≥ 1440 they sit centred in the single header row; below
 * 1440 they are the header's second row, a horizontally scrollable strip (`.header-tabs`) with a
 * paper fade at the right edge while more tabs lie beyond it (`data-more`).
 *
 * Client for `usePathname()` (the one per-route value a static build cannot know, TP1) and for the
 * strip's horizontal scroll: the active tab is brought into view on load / route change, and a
 * focused tab on keyboard focus. Both set the strip's own `scrollLeft` — never `scrollIntoView`,
 * which could also move the page vertically. It still server-renders, so the links are in the
 * static HTML (EVAL-015 no-JS check).
 */
export function PrimaryNav() {
  const pathname = usePathname();
  const stripRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  /** Horizontal "nearest" scroll of one tab inside the strip; a no-op when nothing overflows. */
  const reveal = useCallback((tab: HTMLElement | null, behavior: ScrollBehavior) => {
    const strip = stripRef.current;
    if (!strip || !tab || strip.scrollWidth <= strip.clientWidth) return;
    const s = strip.getBoundingClientRect();
    const t = tab.getBoundingClientRect();
    let delta = 0;
    if (t.left < s.left + EDGE_CLEARANCE_PX) delta = t.left - s.left - EDGE_CLEARANCE_PX;
    else if (t.right > s.right - EDGE_CLEARANCE_PX) delta = t.right - s.right + EDGE_CLEARANCE_PX;
    if (delta !== 0) strip.scrollTo({ left: strip.scrollLeft + delta, behavior });
  }, []);

  // `data-more` on the wrapper while tabs lie past the right edge: it shows the paper fade.
  const syncMore = useCallback(() => {
    const strip = stripRef.current;
    const wrap = wrapRef.current;
    if (!strip || !wrap) return;
    const more = strip.scrollLeft + strip.clientWidth < strip.scrollWidth - 1;
    if (more) wrap.setAttribute("data-more", "");
    else wrap.removeAttribute("data-more");
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    reveal(strip.querySelector<HTMLElement>('[aria-current="page"]'), "instant");
    syncMore();
  }, [pathname, reveal, syncMore]);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const observer = new ResizeObserver(syncMore);
    observer.observe(strip);
    strip.addEventListener("scroll", syncMore, { passive: true });
    return () => {
      observer.disconnect();
      strip.removeEventListener("scroll", syncMore);
    };
  }, [syncMore]);

  return (
    <div ref={wrapRef} className="header-tabs">
      <nav
        ref={stripRef}
        aria-label="Primary"
        className="header-nav"
        onFocus={(event) =>
          reveal(
            event.target as HTMLElement,
            window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
          )
        }
      >
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className="header-nav-link focus-ring"
            >
              {item.label}
              <span className="hn-strip" aria-hidden="true" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
