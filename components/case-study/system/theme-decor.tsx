import type { ReactNode } from "react";
import type { CaseStudy } from "@/data/schema";

/**
 * Per-product decorations (spec §7–§9, §25): each product chooses only the few objects that support
 * its story — never pushpins/tape/stamps everywhere. Every object is `data-decor` + `aria-hidden`
 * (Design.md §3.2 rule 6), repeats something the page already says in text, and keeps its section
 * within the EVAL-018 budget of 4. Static SVG art lives in `public/media/case-studies/<slug>/`.
 */
type Theme = CaseStudy["theme"]["key"];
type Slot = "hero" | "problem" | "product" | "decisions" | "system" | "outcome" | "pivot" | "research" | "learnings";

function Stamp({ src, className }: { src: string; className: string }) {
  return (
    <span data-decor="note" aria-hidden="true" className={`csx-stamp ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative static SVG */}
      <img src={src} alt="" width={200} height={200} loading="lazy" decoding="async" />
    </span>
  );
}

function Sticky({ children, className }: { children: ReactNode; className: string }) {
  return (
    <p data-decor="sticky" aria-hidden="true" className={`csx-sticky ${className}`}>
      {children}
    </p>
  );
}

function Scribble({ children, className }: { children: ReactNode; className: string }) {
  return (
    <p data-decor="annotation" aria-hidden="true" className={`csx-scribble ${className}`}>
      {children}
    </p>
  );
}

function Paper({ src, className, width, height }: { src: string; className: string; width: number; height: number }) {
  return (
    <span data-decor="note" aria-hidden="true" className={`csx-paper ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative static SVG */}
      <img src={src} alt="" width={width} height={height} decoding="async" />
    </span>
  );
}

const DECOR: Partial<Record<Theme, Partial<Record<Slot, ReactNode>>>> = {
  railcite: {
    hero: (
      <>
        <Stamp src="/media/case-studies/railcite/stamp-circular.svg" className="rc-stamp-hero" />
        <Sticky className="rc-sticky-hero">Cite. Don’t guess.</Sticky>
      </>
    ),
    product: <Stamp src="/media/case-studies/railcite/stamp-refusal.svg" className="rc-stamp-refusal" />,
    learnings: <Scribble className="rc-scribble-end">Right rule. Or no rule.</Scribble>,
  },
  teachspark: {
    hero: (
      <>
        <Paper src="/media/case-studies/teachspark/worksheet.svg" className="ts-worksheet" width={480} height={620} />
        <Stamp src="/media/case-studies/teachspark/stamp-checked.svg" className="ts-stamp-hero" />
      </>
    ),
    decisions: <Sticky className="ts-sticky">Capability, not dependency.</Sticky>,
    learnings: <Scribble className="ts-scribble-end">ready for tomorrow’s class ✓</Scribble>,
  },
  velora: {
    hero: (
      <>
        <Stamp src="/media/case-studies/velora/stamp-day7.svg" className="vl-stamp-day7" />
        <Paper src="/media/case-studies/velora/swatch.svg" className="vl-swatch" width={220} height={300} />
      </>
    ),
    learnings: <Scribble className="vl-scribble-end">one survived.</Scribble>,
  },
  cubicle: {
    hero: <Sticky className="cb-sticky-hero">Built, not launched.</Sticky>,
    decisions: <Scribble className="cb-scribble">trust → ownership → autonomy</Scribble>,
  },
  tegaki: {
    hero: <Stamp src="/media/case-studies/tegaki/hanko.svg" className="tg-hanko" />,
    product: <Scribble className="tg-scribble">read by a person, not a model</Scribble>,
  },
  nuptis: {
    decisions: <Sticky className="np-sticky">Vet by risk, not by habit.</Sticky>,
  },
  "bhakti-vilas": {
    decisions: <Scribble className="bv-scribble">a kirtan before a screening</Scribble>,
  },
  "token-toli": {
    outcome: <Sticky className="tt-sticky">Discovery only.</Sticky>,
  },
};

export function themeDecor(theme: Theme, slot: Slot): ReactNode {
  return DECOR[theme]?.[slot] ?? null;
}
