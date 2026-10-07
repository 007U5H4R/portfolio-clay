import type { ReactNode } from "react";

/**
 * Every control instruction the visitor reads, in ONE place (TASK-168): the intro instruction sheet (lines + icons),
 * the keyboard label, and the control hints used as accessible names. The intro renders from this module and the HUD
 * buttons take their labels from it, so changing how the game is played is a copy edit here, not a hunt through the
 * components. (The key handlers themselves live in LabApp.tsx and the pointer controls in gummy-controller.ts.)
 */
const ICON = { width: 28, height: 28, viewBox: "0 0 32 32", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
export const HOW_TO_PLAY: readonly { main: string; sub?: string; icon: ReactNode }[] = [
  {
    main: "Drag",
    sub: "to move",
    icon: (
      <svg {...ICON}>
        <path d="M11 17V8a2 2 0 0 1 4 0v7m0-3a2 2 0 0 1 4 0v3m0-2a2 2 0 0 1 4 0v6c0 4-3 7-7 7h-2c-3 0-5-2-6-4l-3-5a2 2 0 0 1 3-2l3 3" />
        <path d="M24 5h5m-2-2 2 2-2 2" />
      </svg>
    ),
  },
  {
    main: "Flick",
    sub: "to bounce",
    icon: (
      <svg {...ICON}>
        <path d="M5 27c1-9 7-15 18-17m-6-4 6 4-5 6" />
      </svg>
    ),
  },
  {
    main: "Collect",
    sub: "stars & rings",
    icon: (
      <svg {...ICON}>
        <path d="m16 4 3.6 7.4 8 1.1-5.8 5.6 1.4 8L16 22.2 8.8 26.1l1.4-8-5.8-5.6 8-1.1z" />
      </svg>
    ),
  },
  {
    main: "Don't let it fall",
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
  rows: ["← → nudge", "Space bounce", "P pause", "Esc exit"],
} as const;

/** Accessible names and region labels for the control surfaces. */
export const CONTROL_LABELS = {
  introRegion: "Gummy Lab",
  howToPlay: "How to play",
  pause: "Pause",
  resume: "Resume",
  soundOff: "Sound is off. Turn sound on",
  soundOn: "Sound is on. Turn sound off",
} as const;
