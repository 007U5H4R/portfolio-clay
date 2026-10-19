"use client";

import { useSyncExternalStore } from "react";

/** The /projects desktop tier (TASK-127 / TASK-267 start the spread at 1024 px; the phone tier is < 640 px). */
export const DESKTOP_QUERY = "(min-width: 1024px)";

const subscribe = (notify: () => void) => {
  const mql = window.matchMedia(DESKTOP_QUERY);
  mql.addEventListener("change", notify);
  return () => mql.removeEventListener("change", notify);
};

/**
 * TASK-274: true from 1024 px up. Server and first client render are `false` (the static HTML is the pre-redesign tray),
 * so the desktop-only controls are never in the DOM — focusable or exposed — below the breakpoint.
 */
export function useDesktop(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESKTOP_QUERY).matches,
    () => false,
  );
}
