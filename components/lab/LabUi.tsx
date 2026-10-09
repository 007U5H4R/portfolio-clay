"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { Pause, Play, Smartphone, Volume2, VolumeX } from "lucide-react";
import type { LabStoreApi } from "@/lib/lab/store";
import { CONTROL_LABELS, START_PLAQUE } from "./controls-copy";
import type { LabRuntime } from "./runtime";
import styles from "./lab.module.css";

/**
 * Gummy Lab's DOM layer (gummy-bear.md §11, §30–31, §34, §45): a minimal HUD (score · combo · time ·
 * pause), the intro, pause and results cards, danger / banner / hint / toast text. The gummy is always
 * the hero — nothing here is a meter, inventory or full-screen overlay. Values arrive from the store
 * at ~10 Hz; nothing re-renders per frame.
 */
const fmtScore = (n: number) => n.toLocaleString("en-US");
const fmtTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

const POWER_NAME: Record<string, string> = {
  SUPER_SQUISH: "Super squish",
  LOW_GRAVITY: "Low gravity",
  RAINBOW: "Rainbow",
  GOLDEN: "Golden",
  TIME_FREEZE: "Time freeze",
};

/** Moves keyboard focus to `ref` when a screen appears (no `autoFocus`, which a11y lint rightly discourages). */
function useFocusOnMount(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const t = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 60);
    return () => window.clearTimeout(t);
  }, [ref]);
}

export function Chrome({ store, onExit, onMute, showBack = true }: { store: LabStoreApi; onExit: () => void; onMute: () => void; showBack?: boolean }) {
  const muted = store((s) => s.muted);
  const state = store((s) => s.state);
  return (
    <div className={styles.chrome}>
      {/* Off the machine (intro, results) the way back is the classic torn tab; on the machine it is the black hole (BackPortal). */}
      {showBack ? (
        <Link
          className={styles.back}
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onExit();
          }}
        >
          <span aria-hidden="true">←</span> Back to Portfolio
        </Link>
      ) : (
        <span />
      )}
      {state !== "EXITING" ? (
        <div className={styles.chromeRight}>
          <button type="button" className={styles.round} data-lab-sound="" aria-pressed={!muted} aria-label={muted ? CONTROL_LABELS.soundOff : CONTROL_LABELS.soundOn} onClick={(e) => {
            onMute();
            e.currentTarget.blur();
          }}>
            {muted ? <VolumeX size={20} aria-hidden="true" /> : <Volume2 size={20} aria-hidden="true" />}
          </button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The way back to the portfolio (TASK-185, spec §23): the machine's black hole is the link. The 3D hole is drawn by
 * BlackHole.tsx; this is a real `<a href="/">` laid over it (placed each frame by OverlaySync, so it tracks the camera), with
 * a torn-paper label beside it. Keyboard focusable, named "Back to Portfolio", and hover/focus tell the scene to swell the hole.
 */
export function BackPortal({ runtime, onExit }: { runtime: LabRuntime; onExit: () => void }) {
  const ref = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    runtime.dom.portal = ref.current;
    return () => {
      runtime.dom.portal = null;
      runtime.blackHoleHover = false;
    };
  }, [runtime]);
  const hover = (on: boolean) => () => {
    runtime.blackHoleHover = on;
  };
  return (
    <Link
      ref={ref}
      className={styles.portal}
      href="/"
      aria-label={CONTROL_LABELS.back}
      data-lab-portal=""
      onClick={(e) => {
        e.preventDefault();
        onExit();
      }}
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
      onFocus={hover(true)}
      onBlur={hover(false)}
    >
      <span className={styles.portalLabel} data-hand="cta">
        <span aria-hidden="true">←</span> Back to Portfolio
      </span>
    </Link>
  );
}

/**
 * The plunger's touch control (spec §15, brief): a transparent press-and-hold button laid over the launch lane (placed each frame
 * by OverlaySync). Hold to charge, release to launch; the keyboard's Space does the same through the controller. Mouse works too.
 */
export function LaunchControl({ runtime, store }: { runtime: LabRuntime; store: LabStoreApi }) {
  const ref = useRef<HTMLButtonElement>(null);
  const live = store((s) => s.state === "PLAYING" || s.state === "DANGER");
  const launched = store((s) => s.launched);
  useEffect(() => {
    runtime.dom.plunger = ref.current;
    return () => {
      runtime.dom.plunger = null;
    };
  }, [runtime]);
  const hold = (on: boolean) => {
    runtime.touchPlunger = on;
    runtime.syncInput();
  };
  return (
    <button
      ref={ref}
      type="button"
      tabIndex={-1}
      className={styles.plunger}
      data-lab-plunger=""
      data-hint={!launched ? "on" : undefined}
      aria-label={CONTROL_LABELS.plunger}
      disabled={!live}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        e.preventDefault();
        try {
          e.currentTarget.setPointerCapture(e.pointerId);
        } catch {
          /* capture is best-effort */
        }
        hold(true);
      }}
      onPointerUp={() => hold(false)}
      onPointerCancel={() => hold(false)}
      onLostPointerCapture={() => hold(false)}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}

