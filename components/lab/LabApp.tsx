"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { canGoBackToPortfolio, LAB_PATH, readReturnRoute } from "@/lib/lab/session";
import { createLabStore } from "@/lib/lab/store";
import { stopSmoothScroll } from "@/lib/smooth-scroll";
import { playExit, settleOverlay } from "@/components/easter-egg/transition";
import { createRuntime } from "./create-runtime";
import { DebugPanel } from "./DebugPanel";
import { createFxHooks } from "./fx";
import { CenterText, Chrome, Hint, Hud, Intro, PauseCard, PowerChips, Results, Toasts, TpEmblem } from "./LabUi";
import { Fallback } from "./Fallback";
import { GUMMY_URL } from "./gummy-url";
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
    // TASK-155: the lab's boot was a serial chain (LabApp chunk -> GameScene chunk -> rapier wasm init -> only then the
    // GLB fetch, inside Suspense). Start the GLB fetch now so it warms the HTTP cache in parallel with the engine
    // chunks. In the initializer, not at module top level, so the module stays side-effect free (EVAL-027 chunk layout).
    void fetch(GUMMY_URL).catch(() => undefined);
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
            navigate: () => (canGoBackToPortfolio() ? router.back() : router.push(readReturnRoute())),
          }),
        mode === "canvas" && !reduced ? 650 : 0,
      );
    },
    [router, store, runtime, mode],
  );
  useEffect(() => {
    if (runtime) runtime.requestExit = exit;
  }, [runtime, exit]);

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
      runtime?.audio.dispose();
    };
  }, [runtime]);

  // Discovery → intro: the visitor arrived (CURIOUS MIND), then the bear is ready.
  const asset = store((s) => s.assetStatus);
  useEffect(() => {
    if (!runtime) return;
    store.getState().send("DISCOVER");
    runtime.engine.discover();
  }, [runtime, store]);
  // TASK-155: the intro never waits on the GLB (the bear shows its procedural fallback body until the model lands),
  // so a slow network no longer holds the intro for up to the old 9 s guard.
  useEffect(() => {
    if (!runtime) return;
    const t = window.setTimeout(() => store.getState().send("INTRO_READY"), 500);
    return () => window.clearTimeout(t);
  }, [runtime, store]);

  const startRun = useCallback(
    (event: "PLAY" | "REPLAY") => {
      const s = store.getState();
      const next = s.send(event);
      if (next !== "COUNTDOWN" || !runtime) return;
      runtime.engine.beginRun();
      runtime.jelly.reset();
      runtime.melt = 0;
      runtime.reform = 0;
      store.setState({ runId: s.runId + 1, score: 0, combo: 1, timeS: 0, dangerLeft: null, countdown: 3, powers: [], tpMode: false, banner: null, hint: null, summary: null });
    },
    [store, runtime],
  );

  const togglePause = useCallback(() => {
    const s = store.getState();
    if (s.state === "PAUSED") s.send("RESUME");
    else if (s.machine.running) s.send("PAUSE");
  }, [store]);

  const toggleMute = useCallback(() => {
    if (!runtime) return;
    const muted = runtime.audio.setMuted(!runtime.audio.muted);
    store.getState().patch({ muted });
  }, [runtime, store]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        exit("button");
      } else if ((e.key === "p" || e.key === "P") && !e.repeat && !(e.target instanceof HTMLInputElement)) {
        togglePause();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exit, togglePause]);

  // `?debug=panel` also shows the tuning panel (spec §47); plain `?debug` only exposes the handles.
  const [debug] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "panel");
  const state = store((s) => s.state);
  const tp = store((s) => s.tpMode);
  const running = state === "PLAYING" || state === "DANGER" || state === "PAUSED" || state === "COUNTDOWN";

  return (
    <div
      className={styles.root}
      data-lab={mode}
      data-lab-state={state}
      data-lab-asset={asset}
      data-lab-path={LAB_PATH}
      data-theme-mode={tp ? "tp" : undefined}
      data-lenis-prevent=""
    >
      {mode === "canvas" && runtime ? (
        <div className={styles.canvasWrap} data-lab-canvas="" role="group" aria-label="Gummy Lab play field">
          <GameScene runtime={runtime} />
        </div>
      ) : null}
      {mode === "canvas" ? <Chrome store={store} onExit={() => exit("button")} onMute={toggleMute} /> : (
        <div className={styles.chrome}>
          <Link className={styles.back} href="/" onClick={(e) => { e.preventDefault(); exit("button"); }}>
            <span aria-hidden="true">←</span> Back to Portfolio
          </Link>
        </div>
      )}
      {mode === "canvas" ? (
        <>
          {running ? <Hud store={store} onPause={togglePause} /> : null}
          <CenterText store={store} />
          <PowerChips store={store} />
          <TpEmblem store={store} />
          <Hint store={store} />
          <Toasts store={store} />
          {debug && runtime ? <DebugPanel runtime={runtime} /> : null}
          {state === "DISCOVERED" ? <p className={styles.loading} role="status">Warming up the Gummy Lab…</p> : null}
          {state === "INTRO" ? <Intro onPlay={() => startRun("PLAY")} /> : null}
          {state === "PAUSED" ? <PauseCard onResume={togglePause} onExit={() => exit("button")} /> : null}
          {state === "RESULTS" ? <Results store={store} onReplay={() => startRun("REPLAY")} onExit={() => exit("button")} /> : null}
        </>
      ) : (
        <Fallback onBack={() => exit("button")} />
      )}
    </div>
  );
}
