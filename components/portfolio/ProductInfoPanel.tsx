"use client";

import { NewTabHint } from "@/components/common/NewTabHint";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Sheet } from "@/components/paper";
import { stepIndex, type CoverArt, type MediaMode, type PortfolioProduct } from "@/lib/portfolio";
import { ACTION_ICON, type ActionIcon } from "./action-icons";
import { PhoneActions, PhoneOutcomes, PhoneTags } from "./PhoneDetail";
import { ProductLogo } from "./ProductLogo";
import { StarDivider } from "./StarDivider";
import { StarNote } from "./StarNote";

export interface ProductInfoPanelProps {
  product: PortfolioProduct;
  mode: MediaMode;
  onModeChange: (mode: MediaMode) => void;
  /** The media stage's screen id (Pitch / Demo `aria-controls`). */
  stageId: string;
  headingId: string;
  /** TASK-217: how many products the carousel holds ("01 / 13"). */
  total: number;
  /** TASK-210: the phone's "Watch demo / pitch" — switches the stage to that video and starts it. */
  onWatch: (mode: MediaMode) => void;
  /**
   * TASK-274: the desktop-only previous / next arrows (top right) and the pagination row under the actions. Omitted below
   * 1024 px, so on a phone or tablet none of it is rendered — not merely hidden. `key` names the control so focus can be
   * put back on it after the card remounts for the next product.
   */
  nav?: { products: readonly PortfolioProduct[]; onNavigate: (id: string, key: string) => void } | undefined;
  /** TASK-301: the vertical-carousel card shows this product's cover art between the text and the actions. Omitted = not rendered. */
  poster?: CoverArt | undefined;
}

type ExternalKind = "product" | "github" | "prd";

const EXTERNAL: Record<ExternalKind, { label: string; name: (product: string) => string }> = {
  product: { label: "Live product", name: (p) => `Open live product: ${p}` },
  github: { label: "GitHub", name: (p) => `GitHub: ${p} source code` },
  prd: { label: "PRD", name: (p) => `PRD: ${p} product requirements document` },
};

