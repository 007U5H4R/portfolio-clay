/**
 * Gummy Lab analytics (TASK-194). A pure observer of the lab's HUD store: it never touches the engine,
 * the physics step, the render loop or any `rt.hooks` callback. The store is written at HUD rate (≤ 10 Hz,
 * "only low-frequency, display-level values", lib/lab/store.ts) and every run/state change already flows
 * through it, so subscribing is a lightweight, safe event boundary: each store update does a handful of
 * reference comparisons and returns, and events are sent only on state transitions or first-of-kind
 * thresholds (bounded: 4 interactions + 4 milestones + 1 game_over per run).
 *
 *   game_intro_viewed       state → INTRO (once per visit)
 *   game_started            COUNTDOWN → PLAYING for the visit's first run
 *   game_interaction_*      first launch / nudge / power-up / escape from the danger zone, per run
 *   game_milestone_reached  30 s, 60 s, combo x5, TP MODE: once each per run
 *   game_over               exactly once per run, with the engine's own final summary (score, whole seconds)
 *   game_replayed           RESULTS → COUNTDOWN
 *   game_exited_to_portfolio the visit ends (portal, button or Esc)
 */
import { deviceTypeFor } from "./device";
import { track as realTrack } from "./track";
import type { EventName, EventProps } from "./events";
import type { LabSnapshot, LabStoreApi } from "@/lib/lab/store";

type TrackFn = <N extends EventName>(name: N, props: EventProps<N>) => void;

export interface LabObserverOptions {
  track?: TrackFn;
  input?: "touch" | "pointer";
  device?: "mobile" | "tablet" | "desktop";
}

export interface LabObserver {
  /** The visitor is leaving the lab; `via` is how (the portal, or the button / Esc). */
  exit(via: "portal" | "button", fallback?: boolean): void;
  dispose(): void;
}

type ExitLocation = EventProps<"game_exited_to_portfolio">["exit_location"];

function exitLocationFor(state: LabSnapshot["state"], via: "portal" | "button", fallback: boolean): ExitLocation {
  if (fallback) return "fallback";
  if (via === "portal") return "portal";
  switch (state) {
    case "DISCOVERED":
    case "INTRO":
      return "intro";
    case "PAUSED":
      return "paused";
    case "RESULTS":
      return "results";
    default:
      return "playing"; // countdown, playing, danger, game over: the run was left behind
  }
}

export function observeLab(store: LabStoreApi, options: LabObserverOptions = {}): LabObserver {
  const track = options.track ?? realTrack;
  const input = options.input ?? (typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches ? "touch" : "pointer");
  const device = options.device ?? deviceTypeFor(typeof window === "undefined" ? 1280 : window.innerWidth);

  let introSent = false;
  let started = false;
  let runKeys = new Set<string>();
  let lastScore = 0;
  let overReported = -1; // runId whose game_over was sent
  let overPending = false;
  let exited = false;
  const once = (key: string, fn: () => void) => {
    if (runKeys.has(key)) return;
    runKeys.add(key);
    fn();
  };

  const reportOver = (score: number, seconds: number, runId: number) => {
    if (overReported === runId) return;
    overReported = runId;
    overPending = false;
    lastScore = Math.max(0, Math.floor(score));
    track("game_over", { survival_time_seconds: Math.max(0, Math.floor(seconds)), score: lastScore, end_reason: "drained" });
  };

  const unsubscribe = store.subscribe((s, prev) => {
    if (s === prev) return;

    if (s.state !== prev.state) {
      if (s.state === "INTRO" && !introSent) {
        introSent = true;
        track("game_intro_viewed", { game_version: "pinball_v1" });
      }
      if (s.state === "COUNTDOWN") {
        runKeys = new Set(); // a fresh run: its once-per-run events may fire again
        if (prev.state === "RESULTS") track("game_replayed", { previous_score: lastScore });
      }
      if (s.state === "PLAYING" && prev.state === "COUNTDOWN" && !started) {
        started = true;
        track("game_started", { input_method: input, device_type: device });
      }
      if (s.state === "PLAYING" && prev.state === "DANGER") once("i:danger_escape", () => track("game_interaction_performed", { interaction_type: "danger_escape" }));
      if (s.state === "GAME_OVER") {
        overPending = true;
        lastScore = Math.floor(prev.score); // the last HUD value; replaced by the engine's summary below
      }
    }

    // The engine's own final summary lands ~1.3 s after GAME_OVER (state RESULTS): the authoritative numbers.
    if (s.summary && s.summary !== prev.summary && s.state === "RESULTS") reportOver(s.summary.score, s.summary.timeS, s.runId);

    if (s.launched && !prev.launched) once("i:launch", () => track("game_interaction_performed", { interaction_type: "launch" }));
    if (s.nudgeRun !== prev.nudgeRun) once("i:nudge", () => track("game_interaction_performed", { interaction_type: "nudge" }));
    if (s.powers.length > prev.powers.length) once("i:power_up", () => track("game_interaction_performed", { interaction_type: "power_up" }));

    if (s.timeS !== prev.timeS) {
      if (s.timeS >= 30) once("m:30", () => track("game_milestone_reached", { milestone_type: "survived_30s" }));
      if (s.timeS >= 60) once("m:60", () => track("game_milestone_reached", { milestone_type: "survived_60s" }));
    }
    if (s.combo >= 5 && s.combo !== prev.combo) once("m:combo5", () => track("game_milestone_reached", { milestone_type: "combo_5" }));
  });

  return {
    exit(via, fallback = false) {
      if (exited) return;
      exited = true;
      try {
        const s = store.getState();
        // Left during the 1.3 s between GAME_OVER and the results card: report the run with the last HUD values.
        if (overPending && overReported !== s.runId) reportOver(s.score, s.timeS, s.runId);
        track("game_exited_to_portfolio", { exit_location: exitLocationFor(s.state, via, fallback) });
      } catch {
        /* analytics must never get in the way of leaving the lab */
      }
    },
    dispose: unsubscribe,
  };
}
