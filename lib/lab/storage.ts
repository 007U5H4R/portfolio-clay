/**
 * Gummy Lab's only persistence (gummy-bear.md §32, §35): best score / best time / max combo and the
 * unlocked achievements, in localStorage under one key. No backend, no account. Every access is
 * guarded — a private window or blocked storage simply forgets.
 */
export const STORAGE_KEY = "gummy-lab:v1";

export interface Stored {
  bestScore: number;
  bestTime: number;
  maxCombo: number;
  achievements: string[];
}

export const ACHIEVEMENTS = {
  CURIOUS_MIND: { title: "Curious mind", body: "Discovered the secret lab." },
  WOBBLE_MASTER: { title: "Wobble master", body: "Reached a x10 combo." },
  GUMMY_OPERATOR: { title: "Gummy operator", body: "Survived 30 seconds." },
  PRODUCT_SENSE: { title: "Product sense", body: "Hit all four special targets in one run." },
  YOU_REALLY_FOUND_IT: { title: "You really found it", body: "Discovered a hidden interaction." },
} as const;
export type AchievementId = keyof typeof ACHIEVEMENTS;

const EMPTY: Stored = { bestScore: 0, bestTime: 0, maxCombo: 1, achievements: [] };

const num = (v: unknown, fallback: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : fallback);

export function loadStored(): Stored {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY, achievements: [] };
    const j = JSON.parse(raw) as Partial<Record<keyof Stored, unknown>>;
    return {
      bestScore: num(j.bestScore, 0),
      bestTime: num(j.bestTime, 0),
      maxCombo: Math.max(1, num(j.maxCombo, 1)),
      achievements: Array.isArray(j.achievements) ? j.achievements.filter((a): a is string => typeof a === "string") : [],
    };
  } catch {
    return { ...EMPTY, achievements: [] };
  }
}

function save(s: Stored) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* blocked storage: the best simply is not remembered */
  }
}

export function recordRun(run: { score: number; timeS: number; combo: number }): { stored: Stored; newBest: boolean } {
  const prev = loadStored();
  const newBest = run.score > prev.bestScore;
  const stored: Stored = {
    ...prev,
    bestScore: Math.max(prev.bestScore, Math.floor(run.score)),
    bestTime: Math.max(prev.bestTime, Math.floor(run.timeS)),
    maxCombo: Math.max(prev.maxCombo, run.combo),
  };
  save(stored);
  return { stored, newBest };
}

/** Achievements unlocked this page-session when storage cannot remember them (so a toast shows once). */
const sessionOnly = new Set<string>();

/** Unlock an achievement; true only the first time (so the toast shows once). */
export function unlock(id: AchievementId): boolean {
  if (sessionOnly.has(id)) return false;
  const s = loadStored();
  if (s.achievements.includes(id)) return false;
  save({ ...s, achievements: [...s.achievements, id] });
  if (!loadStored().achievements.includes(id)) sessionOnly.add(id); // blocked storage
  return true;
}
