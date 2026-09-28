"use client";

import Link from "next/link";
import { FileText, GitBranch, Link2, Play, Video, type LucideIcon } from "lucide-react";
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

const EXTERNAL: Record<ExternalKind, { label: string; icon: LucideIcon; name: (product: string) => string }> = {
  product: { label: "Product link", icon: Link2, name: (p) => `Product link: ${p}, the live product` },
  github: { label: "GitHub", icon: GitBranch, name: (p) => `GitHub: ${p} source code` },
  prd: { label: "PRD", icon: FileText, name: (p) => `PRD: ${p} product requirements document` },
};

/**
 * The right-hand product panel (TASK-116, spec §11–§13, §22, §44): name, cover line, a 2–4 line
 * description, then up to five ripped-paper action strips — Pitch / Demo switch the LEFT stage
 * (`aria-pressed` carries the current mode, never colour alone); Product / GitHub / PRD open a new
 * tab. An action with nothing behind it is not rendered at all (no disabled dead buttons). The case
 * study link ("Explore the build", spec §4) keeps the recruiter hop to `/work/<slug>` (EVAL-002).
 */
export function ProductInfoPanel({ product, mode, onModeChange, stageId, headingId }: ProductInfoPanelProps) {
  const externals: { kind: ExternalKind; href: string }[] = [];
  if (product.productUrl) externals.push({ kind: "product", href: product.productUrl });
  if (product.githubUrl) externals.push({ kind: "github", href: product.githubUrl });
  if (product.prdUrl) externals.push({ kind: "prd", href: product.prdUrl });

  const mediaButton = (target: MediaMode, label: string, Icon: LucideIcon) => (
    <li>
      <button
        type="button"
        className="pf-action focus-ring"
        data-action={target}
        aria-pressed={mode === target}
        aria-controls={stageId}
        onClick={() => onModeChange(target)}
      >
        <Icon aria-hidden="true" focusable="false" strokeWidth={1.75} />
        {label}
      </button>
    </li>
  );

  return (
    <div className="pf-info">
      <p className="pf-info-meta">
        <span className="pf-info-code" data-micro-label="">
          {product.code}
        </span>
        <span className="pf-info-status">{product.statusLabel}</span>
      </p>
      <h2 id={headingId} className="pf-info-name">
        {product.name}
      </h2>
      <p className="pf-info-tagline">{product.tagline}</p>
      <p className="pf-info-desc">{product.description}</p>
      <ul className="pf-actions" aria-label={`${product.name} actions`}>
        {product.pitchVideo ? mediaButton("pitch", "Pitch video", Play) : null}
        {product.demoVideo ? mediaButton("demo", "Demo video", Video) : null}
        {externals.map(({ kind, href }) => {
          const def = EXTERNAL[kind];
          const Icon = def.icon;
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
                <Icon aria-hidden="true" focusable="false" strokeWidth={1.75} />
                {def.label}
              </a>
            </li>
          );
        })}
      </ul>
      <Link href={product.caseStudyHref} className="pf-case-link focus-ring">
        Read the case study <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