/** One action's inside: icon · serif label · arrow (↗ external, → internal / in-page; icon + arrow are visual only). */
function StripBody({ icon: Icon, label, external }: { icon: ActionIcon | typeof Play; label: string; external: boolean }) {
  const Arrow = external ? ArrowUpRight : ArrowRight;
  return (
    <>
      <span className="pf-action-icon" aria-hidden="true">
        <Icon aria-hidden="true" focusable="false" strokeWidth={1.75} />
      </span>
      <span className="pf-action-label">{label}</span>
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
export function ProductInfoPanel({ product, mode, onModeChange, stageId, headingId, total, onWatch, nav, poster }: ProductInfoPanelProps) {
  const externals: { kind: ExternalKind; href: string }[] = [];
  if (product.productUrl) externals.push({ kind: "product", href: product.productUrl });
  if (product.githubUrl) externals.push({ kind: "github", href: product.githubUrl });
  if (product.prdUrl) externals.push({ kind: "prd", href: product.prdUrl });

  // the strips + the case study: the phone lays them out as one 2-column grid (an odd count lets the case study span)
  const actionCount = (product.pitchVideo ? 1 : 0) + (product.demoVideo ? 1 : 0) + externals.length + 1;

  // TASK-217 tiers, TASK-256, TASK-262 (Tushar 2026-10-18): the primary is the demo (else the pitch, else the case study);
  // every other action is secondary and sits two per row under it. The pitch still autoplays first (TASK-253).
  const primary: "pitch" | "demo" | "case" = product.demoVideo ? "demo" : product.pitchVideo ? "pitch" : "case";
  const tierOf = (action: string): "primary" | "secondary" => (action === primary ? "primary" : "secondary");
  // an odd number of secondaries: the last one spans both grid columns so the grid stays balanced
  const secondaryKeys = [product.pitchVideo ? "pitch" : "", product.demoVideo ? "demo" : "", ...externals.map((e) => e.kind), "case"].filter((k) => k && tierOf(k) === "secondary");
  const spanFor = (key: string) => (secondaryKeys.length % 2 === 1 && secondaryKeys.at(-1) === key ? "full" : undefined);
  const totalLabel = String(total).padStart(2, "0");
  const position = String(product.position).padStart(2, "0");
  const category = (product.tags ?? []).slice(0, 2).join(" · ");
  // TASK-274: the same loop as the carousel (stepIndex wraps), so the arrows are never dead
  const navIndex = nav ? nav.products.findIndex((p) => p.id === product.id) : -1;
  const adjacent = (delta: number) => (nav && navIndex >= 0 ? nav.products[stepIndex(navIndex, delta, nav.products.length)] : undefined);
  const prevProduct = adjacent(-1);
  const nextProduct = adjacent(1);

  // the primary bar spells the video out; a half-width secondary keeps it short so two fit a row
  const mediaButton = (target: MediaMode, label: string, Icon: ActionIcon | typeof Play) => (
    <li>
      <button
        type="button"
        className="pf-action focus-ring"
        data-action={target}
        data-tier={tierOf(target)}
        data-span={spanFor(target)}
        aria-pressed={mode === target}
        aria-controls={stageId}
        onClick={() => onModeChange(target)}
      >
        <StripBody icon={tierOf(target) === "primary" ? Play : Icon} label={tierOf(target) === "primary" ? `${label} video` : label} external={false} />
      </button>
    </li>
  );

  return (
    <Sheet as="div" variant="card" rotate={0.6} className="pf-info">
      {nav && prevProduct && nextProduct ? (
        <div className="pf-info-nav" role="group" aria-label="Browse products">
          <button type="button" className="pf-info-arrow focus-ring" data-nav-key="prev" aria-label={`Previous: ${prevProduct.name}`} onClick={() => nav.onNavigate(prevProduct.id, "prev")}>
            <ChevronLeft aria-hidden="true" focusable="false" strokeWidth={2} />
          </button>
          <button type="button" className="pf-info-arrow focus-ring" data-nav-key="next" aria-label={`Next: ${nextProduct.name}`} onClick={() => nav.onNavigate(nextProduct.id, "next")}>
            <ChevronRight aria-hidden="true" focusable="false" strokeWidth={2} />
          </button>
        </div>
      ) : null}
      <div className="pf-info-head">
      <PhoneTags tags={product.tags} />
      <p className="pf-info-kicker">
        <span className="pf-info-count">
          {position} / {totalLabel}
        </span>
        {category ? <span className="pf-info-category">{category}</span> : null}
      </p>
      <p className="pf-info-meta">
        <span className="pf-info-code">{product.code}</span>
        <span aria-hidden="true">·</span>
        <span className="pf-info-status">{product.meta}</span>
      </p>
      {/* TASK-250 (Tushar 2026-10-18): the product's own logo replaces the name text when it has one (the name stays the accessible name) */}
      <h2 id={headingId} className="pf-info-name" data-logo={product.logo ? "" : undefined}>
        {product.logo ? <ProductLogo name={product.name} logo={product.logo} /> : product.name}
      </h2>
      <p className="pf-info-tagline">{product.tagline}</p>
      <p className="pf-info-desc">{product.description}</p>
      </div>
      {poster ? (
        <span className="pf-info-poster" aria-hidden="true" data-poster={poster.src}>
          <span className="pf-info-poster-frame">
            <Image src={poster.src} alt="" fill sizes="(min-width: 1024px) 440px, 0px" decoding="async" loading="lazy" unoptimized={poster.src.endsWith(".svg")} className="pf-info-poster-img" />
          </span>
        </span>
      ) : null}
      <div className="pf-action-set" data-odd={actionCount % 2 === 1 ? "" : undefined}>
      <StarDivider slot="top" />
      <ul className="pf-actions" aria-label={`${product.name} actions`}>
        {product.demoVideo ? mediaButton("demo", "Watch demo", ACTION_ICON.demo) : null}
        {product.pitchVideo ? mediaButton("pitch", "Watch pitch", ACTION_ICON.demo) : null}
        {externals.map(({ kind, href }) => {
          const def = EXTERNAL[kind];
          return (
            <li key={kind}>
              <a
                className="pf-action focus-ring"
                data-action={kind}
                data-tier={tierOf(kind)}
                data-span={spanFor(kind)}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${def.name(product.name)} (opens in new tab)`}
              >
                <StripBody icon={ACTION_ICON[kind]} label={def.label} external />
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
        data-span={spanFor("case")}
        data-tier={tierOf("case")}
      >
        <span className="pf-action-icon" aria-hidden="true">
          <ACTION_ICON.case aria-hidden="true" focusable="false" strokeWidth={1.75} />
        </span>
        <span className="pf-action-label">
          <span className="pf-case-lead">Read the</span> <span className="pf-case-name">case study</span>
          <NewTabHint />
        </span>
        <ArrowRight className="pf-action-arrow" aria-hidden="true" focusable="false" strokeWidth={1.75} />
      </Link>
      {/* TASK-252 (Tushar 2026-10-18): a subtle star nudge, only where the GitHub strip shows */}
      {product.githubUrl && !poster ? (
        <>
          <StarDivider slot="foot" />
          <StarNote name={product.name} href={product.githubUrl} />
        </>
      ) : null}
      </div>
      {nav ? (
        <div className="pf-info-pager" role="group" aria-label="Product position">
          {nav.products.map((p, index) => (
            <button
              key={p.id}
              type="button"
              className="pf-info-dot focus-ring"
              data-nav-key={`dot-${p.id}`}
              aria-label={`Open ${p.name}, ${index + 1} of ${nav.products.length}`}
              aria-current={p.id === product.id ? "true" : undefined}
              onClick={() => nav.onNavigate(p.id, `dot-${p.id}`)}
            />
          ))}
        </div>
      ) : null}
      {/* TASK-210: the phone's own actions + outcomes (display: none from 640 px up; the strips above are hidden below it) */}
      <PhoneActions product={product} stageId={stageId} onWatch={onWatch} />
      <PhoneOutcomes product={product} />
    </Sheet>
  );
}
