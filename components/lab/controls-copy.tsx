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
    main: "Hold Space",
    sub: "to launch",
    icon: (
      <svg {...ICON}>
        <rect x="11" y="4" width="10" height="7" rx="2" />
        <path d="M16 11v9" />
        <path d="M11 20c3 1.6 7-1.6 10 0m-10 4c3 1.6 7-1.6 10 0" />
      </svg>
    ),
  },
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
    main: "Hit",
    sub: "bumpers & targets",
    icon: (
      <svg {...ICON}>
        <circle cx="16" cy="16" r="9" />
        <path d="m16 10.5 1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" />
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
  rows: ["← → flip · Space launch · N nudge · P pause · Esc exit"],
} as const;

/** Accessible names and region labels for the control surfaces. */
export const CONTROL_LABELS = {
  introRegion: "Gummy Lab",
  howToPlay: "How to play",
  /** The Nudge button (and N): shakes the table to free a stuck gummy. */
  nudge: "Nudge the machine",
  pause: "Pause",
  resume: "Resume",
  soundOff: "Sound is off. Turn sound on",
  soundOn: "Sound is on. Turn sound off",
  /** Spoken (aria-live, polite) when a run starts, so the flippers are discoverable without sight. */
  flipLive: "Left and right flip",
  /** Spoken with it, so the plunger is discoverable without sight. */
  plungerLive: "Hold Space to charge the plunger, release to launch",
  /** The on-screen plunger in the launch lane (touch): a press-and-hold control. */
  plunger: "Plunger: hold to charge, release to launch",
  /** The black hole, which is the way back to the portfolio (a real link). */
  back: "Back to Portfolio",
} as const;

/** The on-canvas hints (first session only, never a modal). */
export const HINTS = {
  first: "Left and right flip",
  keep: "Keep me in play.",
} as const;

/** The plaque on the table before the first launch (spec §28): two short lines, never a modal. Touch gets its own wording. */
export const START_PLAQUE = {
  keys: ["Hold Space", "to charge", "Release", "to launch"],
  touch: ["Hold the plunger", "to charge", "Release", "to launch"],
} as const;
