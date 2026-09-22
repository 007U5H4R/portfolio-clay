import { papers, patent, researchDisclaimer } from "@/data/credentials";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ClayCard } from "@/components/clay/ClayCard";
import { ExternalLink } from "@/components/common/ExternalLink";
import { Tag } from "@/components/common/Tag";

/**
 * `/about`'s "Research" section (TKT-42, CONTENT_INVENTORY §4.7): the granted patent (linking out
 * to the Pratyasa record) + the two papers + the rights/safety disclaimer.
 *
 * Truth is the entire point of this component (brief non-negotiables):
 *   - `patent.number` ("IN 429867") is the ONLY patent number ever rendered — the certificate wins
 *     over the résumé's SL No. misprint, which never appears here (data/credentials.ts owns that
 *     fact; this component never re-derives or reformats it).
 *   - A paper with `doi` renders a real `ExternalLink` to `doiHref`; a paper with no `doi` (Soft
 *     Matter — DOI + authors MISSING) renders the static `Tag` "DOI pending", never a link, never a
 *     guessed identifier.
 *   - `researchDisclaimer` renders verbatim, unconditionally.
 *
 * The patent block uses `ClayCard tier="card" tone="lavender"` — the same card-tier/lavender
 * combination `StoryCard` uses for the Experience timeline's expanded cards (Design.md §3), since
 * this is the section's one "proof" artifact worth visually lifting above the plain papers list.
 *
 * Server component: no interactivity.
 */
export function Research() {
  return (
    <Section id="research" aria-labelledby="research-heading">
      <SectionHeading
        id="research-heading"
        eyebrow="Before product management"
        title="Research"
        lead="A granted patent and two peer-reviewed papers from the M.Tech years."
        className="mb-[var(--space-8)]"
      />

      <div className="flex flex-col gap-[var(--space-6)]">
        <ClayCard tier="card" tone="lavender" padding="card" className="flex flex-col gap-[var(--space-3)]">
          <p className="text-[length:var(--text-body)] font-bold text-ink">{patent.title}</p>
          <p className="text-caption text-ink-2">
            Patent {patent.number} · Application {patent.application} · Filed {patent.filed} · Granted{" "}
            {patent.granted}
          </p>
          <p className="text-caption text-ink-2">
            Patentee: {patent.patentee}. Inventors: {patent.inventors.join(", ")}.
          </p>
          <ExternalLink href={patent.href}>View Pratyasa — the patent record</ExternalLink>
        </ClayCard>

        <ul className="flex flex-col gap-[var(--space-5)]">
          {papers.map((paper) => (
            <li key={paper.id} className="flex flex-col gap-[var(--space-2)]">
              <p className="text-[length:var(--text-body)] font-semibold text-ink">{paper.title}</p>
              <p className="text-caption text-ink-2">
                {paper.authors ? `${paper.authors} ` : ""}
                {paper.journal} {paper.year}
                {paper.volumeIssue ? `, ${paper.volumeIssue}` : ""}
              </p>
              {paper.doi && paper.doiHref ? (
                <ExternalLink href={paper.doiHref}>DOI {paper.doi}</ExternalLink>
              ) : (
                <Tag>DOI pending</Tag>
              )}
            </li>
          ))}
        </ul>

        <p className="max-w-[60ch] text-caption text-ink-3">{researchDisclaimer}</p>
      </div>
    </Section>
  );
}
