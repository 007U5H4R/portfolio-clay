"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { bleedPx, DEPTHS, ORIENTATION_PX, pointerRangePx, type Depth, type LayerName } from "@/content/media/illustrations/layers";
import { paperMotion } from "@/lib/paper-world/motion";
import styles from "./lab.module.css";

/**
 * The torn-paper diorama around the game (TASK-168). Four backdrop layers sit behind the canvas and three frame
 * sheets (plus an inner-shadow vignette) in front of it, all driven by Paper World's one motion source
 * (`paperMotion` writes `--pp-x/--pp-y` on `.stage`; each layer turns that into `translate` with its depth
 * factor from `DEPTHS`, `--par-N`). The canvas and the HUD are never inside a moving layer: the world stays still.
 *
 * Geometry: the frame art is 2400 × 1357 and its opening is the same on all three sheets (measured on the alpha:
 * x .168–.828, y .155–.815). `lab.module.css` turns that into `--o-*` custom properties (contain-fit on landscape,
 * height-fit crop on portrait phones) and the canvas, backdrop clip and HUD overlay all sit on that rectangle.
 * Images are only rendered once `show` is true (the canvas exists), so the lab's first load is unchanged.
 */
const ART = "/media/lab/art";
const FRAME = { w: 2400, h: 1357 };

interface Layer {
  name: LayerName;
  depth: Depth;
  file: string;
  /** The art has a matched dark twin (`-dark.webp`). */
  dark: boolean;
  kind: "sky" | "hills" | "frame" | "vignette";
}

const BACKDROP: Layer[] = [
  { name: "bg", depth: DEPTHS[0], file: "bg-1-sky", dark: true, kind: "sky" },
  { name: "distant", depth: DEPTHS[1], file: "bg-2-hills-far", dark: true, kind: "hills" },
  { name: "mid", depth: DEPTHS[2], file: "bg-3-hills-mid", dark: true, kind: "hills" },
  { name: "subject", depth: DEPTHS[3], file: "bg-4-hills-near", dark: true, kind: "hills" },
];
const FRAME_LAYERS: Layer[] = [
  { name: "bg", depth: DEPTHS[0], file: "frame-4-vignette", dark: false, kind: "vignette" },
  // Back to front: the big cream sheet sits at the back and the sage sheet on top of it, so the nearer a sheet is the
  // more it moves. (The asset manifest listed the factors the other way round; the art's own stacking wins.)
  { name: "subject", depth: DEPTHS[3], file: "frame-1-outer", dark: true, kind: "frame" },
  { name: "fg", depth: DEPTHS[4], file: "frame-2-secondary", dark: true, kind: "frame" },
  { name: "fg", depth: DEPTHS[4], file: "frame-3-inner", dark: true, kind: "frame" },
];
/** Alt text lives on the group; every layer is decorative. */
export const DIORAMA_LAYERS = { backdrop: BACKDROP.map((l) => l.file), frame: FRAME_LAYERS.map((l) => l.file) } as const;

function Img({ layer, theme }: { layer: Layer; theme: "light" | "dark" | undefined }) {
  const file = theme === "dark" ? `${layer.file}-dark` : layer.file;
  return (
    // Layer art is already WebP at its shipped size; no next/image loader (same as PaperParallaxScene).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${ART}/${file}.webp`}
      alt=""
      aria-hidden="true"
      draggable={false}
      decoding="async"
      loading="lazy"
      width={layer.kind === "hills" ? 2400 : FRAME.w}
      height={layer.kind === "hills" ? undefined : FRAME.h}
      className={styles.dioImg}
    />
  );
}

function LayerEl({ layer }: { layer: Layer }) {
  const par = DEPTHS.indexOf(layer.depth);
  const style = {
    "--par": `var(--par-${par}, ${layer.depth})`,
    "--rng-p": `${pointerRangePx(layer.depth)}px`,
    "--rng-o": `${ORIENTATION_PX[layer.name]}px`,
    "--bleed": `${layer.kind === "frame" || layer.kind === "vignette" ? 0 : bleedPx(layer.name, layer.depth)}px`,
  } as CSSProperties;
  return (
    <div data-layer={layer.file} data-depth={layer.depth} data-kind={layer.kind} className={styles.dioLayer} style={style}>
      {layer.dark ? (
        <>
          <picture data-theme-art="light">
            <Img layer={layer} theme="light" />
          </picture>
          <picture data-theme-art="dark">
            <Img layer={layer} theme="dark" />
          </picture>
        </>
      ) : (
        <Img layer={layer} theme={undefined} />
      )}
    </div>
  );
}

export function Diorama({ show, children }: { show: boolean; children: ReactNode }) {
  const stage = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stage.current;
    return el ? paperMotion.register(el) : undefined;
  }, []);
  return (
    <div ref={stage} className={styles.stage} data-lab-diorama={show ? "ready" : "pending"}>
      <div className={styles.dioClip} data-lab-backdrop="" aria-hidden="true">
        {show ? BACKDROP.map((l) => <LayerEl key={l.file} layer={l} />) : null}
      </div>
      {children}
      <div className={styles.dioFrame} data-lab-frame="" aria-hidden="true">
        {show ? FRAME_LAYERS.map((l) => <LayerEl key={l.file} layer={l} />) : null}
      </div>
    </div>
  );
}
