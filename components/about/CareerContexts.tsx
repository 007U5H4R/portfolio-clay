import type { CSSProperties, ReactNode } from "react";
import { Container } from "@/components/layout/Container";
import { Reveal } from "@/components/interactions/Reveal";
import { TornEdge } from "@/components/paper";
import { CAREER_HEAD, ERAS, type Era } from "./about-content";

/** A small hand-drawn icon per era (spec §18) — ink strokes in `currentColor`, decorative. */
const ICONS: Record<Era["id"], ReactNode> = {
  // a flask over a bench line (research)
  research: (
    <>
      <path d="M13 5h10M15.5 5v9L8 27.5c-.8 1.6.3 3.5 2.1 3.5h15.8c1.8 0 2.9-1.9 2.1-3.5L20.5 14V5" />
      <path d="M11 22.5c3.6-1.4 6.8 1.2 14 0" />
      <circle cx="16" cy="26.5" r="1.2" />
      <circle cx="21" cy="25" r="1" />
    </>
  ),
  // a cloud over a database (cloud & data)
  cloud: (
    <>
      <path d="M10 17.5c-3 0-5-2-5-4.6 0-2.5 2-4.5 4.6-4.5.8-3 3.4-5 6.6-5 3.8 0 6.6 2.9 6.8 6.4 2.5.2 4.2 2 4.2 4.1 0 2.2-1.9 3.6-4.2 3.6" />
      <ellipse cx="18" cy="21" rx="6.5" ry="2.2" />
      <path d="M11.5 21v8.2c0 1.2 2.9 2.2 6.5 2.2s6.5-1 6.5-2.2V21M11.5 25.2c0 1.2 2.9 2.2 6.5 2.2s6.5-1 6.5-2.2" />
    </>
  ),
  // three linked blocks (enterprise platforms)
  enterprise: (
    <>
      <rect x="4" y="5" width="11" height="9" rx="1.5" />
      <rect x="21" y="5" width="11" height="9" rx="1.5" />
      <rect x="12.5" y="22" width="11" height="9" rx="1.5" />
      <path d="M15 9.5h6M9.5 14v4.5h8.5V22M26.5 14v4.5H18" />
    </>
  ),
  // a spark over a small chip (AI products)
  ai: (
    <>
      <rect x="9" y="14" width="18" height="16" rx="2.5" />
      <path d="M13 14v-3M18 14v-3M23 14v-3M13 30v3M18 30v3M23 30v3M9 19H6M9 25H6M27 19h3M27 25h3" />
      <path d="M18 17.5l1.4 3.1 3.1 1.4-3.1 1.4-1.4 3.1-1.4-3.1-3.1-1.4 3.1-1.4z" />
    </>
  ),
};

/**
 * CAREER ACROSS CONTEXTS (TASK-136, spec §12–§18) — a compact conceptual strip of eras, not employers:
 * Research & Engineering → Cloud & Data → Enterprise Platforms → AI Products. `section#career` on `paper`
 * under its torn edge. One ordered list: per era a small hand-drawn icon, the name (h3), one descriptor,
 * a few words of focus and small context references (the real employers / research roots — no dates, no
 * responsibilities: Experience owns those). A thin hand-drawn thread with milestone dots runs behind the
 * eras (horizontal ≥ 900, vertical at the left < 900) and draws left → right once on entry (spec §57).
 * No second vertical employment timeline.
 *
 * EVAL-018: torn · the thread `sketch` = 2 (the icons are list chrome, `aria-hidden`).
 */
export function CareerContexts() {
  return (
    <section id="career" aria-labelledby="career-heading" className="crx">
      <TornEdge fill="paper" />
      <div className="crx-body">
        <Container className="crx-wrap">
          <div className="ab-head">
            <div>
              <p className="ab-eyebrow">{CAREER_HEAD.eyebrow}</p>
              <h2 id="career-heading" className="ab-h2">
                {CAREER_HEAD.title}
              </h2>
            </div>
          </div>
          <Reveal className="crx-strip">
            <svg className="sketch crx-thread" data-decor="sketch" data-sketch="thread" viewBox="0 0 1000 40" preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <path pathLength={1} d="M6 22 C 120 12, 230 30, 340 20 S 560 12, 670 22 S 880 30, 994 18" />
            </svg>
            <ol className="crx-list">
              {ERAS.map((era, index) => (
                <li key={era.id} className="crx-era" data-era={era.id} style={{ "--era-i": index } as CSSProperties}>
                  <span className="crx-dot" aria-hidden="true" />
                  <svg className="crx-icon" viewBox="0 0 36 36" aria-hidden="true" focusable="false">
                    {ICONS[era.id]}
                  </svg>
                  <h3 className="crx-name">{era.name}</h3>
                  <p className="crx-desc">{era.descriptor}</p>
                  <p className="crx-focus">{era.focus}</p>
                  <p className="crx-refs">{era.refs}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </div>
    </section>
  );
}
