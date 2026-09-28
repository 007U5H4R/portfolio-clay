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
 * Section 2 — Enterprise & Client Work (TASK-116, spec §25–§42, §47, §52; TASK-127 fidelity spec
 * §20–§24). Deliberately quieter than Section 1: a chapter break of two layered torn page edges onto
 * the cooler, ruled dossier paper (`paper-2`), a restrained one-line intro, one subtle "inside larger
 * systems" annotation, and a 3 × 2 grid (2 at tablet, 1 on phones) of case files.
 *
 * Each card is content paper (`data-paper="card"`, not counted) clipped into a manila folder: the
 * folder's tab carries a neutral "Case file 0N" stamp (says nothing factual), then client (h3),
 * program, a 1–2 sentence summary, the grouped sub-projects (names only — the detail stays in
 * `data/enterprise.ts`), 4–6 tags, and a quiet file foot (role · dates, then the source line) — a plain
 * `div`, not a `<footer>`: each route keeps exactly one footer, the band (layout.spec). The
 * folder, paperclip and tab are the card's own CSS material. No "Open case file →" CTA: no detail
 * page exists, so it would be a dead link (spec §34).
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
                <span className="pf-case-clip" aria-hidden="true" />
                <p className="pf-case-stamp">Case file {String(index + 1).padStart(2, "0")}</p>
                <h3 className="pf-case-client">{item.client}</h3>
                <p className="pf-case-program">{item.program}</p>
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
                <div className="pf-case-foot">
                  <p className="pf-case-role">
                    {item.role} · {formatRange(item.period)}
                  </p>
                  <p className="pf-case-source">Source: {sourceLine(item.sources)}</p>
                </div>
              </Sheet>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
