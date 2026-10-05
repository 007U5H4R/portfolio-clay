"use client";

import { useEffect } from "react";

/** The scroll offset past which the header gains its hairline (Design.md §4.1: "after 8 px"). */
export const SCROLLED_AFTER_PX = 8;

/**
 * The header's only scroll behaviour (Design.md §4.1, decision D12 — TKT-71): a render-less client
 * leaf that toggles `data-scrolled` on `header[data-site-header]` once `scrollY > 8`, via a passive,
 * rAF-throttled listener. It never touches layout — the header keeps one height and the attribute
 * only turns the bottom border on — so the F6 scroll hysteresis has no state left to guard (a
 * border-colour change cannot clamp `scrollY`). The attribute is written to the DOM, not React
 * state, so a scroll never re-renders the header tree.
 */
export function HeaderScroll() {
  useEffect(() => {
    const header = document.querySelector("header[data-site-header]");
    if (!header) return;
    let frame = 0;
    const apply = () => {
      frame = 0;
      if (window.scrollY > SCROLLED_AFTER_PX) header.setAttribute("data-scrolled", "");
      else header.removeAttribute("data-scrolled");
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
