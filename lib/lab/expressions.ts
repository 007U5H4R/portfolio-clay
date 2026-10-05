import { FACE_OPEN_CAP } from "./jelly";
import type { GummyPhysicsState } from "./gummy-state";

/**
 * Face targets from the game situation (gummy-bear.md §24): happy by default, surprised at speed,
 * excited on a big bounce, worried in danger (panicked when the timer is nearly out), celebrating on
 * a hot combo, confident under a power-up, wide-eyed on a long fall, dizzy-but-adorable at game over.
 * Mouth-opening faces (Surprised, Panic) are capped at 0.6 so they never read as a scream.
 */
export interface FaceTargets {
  Happy: number;
  Surprised: number;
  Worried: number;
  Panic: number;
}

export interface FaceSignals {
  state: GummyPhysicsState;
  speed: number;
  /** Seconds the bear has been falling without contact. */
  fallTime: number;
  /** 0–1 danger urgency (1 = timer almost out), 0 when safe. */
  urgency: number;
  combo: number;
  powered: boolean;
  gameOver: boolean;
  /** Intro/idle: a calm smile. */
  calm?: boolean;
}

export function pickFace(s: FaceSignals): FaceTargets {
  const f: FaceTargets = { Happy: 0, Surprised: 0, Worried: 0, Panic: 0 };
  if (s.gameOver) {
    f.Worried = 0.45;
    f.Happy = 0.35;
    return f;
  }
  if (s.calm) {
    f.Happy = 0.85;
    return f;
  }
  if (s.state === "DANGER") {
    f.Worried = 0.9 - 0.4 * s.urgency;
    f.Panic = Math.min(FACE_OPEN_CAP, 0.7 * s.urgency);
    return f;
  }
  f.Happy = 0.7;
  if (s.state === "BOUNCING") f.Happy = 1;
  if (s.state === "DRAGGED") f.Surprised = 0.3;
  if (s.speed > 9) f.Surprised = Math.min(FACE_OPEN_CAP, (s.speed - 9) / 12);
  if (s.fallTime > 0.9) f.Surprised = Math.min(FACE_OPEN_CAP, Math.max(f.Surprised, 0.25 + (s.fallTime - 0.9) * 0.4));
  if (s.combo >= 5) f.Happy = 1;
  if (s.powered) f.Happy = Math.max(f.Happy, 0.95);
  f.Surprised = Math.min(f.Surprised, FACE_OPEN_CAP);
  if (f.Surprised > 0.3) f.Happy = Math.min(f.Happy, 0.5);
  return f;
}
