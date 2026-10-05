"use client";

import { NewTabHint } from "@/components/common/NewTabHint";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpen, FileText, GitBranch, Link2, Play, Video, type LucideIcon } from "lucide-react";
import { Pin, Sheet, Tape } from "@/components/paper";
import type { MediaMode, PortfolioProduct } from "@/lib/portfolio";

export interface ProductInfoPanelProps {
  product: PortfolioProduct;
  mode: MediaMode;
  onModeChange: (mode: MediaMode) => void;
  /** The media stage's screen id (Pitch / Demo `aria-controls`). */
  stageId: string;
  headingId: string;
}

type ExternalKind = "product" | "github" | "prd";

const EXTERNAL: Record<ExternalKind, { label: string; hint: string; icon: LucideIcon; name: (product: string) => string }> = {
  product: { label: "Product link", hint: "Open the live product", icon: Link2, name: (p) => `Product link: ${p}, the live product` },
  github: { label: "GitHub", hint: "View the source", icon: GitBranch, name: (p) => `GitHub: ${p} source code` },
  prd: { label: "PRD", hint: "Read the product doc", icon: FileText, name: (p) => `PRD: ${p} product requirements document` },
};

/** One torn strip's inside: icon block · label · hint · arrow (the hint + arrow are visual only). */
function StripBody({ icon: Icon, label, hint, external }: { icon: LucideIcon; label: string; hint: string; external: boolean }) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  return (
    <>
      <span className="pf-action-icon" aria-hidden="true">
        <Icon aria-hidden="true" focusable="false" strokeWidth={1.75} />
      </span>
      <span className="pf-action-label">{label}</span>
      <span className="pf-action-hint" aria-hidden="true">
        {hint}
      </span>
      <Arrow className="pf-action-arrow" aria-hidden="true" focusable="false" strokeWidth={1.75} />
    </>
  );
}

/**
 * The right-hand product sheet (TASK-116, spec §11–§13, §22, §44; TASK-121 rectify spec §5.3–§6;
 * TASK-127 fidelity spec §6–§8): its own torn, faintly stained ivory sheet at +0.6° over a paper-2
 * under-sheet, pinned top-left and taped top-right (the host's two fasteners). Hierarchy: tiny
 * metadata (code · shortened status, §7) → name → tagline → a ≤ 3-line description → the torn strip
 * stack (each strip: a torn icon chip, a serif label, a short hint, an arrow; its own tint, tear and
 * tilt) → the case study as the last, kraft strip. Up to five action strips — Pitch / Demo switch the LEFT stage
 * (`aria-pressed` carries the current mode, never colour alone); Product / GitHub / PRD open a new
 * tab. An action with nothing behind it is not rendered at all (no disabled dead buttons). The case
 * study link ("Explore the build", spec §4) keeps the recruiter hop to `/work/<slug>` (EVAL-002).
 */
export function ProductInfoPanel({ product, mode, onModeChange, stageId, headingId }: ProductInfoPanelProps) {
  const externals: { kind: ExternalKind; href: string }[] = [];
  if (product.productUrl) externals.push({ kind: "product", href: product.productUrl });
  if (product.githubUrl) externals.push({ kind: "github", href: product.githubUrl });
  if (product.prdUrl) externals.push({ kind: "prd", href: product.prdUrl });

  const mediaButton = (target: MediaMode, label: string, hint: string, Icon: LucideIcon) => (
    <li>
      <button
        type="button"
        className="pf-action focus-ring"
        data-action={target}
        aria-pressed={mode === target}
        aria-controls={stageId}
        onClick={() => onModeChange(target)}
      >
        <StripBody icon={Icon} label={label} hint={hint} external={false} />
      </button>
    </li>
  );

  return (
    <Sheet as="div" variant="card" rotate={0.6} className="pf-info">
      <Pin tone="rust" className="pf-info-pin" />
      <Tape side="r" rotate={8} className="pf-info-tape" />
      <p className="pf-info-meta">
        <span className="pf-info-code">{product.code}</span>
        <span aria-hidden="true">·</span>
        <span className="pf-info-status">{product.meta}</span>
      </p>
      <h2 id={headingId} className="pf-info-name">
        {product.name}
      </h2>
      <p className="pf-info-tagline">{product.tagline}</p>
      <p className="pf-info-desc">{product.description}</p>
      <ul className="pf-actions" aria-label={`${product.name} actions`}>
        {product.pitchVideo ? mediaButton("pitch", "Pitch video", "Plays here", Play) : null}
        {product.demoVideo ? mediaButton("demo", "Demo video", "See it in action", Video) : null}
        {externals.map(({ kind, href }) => {
          const def = EXTERNAL[kind];
          return (
            <li key={kind}>
              <a
                className="pf-action focus-ring"
                data-action={kind}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${def.name(product.name)} (opens in new tab)`}
              >
                <StripBody icon={def.icon} label={def.label} hint={def.hint} external />
              </a>
            </li>
          );
        })}
      </ul>
      {/* TASK-130: the case study opens in a new tab (Tushar, 2026-09-29). */}
      <Link
        href={product.caseStudyHref}
        target="_blank"
        rel="noopener noreferrer"
        className="pf-action pf-case-link focus-ring"
        data-action="case"
      >
        <span className="pf-action-icon" aria-hidden="true">
          <BookOpen aria-hidden="true" focusable="false" strokeWidth={1.75} />
        </span>
        <span className="pf-action-label">
          Read the case study <span aria-hidden="true">→</span>
          <NewTabHint />
        </span>
      </Link>
    </Sheet>
  );
}
