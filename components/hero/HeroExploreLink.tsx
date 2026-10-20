"use client";

/**
 * HeroExploreLink (TASK-289) — the glass hero's primary CTA, "Explore my work →". An in-page smooth scroll
 * to the Credentials section that directly follows the hero (`#credentials`, the existing section id): same tab, no
 * navigation, and no hash pushed (the URL stays `/`). It stays a real `<a href="#credentials">`, so
 * with JavaScript off, or before hydration, the browser's own jump still lands there, and a modified
 * click (new tab / window) keeps native behaviour.
 *
 * Scrolling reuses the site's one smooth-scroll system: Lenis (`lib/smooth-scroll.ts`, which clears the
 * sticky header and moves focus) when it is mounted — fine pointer, motion allowed. Otherwise (touch,
 * `prefers-reduced-motion: reduce`) a native `scrollTo` clear of the header: instant under reduced
 * motion, smooth otherwise. No new scroll handlers or libraries; the CSS scroll-driven parallax runs
 * off the root scroller either way.
 */
import type { MouseEvent, ReactNode } from "react";
import { scrollToTarget } from "@/lib/smooth-scroll";

export const HERO_EXPLORE_TARGET_ID = "credentials";

export function HeroExploreLink({ className, children }: { className?: string; children: ReactNode }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = document.getElementById(HERO_EXPLORE_TARGET_ID);
    if (!target) return; // no target: leave the native hash jump alone
    event.preventDefault();
    if (scrollToTarget(target)) return; // Lenis path: offsets for the header, then focuses the target
    const header = document.querySelector<HTMLElement>("header[data-site-header]");
    const top = target.getBoundingClientRect().top + window.scrollY - (header?.getBoundingClientRect().height ?? 0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "instant" : "smooth" });
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  return (
    <a href={`#${HERO_EXPLORE_TARGET_ID}`} className={className} onClick={onClick}>
      {children}
    </a>
  );
}
