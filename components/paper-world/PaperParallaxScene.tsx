import type { CSSProperties } from "react";
import { bleedPx, layerSrc, layeredScene, DEPTHS, ORIENTATION_PX, pointerRangePx, type LayeredSceneId, type SceneLayer } from "@/content/media/illustrations/layers";
import { SceneMotion } from "./SceneMotion";
import styles from "./paper-world.module.css";

export interface PaperParallaxSceneProps {
  id: LayeredSceneId;
  /** The LCP scene: `bg` (and any layer flagged `eager`) load eagerly, `bg` with `fetchpriority="high"`. */
  priority?: boolean | undefined;
  /** Focal point as fractions of the frame (default 0.5, 0.5) — the crop when the box is not the art's aspect. */
  focal?: { x?: number; y?: number } | undefined;
  className?: string | undefined;
}

const MOBILE_MEDIA = "(max-width: 767px)";
const unit = (n: number | undefined) => `${Math.round(Math.min(1, Math.max(0, n ?? 0.5)) * 100)}%`;

/**
 * Layered paper-cut scene (M-011, Design.md §14.4–14.6). Server component: one `role="img"` root carrying the
 * scene's alt, and per layer a wrapper (pointer/tilt `translate`, from `--pp-x/--pp-y`) around a depth wrapper
 * (CSS scroll-timeline offset) around a `<picture>` per theme. The inactive theme's picture is `display: none`
 * (app/globals.css `[data-theme-art]`) and lazy, so it is never fetched; light is the eager/LCP rendition, as in
 * SceneBanner. The client island `SceneMotion` only registers the root with `paperMotion`.
 */
export function PaperParallaxScene({ id, priority = false, focal, className }: PaperParallaxSceneProps) {
  const scene = layeredScene(id);
  const style = {
    "--ps-ar": `${scene.width} / ${scene.height}`,
    "--focal-x": unit(focal?.x),
    "--focal-y": unit(focal?.y),
  } as CSSProperties;
  // One bleed for every layer, so all `object-fit: cover` boxes have the same shape and scale (the layers register at rest).
  const bleed = Math.max(...scene.layers.map((l) => bleedPx(l.layer, l.depth)));
  return (
    <div role="img" aria-label={scene.alt} data-paper-scene={id} className={[styles.root, className].filter(Boolean).join(" ")} style={style}>
      {scene.layers.map((l) => (
        <Layer key={l.layer} scene={scene} layer={l} priority={priority} bleed={bleed} />
      ))}
      <SceneMotion />
    </div>
  );
}

function Layer({ scene, layer, priority, bleed }: { scene: ReturnType<typeof layeredScene>; layer: SceneLayer; priority: boolean; bleed: number }) {
  const par = DEPTHS.indexOf(layer.depth);
  const style = {
    "--par": `var(--par-${par}, ${layer.depth})`,
    "--rng-p": `${pointerRangePx(layer.depth)}px`,
    "--rng-o": `${ORIENTATION_PX[layer.layer]}px`,
    "--bleed": `${bleed}px`,
  } as CSSProperties;
  // `bg` leads the page; a flagged layer (the home subject) is eager too. Only `bg` asks for high priority.
  const eager = priority && (layer.layer === "bg" || layer.eager === true);
  return (
    <div data-layer={layer.layer} data-depth={layer.depth} data-bleed={bleed} className={styles.layer} style={style}>
      <div className={styles.depth}>
        <Picture scene={scene} file={layer.file} theme="light" eager={eager} high={priority && layer.layer === "bg"} />
        <Picture scene={scene} file={layer.darkFile} theme="dark" eager={false} high={false} />
      </div>
    </div>
  );
}

function Picture({ scene, file, theme, eager, high }: { scene: ReturnType<typeof layeredScene>; file: string; theme: "light" | "dark"; eager: boolean; high: boolean }) {
  return (
    <picture data-theme-art={theme} className={styles.picture}>
      <source media={MOBILE_MEDIA} srcSet={layerSrc(scene.id, file, true)} width={scene.mobileWidth} height={scene.mobileHeight} type="image/webp" />
      {/* Layer art is already WebP-encoded at its two shipped sizes (provenance README), so no next/image loader. */}
      <img
        src={layerSrc(scene.id, file)}
        width={scene.width}
        height={scene.height}
        alt=""
        aria-hidden="true"
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={high ? "high" : undefined}
        draggable={false}
        className={styles.img}
      />
    </picture>
  );
}
