"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { Diorama } from "./Diorama";
import { IntroBack, IntroFront } from "./IntroScene";
import { BackPortal, CenterText, Chrome, FlipLive, Hint, Hud, LaunchControl, PauseCard, PowerChips, Results, ScorePops, StartPlaque, Toasts, TpEmblem } from "./LabUi";
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
    // A remembered "sound on" shows the toggle on; the audio context itself waits for the first gesture (audio.ts).
    store.getState().patch({ muted: rt.audio.muted });
    return { mode: "canvas", runtime: rt };
  });

  useEffect(() => {
    // `?debug` exposes read-only handles for profiling/tests; nothing is drawn (spec §47: not visible in production).
    if (runtime && new URLSearchParams(window.location.search).has("debug")) {
      (window as unknown as { __gummyLab?: unknown }).__gummyLab = { rt: runtime, store };
    }
  }, [runtime, store]);

  // The diorama's art is only requested once the canvas exists, so the lab's own first load is unchanged.
  const [art, setArt] = useState(false);

  const [exitedFromMachine, setExitedFromMachine] = useState(false);
  const exit = useCallback(
    (via: "portal" | "button" = "button") => {
      const s = store.getState();
      if (s.state === "EXITING") return;
      setExitedFromMachine(s.machine.live || s.state === "COUNTDOWN");
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

  // The intro stays mounted while it animates out (the paper opens onto the game world).
  const [leaving, setLeaving] = useState(false);
  const leaveTimer = useRef<number | null>(null);
  useEffect(() => () => void (leaveTimer.current !== null && window.clearTimeout(leaveTimer.current)), []);

  const startRun = useCallback(
    (event: "PLAY" | "REPLAY") => {
      const s = store.getState();
      const wasIntro = s.state === "INTRO";
      const next = s.send(event);
      if (next !== "COUNTDOWN" || !runtime) return;
      if (wasIntro) {
        setLeaving(true);
        leaveTimer.current = window.setTimeout(() => setLeaving(false), runtime.reducedMotion ? 300 : 800);
      }
      runtime.engine.beginRun();
      runtime.jelly.reset();
      runtime.melt = 0;
      runtime.reform = 0;
      // Every run starts on the plunger at 0%: the gummy parks at the launcher (Gummy.tsx), the charge, the trail and the plaque reset.
      runtime.plunger.cancel();
      runtime.touchPlunger = false;
      runtime.launched = false;
      runtime.laneGateShut = false;
      runtime.nudge.reset();
      runtime.nudgeRequested = false;
      runtime.sinceLaunch = Infinity;
      runtime.trail.clear();
      runtime.particles.clear();
      store.setState({ runId: s.runId + 1, score: 0, combo: 1, timeS: 0, dangerLeft: null, countdown: 3, powers: [], tpMode: false, banner: null, hint: null, summary: null, launched: false });
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
  // Paper rustle as the intro, pause and results cards open (a no-op while muted).
  useEffect(() => {
    if (state === "INTRO" || state === "PAUSED" || state === "RESULTS") runtime?.audio.play("rustle");
  }, [state, runtime]);
  const introOn = mode === "canvas" && (state === "DISCOVERED" || state === "INTRO" || leaving);
  const running = state === "PLAYING" || state === "DANGER" || state === "PAUSED" || state === "COUNTDOWN";
  // The machine is on screen (Arena.tsx shows it for these states): the black hole is the exit and the plunger control is live.
  // Leaving keeps whichever layout the visitor was in (an exit from the intro or the results never zooms the frame).
  const onMachine = state === "EXITING" ? exitedFromMachine : running || state === "GAME_OVER";

  return (
    <div
      className={styles.root}
      data-lab={mode}
      data-lab-state={state}
      data-lab-asset={asset}
      data-lab-path={LAB_PATH}
      data-intro={introOn ? (leaving ? "leaving" : "on") : undefined}
      data-theme-mode={tp ? "tp" : undefined}
      data-machine={mode === "canvas" && onMachine ? "" : undefined}
      data-lenis-prevent=""
      onClickCapture={(e) => {
        if ((e.target as Element).closest("button, a")) runtime?.audio.play("click");
      }}
    >
      {introOn ? <IntroBack show={art} leaving={leaving} /> : null}
      {mode === "canvas" && runtime ? (
        <Diorama show={art}>
          <div className={styles.canvasWrap} data-lab-canvas="" role="group" aria-label="Gummy Lab play field">
            <GameScene runtime={runtime} onReady={() => setArt(true)} />
          </div>
        </Diorama>
      ) : null}
      {mode === "canvas" ? <Chrome store={store} onExit={() => exit("button")} onMute={toggleMute} showBack={!onMachine} /> : (
        <div className={styles.chrome}>
          <Link className={styles.back} href="/" onClick={(e) => { e.preventDefault(); exit("button"); }}>
            <span aria-hidden="true">←</span> Back to Portfolio
          </Link>
        </div>
      )}
      {mode === "canvas" ? (
        <>
        {introOn ? <IntroFront art={art} text={state === "INTRO" || leaving} leaving={leaving} onPlay={() => startRun("PLAY")} /> : null}
        {runtime && onMachine ? <BackPortal runtime={runtime} onExit={() => exit("portal")} /> : null}
        {runtime && onMachine ? <LaunchControl runtime={runtime} store={store} /> : null}
        <div className={styles.opening} data-lab-opening="">
          {running ? <Hud store={store} onPause={togglePause} runtime={runtime ?? undefined} /> : null}
          <CenterText store={store} />
          <PowerChips store={store} />
          <TpEmblem store={store} />
          <Hint store={store} />
          <FlipLive store={store} />
          {runtime ? <StartPlaque runtime={runtime} store={store} /> : null}
          {runtime ? <ScorePops runtime={runtime} /> : null}
          <Toasts store={store} />
          {debug && runtime ? <DebugPanel runtime={runtime} /> : null}
          {state === "DISCOVERED" ? <p className={styles.loading} role="status">Warming up the Gummy Lab…</p> : null}
          {state === "PAUSED" ? <PauseCard onResume={togglePause} onExit={() => exit("button")} /> : null}
          {state === "RESULTS" ? <Results store={store} onReplay={() => startRun("REPLAY")} onExit={() => exit("button")} /> : null}
        </div>
        </>
      ) : (
        <Fallback onBack={() => exit("button")} />
      )}
    </div>
  );
}
