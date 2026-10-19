"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getLenis, scrollToTarget, setLenis, setLenisWake } from "@/lib/smooth-scroll";

export const SMOOTH_SCROLL_POINTER_QUERY = "(pointer: fine)";
export const SMOOTH_SCROLL_REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** Same-document hash target for a clicked link, or `null` when the click is not ours to handle. */
function hashTarget(event: MouseEvent): HTMLElement | null {
  if (event.defaultPrevented || event.button !== 0) return null;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return null;
  const link = (event.target as Element | null)?.closest?.("a[href]");
  if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) {
    return null;
  }
  const url = new URL(link.href, window.location.href);
  if (!url.hash || url.origin !== window.location.origin || url.pathname !== window.location.pathname) {
    return null;
  }
  const id = decodeURIComponent(url.hash.slice(1));
  return id ? document.getElementById(id) : null;
}

/**
 * Site-wide smooth scroll (TKT-94, decision EXE-16, Design.md §11 Dev-22). Render-less; mounted once in
 * `app/layout.tsx`. One mount effect decides **once** (the TP13/TP14 pattern — no media-query
 * listeners, a mid-session change never re-decides): only when `(pointer: fine)` matches and
 * `prefers-reduced-motion` does not does it dynamically import Lenis and create one instance with
 * a sleeping rAF loop (TASK-155); otherwise it does nothing and native scroll stays in charge (touch keeps its momentum,
 * reduced motion keeps instant scroll). Smoothing only — no scroll-linked animation.
 *
 * While mounted it also owns same-document hash navigation (hero "Ask my portfolio" → `#ask`, the
 * SkipLink → `#main`, case-study chapter links, and a hash present on load): `lenis.scrollTo` clear of
 * the sticky header, then focus moves to the target (`lib/smooth-scroll.ts`).
 */
export function SmoothScroll() {
  const pathname = usePathname();
  // TASK-270: set by a back/forward `popstate`, cleared by the next click; lets the route-change reset below leave
  // history traversal to Next's own scroll restoration.
  const poppedRef = useRef(false);

  // TASK-270: a new page must open at the top. Lenis keeps easing toward its old target after a click, so a link
  // clicked mid-ease opened the next page part-way down (`stopInertiaOnNavigate` covers `<a>` clicks; this covers
  // `router.push` and anything else that changes the route). Skipped for a hash URL (the hash handling owns the
  // landing spot) and for back/forward (Next restores the position).
  useEffect(() => {
    const popped = poppedRef.current;
    poppedRef.current = false;
    const lenis = getLenis();
    if (!lenis || popped || window.location.hash) return;
    // `force` so it also lands while a modal has Lenis paused; no stop()/start() (that would un-pause it).
    lenis.scrollTo(0, { immediate: true, force: true });
  }, [pathname]);

  useEffect(() => {
    const onPopState = () => {
      poppedRef.current = true;
    };
    const onAnyClick = () => {
      poppedRef.current = false;
    };
    window.addEventListener("popstate", onPopState);
    document.addEventListener("click", onAnyClick, true);
    return () => {
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onAnyClick, true);
    };
  }, []);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    if (!window.matchMedia(SMOOTH_SCROLL_POINTER_QUERY).matches) return;
    if (window.matchMedia(SMOOTH_SCROLL_REDUCED_QUERY).matches) return;

    let cancelled = false;
    let destroy: (() => void) | undefined;

    const onClick = (event: MouseEvent) => {
      const target = hashTarget(event);
      if (!target) return;
      if (!scrollToTarget(target)) return;
      event.preventDefault();
      // Keep the URL/history behaviour of a native hash jump.
      if (window.location.hash !== `#${target.id}`) window.history.pushState(null, "", `#${target.id}`);
    };

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      // TASK-155: no `autoRaf` — Lenis's own loop re-queued a rAF every frame for the whole visit, idle or not.
      // This loop runs only while Lenis is easing (`isScrolling`) and sleeps otherwise; a wheel
      // event (Lenis's own virtual-scroll listener runs first) or a programmatic scrollTo wakes it.
      const lenis = new Lenis({ autoRaf: false, stopInertiaOnNavigate: true });
      let rafId = 0;
      const tick = (time: number) => {
        rafId = 0;
        lenis.raf(time);
        if (lenis.isScrolling) rafId = requestAnimationFrame(tick);
      };
      const wake = () => {
        if (!rafId) rafId = requestAnimationFrame(tick);
      };
      window.addEventListener("wheel", wake, { passive: true });
      setLenis(lenis);
      setLenisWake(wake);
      document.addEventListener("click", onClick);

      // A hash on load: the browser already jumped natively (under the header) — correct it.
      const id = decodeURIComponent(window.location.hash.slice(1));
      const initial = id ? document.getElementById(id) : null;
      if (initial) scrollToTarget(initial, { immediate: true });

      destroy = () => {
        document.removeEventListener("click", onClick);
        window.removeEventListener("wheel", wake);
        cancelAnimationFrame(rafId);
        setLenisWake(null);
        setLenis(null);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      destroy?.();
    };
  }, []);

  return null;
}