/** Floating "+100" popups (spec §10): a fixed pool of six nodes, restarted in place, never created per hit. */
export function ScorePops({ runtime }: { runtime: LabRuntime }) {
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const nodes = Array.from(el.children) as HTMLElement[];
    let next = 0;
    runtime.popup = (text, x, y) => {
      const n = nodes[next]!;
      next = (next + 1) % nodes.length;
      const p = runtime.project(x, y);
      n.textContent = text;
      n.style.left = `${p.x}px`;
      n.style.top = `${p.y}px`;
      n.classList.remove(styles.popOn!);
      void n.offsetWidth;
      n.classList.add(styles.popOn!);
    };
    return () => {
      runtime.popup = () => {};
    };
  }, [runtime]);
  return (
    <div ref={box} className={styles.pops} aria-hidden="true" data-lab-pops="">
      {Array.from({ length: 6 }, (_, i) => (
        <span key={i} className={styles.pop} />
      ))}
    </div>
  );
}

/** The instruction plaque (spec §28): on the table until the first launch, then gone. Small, never a modal. */
export function StartPlaque({ runtime, store }: { runtime: LabRuntime; store: LabStoreApi }) {
  const ref = useRef<HTMLDivElement>(null);
  const state = store((s) => s.state);
  const launched = store((s) => s.launched);
  // The lab chunk only renders on the client (ssr: false), so the pointer type can be read up front.
  const [coarse] = useState(() => window.matchMedia?.("(pointer: coarse)").matches ?? false);
  const show = !launched && (state === "COUNTDOWN" || state === "PLAYING" || state === "DANGER" || state === "PAUSED");
  useEffect(() => {
    runtime.dom.plaque = show ? ref.current : null;
    return () => {
      runtime.dom.plaque = null;
    };
  }, [runtime, show]);
  if (!show) return null;
  const t = coarse ? START_PLAQUE.touch : START_PLAQUE.keys;
  return (
    <div ref={ref} className={styles.plaque} data-lab-plaque="" aria-hidden="true">
      <p className={styles.plaqueHead}>
        <span>{t[0]}</span>
        <span>{t[1]}</span>
      </p>
      <p className={styles.plaqueSub}>
        <span>{t[2]}</span>
        <span>{t[3]}</span>
      </p>
    </div>
  );
}

/** One blank paper plate with a live label and value. The value is real text (Fraunces numerals), never part of the art. */
function Plate({ className, label, children }: { className: string | undefined; label: string; children: ReactNode }) {
  return (
    <div className={`${styles.plate} ${className}`}>
      <div className={styles.plateInner}>
        <span className={styles.hudLabel}>{label}</span>
        {children}
      </div>
    </div>
  );
}

/**
 * The Nudge button (TASK-185): shakes the table and kicks a stuck gummy free (the same press as N). A paper round button
 * beside the pause button under the time plate (48 px, clear of the black hole, the flipper halves and the plunger). It recharges
 * for 1.5 s after each nudge: the dim disc drains as it does (a plain dim under reduced motion), and `aria-disabled` says it for
 * assistive tech while the button stays focusable.
 */
