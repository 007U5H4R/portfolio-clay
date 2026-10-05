"use client";

import { useEffect } from "react";
import { FINE_POINTER_QUERY, REDUCED_MOTION_QUERY, shouldMountCursor } from "@/lib/cursor/gate";

/**
 * Paper Trail cursor gate (S29, TASK-142.4). Render-less; mounted once in `app/layout.tsx`. It is the
 * ONLY cursor code in the first-load set: it decides once (TP13/TP14 pattern — no listeners, a
 * mid-session change never re-decides) and only for a fine pointer without reduced motion does it
 * dynamically import the cursor module, after the window `load` event and an idle tick. Touch,
 * coarse pointers, reduced motion and no-JS therefore never request the chunk and mount nothing
 * (EVAL-027/028); the native cursor stays in charge until the module has mounted.
 */
export function PaperCursorGate() {
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const finePointer = window.matchMedia(FINE_POINTER_QUERY).matches;
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    if (!shouldMountCursor({ finePointer, reducedMotion, loaded: true })) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;
    let idleHandle: number | undefined;

    const load = () => {
      void import("./paper-cursor").then((mod) => {
        if (!cancelled) teardown = mod.mountPaperCursor();
      });
    };
    const afterLoad = () => {
      if (cancelled) return;
      if (typeof window.requestIdleCallback === "function") idleHandle = window.requestIdleCallback(load, { timeout: 2000 });
      else idleHandle = window.setTimeout(load, 200);
    };

    if (document.readyState === "complete") afterLoad();
    else window.addEventListener("load", afterLoad, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", afterLoad);
      if (idleHandle !== undefined) {
        if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleHandle);
        window.clearTimeout(idleHandle);
      }
      teardown?.();
    };
  }, []);

  return null;
}
