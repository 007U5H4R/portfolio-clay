"use client";

import { useEffect } from "react";

/**
 * Spec §26–§27: one-time, viewport-triggered, product-specific motion. This only flips state; each
 * theme's CSS decides what "arriving" looks like (a rail segment drawing, a stamp settling, a tab
 * sliding, an ink stroke). Without JS nothing is ever hidden: sections only start in their
 * "before" pose once `data-motion="on"` is set here, and never under reduced motion.
 */
export function CaseMotion({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId);
    if (!root || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>("[data-cs-reveal]"));
    // Anything already on screen when the page loads is shown as-is (no replayed entrance).
    const fold = window.innerHeight;
    for (const el of targets) if (el.getBoundingClientRect().top < fold * 0.9) el.dataset.shown = "";
    root.dataset.motion = "on";
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.shown = "";
          io.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -18% 0px", threshold: 0.08 },
    );
    for (const el of targets) if (!("shown" in el.dataset)) io.observe(el);
    return () => io.disconnect();
  }, [rootId]);
  return null;
}
