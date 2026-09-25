import { education, languages } from "@/data/credentials";

/**
 * Education (TKT-42 → TKT-87, Design.md §7.4, CONTENT_INVENTORY §4.8) — the third `band` row of the
 * `/about` proof section: two degrees verbatim on a kraft left rule, then the languages line in
 * Inter (Dev-04 — not Caveat; languages are not PII). Server component.
 */
export function Education() {
  return (
    <div id="education" role="region" aria-labelledby="education-heading" className="proof-band">
      <div className="proof-head">
        <p className="proof-eyebrow">Foundation</p>
        <h2 id="education-heading">Education</h2>
      </div>
      <div>
        <ul className="proof-edu">
          {education.map((entry) => (
            <li key={entry.id}>
              <h3>{entry.degree}</h3>
              <p>
                {entry.institution} · {entry.year}
              </p>
            </li>
          ))}
        </ul>
        {languages.length > 0 ? <p className="proof-langs">Languages: {languages.join(", ")}.</p> : null}
      </div>
    </div>
  );
}
