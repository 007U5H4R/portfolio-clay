"use client";

import styles from "./lab.module.css";
import type { LabRuntime, Tuning } from "./runtime";

/**
 * Development controls (gummy-bear.md §47): gravity, bounce, jelly intensity, flick multiplier, camera
 * follow, power-up spawn rate, morph strength and the gummy's transmission / roughness / thickness / IOR.
 * Mounted ONLY when the URL carries `?debug` — it is never rendered, and never linked, in normal use.
 */
const TUNING: [keyof Tuning, string, number, number, number][] = [
  ["gravity", "Gravity ×", 0.2, 2, 0.05],
  ["bounce", "Bounce ×", 0.5, 2, 0.05],
  ["jelly", "Jelly intensity ×", 0, 2.5, 0.05],
  ["flick", "Flick ×", 0.2, 2, 0.05],
  ["follow", "Camera follow ×", 0, 4, 0.1],
  ["spawn", "Power-up spawn rate ×", 0.2, 4, 0.1],
  ["morph", "Morph strength ×", 0, 1.5, 0.05],
];
const MATERIAL: ["transmission" | "roughness" | "thickness" | "ior", string, number, number, number][] = [
  ["transmission", "Transmission", 0, 1, 0.02],
  ["roughness", "Roughness", 0, 1, 0.02],
  ["thickness", "Thickness", 0, 3, 0.05],
  ["ior", "IOR", 1, 2.3, 0.01],
];

export function DebugPanel({ runtime }: { runtime: LabRuntime }) {
  return (
    <details className={styles.debug} data-lab-debug="">
      <summary>debug</summary>
      {TUNING.map(([key, label, min, max, step]) => (
        <label key={key}>
          <span>{label}</span>
          <input type="range" min={min} max={max} step={step} defaultValue={runtime.tune[key]} onChange={(e) => (runtime.tune[key] = Number(e.target.value))} />
        </label>
      ))}
      {MATERIAL.map(([key, label, min, max, step]) => (
        <label key={key}>
          <span>{label}</span>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            defaultValue={runtime.gummyMaterial.current?.[key] ?? 0.5}
            onChange={(e) => {
              const m = runtime.gummyMaterial.current;
              if (m) m[key] = Number(e.target.value);
            }}
          />
        </label>
      ))}
    </details>
  );
}
