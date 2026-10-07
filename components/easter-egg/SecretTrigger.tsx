"use client";

import "./secret-trigger.css";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClickDetector } from "@/lib/lab/click-detector";
import { LAB_PATH, rememberEntry } from "@/lib/lab/session";

const BRAND = "[data-site-header] .header-brand";

/**
 * One detector for the whole page session (this module is evaluated once per document): click 1 on an
 * inner page navigates home, and clicks 2–5 there must still count towards the same sequence.
 */
const detector = createClickDetector();
/** The last brand click came from an inner page, so it is navigating home (the route commit rebases). */
let navigatingFromClick = false;

/**
 * The Gummy Lab secret trigger (TASK-143.2, S30, gummy-bear.md §9). Render-less; mounted once in
 * `Header`. Five clicks on the name or the TP monogram inside 3.5 s open `/lab`; the first four give
 * progressively stronger hints (`data-gummy-step`, styled in secret-trigger.css). This file and
 * `lib/lab/click-detector.ts` are the only Gummy Lab code in the first-load set: no three.js, no
 * game code — the transition module is fetched lazily from click 2, the lab itself only on `/lab`.
 * There is deliberately no `<a href="/lab">` anywhere (S30: hidden): the navigation is programmatic,
 * under the entry overlay, as a full document load (the lab page carries its own CSP).
 */
export function SecretTrigger() {
  const pathname = usePathname();

  useEffect(() => {
    let resetTimer: number | undefined;

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || window.location.pathname === LAB_PATH) return;
      const target = event.target;
      const brand = target instanceof Element ? target.closest(BRAND) : null;
      if (!brand) return;

      // The input's own timestamp, not "now": a busy main thread (hydration after the route change,
      // a slow phone) delays the handler, not the click, so it must not eat the 3.5 s window.
      const { step, triggered } = detector.click(event.timeStamp || performance.now());
      navigatingFromClick = !triggered && window.location.pathname !== "/";
      window.clearTimeout(resetTimer);
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

      if (step >= 2) void import("./transition");

      if (triggered) {
        // Hold the home navigation of the 5th click: the overlay performs the route change.
        event.preventDefault();
        brand.removeAttribute("data-gummy-step");
        rememberEntry(window.location.pathname + window.location.search);
        void import("./transition").then((m) =>
          m.playEntry({
            nameEl: brand.querySelector(".header-name"),
            reducedMotion: reduced,
            // A full document load, not a client-side route change: /lab is served with its own CSP
            // (it alone may compile the Rapier wasm), and a document keeps the CSP it was loaded with.
            navigate: () => window.location.assign(LAB_PATH),
          }),
        );
        return;
      }

      // Restart the keyframes for this step.
      brand.removeAttribute("data-gummy-step");
      void (brand as HTMLElement).offsetWidth;
      brand.setAttribute("data-gummy-step", String(step));
      if (step === 3 || step === 4) {
        void import("./transition").then((m) => m.spawnDroplets(brand, step === 3 ? 2 : 6));
      }
      resetTimer = window.setTimeout(() => brand.removeAttribute("data-gummy-step"), 900);
    };

    document.addEventListener("click", onClick, true);
    document.documentElement.dataset.gummyTrigger = "ready"; // armed (also lets tests wait for hydration)
    return () => {
      delete document.documentElement.dataset.gummyTrigger;
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(resetTimer);
    };
  }, []);

  // Coming back (browser Back / bfcache) must never show a frozen entry overlay.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) document.querySelector("[data-gummy-overlay]")?.remove();
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // The exit overlay outlives the route change: once the portfolio has painted, fade it out.
  useEffect(() => {
    // The sequence's own first click navigated here: page-load time is not clicking time.
    if (navigatingFromClick) {
      navigatingFromClick = false;
      detector.rebase(performance.now());
    }
    if (pathname === LAB_PATH) return;
    const overlay = document.querySelector("[data-gummy-overlay]");
    if (!overlay) return;
    let cancelled = false;
    void import("./transition").then((m) => {
      if (!cancelled) requestAnimationFrame(() => m.settleOverlay());
    });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
