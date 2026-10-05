import type { ReactNode } from "react";
import Link from "next/link";
import type { CaseImage, CaseProof, EvidenceKind } from "@/data/schema";
import type { VideoMedia } from "@/lib/video-providers";
import { Container } from "@/components/layout/Container";
import { ProductMediaPlayer } from "@/components/portfolio/ProductMediaPlayer";
import { CaseImageFrame } from "./CaseImageFrame";
import { BadgeLegend } from "./EvidenceBadge";
import { MetricCard } from "./MetricCard";

export interface CaseStudyHeroProps {
  slug: string;
  name: string;
  code: string;
  status: string;
  tagline: string;
  proposition: string;
  proofs: readonly CaseProof[];
  legendKinds: readonly EvidenceKind[];
  layout: "split" | "split-reverse" | "stacked" | "pivot";
  image?: CaseImage | undefined;
  pivotFrom?: CaseImage | undefined;
  video?: { media: VideoMedia; poster: CaseImage } | undefined;
  decor?: ReactNode;
}

/**
 * Spec §5–§6: PRODUCT NAME → short tagline → one-sentence proposition → 2–4 proof points, beside the
 * product itself (a real screenshot, or the product's pitch video on its poster). Minor metadata
 * (role, dates) lives in the footer strip, not here. `layout` lets a product override the
 * composition (spec §39); the theme restyles the rest.
 */
export function CaseStudyHero(props: CaseStudyHeroProps) {
  const { slug, name, code, status, tagline, proposition, proofs, legendKinds, layout, image, pivotFrom, video, decor } = props;
  return (
    <section className="csx-hero" aria-labelledby="cs-h" data-layout={layout}>
      <Container className="csx-hero-in">
        <div className="csx-hero-copy">
          <p className="csx-crumb">
            <Link href="/projects" className="focus-ring" data-inline-link="">
              Portfolio
            </Link>
            <span aria-hidden="true">/</span>
            <span>Case study</span>
          </p>
          <p className="csx-code" data-micro-label="">
            <span className="csx-code-id">{code}</span>
            <span aria-hidden="true"> · </span>
            <span>{status}</span>
          </p>
          <h1 id="cs-h" className="csx-h1" style={{ viewTransitionName: `project-${slug}` }}>
            {name}
          </h1>
          <p className="csx-tagline">{tagline}</p>
          <p className="csx-prop">{proposition}</p>
        </div>
        <div className="csx-hero-media">
          {pivotFrom ? (
            <div className="csx-pivot-from">
              <CaseImageFrame image={pivotFrom} className="csx-pivot-from-shot" />
              <span className="csx-pivot-strike" aria-hidden="true" />
            </div>
          ) : null}
          {video ? (
            <div className="csx-video csx-hero-video">
              <ProductMediaPlayer
                media={video.media}
                className="csx-video-player"
                fallbackPoster={
                  // eslint-disable-next-line @next/next/no-img-element -- static SVG/WebP poster from public/
                  <img src={video.poster.src} alt={video.poster.alt} width={video.poster.width} height={video.poster.height} decoding="async" fetchPriority="high" />
                }
              />
            </div>
          ) : image ? (
            <CaseImageFrame image={image} priority className="csx-hero-shot" />
          ) : null}
          {decor}
        </div>
        {proofs.length > 0 ? (
          <div className="csx-hero-proofs">
            <ul className="csx-proofs" data-count={proofs.length}>
              {proofs.map((proof) => (
                <li key={proof.label}>
                  <MetricCard proof={proof} size="lg" />
                </li>
              ))}
            </ul>
            <BadgeLegend kinds={legendKinds} />
          </div>
        ) : null}
      </Container>
    </section>
  );
}
