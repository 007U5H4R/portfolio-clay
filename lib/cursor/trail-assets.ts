/** Trail asset manifest (cursor.md §53, TASK-142.1). Themes map to the section IDs used on the site. */
export const TRAIL_BASE = "/cursor/trail/";

export const TRAIL_ASSETS = {
  default: ["paw", "sticky", "research-paper", "wireframe", "lightbulb", "paper-arrow"],
  railcite: ["rail-ticket", "research-paper", "paper-arrow"],
  "slag-city": ["arcade-token", "sticky", "paper-arrow"],
  campfire: ["sticky", "lightbulb", "paper-arrow"],
  about: ["research-paper", "wireframe", "lightbulb"],
  tushky: ["paw"],
} as const;

export type TrailTheme = keyof typeof TRAIL_ASSETS;

export function isTrailTheme(value: string | null | undefined): value is TrailTheme {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(TRAIL_ASSETS, value);
}

/** An unknown or missing `data-cursor-theme` is the default theme (§66: reset when no themed ancestor). */
export function themeFor(value: string | null | undefined): TrailTheme {
  return isTrailTheme(value) ? value : "default";
}

export function trailSrc(name: string): string {
  return `${TRAIL_BASE}${name}.svg`;
}

/** Every file the manifest references, de-duplicated — what the idle preload fetches. */
export function allTrailSrcs(): string[] {
  return Array.from(new Set(Object.values(TRAIL_ASSETS).flat())).map(trailSrc);
}

/** Deterministic looping sequence (§9): the n-th spawn of a theme is always the same piece. */
export function pieceAt(theme: TrailTheme, index: number): string {
  const list = TRAIL_ASSETS[theme];
  return trailSrc(list[((index % list.length) + list.length) % list.length]!);
}
