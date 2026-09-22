import { awards } from "@/data/credentials";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { ClayTile } from "@/components/clay/ClayTile";

/**
 * `/about`'s "Awards" section (TKT-42, CONTENT_INVENTORY §4.6). Renders the 3 résumé awards
 * verbatim — text only, since the underlying certificates are MISSING; the two banner-only
 * credential claims §4.6 calls out as "Not in RESUME" are excluded (see `data/credentials.ts`
 * header — never added here).
 *
 * Same utility-tile grid idiom as `CapabilityClusters` (Design.md §3's shared "What I Bring"
 * primitive: `ClayTile` utility tier, `!h-auto !w-full` relaxing the fixed-square default so each
 * tile fits a title + year instead of an icon).
 *
 * Server component: no interactivity.
 */
export function Awards() {
  return (
    <Section id="awards" aria-labelledby="awards-heading">
      <SectionHeading
        id="awards-heading"
        eyebrow="Recognition"
        title="Awards"
        lead="Text only — the underlying certificates aren't digitised yet."
        className="mb-[var(--space-8)]"
      />

      <div className="grid grid-cols-1 gap-[var(--space-5)] sm:grid-cols-3">
        {awards.map((award) => (
          <ClayTile
            key={award.id}
            tier="utility"
            tone="butter"
            className="!h-auto !w-full flex-col items-start gap-[var(--space-2)] p-[var(--space-5)] text-left"
          >
            <span className="text-[length:var(--text-body)] font-bold text-ink">{award.title}</span>
            <span className="text-caption text-ink-2">{award.year}</span>
          </ClayTile>
        ))}
      </div>
    </Section>
  );
}
