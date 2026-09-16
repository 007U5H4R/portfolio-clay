import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";
import { CopyButton } from "@/components/common/CopyButton";
import { Section } from "@/components/layout/Section";
import { site, resumeAction } from "@/lib/site";

/**
 * FinalCTA — the home page's closing call-to-action section (TKT-14; technical-plan.md §B S14.01,
 * Design.md §3 ContactCard DNA). Server component; the only interactive leaf is `CopyButton`.
 *
 * A single centered hero-tier `ClayCard` (the site's largest radius, `lavender` tone — the section's
 * one accent per Design.md §3), holding the closing headline and the three conversion actions the
 * plan names: copy-the-email (`CopyButton`), "Let's Talk" → `/contact`, and the resume control
 * (derived from `resumeAction()` so it tracks the single PB5 source of truth, never hard-coded).
 * The `/contact` page (TKT-45) reuses the same action set in its own `ContactCard`.
 *
 * COPY PROVENANCE: the headline "Building something AI-native? Let's talk." is editorial framing
 * from technical-plan.md §B S14.01, not a line Tushar has signed off, so it is DRAFT-labelled (the
 * same convention `HowIThink` uses for its unsigned principle lines) — no fabricated claims, and
 * the draft status is visible until sign-off.
 */
export function FinalCTA() {
  const resume = resumeAction();

  return (
    <Section id="cta" aria-labelledby="cta-heading">
      <ClayCard
        tier="hero"
        tone="lavender"
        padding="hero"
        className="mx-auto flex max-w-[640px] flex-col items-center gap-[var(--space-6)] text-center"
      >
        <div className="flex flex-col items-center gap-[var(--space-3)]">
          <h2
            id="cta-heading"
            className="max-w-[20ch] text-[length:var(--text-h2)] font-extrabold text-ink"
          >
            Building something AI-native? Let&apos;s talk.
          </h2>
          <p className="max-w-[44ch] text-[length:var(--text-lead)] text-ink-2">
            Copy my email, drop me a line, or grab my resume — whichever is easiest.
          </p>
        </div>

        {/* The three actions (12px gaps, all ≥44×44 — Design.md §3 / Fitts's Law), wrapping to a
            stacked column below the card's inner width. */}
        <div className="flex flex-wrap items-start justify-center gap-[var(--space-3)]">
          <CopyButton value={site.email} />
          <ClayButton variant="primary" href="/contact">
            Let&apos;s Talk
          </ClayButton>
          <ClayButton variant="secondary" href={resume.href} download={resume.download} title={resume.note}>
            {resume.label}
          </ClayButton>
        </div>

        {/* DRAFT provenance marker (see docstring) — unsigned closing copy, same convention as HowIThink. */}
        <div className="flex flex-wrap items-center justify-center gap-[var(--space-2)]">
          <span className="inline-flex items-center rounded-[var(--radius-utility)] bg-butter/50 px-[var(--space-2)] py-[2px] text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink">
            Draft
          </span>
          <span className="text-caption text-ink-3">Closing copy is my framing, not yet signed off.</span>
        </div>
      </ClayCard>
    </Section>
  );
}