export function NudgeButton({ runtime, store }: { runtime: LabRuntime; store: LabStoreApi }) {
  const run = store((s) => s.nudgeRun);
  const ref = useRef<HTMLButtonElement>(null);
  const seen = useRef(run); // a remount (after a pause) must not replay an old recharge
  // The recharge follows the real cooldown (simulated time, so it stays true on a slow device): one rAF loop per nudge writes the
  // fill straight to the element (no render per frame) and stops when the cooldown is over, on unmount, or after 5 s.
  useEffect(() => {
    const el = ref.current;
    if (!el || run === seen.current) return;
    seen.current = run;
    el.setAttribute("data-cooling", "");
    el.setAttribute("aria-disabled", "true");
    el.style.setProperty("--nudge", "0");
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      if (runtime.nudge.cooling && performance.now() - t0 < 5000) {
        el.style.setProperty("--nudge", runtime.nudge.progress.toFixed(3));
        raf = requestAnimationFrame(tick);
        return;
      }
      el.removeAttribute("data-cooling");
      el.removeAttribute("aria-disabled");
      el.style.removeProperty("--nudge");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, runtime]);
  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.round} ${styles.nudge}`}
      data-lab-nudge=""
      aria-label={CONTROL_LABELS.nudge}
      onClick={(e) => {
        if (store.getState().machine.running) runtime.nudgeRequested = true;
        e.currentTarget.blur();
      }}
    >
      <Smartphone size={20} aria-hidden="true" />
      <span className={styles.nudgeLabel} aria-hidden="true" data-hand="cta">Nudge</span>
    </button>
  );
}

export function Hud({ store, onPause, runtime }: { store: LabStoreApi; onPause: () => void; runtime?: LabRuntime | undefined }) {
  const score = store((s) => s.score);
  const combo = store((s) => s.combo);
  const timeS = store((s) => s.timeS);
  const tp = store((s) => s.tpMode);
  const state = store((s) => s.state);
  return (
    <div className={styles.hud} data-lab-hud="">
      <Plate className={styles.plateScore} label="Score">
        <span className={styles.hudValue} data-lab-score="">{fmtScore(score)}</span>
      </Plate>
      {/* Remounting on each change replays the lift + flutter once; reduced motion turns the animation off in CSS. */}
      <div key={combo} className={`${styles.plate} ${styles.plateCombo} ${combo > 1 ? styles.flutter : ""}`} data-lab-combo-plate="">
        <div className={styles.plateInner}>
          <span className={styles.hudLabel}>Combo{tp ? " · TP" : ""}</span>
          <span className={`${styles.hudValue} ${styles.combo}`} data-hot={combo >= 3} data-lab-combo="">x{combo}</span>
        </div>
      </div>
      <div className={`${styles.plate} ${styles.plateTime}`}>
        <div className={styles.plateInner}>
          <span className={styles.hudLabel}>Time</span>
          <span className={styles.hudValue} data-lab-time="">{fmtTime(timeS)}</span>
        </div>
        {runtime && (state === "PLAYING" || state === "DANGER") ? <NudgeButton runtime={runtime} store={store} /> : null}
        {state === "PLAYING" || state === "DANGER" || state === "PAUSED" ? (
          <button type="button" className={`${styles.round} ${styles.pause}`} data-lab-pause="" aria-label={state === "PAUSED" ? CONTROL_LABELS.resume : CONTROL_LABELS.pause} onClick={(e) => {
            onPause();
            e.currentTarget.blur();
          }}>
            {state === "PAUSED" ? <Play size={18} aria-hidden="true" /> : <Pause size={18} aria-hidden="true" />}
          </button>
        ) : null}
      </div>
    </div>
  );
}

/** Countdown, banner, danger countdown: the centred, transient text. */
export function CenterText({ store }: { store: LabStoreApi }) {
  const state = store((s) => s.state);
  const countdown = store((s) => s.countdown);
  const timeS = store((s) => s.timeS);
  const danger = store((s) => s.dangerLeft);
  const banner = store((s) => s.banner);
  return (
    <>
      <div className={styles.center}>
        {state === "COUNTDOWN" && countdown > 0 ? (
          <span key={countdown} className={styles.count} aria-hidden="true">{countdown}</span>
        ) : null}
        {state === "PLAYING" && timeS < 0.8 && timeS >= 0 ? <span className={styles.count} aria-hidden="true">GO!</span> : null}
        {banner ? <span className={styles.banner} aria-hidden="true">{banner}</span> : null}
        {state === "DANGER" && danger !== null ? (
          <>
            <span className={styles.danger} aria-hidden="true">Save the gummy!</span>
            <span className={styles.dangerTime} aria-hidden="true">{danger.toFixed(1)}</span>
          </>
        ) : null}
      </div>
      {/* One polite status line for assistive tech: no per-tick announcements. */}
      <p className="sr-only" role="status" data-lab-status="">
        {state === "COUNTDOWN" ? "Get ready" : state === "DANGER" ? "Danger: save the gummy" : state === "PAUSED" ? "Paused" : banner ?? ""}
      </p>
    </>
  );
}

/** The TP gummy emblem (§33): the monogram on a gummy-coloured badge, shown for the rest of a TP MODE run. */
export function TpEmblem({ store }: { store: LabStoreApi }) {
  const tp = store((s) => s.tpMode);
  const state = store((s) => s.state);
  if (!tp || (state !== "PLAYING" && state !== "DANGER" && state !== "PAUSED")) return null;
  return (
    <div className={styles.emblem} aria-hidden="true" data-lab-emblem="">
      <svg viewBox="0 0 40 40" width="28" height="28" fill="none" stroke="currentColor" strokeLinecap="round">
        <path d="M6 9 C 14 7, 22 8, 30 7" strokeWidth="2.6" />
        <path d="M17 8 C 15 16, 13 24, 12 33" strokeWidth="2.6" />
        <path d="M23 12 C 24 20, 22 27, 21 33" strokeWidth="2.4" />
        <path d="M23 12 C 30 10, 35 13, 34 18 C 33 23, 27 24, 22 22" strokeWidth="2.4" />
      </svg>
    </div>
  );
}

export function PowerChips({ store }: { store: LabStoreApi }) {
  const powers = store((s) => s.powers);
  const state = store((s) => s.state);
  if (powers.length === 0 || (state !== "PLAYING" && state !== "DANGER" && state !== "PAUSED")) return null;
  return (
    <div className={styles.power} aria-hidden="true">
      {powers.map((p) => (
        <span key={p.type} className={styles.powerChip}>
          {POWER_NAME[p.type]} {p.left}s
        </span>
      ))}
    </div>
  );
}

const SR_ONLY = { position: "absolute", width: 1, height: 1, margin: -1, padding: 0, overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap", border: 0 } as const;

/** Polite live region: tells a screen-reader user the flippers exist as soon as a run begins (TASK-172). */
export function FlipLive({ store }: { store: LabStoreApi }) {
  const on = store((s) => s.state === "COUNTDOWN" || s.state === "PLAYING" || s.state === "DANGER");
  const waiting = store((s) => !s.launched);
  return (
    <>
      <p role="status" aria-live="polite" style={SR_ONLY} data-lab-live="">
        {on ? CONTROL_LABELS.flipLive : ""}
      </p>
      <p role="status" aria-live="polite" style={SR_ONLY} data-lab-plunger-live="">
        {on && waiting ? CONTROL_LABELS.plungerLive : ""}
      </p>
    </>
  );
}

export function Hint({ store }: { store: LabStoreApi }) {
  const hint = store((s) => s.hint);
  return hint ? (
    <p className={styles.hint} aria-hidden="true" data-lab-hint="">
      {hint}
    </p>
  ) : null;
}

export function Toasts({ store }: { store: LabStoreApi }) {
  const toasts = store((s) => s.toasts);
  return (
    <div className={styles.toasts} role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={styles.toast} data-lab-toast="">
          <span className={styles.toastTitle}>{t.title}</span>
          <span className={styles.toastBody}>{t.body}</span>
        </div>
      ))}
    </div>
  );
}

function Screen({ children, label }: { children: ReactNode; label: string }) {
  return (
    <section className={styles.screen} aria-label={label}>
      {children}
    </section>
  );
}

export function PauseCard({ onResume, onExit }: { onResume: () => void; onExit: () => void }) {
  const btn = useRef<HTMLButtonElement>(null);
  useFocusOnMount(btn);
  return (
    <Screen label="Paused">
      <div className={styles.results} role="dialog" aria-modal="false" aria-label="Paused" style={{ marginTop: "20vh" }}>
        <h2 className={styles.title} style={{ fontSize: "2.4rem" }}>Paused</h2>
        <div className={styles.actions} style={{ marginTop: 16 }}>
          <button ref={btn} type="button" className={styles.play} style={{ marginTop: 0 }} onClick={onResume}>Resume</button>
          <button type="button" className={styles.ghost} onClick={onExit}>Back to Portfolio</button>
        </div>
      </div>
    </Screen>
  );
}

export function Results({ store, onReplay, onExit }: { store: LabStoreApi; onReplay: () => void; onExit: () => void }) {
  const summary = store((s) => s.summary);
  const btn = useRef<HTMLButtonElement>(null);
  useFocusOnMount(btn);
  if (!summary) return null;
  return (
    <Screen label="Results">
      <div className={styles.results} data-lab-results="" style={{ marginTop: "auto" }}>
        <p className={styles.hudLabel}>Your score</p>
        <p className={styles.resultsScore} data-lab-final-score="">{fmtScore(summary.score)}</p>
        {summary.newBest ? <span className={styles.newBest}>New best</span> : null}
        <p className={styles.status}>{summary.status}</p>
        <dl className={styles.statGrid}>
          <div className={styles.stat}><dt>Best score</dt><dd data-lab-best="">{fmtScore(summary.best.score)}</dd></div>
          <div className={styles.stat}><dt>Time survived</dt><dd>{fmtTime(summary.timeS)}</dd></div>
          <div className={styles.stat}><dt>Best combo</dt><dd>x{summary.combo}</dd></div>
          <div className={styles.stat}><dt>Targets hit</dt><dd>{summary.targets}</dd></div>
          <div className={styles.stat}><dt>Power-ups used</dt><dd>{summary.powerUps}</dd></div>
          <div className={styles.stat}><dt>Saves</dt><dd>{summary.saves}</dd></div>
        </dl>
        <div className={styles.actions}>
          <button ref={btn} type="button" className={styles.play} style={{ marginTop: 0 }} onClick={onReplay} data-lab-replay="">Play again</button>
          <button type="button" className={styles.ghost} onClick={onExit}>Back to Portfolio</button>
        </div>
      </div>
    </Screen>
  );
}
