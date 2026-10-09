import { create } from "zustand";
import { GameMachine, type GameState } from "./state-machine";

/**
 * The HUD-facing game store (gummy-bear.md §42, §39). Only low-frequency, display-level values live
 * here — the per-frame physics values stay in refs. The explicit state machine owns `state`; the
 * store mirrors it (and the run snapshot the HUD, intro, results and toasts render).
 */
export interface Toast {
  id: number;
  title: string;
  body: string;
}

export interface RunSummary {
  score: number;
  timeS: number;
  combo: number;
  targets: number;
  powerUps: number;
  saves: number;
  newBest: boolean;
  best: { score: number; timeS: number; combo: number };
  status: string;
}

export interface PowerChip {
  type: "SUPER_SQUISH" | "LOW_GRAVITY" | "RAINBOW" | "GOLDEN" | "TIME_FREEZE";
  /** seconds left, or 0 for a single-use charge that is armed */
  left: number;
}

export interface LabSnapshot {
  state: GameState;
  score: number;
  combo: number;
  timeS: number;
  dangerLeft: number | null;
  countdown: number;
  powers: PowerChip[];
  tpMode: boolean;
  banner: string | null;
  hint: string | null;
  muted: boolean;
  assetStatus: "loading" | "ready" | "failed";
  summary: RunSummary | null;
  toasts: Toast[];
  /** The gummy has left the plunger at least once this run (the start plaque shows until then). */
  launched: boolean;
  /** Bumped on every new run so scene parts can key off it. */
  runId: number;
  /** Bumped whenever pickups spawn, expire or are collected (the scene re-reads the spawner). */
  pickupsVersion: number;
  /** Bumped on every manual nudge (the Nudge button shows its recharge from it). */
  nudgeRun: number;
}

export interface LabStore extends LabSnapshot {
  machine: GameMachine;
  send: (event: Parameters<GameMachine["send"]>[0]) => GameState;
  patch: (p: Partial<LabSnapshot>) => void;
  toast: (title: string, body: string) => void;
  dismissToast: (id: number) => void;
  reset: () => void;
}

let toastId = 0;

const initial = (): Omit<LabSnapshot, "state"> => ({
  score: 0,
  combo: 1,
  timeS: 0,
  dangerLeft: null,
  countdown: 0,
  powers: [],
  tpMode: false,
  banner: null,
  hint: null,
  muted: true,
  assetStatus: "loading",
  summary: null,
  toasts: [],
  launched: false,
  runId: 0,
  pickupsVersion: 0,
  nudgeRun: 0,
});

/** One store per lab mount (never shared across enter/exit cycles: no leaked state). */
export function createLabStore() {
  const machine = new GameMachine();
  return create<LabStore>((set, get) => ({
    machine,
    state: machine.state,
    ...initial(),
    send: (event) => {
      const next = machine.send(event);
      if (next !== get().state) set({ state: next });
      return next;
    },
    patch: (p) => set(p),
    toast: (title, body) => {
      toastId += 1;
      const t = { id: toastId, title, body };
      set({ toasts: [...get().toasts.slice(-2), t] });
      setTimeout(() => get().dismissToast(t.id), 3800);
    },
    dismissToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
    reset: () => set({ ...initial(), muted: get().muted, assetStatus: get().assetStatus }),
  }));
}

export type LabStoreApi = ReturnType<typeof createLabStore>;
