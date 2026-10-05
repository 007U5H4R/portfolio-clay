"use client";

import "./secret-trigger.css";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createClickDetector } from "@/lib/lab/click-detector";
import { LAB_PATH, rememberEntry } from "@/lib/lab/session";

const BRAND = "[data-site-header] .header-brand";

/**
 * The Gummy Lab secret trigger (TASK-143.2, S30, gummy-bear.md §9). Render-less; mounted once in
 * `Header`. Five clicks on the name or the TP monogram inside 3.5 s open `/lab`; the first four give
 * progressively stronger hints (`data-gummy-step`, styled in secret-trigger.css). This file and
 * `lib/lab/click-detector.ts` are the only Gummy Lab code in the first-load set: no three.js, no
 * game code — the transition module is fetched lazily from click 2, the lab itself only on `/lab`.
 * There is deliberately no `<a href="/lab">` anywhere (S30: hidden): the route change is a
 * programmatic `router.push` under the entry overlay.
 */
export function SecretTrigger() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // One detector for the whole session: click 1 on an inner page navigates home, and clicks 2–5
    // there must still count towards the same sequence.
    const detector = createClickDetector();
    let resetTimer: number | undefined;

    const onClick = (event: MouseEvent) => {
      if (event.button !== 0 || window.location.pathname === LAB_PATH) return;
      const target = event.target;
      const brand = target instanceof Element ? target.closest(BRAND) : null;
      if (!brand) return;

      const { step, triggered } = detector.click(performance.now());
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
            navigate: () => router.push(LAB_PATH),
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
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(resetTimer);
    };
  }, [router]);

  // The exit overlay outlives the route change: once the portfolio has painted, fade it out.
  useEffect(() => {
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
