"use client";

import { useEffect } from "react";

/**
 * Footer ocean gate (M-011 P6, EVAL-036, the TASK-143 scar): the ocean's drift / sail / rock loops run only while the strip
 * is on screen, the tab is visible and the footer is not covered by an overlay (the Gummy Lab marks the portfolio chrome
 * `inert` while it covers it). Everything else is `animation-play-state: paused` (app/globals.css `.band-ocean:not([data-live])`).
 * No timers, no rAF: one IntersectionObserver, one `visibilitychange` listener and one attribute observer, all torn down on unmount.
 * Renders nothing; reduced motion has no animation to gate.
 */
export function OceanGate() {
  useEffect(() => {
    const ocean = document.querySelector<HTMLElement>("[data-band-ocean]");
    const footer = ocean?.closest("footer");
    if (!ocean) return;
    let visible = false;
    const sync = () => {
      const live = visible && document.visibilityState !== "hidden" && !footer?.hasAttribute("inert");
      if (live) ocean.setAttribute("data-live", "");
      else ocean.removeAttribute("data-live");
    };
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting);
      sync();
    });
    io.observe(ocean);
    const mo = footer ? new MutationObserver(sync) : undefined;
    if (footer) mo?.observe(footer, { attributes: true, attributeFilter: ["inert"] });
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      mo?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      ocean.removeAttribute("data-live");
    };
  }, []);
  return null;
}
