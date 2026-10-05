"use client";

import { useEffect } from "react";

/**
 * Opposite-theme art preload (dark-mode.md §44, EVAL-026): once the page has loaded and the browser is idle,
 * the inactive twin (`[data-theme-art]` hidden by the theme CSS, lazy so it was never fetched) is told to load
 * eagerly, so the first theme switch is instant. Route-aware by construction: it is rendered only by a route
 * that has paired art (the home hero), warms only that route's twin, and renders nothing itself. The twin's own
 * `srcset`/`sizes` pick the file, so a phone warms the narrow crop and a desktop the full scene.
 */
export function ThemeArtPreload() {
  useEffect(() => {
    const warm = () => {
      const active = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      for (const el of document.querySelectorAll<HTMLImageElement>("img[data-theme-art], picture[data-theme-art] img")) {
        const own = el.closest("[data-theme-art]")?.getAttribute("data-theme-art");
        if (own && own !== active && el.loading === "lazy") el.loading = "eager";
      }
    };
    const schedule = () => {
      if ("requestIdleCallback" in window) window.requestIdleCallback(warm, { timeout: 4000 });
      else setTimeout(warm, 1500);
    };
    if (document.readyState === "complete") schedule();
    else {
      window.addEventListener("load", schedule, { once: true });
      return () => window.removeEventListener("load", schedule);
    }
  }, []);
  return null;
}
