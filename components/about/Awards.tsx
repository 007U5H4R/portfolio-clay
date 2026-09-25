import { awards } from "@/data/credentials";
import { Sheet } from "@/components/paper";

/**
 * Awards (TKT-42 → TKT-87, Design.md §7.4, CONTENT_INVENTORY §4.6) — the first `band` row of the
 * `/about` proof section (the enclosing `<section>` lives in `app/about/page.tsx`; this is a
 * labelled region inside it, so it adds no counting unit). Three résumé awards verbatim, each on a
 * kraft eyelet tag (`Sheet variant="tag"`, content paper — not counted). Text only: the underlying
 * certificates are not digitised; the two banner-only credential claims §4.6 flags are never added.
 * Server component.
 */
const TILT = [-0.9, 0.8, -0.6] as const;

export function Awards() {
  return (
    <div id="awards" role="region" aria-labelledby="awards-heading" className="proof-band">
      <div className="proof-head">
        <p className="proof-eyebrow" data-micro-label="">Recognition</p>
        <h2 id="awards-heading">Awards</h2>
        <p className="proof-lead">Text only — the underlying certificates aren&apos;t digitised yet.</p>
      </div>
      <ul className="proof-awards">
        {awards.map((award, i) => (
          <li key={award.id}>
            <Sheet variant="tag" rotate={TILT[i % TILT.length]} className="proof-award">
              <b>{award.year}</b>
              <span>{award.title}</span>
            </Sheet>
          </li>
        ))}
      </ul>
    </div>
  );
}
