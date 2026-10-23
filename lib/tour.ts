/**
 * TASK-170 — the guided tour's pure logic: the six stops, the invite rule, the note placement maths and the
 * cross-page start hand-off. The UI lives in `components/tour/GuidedTour.tsx`; everything here is unit-tested
 * (tests/unit/tour.test.ts). The last stop is a hint at the hidden Lab egg, never a link to it (S30, EXE-82).
 */

import type { TOUR_STEP_IDS } from "@/lib/analytics/events";

/** The stop ids live once, in the analytics catalogue (`tour_step_viewed.step_id`); a unit test keeps TOUR_STEPS in that order. */
export type TourStepId = (typeof TOUR_STEP_IDS)[number];
export type TourSource = "invite" | "menu";

export interface TourStep {
  id: TourStepId;
  title: string;
  body: string;
  /** Tried in order; the first one present and visible is the anchor. */
  targets: string[];
  /** Lives in the fixed header: never scrolled to. */
  inHeader?: true;
}

export const TOUR_STEPS: readonly TourStep[] = [
  {
    id: "hero",
    title: "Start here",
    body: "Who I am and what I build, in one screen.",
    targets: ["#hero-h", "#hero-copy"],
  },
  {
    id: "work",
    title: "Selected work",
    body: "Products I've shipped. Open any card for the story behind it.",
    targets: ["#selected-work ul.hs-grid-3", "#selected-work"],
  },
  {
    id: "ask",
    title: "Ask Tushky",
    body: "Got a question about my work? My portfolio assistant answers it.",
    targets: ["#ask .hat-grid", "#ask"],
  },
  {
    id: "credentials",
    title: "Credentials",
    body: "Where I've made an impact, at a glance.",
    targets: ["#credentials ul.hs-grid-4", "#credentials"],
  },
  {
    id: "theme",
    title: "Light or dark",
    body: "Paper by day, ink by night. Switch any time.",
    targets: ["[data-site-header] [data-theme-toggle]", "[data-theme-toggle]"],
    inHeader: true,
  },
  {
    id: "brand",
    title: "One more thing",
    body: "Psst, tap my name 5 times, fast.",
    targets: ["[data-site-header] .header-brand"],
    inHeader: true,
  },
];

/** localStorage key: set once the invite is accepted or dismissed (or the tour is started from the menu). */
export const TOUR_INVITE_KEY = "tp-tour-invite";
/** Window event that asks the mounted tour to start: `detail: { source, returnTo? }`. */
export const TOUR_START_EVENT = "tour:start";
/** Document event fired whenever the tour opens or closes (MobileCarousel re-checks autoplay on it). */
export const TOUR_CHANGE_EVENT = "tour:change";
/** `<html>` attribute present while the tour is open. */
export const TOUR_OPEN_ATTR = "data-tour-open";
/** Phone layout (bottom sheet) below this width; matches the site's 640 px header breakpoint. */
export const TOUR_PHONE_MAX = 639;

export function clampStep(index: number, count: number = TOUR_STEPS.length): number {
  if (count <= 0) return 0;
  if (!Number.isFinite(index)) return 0;
  return Math.min(Math.max(Math.trunc(index), 0), count - 1);
}

/**
 * The one-time invite shows only on the home page, only if it was never answered, and never to an automated
 * browser unless the test opts in (`window.__tourInvite = true`, the `__hsCarouselAutoplay` pattern).
 */
export function shouldInvite(o: { webdriver: boolean; optIn: boolean; stored: string | null; pathname: string | null }): boolean {
  if (o.pathname !== "/") return false;
  if (o.stored) return false;
  if (o.webdriver && !o.optIn) return false;
  return true;
}

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function readInvite(storage?: StorageLike | null): string | null {
  try {
    return (storage ?? window.localStorage).getItem(TOUR_INVITE_KEY);
  } catch {
    return null;
  }
}

export function writeInvite(value: "accepted" | "dismissed", storage?: StorageLike | null): void {
  try {
    (storage ?? window.localStorage).setItem(TOUR_INVITE_KEY, value);
  } catch {
    /* private mode / blocked storage: the invite may show again, which is harmless */
  }
}

export interface Box {
  top: number;
  left: number;
  width: number;
  height: number;
}
export type NoteSide = "below" | "above" | "right" | "left" | "pinned";
export interface NotePlacement {
  top: number;
  left: number;
  side: NoteSide;
  /** Horizontal (below/above) or vertical (left/right) offset of the arrow inside the note, in px. */
  arrow: number;
}

export const NOTE_GAP = 14;
export const NOTE_GUTTER = 16;

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), Math.max(lo, hi));

/**
 * Where the note sits next to its target (desktop). Prefers below, then above, then right, then left; if none
 * fits it is pinned to the bottom of the viewport. The result always stays inside a 16 px gutter and below
 * the fixed header (`topInset`).
 */
export function placeNote(target: Box, note: { width: number; height: number }, viewport: { width: number; height: number }, topInset = 0): NotePlacement {
  const minTop = topInset + NOTE_GUTTER;
  const maxTop = viewport.height - NOTE_GUTTER - note.height;
  const minLeft = NOTE_GUTTER;
  const maxLeft = viewport.width - NOTE_GUTTER - note.width;
  const cx = target.left + target.width / 2;
  const cy = target.top + target.height / 2;
  const hLeft = clamp(cx - note.width / 2, minLeft, maxLeft);
  const hArrow = clamp(cx - hLeft, 20, note.width - 20);

  const below = target.top + target.height + NOTE_GAP;
  if (below >= minTop && below + note.height <= viewport.height - NOTE_GUTTER) return { top: below, left: hLeft, side: "below", arrow: hArrow };
  const above = target.top - NOTE_GAP - note.height;
  if (above >= minTop && above <= maxTop) return { top: above, left: hLeft, side: "above", arrow: hArrow };

  const vTop = clamp(cy - note.height / 2, minTop, maxTop);
  const vArrow = clamp(cy - vTop, 20, note.height - 20);
  const right = target.left + target.width + NOTE_GAP;
  if (right + note.width <= viewport.width - NOTE_GUTTER) return { top: vTop, left: right, side: "right", arrow: vArrow };
  const left = target.left - NOTE_GAP - note.width;
  if (left >= minLeft) return { top: vTop, left, side: "left", arrow: vArrow };

  return { top: clamp(maxTop, minTop, maxTop), left: hLeft, side: "pinned", arrow: hArrow };
}

/** Phone: the scroll position that puts the target just under the header, leaving room for the bottom sheet. */
export function phoneScrollY(targetTopInDoc: number, headerBottom: number, margin = 16): number {
  return Math.max(0, Math.round(targetTopInDoc - headerBottom - margin));
}

/** A start requested from another page: kept in memory until the home page mounts the tour. */
let pending: TourSource | null = null;
export function setPendingStart(source: TourSource | null): void {
  pending = source;
}
export function takePendingStart(): TourSource | null {
  const p = pending;
  pending = null;
  return p;
}

export interface TourStartDetail {
  source: TourSource;
  /** Where focus goes back to when the tour closes (the button that started it). */
  returnTo?: HTMLElement | null | undefined;
}

/** Ask the mounted `GuidedTour` to start (from the header button or the phone menu row). */
export function requestTour(source: TourSource, returnTo?: HTMLElement | null): void {
  window.dispatchEvent(new CustomEvent<TourStartDetail>(TOUR_START_EVENT, { detail: { source, returnTo } }));
}
