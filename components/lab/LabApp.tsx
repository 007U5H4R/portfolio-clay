"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enteredFromPortfolio, LAB_PATH, readReturnRoute } from "@/lib/lab/session";
import { createLabStore } from "@/lib/lab/store";
import { stopSmoothScroll } from "@/lib/smooth-scroll";
import { playExit, settleOverlay } from "@/components/easter-egg/transition";
import { createRuntime } from "./create-runtime";
import { createFxHooks } from "./fx";
import { Fallback } from "./Fallback";
import type { LabRuntime } from "./runtime";
import { webglAvailable } from "./webgl";
import styles from "./lab.module.css";

const GameScene = dynamic(() => import("./GameScene"), { ssr: false });

/** Elements of the portfolio chrome that must not be reachable while the lab covers the page. */
const CHROME_SELECTOR = "header[data-site-header], footer, a[href='#main']";

type Mode = "canvas" | "fallback";

export default function LabApp() {
  const router = useRouter();
  const store = useMemo(() => createLabStore(), []);
  // The lab chunk only ever renders on the client (`ssr: false`), so WebGL can be probed up front.
  const [{ mode, runtime }] = useState<{ mode: Mode; runtime: LabRuntime | null }>(() => {
    if (!webglAvailable()) return { mode: "fallback", runtime: null };
    const rt = createRuntime(store);
    rt.onAsset = (status) => store.getState().patch({ assetStatus: status });
    rt.hooks = createFxHooks(rt);
    return { mode: "canvas", runtime: rt };
  });

  useEffect(() => {
    // `?debug` exposes read-only handles for profiling/tests; nothing is drawn (spec §47: not visible in production).
    if (runtime && new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as { __gummyLab?: unknown }).__gummyLab = { rt: runtime, store };
    }
  }, [runtime, store]);

  const exit = useCallback(
    (via: "portal" | "button" = "button") => {
      const s = store.getState();
      if (s.state === "EXITING") return;
      s.send("EXIT");
      if (runtime) runtime.exit = { via, t: 0 };
      const monogram = document.querySelector("[data-site-header] .header-monogram");
      const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      window.setTimeout(
        () =>
          playExit({
            targetRect: monogram?.getBoundingClientRect() ?? null,
            reducedMotion: reduced,
            navigate: () => (enteredFromPortfolio() && window.history.length > 1 ? router.back() : router.push(readReturnRoute())),
          }),
        mode === "canvas" && !reduced ? 650 : 0,
      );
    },
    [router, store, runtime, mode],
  );

  // Cover and silence the portfolio underneath; restore everything on unmount.
  useEffect(() => {
    const chrome = Array.from(document.querySelectorAll<HTMLElement>(CHROME_SELECTOR));
    chrome.forEach((el) => el.setAttribute("inert", ""));
    const html = document.documentElement;
    const prevOverflow = html.style.overflow;
    html.style.overflow = "hidden";
    const releaseScroll = stopSmoothScroll();
    // The entry overlay has carried us here; let it go once the lab has painted.
    const raf = requestAnimationFrame(() => settleOverlay());
    return () => {
      cancelAnimationFrame(raf);
      chrome.forEach((el) => el.removeAttribute("inert"));
      html.style.overflow = prevOverflow;
      releaseScroll();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exit("button");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exit]);

  const state = store((s) => s.state);
  // Interim flow (replaced by the full intro/countdown/engine in TASK-143.4).
  useEffect(() => {
    if (mode !== "canvas") return;
    store.getState().send("DISCOVER");
    store.getState().send("INTRO_READY");
  }, [mode, store]);
  const play = () => {
    const s = store.getState();
    s.send("PLAY");
    window.setTimeout(() => store.getState().send("COUNTDOWN_DONE"), 1400);
  };
  const asset = store((s) => s.assetStatus);

  return (
    <div className={styles.root} data-lab={mode} data-lab-state={state} data-lab-asset={asset} data-lab-path={LAB_PATH} data-lenis-prevent="">
      {mode === "canvas" && runtime ? (
        <div className={styles.canvasWrap} data-lab-canvas="">
          <GameScene runtime={runtime} />
        </div>
      ) : null}
      <div className={styles.chrome}>
        <Link
          className={styles.back}
          href="/"
          onClick={(e) => {
            e.preventDefault();
            exit("button");
          }}
        >
          <span aria-hidden="true">←</span> Back to Portfolio
        </Link>
      </div>
      {state === "INTRO" ? (
        <div className={styles.screen}>
          <button type="button" className={styles.play} onClick={play}>
            Let&apos;s play →
          </button>
        </div>
      ) : null}
      {mode === "fallback" ? <Fallback onBack={() => exit("button")} /> : null}
    </div>
  );
}
