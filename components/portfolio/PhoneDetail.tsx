"use client";

import Link from "next/link";
import { ArrowUpRight, BookOpen, ChevronLeft, FileText, GitBranch, Link2, Play, Video, type LucideIcon } from "lucide-react";
import type { MediaMode, PortfolioMetric, PortfolioProduct, ProductLogo as ProductLogoFiles } from "@/lib/portfolio";
import { ProductLogo } from "./ProductLogo";

/**
 * The phone project detail's own pieces (TASK-210; < 640 px only — every `.pf-m-*` block is `display: none` above).
 * The detail is the existing `/projects?product=<id>` view; these sit beside the desktop panel's DOM and are shown
 * instead of it on a phone. Everything here is read from the project record: no number, link or video is invented.
 */

/** Back bar: the one way out of a detail on a phone. Name is the product's; TASK-250: its own logo stands in for the name text when it has one. */
export function PhoneDetailBar({ name, logo, onBack }: { name: string; logo?: ProductLogoFiles | undefined; onBack: () => void }) {
  return (
    <div className="pf-m-bar">
      <button type="button" className="pf-m-back focus-ring" onClick={onBack} aria-label="Back to portfolio">
        <ChevronLeft aria-hidden="true" focusable="false" strokeWidth={2} />
        <span>Portfolio</span>
      </button>
      <p className="pf-m-bar-title" aria-hidden="true" data-logo={logo ? "" : undefined}>
        {logo ? <ProductLogo name={name} logo={logo} /> : name}
      </p>
    </div>
  );
}

/** The project's own tags, as a compact row above the title. */
export function PhoneTags({ tags }: { tags: readonly string[] | undefined }) {
  if (!tags || tags.length === 0) return null;
  return (
    <ul className="pf-m-detail-tags" aria-label="Tags">
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}

interface LinkDef {
  key: string;
  label: string;
  Icon: LucideIcon;
  href: string;
}

/**
 * Action hierarchy: primary "Watch demo" (or "Watch pitch" when only a pitch exists) only when a real video exists;
 * secondary Case study, Live product (real URL only), the other video, GitHub (public repo only), PRD. Nothing that
 * has nothing behind it is rendered. Each tap target is ≥ 44 px (`.pf-m-btn`).
 */
export function PhoneActions({
  product,
  stageId,
  onWatch,
}: {
  product: PortfolioProduct;
  stageId: string;
  onWatch: (mode: MediaMode) => void;
}) {
  const primary: MediaMode | null = product.demoVideo ? "demo" : product.pitchVideo ? "pitch" : null;
  const other: MediaMode | null = primary === "demo" && product.pitchVideo ? "pitch" : null;

  const links: LinkDef[] = [{ key: "case", label: "Case study", Icon: BookOpen, href: product.caseStudyHref }];
  if (product.productUrl) links.push({ key: "live", label: "Live product", Icon: Link2, href: product.productUrl });
  if (product.githubUrl) links.push({ key: "github", label: "GitHub", Icon: GitBranch, href: product.githubUrl });
  if (product.prdUrl) links.push({ key: "prd", label: "PRD", Icon: FileText, href: product.prdUrl });

  const count = links.length + (other ? 1 : 0);
  return (
    <div className="pf-m-actions" role="group" aria-label={`${product.name} actions`}>
      {primary ? (
        <button type="button" className="pf-m-btn pf-m-primary focus-ring" data-action="watch" data-mode={primary} aria-controls={stageId} onClick={() => onWatch(primary)}>
          <Play aria-hidden="true" focusable="false" strokeWidth={2} />
          <span>{primary === "demo" ? "Watch demo" : "Watch pitch"}</span>
        </button>
      ) : null}
      <div className="pf-m-secondary" data-odd={count % 2 === 1 ? "" : undefined}>
        {links.map((link) => {
          const body = (
            <>
              <link.Icon aria-hidden="true" focusable="false" strokeWidth={1.75} />
              <span>{link.label}</span>
              <ArrowUpRight className="pf-m-ext" aria-hidden="true" focusable="false" strokeWidth={1.75} />
              <span className="sr-only"> (opens in a new tab)</span>
            </>
          );
          const props = { target: "_blank", rel: "noopener noreferrer", className: "pf-m-btn focus-ring", "data-action": link.key } as const;
          return link.key === "case" ? (
            <Link key={link.key} href={link.href} {...props}>
              {body}
            </Link>
          ) : (
            <a key={link.key} href={link.href} {...props}>
              {body}
            </a>
          );
        })}
        {other ? (
          <button type="button" className="pf-m-btn focus-ring" data-action="watch" data-mode={other} aria-controls={stageId} onClick={() => onWatch(other)}>
            <Video aria-hidden="true" focusable="false" strokeWidth={1.75} />
            <span>Watch pitch</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}

const KIND_LABEL: Record<PortfolioMetric["kind"], string> = {
  measured: "Measured",
  structural: "Structural",
  "self-reported": "Self-reported",
};

/**
 * "Key outcomes" ONLY from the project record's own metrics (value + label verbatim, each tagged with how it was
 * evidenced); a project with none shows its role and build window instead (its status is the summary's last line), never a placeholder number.
 */
export function PhoneOutcomes({ product }: { product: PortfolioProduct }) {
  const metrics = product.metrics ?? [];
  const facts: { label: string; value: string }[] = [];
  if (product.role) facts.push({ label: "Role", value: product.role });
  if (product.duration) facts.push({ label: "Built", value: product.duration });
  const headingId = `pf-m-outcomes-${product.id}`;
  if (metrics.length === 0 && facts.length === 0) return null;
  return (
    <section className="pf-m-outcomes m-solid" aria-labelledby={headingId}>
      <h3 id={headingId} className="pf-m-h3">
        {metrics.length > 0 ? "Key outcomes" : "At a glance"}
      </h3>
      {metrics.length > 0 ? (
        <ul className="pf-m-metrics">
          {metrics.map((metric) => (
            <li key={metric.label}>
              <span className="pf-m-metric-value">{metric.value}</span>
              <span className="pf-m-metric-label">{metric.label}</span>
              <span className="pf-m-metric-kind" data-kind={metric.kind}>
                {KIND_LABEL[metric.kind]}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      {facts.length > 0 ? (
        <dl className="pf-m-facts">
          {facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
