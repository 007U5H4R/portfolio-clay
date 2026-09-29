import Link from "next/link";
import { ArrowRight, ArrowUpRight, GitBranch, Globe, LayoutGrid, PlayCircle } from "lucide-react";
import type { CaseAction } from "@/components/case-study/system/CaseStudyCTA";

const ICON = { live: Globe, pitch: PlayCircle, demo: PlayCircle, github: GitBranch } as const;

/**
 * The closing paper strips (TASK-130 redesign brief §49). Only real links: the record's public
 * actions (new tab, "(opens in a new tab)") plus the product's own Portfolio entry (same tab). A
 * product with no public live URL or repo still gets its Portfolio strip — never a fabricated link.
 */
export function JournalCta({ actions, portfolioHref, name, meta }: { actions: readonly CaseAction[]; portfolioHref: string; name: string; meta: readonly string[] }) {
  return (
    <section className="csx-cta jx-cta" aria-labelledby="cta-h">
      <div className="jx-cta-in">
        <h2 id="cta-h" className="sr-only">
          Links and next steps
        </h2>
        <ul className="jx-strips">
          {actions.map((action) => {
            const Icon = ICON[action.kind];
            return (
              <li key={action.kind}>
                <a href={action.href} target="_blank" rel="noopener noreferrer" className="jx-strip focus-ring" data-action={action.kind}>
                  <Icon aria-hidden="true" focusable="false" size={24} strokeWidth={1.7} />
                  <span className="jx-strip-text">
                    <span className="jx-strip-label">{action.label}</span>
                    <span className="jx-strip-hint">{action.hint}</span>
                  </span>
                  <ArrowUpRight aria-hidden="true" focusable="false" size={18} strokeWidth={1.8} />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            );
          })}
          <li>
            <Link href={portfolioHref} className="jx-strip focus-ring" data-action="portfolio">
              <LayoutGrid aria-hidden="true" focusable="false" size={24} strokeWidth={1.7} />
              <span className="jx-strip-text">
                <span className="jx-strip-label">Portfolio</span>
                <span className="jx-strip-hint">{`${name} on the Portfolio page`}</span>
              </span>
              <ArrowRight aria-hidden="true" focusable="false" size={18} strokeWidth={1.8} />
            </Link>
          </li>
        </ul>
        <p className="csx-meta jx-meta">
          {meta.map((item, index) => (
            <span key={item}>
              {index > 0 ? <span aria-hidden="true"> · </span> : null}
              {item}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
