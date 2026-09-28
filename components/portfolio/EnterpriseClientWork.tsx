import type { EnterpriseCase } from "@/data/schema";
import { Container } from "@/components/layout/Container";
import { Annotation, Sheet, TornEdge } from "@/components/paper";
import { formatRange } from "@/lib/format";

export interface EnterpriseClientWorkProps {
  cases: readonly EnterpriseCase[];
}

/** "Project Manager portfolio V2.0, p. 1 · Résumé, p. 3" — titles and pages, never a file path. */
function sourceLine(sources: EnterpriseCase["sources"]): string {
  const byDoc = new Map<string, number[]>();
  for (const { document, page } of sources) byDoc.set(document, [...(byDoc.get(document) ?? []), page]);
  return [...byDoc.entries()]
    .map(([doc, pages]) => {
      const consecutive = pages.length === 2 && pages[1] === (pages[0] ?? 0) + 1;
      return `${doc}, ${pages.length > 1 ? "pp." : "p."} ${pages.join(consecutive ? "–" : ", ")}`;
    })
    .join(" · ");
}

/**
 * Section 2 — Enterprise & Client Work (TASK-116, spec §25–§42, §47, §52). Deliberately quieter than
 * Section 1: a torn seam onto the darker, ruled dossier paper (`paper-2`, spec §41), a restrained
 * intro, one subtle "inside larger systems" annotation, and a 3 × 2 grid of case-file cards.
 *
 * Each card is content paper (`data-paper="card"`, not counted): a stamped case-file label, client
 * (h3), program, role + dates, a 1–2 sentence summary, the grouped sub-projects (TASK-121 rectify
 * spec §11.3: names only — the per-workstream detail stays in `data/enterprise.ts`, so the cards read
 * as compact case files, not résumés), 4–6 tags and its source line. The paperclip and torn corner are the card's own CSS material. No "Open case file →" CTA:
 * no detail page exists, so it would be a dead link (spec §34).
 *
 * EVAL-018 (Design.md §3.3 `/projects` enterprise): torn · annotation = 2.
 */
export function EnterpriseClientWork({ cases }: EnterpriseClientWorkProps) {
  return (
    <section id="enterprise" className="pf-enterprise" aria-labelledby="pf-enterprise-h">
      <TornEdge fill="paper-2" />
      <Container className="pf-ent-wrap">
        <header className="pf-ent-intro">
          <p className="pf-eyebrow">Enterprise &amp; client work</p>
          <h2 id="pf-enterprise-h" className="pf-ent-h">
            Projects built inside larger systems.
          </h2>
          <p className="pf-ent-sub">
            Cloud, data, APIs, healthcare, analytics and ML programs delivered across enterprise environments.
          </p>
          <Annotation arrow="down" rotate={-2} className="pf-ent-note">
            inside larger systems
          </Annotation>
        </header>
        <ol className="pf-cases" aria-label="Enterprise case files">
          {cases.map((item, index) => (
            <li key={item.id} className="pf-case-item">
              <Sheet as="article" variant="card" className="pf-case">
                <p className="pf-case-stamp">Case file {String(index + 1).padStart(2, "0")}</p>
                <h3 className="pf-case-client">{item.client}</h3>
                <p className="pf-case-program">{item.program}</p>
                <p className="pf-case-role">
                  {item.role} · {formatRange(item.period)}
                </p>
                <p className="pf-case-summary">{item.summary}</p>
                {item.workstreams.length > 0 ? (
                  <ul className="pf-case-streams" aria-label="Sub-projects">
                    {item.workstreams.map((stream) => (
                      <li key={stream.name}>{stream.name}</li>
                    ))}
                  </ul>
                ) : null}
                <ul className="pf-case-tags" aria-label="Tags">
                  {item.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <p className="pf-case-source">Source: {sourceLine(item.sources)}</p>
              </Sheet>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
