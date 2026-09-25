import { Container } from "@/components/layout/Container";
import { TornEdge } from "@/components/paper/TornEdge";
import { AskPortfolio } from "./AskPortfolio";

export interface AskSectionProps {
  /** The 5 `surface:'home'` prompts, resolved server-side in app/page.tsx (A1). */
  prompts: string[];
}

/**
 * Home "Ask my portfolio" section (technical-plan.md §F TKT-77 S77.01, Design.md §7.1 Ask, §3.3):
 * `section#ask` on `paper-2` opened by a torn paper edge, a `1fr 1.2fr` grid ≥ 900 px — the eyebrow,
 * h2 and lead on the left (copy verbatim from the pre-M-009 section, Dev-01), the notebook
 * `AskPortfolio` on the right. EVAL-018 unit count = 2: the `torn` edge + the notebook's prompt
 * annotation. The section keeps the 72/96/128 top padding ladder (transparent, above the tear); the
 * `paper-2` body starts at the tear, like the band footer. Server component; the AskProvider is
 * hoisted to app/layout.tsx so the inline surface and the global AskPanel share one context.
 */
export function AskSection({ prompts }: AskSectionProps) {
  return (
    <section id="ask" aria-labelledby="ask-heading" className="ask-section">
      <TornEdge fill="paper-2" />
      <div className="ask-section-body">
        <Container className="ask-section-grid">
          <div className="ask-section-copy">
            <p className="ask-eyebrow">Ask</p>
            <h2 id="ask-heading" className="ask-h2">
              Ask my portfolio
            </h2>
            <p className="ask-lead">Type a question and get a sourced answer drawn only from this site — no live AI.</p>
          </div>
          <AskPortfolio prompts={prompts} />
        </Container>
      </div>
    </section>
  );
}
