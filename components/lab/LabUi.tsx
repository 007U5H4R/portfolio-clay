"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import type { LabStoreApi } from "@/lib/lab/store";
import { CONTROL_LABELS } from "./controls-copy";
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

export function Chrome({ store, onExit, onMute }: { store: LabStoreApi; onExit: () => void; onMute: () => void }) {
  const muted = store((s) => s.muted);
  const state = store((s) => s.state);
  return (
    <div className={styles.chrome}>
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

export function Hud({ store, onPause }: { store: LabStoreApi; onPause: () => void }) {
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
