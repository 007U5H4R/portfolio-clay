import type { ReactNode } from "react";
import { ArrowUpRight, GitBranch, Globe, PlayCircle } from "lucide-react";
import { Container } from "@/components/layout/Container";

export interface CaseAction {
  kind: "live" | "pitch" | "demo" | "github";
  label: string;
  hint: string;
  href: string;
}

const ICON = { live: Globe, pitch: PlayCircle, demo: PlayCircle, github: GitBranch } as const;

/**
 * Spec §43: a compact action strip — only links that exist and are public (live product, YouTube
 * pitch/demo, a public repo); every one opens in a new tab. A one-line meta row carries the minor
 * facts moved out of the hero (spec §6): role · dates · status.
 */
export function CaseStudyCTA({ actions, meta, children }: { actions: readonly CaseAction[]; meta: readonly string[]; children?: ReactNode }) {
  return (
    <section className="csx-cta" aria-labelledby="cta-h">
      <Container className="csx-cta-in">
        <h2 id="cta-h" className="sr-only">
          Links and next steps
        </h2>
        {children}
        {actions.length > 0 ? (
          <ul className="csx-actions">
            {actions.map((action) => {
              const Icon = ICON[action.kind];
              return (
                <li key={action.kind}>
                  <a href={action.href} target="_blank" rel="noopener noreferrer" className="csx-action focus-ring" data-action={action.kind}>
                    <Icon aria-hidden="true" focusable="false" size={22} strokeWidth={1.7} className="csx-action-icon" />
                    <span className="csx-action-text">
                      <span className="csx-action-label">{action.label}</span>
                      <span className="csx-action-hint">{action.hint}</span>
                    </span>
                    <ArrowUpRight aria-hidden="true" focusable="false" size={16} strokeWidth={1.8} />
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              );
            })}
          </ul>
        ) : null}
        <p className="csx-meta">
          {meta.map((item, index) => (
            <span key={item}>
              {index > 0 ? <span aria-hidden="true"> · </span> : null}
              {item}
            </span>
          ))}
        </p>
      </Container>
    </section>
  );
}
