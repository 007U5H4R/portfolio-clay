"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { AlertTriangle, Play } from "lucide-react";
import { Pin, Sheet, Tape } from "@/components/paper";
import { externalMediaUrl, mediaFor, type MediaMode, type PortfolioProduct } from "@/lib/portfolio";
import { ProductCover } from "./ProductCover";

/** The player chunk loads only when someone presses play (spec §23–§24). */
const ProductVideo = dynamic(() => import("./ProductVideo").then((m) => m.ProductVideo), {
  ssr: false,
  loading: () => <span className="pf-stage-loading" role="status">Loading video…</span>,
});

export type StagePhase = "poster" | "playing" | "error";

export interface MainMediaStageProps {
  product: PortfolioProduct;
  mode: MediaMode;
  /** Which change brought this stage in — drives the enter transition (spec §20). */
  enter: "none" | "product" | "mode";
  id: string;
}

const MODE_LABEL: Record<MediaMode, string> = { pitch: "pitch video", demo: "demo video" };

/**
 * The left media stage (TASK-116, spec §7–§10, §20, §49; TASK-121 rectify spec §5.1–§5.2): the hero
 * of the page, built as one physical stack — a kraft back sheet, a torn cream frame (`::before` /
 * `::after`), the 16:9 screen on top, a tape strip + a push-pin, a small doodle burst and a warm
 * paper shadow. A torn tab on the frame names the mode ("Pitch video" / "Demo video").
 *
 * The showcase renders it with `key={product:mode}`, so every product or Pitch ↔ Demo change is a
 * fresh mount: the old player (if any) unmounts — stopping it — and the new one starts at `poster`,
 * i.e. its start, never autoplaying. Phases (`data-stage-phase`):
 *   poster  → the source's own poster, else the product's cover at stage size (its painted art, or
 *             its designed CSS cover) with the name lettered over it; a large central play button
 *             only when this mode has a video (spec §22: never a dead control), else a small torn
 *             "coming" tag so the stage reads as intended, not broken.
 *   playing → `ProductVideo` (lazy chunk) replaces the poster — the only player on the page.
 *   error   → the poster again + a short message and a link to open the video directly (spec §49).
 */
export function MainMediaStage({ product, mode, enter, id }: MainMediaStageProps) {
  const [phase, setPhase] = useState<StagePhase>("poster");
  const source = mediaFor(product, mode);
  const label = `${product.name} — ${MODE_LABEL[mode]}`;
  const poster = source?.kind === "file" ? source.poster : undefined;

  return (
    <Sheet as="figure" variant="photo" className="pf-stage">
      <Tape side="l" rotate={-6} />
      <Pin tone="rust" className="pf-stage-pin" />
      <span className="pf-stage-label" aria-hidden="true">
        {mode === "pitch" ? "Pitch video" : "Demo video"}
      </span>
      <span className="pf-doodle pf-doodle-burst" aria-hidden="true" />
      <div id={id} className="pf-stage-screen" data-enter={enter} data-stage-phase={phase} data-mode={mode}>
        {phase === "playing" && source ? (
          <ProductVideo source={source} title={label} onError={() => setPhase("error")} />
        ) : (
          <>
            {poster ? (
              <Image src={poster} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="pf-stage-poster" />
            ) : (
              <ProductCover product={product} size="stage" />
            )}
            {source && phase === "poster" ? (
              <button type="button" className="pf-play focus-ring" onClick={() => setPhase("playing")} aria-label={`Play ${label}`}>
                <Play aria-hidden="true" focusable="false" strokeWidth={1.75} />
              </button>
            ) : null}
            {!source ? (
              <span className="pf-stage-tag" data-paper="tag">
                {mode === "pitch" ? "Pitch video coming" : "Demo video coming"}
              </span>
            ) : null}
            {phase === "error" && source ? (
              <span className="pf-stage-error" role="alert">
                <AlertTriangle aria-hidden="true" focusable="false" strokeWidth={1.75} />
                This video didn&apos;t load.{" "}
                <a href={externalMediaUrl(source)} target="_blank" rel="noopener noreferrer" className="focus-ring" data-inline-link="">
                  Open it in a new tab
                </a>
              </span>
            ) : null}
          </>
        )}
      </div>
      <figcaption className="sr-only">
        {label}
        {!poster && product.art ? `. Poster: ${product.art.alt}` : ""}
      </figcaption>
    </Sheet>
  );
}
