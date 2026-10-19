"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { dockItems } from "@/lib/mobile-dock";

/**
 * TASK-259 (reversible test, Tushar 2026-10-18): the "living origami" background behind the PHONE /projects list
 * (< 640 px; the frosted `.pf-m-card.m-float` cards from TASK-233 blur it). One fixed, pointer-less, aria-hidden layer:
 * a theme wash, two slow lighting blooms, a few faint orbital curves, two folded-paper sculptures at the outer edges
 * and two paper-cut ridges at the lower corners. Everything animates transform/opacity only, each layer on its own
 * loop, and nothing moves under `prefers-reduced-motion`. Art: public/media/projects-bg/ (swapped per theme in CSS, so
 * only the active theme's files download); provenance in public/media/illustrations/card-art-README.md.
 *
 * Styles: the fenced TASK-259 block at the end of app/globals.css.
 *
 * UNDO: set the constant below to `false` (the mount renders nothing and no asset loads), or `git revert` the commit.
 */
export const ORIGAMI_BG_ENABLED = true;

const subscribeNever = () => () => {};

/**
 * TASK-271: how long the six time-based loops keep playing after the last scroll / touch before they pause (the CSS pauses
 * them whenever `data-live` is absent; `animation-play-state` keeps their position, so resuming never jumps).
 */
export const ORIGAMI_LIVE_MS = 7000;
const ACTIVITY_EVENTS = ["scroll", "touchstart", "touchmove", "pointerdown", "wheel", "keydown"] as const;

/**
 * TASK-265 (Tushar 2026-10-19): the layer is mounted ONCE, from the root layout, and shown on the phone dock's own routes
 * only (Home, Xp, Portfolio, About, Certs). Case studies (`/work/<slug>`), the lab, contact, essays and the card have their
 * own scenes and keep the plain paper. Being in the layout it persists across client navigations (no restart between tabs).
 * The /projects product detail view hides it in CSS (`.pf-showcase[data-view="detail"]`, see the TASK-265 block).
 */
const BG_ROUTES = new Set(dockItems.flatMap((i) => (i.kind === "link" ? [i.href] : [])));

export function SiteMobileBackground() {
  const pathname = usePathname();
  const path = pathname && pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return <ProjectsMobileBackground active={!!path && BG_ROUTES.has(path)} />;
}

export function ProjectsMobileBackground({ active }: { active: boolean }) {
  // Portalled to <body>: the layer is page decoration, not part of the showcase's box tree (its cropped sculptures are
  // meant to overhang the viewport), and a fixed layer inside the page's wrappers could pick up a transformed ancestor.
  const mounted = useSyncExternalStore(subscribeNever, () => true, () => false);
  const rootRef = useRef<HTMLDivElement>(null);
  const rendered = ORIGAMI_BG_ENABLED && active && mounted;

  // TASK-271: the loops play only while the reader is scrolling / touching and for ORIGAMI_LIVE_MS afterwards, never in a
  // hidden tab. Passive listeners + one timer + a data attribute: no React state per event (OceanGate is the model).
  useEffect(() => {
    const root = rootRef.current;
    if (!rendered || !root || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let last = 0;
    let timer: number | undefined;
    const sleep = () => {
      timer = undefined;
      const left = ORIGAMI_LIVE_MS - (performance.now() - last);
      if (left > 50) timer = window.setTimeout(sleep, left); // activity since the timer was armed: wait out the rest
      else root.removeAttribute("data-live");
    };
    const wake = () => {
      if (document.visibilityState === "hidden") return;
      last = performance.now();
      if (!root.hasAttribute("data-live")) root.setAttribute("data-live", "");
      if (timer === undefined) timer = window.setTimeout(sleep, ORIGAMI_LIVE_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState !== "hidden") return;
      window.clearTimeout(timer);
      timer = undefined;
      root.removeAttribute("data-live");
    };
    wake(); // the first seconds after the page opens
    for (const e of ACTIVITY_EVENTS) window.addEventListener(e, wake, { passive: true, capture: true });
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      for (const e of ACTIVITY_EVENTS) window.removeEventListener(e, wake, { capture: true });
      document.removeEventListener("visibilitychange", onVisibility);
      window.clearTimeout(timer);
      root.removeAttribute("data-live");
    };
  }, [rendered]);

  if (!rendered) return null;
  return createPortal(
    <div ref={rootRef} className="ob-root" aria-hidden="true" data-testid="projects-bg">
      <div className="ob-wash" />
      <div className="ob-bloom ob-bloom-a" />
      <div className="ob-bloom ob-bloom-b" />
      <svg className="ob-orbits" viewBox="0 0 390 844" preserveAspectRatio="xMidYMid slice" fill="none">
        <ellipse cx="330" cy="150" rx="250" ry="92" transform="rotate(-24 330 150)" />
        <ellipse cx="40" cy="560" rx="300" ry="120" transform="rotate(18 40 560)" />
        <ellipse cx="200" cy="760" rx="340" ry="70" transform="rotate(-8 200 760)" />
      </svg>
      <div className="ob-par ob-par-ridge-far">
        <div className="ob-drift ob-ridge ob-ridge-far" />
      </div>
      <div className="ob-par ob-par-ridge-near">
        <div className="ob-drift ob-ridge ob-ridge-near" />
      </div>
      <div className="ob-par ob-par-facet">
        <div className="ob-drift ob-sculpt ob-facet" />
      </div>
      <div className="ob-par ob-par-orbit">
        <div className="ob-drift ob-sculpt ob-orbit" />
      </div>
    </div>,
    document.body,
  );
}
