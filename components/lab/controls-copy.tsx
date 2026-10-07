import type { ReactNode } from "react";

/**
 * Every control instruction the visitor reads, in ONE place (TASK-168): the intro instruction sheet (lines + icons),
 * the keyboard label, and the control hints used as accessible names. The intro renders from this module and the HUD
 * buttons take their labels from it, so changing how the game is played is a copy edit here, not a hunt through the
 * components. (The key handlers and pointer halves live in gummy-controller.ts; P and Esc in LabApp.tsx.)
 */
const ICON = { width: 28, height: 28, viewBox: "0 0 32 32", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
export const HOW_TO_PLAY: readonly { main: string; sub?: string; icon: ReactNode }[] = [
  {
    main: "Tap left / right",
    sub: "to flip",
    icon: (
      <svg {...ICON}>
        <path d="M4 22l10 4m14-4-10 4" />
        <path d="M16 4v8m-3-5 3-3 3 3" />
      </svg>
    ),
  },
  {
    main: "Keep the gummy",
    sub: "in play",
    icon: (
      <svg {...ICON}>
        <circle cx="16" cy="13" r="7" />
        <path d="M11 25h10" />
      </svg>
    ),
  },
  {
    main: "Hit",
    sub: "stars & rings",
    icon: (
      <svg {...ICON}>
        <path d="m16 4 3.6 7.4 8 1.1-5.8 5.6 1.4 8L16 22.2 8.8 26.1l1.4-8-5.8-5.6 8-1.1z" />
      </svg>
    ),
  },
  {
    main: "Don't let it drain",
    icon: (
      <svg {...ICON}>
        <path d="M16 4 29 27H3z" />
        <path d="M16 13v7m0 3.5v.5" />
      </svg>
    ),
  },
];

/** The tiny editorial keyboard label (hidden on portrait phones by CSS). */
export const KEYBOARD_LABEL = {
  title: "Keyboard",
  rows: ["← → flip · Space both · P pause · Esc exit"],
} as const;

/** Accessible names and region labels for the control surfaces. */
export const CONTROL_LABELS = {
  introRegion: "Gummy Lab",
  howToPlay: "How to play",
  pause: "Pause",
  resume: "Resume",
  soundOff: "Sound is off. Turn sound on",
  soundOn: "Sound is on. Turn sound off",
  /** Spoken (aria-live, polite) when a run starts, so the flippers are discoverable without sight. */
  flipLive: "Left and right flip",
} as const;

/** The on-canvas hints (first session only, never a modal). */
export const HINTS = {
  first: "Left and right flip",
  keep: "Keep me in play.",
} as const;
