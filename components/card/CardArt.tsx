import Image from "next/image";
import { BLEED, CARD_H, CARD_W, backEdgeLayers, landscapeLayers, type Layer } from "@/lib/card/art";
import styles from "./card.module.css";

const BOX_W = CARD_W + BLEED * 2;
const BOX_H = CARD_H + BLEED * 2;

/**
 * One independent paper layer: a wrapper that carries the parallax transform and the layer's own
 * drop shadows (contact + ambient, sized from its z), and an inner sheet cut with a clip-path in
 * its own paper colour and grain. Nothing is a flattened image (Dev-185).
 */
function PaperLayer({ layer, clipId }: { layer: Layer; clipId: string }) {
  return (
    <div
      className={styles.layer}
      data-layer={layer.id}
      style={{ "--k": layer.k, "--z": layer.z } as React.CSSProperties}
    >
      <div className={styles.sheet} style={{ clipPath: `url(#${clipId})` }} />
    </div>
  );
}

/** Shared <defs>: one objectBoundingBox clipPath per layer so the shape scales with the card. */
function ClipDefs({ layers, prefix }: { layers: Layer[]; prefix: string }) {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" className={styles.defs}>
      <defs>
        {layers.map((l) => (
          <clipPath key={l.id} id={`${prefix}-${l.id}`} clipPathUnits="objectBoundingBox">
            <path transform={`scale(${1 / BOX_W} ${1 / BOX_H})`} d={l.d} />
          </clipPath>
        ))}
      </defs>
    </svg>
  );
}

/** The front landscape: sky is the card paper itself; sun, three ranges, shore, water, land, boat. */
export function FrontArt() {
  const layers = landscapeLayers();
  const byId = Object.fromEntries(layers.map((l) => [l.id, l]));
  const order = ["far", "peak", "mid", "shore", "water"] as const;
  return (
    <div className={styles.art} aria-hidden="true">
      <ClipDefs layers={layers} prefix="cf" />
      <div className={styles.layer} data-layer="sun" style={{ "--k": 0.8, "--z": 8 } as React.CSSProperties}>
        <div className={styles.sun} />
      </div>
      {order.map((id) => (
        <PaperLayer key={id} layer={byId[id]!} clipId={`cf-${id}`} />
      ))}
      <div className={styles.layer} data-layer="boat-shadow" style={{ "--k": 3.5, "--z": 44 } as React.CSSProperties}>
        <div className={styles.boatShadow} />
      </div>
      <PaperLayer layer={byId.land!} clipId="cf-land" />
      <div className={styles.layer} data-layer="boat" style={{ "--k": 4, "--z": 52 } as React.CSSProperties}>
        <div className={styles.boat}>
          <Image src="/card/sailboat.webp" alt="" width={600} height={767} sizes="64px" loading="eager" />
        </div>
      </div>
      <PaperLayer layer={byId.ripples!} clipId="cf-ripples" />
    </div>
  );
}

/** Low landscape edge along the back's bottom (§56): same paper language, two sheets. */
export function BackArt() {
  const layers = backEdgeLayers();
  return (
    <div className={styles.art} aria-hidden="true">
      <ClipDefs layers={layers} prefix="cb" />
      {layers.map((l) => (
        <PaperLayer key={l.id} layer={l} clipId={`cb-${l.id}`} />
      ))}
    </div>
  );
}
