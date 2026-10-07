"use client";

import { useState, useSyncExternalStore } from "react";
import { paperMotion } from "@/lib/paper-world/motion";
import styles from "./paper-world.module.css";

/**
 * "Tap & tilt to explore" (M-011 §28; was "Move your phone to explore" — TASK-169: tilting does nothing until the tap
 * grants permission, so the label says tap first, and the chip glows to be found, Design.md §14.6, EVAL-033) — a cream paper `<button>`, rendered only on
 * touch devices where the platform gates motion sensors behind a gesture (`DeviceOrientationEvent.requestPermission`).
 * The tap is the only place permission is requested, synchronously in the handler; any decision hides the chip, and
 * a denial is silent (no error, no retry). Position it inside a `position: relative` scene container.
 */
const subscribe = () => () => {};

export function GyroChip({ className }: { className?: string | undefined }) {
  // Server and first client render: no chip. After hydration the platform answers (a pure capability read).
  const needed = useSyncExternalStore(subscribe, () => paperMotion.needsGyroPermission(), () => false);
  const [decided, setDecided] = useState(false);
  if (!needed || decided) return null;
  return (
    <button
      type="button"
      className={[styles.chip, className].filter(Boolean).join(" ")}
      onClick={() => {
        void paperMotion.requestGyro().then(() => setDecided(true));
      }}
    >
      Tap &amp; tilt to explore
    </button>
  );
}
