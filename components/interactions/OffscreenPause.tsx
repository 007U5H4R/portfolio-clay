"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { observeOffscreen } from "@/lib/offscreen-pause";

/**
 * Render-less; mounted once in `app/layout.tsx` (TASK-155). Re-scans on every route change so a page's own
 * `[data-pause-offscreen]` containers join the one shared observer (`lib/offscreen-pause.ts`).
 */
export function OffscreenPause() {
  const pathname = usePathname();
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    return observeOffscreen();
  }, [pathname]);
  return null;
}
