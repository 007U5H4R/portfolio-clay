"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { publishRoute, setWake } from "@/lib/analytics/track";

/**
 * The only analytics code in the first-load bundle besides `track()` (TASK-194): a render-less client
 * component mounted once in the root layout. It does two things and nothing else:
 *   1. publishes the current pathname (Next's `usePathname`) so the lazy runtime sees every route change;
 *   2. once the page has loaded and the browser is idle, imports the runtime chunk, which re-checks every
 *      privacy gate before it downloads the Mixpanel SDK.
 * With no `NEXT_PUBLIC_MIXPANEL_TOKEN` at build time the `ENABLED` branch is compiled out and this
 * component renders nothing and loads nothing. Never on the LCP path: the import waits for `load` + idle.
 */
const ENABLED = Boolean(process.env.NEXT_PUBLIC_MIXPANEL_TOKEN);

export function AnalyticsLoader() {
  const pathname = usePathname();

  useEffect(() => {
    if (ENABLED) publishRoute(pathname);
  }, [pathname]);

  useEffect(() => {
    if (!ENABLED) return;
    let cancelled = false;
    let requested = false;
    const run = () => {
      if (cancelled || requested) return;
      requested = true;
      void import("@/lib/analytics/runtime").then((m) => m.start()).catch(() => undefined);
    };
    // An interaction that has to wait for the SDK asks for it now (only once the page has loaded).
    setWake(() => {
      if (document.readyState === "complete") run();
    });
    const schedule = () => {
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number }).requestIdleCallback;
      if (idle) idle(run, { timeout: 4000 });
      else window.setTimeout(run, 2000);
    };
    if (document.readyState === "complete") schedule();
    else window.addEventListener("load", schedule, { once: true });
    return () => {
      cancelled = true;
      setWake(null);
      window.removeEventListener("load", schedule);
    };
  }, []);

  return null;
}
