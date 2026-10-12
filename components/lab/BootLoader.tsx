"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { BOOT_STAGES, type BootTracker } from "@/lib/lab/boot";
import { GEAR_PATHS } from "./boot-gears";
import styles from "./boot-loader.module.css";

/** Below this the loader never appears: a fast boot goes straight to the intro (the boot is quicker than the paper settling). */
export const LOADER_DELAY_MS = 300;
/** The finish beat (gummy hop, fade) the intro waits for when the loader was on screen. Kept inside the 300–600 ms spec window. */
export const LOADER_FINISH_MS = 450;
/** No milestone for this long and the loader offers a retry instead of spinning forever. */
export const LOADER_STALL_MS = 15_000;

type GearProps = { g: (typeof GEAR_PATHS)[keyof typeof GEAR_PATHS]; tone: string; k: number };

function Gear({ g, tone, k }: GearProps) {
  const hub = g.ri * 0.34;
  return (
    <g className={styles.gear} data-tone={tone} style={{ "--k": k } as CSSProperties}>
      <path className={styles.gearShadow} d={g.d} transform="translate(3 4)" />
      <path className={styles.gearBody} d={g.d} />
      <circle className={styles.gearFace} cx={g.cx} cy={g.cy} r={g.ri * 0.78} />
      <circle className={styles.gearWell} cx={g.cx} cy={g.cy} r={g.ri * 0.52} />
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <circle key={a} className={styles.gearHole} cx={g.cx + g.ri * 0.64 * Math.cos((a * Math.PI) / 180)} cy={g.cy + g.ri * 0.64 * Math.sin((a * Math.PI) / 180)} r={g.ri * 0.075} />
      ))}
      <circle className={styles.gearHub} cx={g.cx} cy={g.cy} r={hub} />
      <circle className={styles.gearPin} cx={g.cx} cy={g.cy} r={hub * 0.42} />
    </g>
  );
}

function Gummy() {
  return (
    <svg className={styles.gummySvg} viewBox="0 0 64 76" width="64" height="76" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="boot-gummy-g" cx="38%" cy="30%" r="75%">
          <stop offset="0" className={styles.gStopA} />
          <stop offset="0.6" className={styles.gStopB} />
          <stop offset="1" className={styles.gStopC} />
        </radialGradient>
      </defs>
      <g fill="url(#boot-gummy-g)" className={styles.gummyBody}>
        <circle cx="17" cy="14" r="8" />
        <circle cx="47" cy="14" r="8" />
        <ellipse cx="32" cy="46" rx="19" ry="21" />
        <circle cx="32" cy="24" r="16" />
        <ellipse cx="12" cy="46" rx="7" ry="10" transform="rotate(24 12 46)" />
        <ellipse cx="52" cy="44" rx="7" ry="10" transform="rotate(-34 52 44)" />
        <ellipse cx="21" cy="66" rx="9" ry="8" />
        <ellipse cx="43" cy="66" rx="9" ry="8" />
      </g>
      <ellipse className={styles.gummyShine} cx="24" cy="15" rx="6" ry="3.4" transform="rotate(-28 24 15)" />
      <ellipse className={styles.gummyShine} cx="25" cy="39" rx="4.5" ry="7" transform="rotate(14 25 39)" />
      <circle className={styles.gummyEye} cx="26.5" cy="24" r="1.9" />
      <circle className={styles.gummyEye} cx="37.5" cy="24" r="1.9" />
      <ellipse className={styles.gummyNose} cx="32" cy="28.6" rx="2.6" ry="1.8" />
      <path className={styles.gummySmile} d="M28.4 31.4 Q32 34.6 35.6 31.4" />
    </svg>
  );
}

/**
 * The paper-machine loading screen (TASK-198). Presentation only: it renders the boot tracker's real progress and stage and
 * owns no loading logic. Everything moves from the single `--p` custom property (gear turn, fill, gummy position), through
 * finite CSS transitions: no infinite animation, no rAF loop and no per-frame work while the canvas boots (TASK-143).
 */
export function BootLoader({ boot, reducedMotion, onShown }: { boot: BootTracker; reducedMotion: boolean; onShown: () => void }) {
  const snap = useSyncExternalStore(boot.subscribe, boot.get, boot.get);
  const [shown, setShown] = useState(false);
  const [stalled, setStalled] = useState(false);
  const { progress, stage, ready, glbFailed } = snap;

  useEffect(() => {
    const show = window.setTimeout(() => {
      setShown(true);
      onShown();
    }, LOADER_DELAY_MS);
    const stall = window.setTimeout(() => setStalled(true), LOADER_STALL_MS);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(stall);
    };
  }, [onShown]);

  if (!shown) return null;

  const label = BOOT_STAGES[stage];
  const showStall = stalled && !ready;
  return (
    <div className={styles.root} data-lab-loader="" data-done={ready ? "" : undefined} data-reduced={reducedMotion ? "" : undefined} style={{ "--p": progress } as CSSProperties}>
      <header className={styles.head}>
        <p className={styles.eyebrow}>Tushar’s Secret Lab</p>
        <h1 className={styles.title}>Gummy Lab</h1>
        <p className={styles.hand} data-decor="annotation" aria-hidden="true">
          Preparing the playground…
        </p>
      </header>

      <div className={styles.machine}>
        <svg className={styles.gears} viewBox="0 0 720 210" aria-hidden="true" focusable="false">
          <Gear g={GEAR_PATHS.small} tone="kraft" k={2.4} />
          <Gear g={GEAR_PATHS.big} tone="steel" k={1} />
          <Gear g={GEAR_PATHS.mid} tone="rust" k={-1.6} />
          <g className={styles.rightGear}>
            <Gear g={GEAR_PATHS.right} tone="steel" k={-1.9} />
          </g>
        </svg>
        <div className={styles.tag} aria-hidden="true">
          Loading…
        </div>
        <div className={styles.conveyor}>
          <div className={styles.under} />
          <div className={styles.top}>
            <div
              className={styles.channel}
              role="progressbar"
              aria-label="Loading the Gummy Lab"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
              aria-valuetext={`${progress}%, ${label}`}
            >
              <div className={styles.fill} />
            </div>
          </div>
          <div className={styles.lane} aria-hidden="true">
            <div className={styles.gummy}>
              <div className={styles.gummyHop} key={ready ? "done" : stage}>
                <Gummy />
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className={styles.percent} aria-hidden="true">
        <span className={styles.num}>{progress}%</span> <span className={styles.loaded}>Loaded</span>
      </p>
      <p className={styles.stage} aria-hidden="true">
        {label}
      </p>
      <ol className={styles.steps} aria-hidden="true">
        {BOOT_STAGES.map((s, i) => (
          <li key={s} className={styles.step} data-state={ready || i < stage ? "done" : i === stage ? "now" : "next"}>
            <span className={styles.dot} />
            <span className={styles.stepName}>{s}</span>
          </li>
        ))}
      </ol>

      {showStall ? (
        <div className={styles.stall}>
          <p>This is taking longer than usual.</p>
          <button type="button" className={styles.retry} onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      ) : null}

      <p className={styles.sr} role="status" aria-live="polite">
        {showStall ? "Loading is taking longer than usual. A Try again button is available." : ready ? "Gummy Lab is ready." : `${label}${glbFailed && stage >= 1 ? " Using the built-in gummy." : ""}`}
      </p>
    </div>
  );
}
