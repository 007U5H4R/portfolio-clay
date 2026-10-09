import { BLEED, CARD_H, CARD_W, foldLayers, type Layer } from "@/lib/card/art";
import styles from "./card.module.css";

const BOX_W = CARD_W + BLEED * 2;
const BOX_H = CARD_H + BLEED * 2;

/**
 * One independent paper sheet: a wrapper that carries the parallax transform and its own drop shadows
 * (sized from its z), and an inner sheet cut with a clip-path in its own paper colour and grain.
 */
function PaperLayer({ layer, clipId }: { layer: Layer; clipId: string }) {
  return (
    <div className={styles.layer} data-layer={layer.id} style={{ "--k": layer.k, "--z": layer.z } as React.CSSProperties}>
      <div className={styles.sheet} style={{ clipPath: `url(#${clipId})` }} />
    </div>
  );
}

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

/**
 * The panther: depth-ordered layers on one registered canvas (back to front). The numbers are the brief's
 * parallax multipliers: silhouette 2x, neck 2.5x, head 3x, cheeks and muzzle 4x, nose and eyes 4.5x.
 * Images come from CSS custom properties, so only the active theme's art is ever requested.
 */
const PANTHER = [
  ["silhouette", 2, 14],
  ["neck", 2.5, 20],
  ["head", 3, 28],
  ["face", 4, 36],
  ["nose", 4.5, 44],
  ["eyes", 4.5, 44],
] as const;

function PantherStack({ side }: { side: "front" | "back" }) {
  const list = side === "front" ? PANTHER : ([PANTHER[0], PANTHER[2]] as const);
  return (
    <div className={side === "front" ? styles.panther : styles.pantherBack} data-panther={side}>
      {list.map(([id, k, z]) => (
        <div
          key={id}
          className={styles.pl}
          data-panther-layer={id}
          data-layer={`${side === "back" ? "back-" : ""}${id}`}
          style={{ "--k": k, "--z": z } as React.CSSProperties}
        />
      ))}
    </div>
  );
}

/** Front: corner folds behind and in front of the layered panther. */
export function FrontArt() {
  const folds = foldLayers("front");
  return (
    <div className={styles.art} aria-hidden="true">
      <ClipDefs layers={folds} prefix="cf" />
      <PantherStack side="front" />
      {folds.map((l) => (
        <PaperLayer key={l.id} layer={l} clipId={`cf-${l.id}`} />
      ))}
    </div>
  );
}

/** Back: same fold language and a small cropped panther silhouette (not the full head again). */
export function BackArt() {
  const folds = foldLayers("back");
  return (
    <div className={styles.art} aria-hidden="true">
      <ClipDefs layers={folds} prefix="cb" />
      <PantherStack side="back" />
      {folds.map((l) => (
        <PaperLayer key={l.id} layer={l} clipId={`cb-${l.id}`} />
      ))}
    </div>
  );
}
