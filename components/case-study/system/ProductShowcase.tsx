import type { CSSProperties, ReactNode } from "react";
import type { CaseSection } from "@/data/schema";
import type { VideoMedia } from "@/lib/video-providers";
import { ProductMediaPlayer } from "@/components/portfolio/ProductMediaPlayer";
import { CaseImageFrame } from "./CaseImageFrame";

type Product = Extract<CaseSection, { kind: "product" }>;

/**
 * Spec §12, §42: show the product early, as it really is — the recorded screenshots, the product's
 * own demo video (click-to-load youtube-nocookie through the shared `ProductMediaPlayer`, TASK-122),
 * and, where the record defines them, its output states as a small contract diagram.
 */
export function ProductShowcase({ section, video, poster }: { section: Product; video?: VideoMedia | undefined; poster?: ReactNode }) {
  const hasVideo = Boolean(section.video && video);
  return (
    <div className="csx-product" data-shots={section.shots.length} data-video={hasVideo ? "" : undefined} data-flow={section.flow ? "" : undefined}>
      <p className="csx-lead">{section.summary}</p>
      {hasVideo && video ? (
        <div className="csx-video">
          <ProductMediaPlayer media={video} fallbackPoster={poster} className="csx-video-player" />
        </div>
      ) : null}
      {section.flow ? (
        <figure className="csx-flow csx-product-flow">
          <figcaption className="csx-flow-cap" data-micro-label="">{section.flow.caption}</figcaption>
          <ol className="csx-flow-steps">
            {section.flow.steps.map((step, index) => (
              <li key={step.label} className="csx-flow-step" style={{ "--i": index } as CSSProperties}>
                <span className="csx-flow-n" aria-hidden="true" data-micro-label="">
                  {index + 1}
                </span>
                <span className="csx-flow-label">{step.label}</span>
                {step.note ? <span className="csx-flow-note">{step.note}</span> : null}
              </li>
            ))}
          </ol>
        </figure>
      ) : null}
      {section.shots.length > 0 ? (
        <div className="csx-shots" data-count={section.shots.length}>
          {section.shots.map((shot, index) => (
            <CaseImageFrame key={shot.src} image={shot} className={`csx-shot csx-shot-${index + 1}`} />
          ))}
        </div>
      ) : null}
      {section.states.length > 0 ? (
        <ul className="csx-states" aria-label="Output states">
          {section.states.map((state) => (
            <li key={state.title} className="csx-state" data-tone={state.tone} data-paper="card">
              <p className="csx-state-title">{state.title}</p>
              <ul>
                {state.lines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
