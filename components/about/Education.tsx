import { education, languages } from "@/data/credentials";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";

/**
 * `/about`'s final "Education" section (TKT-42, CONTENT_INVENTORY §4.8, LAST section on the
 * page). Two degrees, verbatim, plus the optional languages line (RESUME Personal Details —
 * languages are not PII).
 *
 * Flat text list (Design.md's flat-tier idiom) rather than another clay grid — two rows don't need
 * the tile treatment `Awards`/`CapabilityClusters` use for 3–4 items.
 *
 * Server component: no interactivity.
 */
export function Education() {
  return (
    <Section id="education" aria-labelledby="education-heading">
      <SectionHeading
        id="education-heading"
        eyebrow="Foundation"
        title="Education"
        className="mb-[var(--space-8)]"
      />

      <ul className="flex flex-col gap-[var(--space-5)]">
        {education.map((entry) => (
          <li key={entry.id} className="flex flex-col gap-[var(--space-1)]">
            <p className="text-[length:var(--text-body)] font-semibold text-navy">{entry.degree}</p>
            <p className="text-caption text-navy-2">
              {entry.institution} · {entry.year}
            </p>
          </li>
        ))}
      </ul>

      {languages.length > 0 ? (
        <p className="mt-[var(--space-6)] text-caption text-ink-soft">Languages: {languages.join(", ")}.</p>
      ) : null}
    </Section>
  );
}
