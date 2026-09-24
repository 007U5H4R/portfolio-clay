import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";
import { CopyButton } from "@/components/common/CopyButton";
import { resumeAction, site } from "@/lib/site";

/**
 * ContactCard (TKT-45; Design.md §3 Contact, SITEMAP.md line 16, CONTENT_INVENTORY §7) — the
 * entire content of `/contact`: a single centred hero-tier lavender `ClayCard` (max 640px) with
 * four reach-out actions. No form (decision S10).
 *
 * The headline "Still curious?" is rendered as this page's own `h1` — the same flat-hero
 * convention `PlaygroundHero`/`WorkHero` use (one page, one hero heading, verbatim-matching the
 * OG title already shipped in `app/contact/opengraph-image.tsx`) — rather than nesting it under a
 * separate generic page heading. That keeps the outline a single, skip-free `h1` (TKT-43 a11y
 * scar: any title styled with a heading-size token must be a real heading at the correct level).
 *
 * Actions (2×2 grid ≥768px / stacked <768px, 12px gaps — `--space-3` — all ≥44×44, Fitts's Law):
 *   1. `CopyButton` — copies `site.email`; idle → copied (2s) → error with a selectable-text
 *      fallback (component-owned, never silent — TKT-14).
 *   2. `mailto:` `ClayButton` — a real one-click fallback for a blocked clipboard.
 *   3. LinkedIn `ClayButton` — `external`, so it carries `target=_blank rel="noopener noreferrer"`
 *      and a VisuallyHidden "(opens in new tab)" note (ClayButton's own `external` contract).
 *   4. Resume `ClayButton` — derived from `resumeAction()` (PB5, `lib/site.ts`), the single source
 *      of truth: renders the placeholder label + the "email me for a copy" note (visible, not just
 *      a tooltip) while `site.resumeAvailable` is `false`, and a real `download` link once TKT-08
 *      flips the flag. Never hard-codes a resume href.
 *
 * `id="resume"` sits on the resume action itself (not the whole card) — it is the exact anchor
 * every placeholder resume link across the site (`Hero`, `Footer`, `FinalCTA`, `MobileMenu`)
 * points at via `resumeAction()`'s placeholder `href` of `/contact#resume`; `scroll-mt-32` keeps it
 * clear of the sticky header on a deep link.
 *
 * Email / LinkedIn / city are verbatim from CONTENT_INVENTORY §7 — no phone, no DOB, no street
 * address (EXE-8).
 */
export function ContactCard() {
  const resume = resumeAction();

  return (
    <ClayCard
      tier="hero"
      tone="lavender"
      padding="hero"
      className="mx-auto flex max-w-[640px] flex-col items-center gap-[var(--space-6)] text-center"
    >
      <h1 className="text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-navy">
        Still curious?
      </h1>

      {/* data-contact-actions: stable test hook (same convention as CopyButton's data-copy-button)
          for asserting the 2×2/stacked grid's 12px gap directly, rather than re-deriving it from
          bounding boxes. */}
      <div
        data-contact-actions=""
        className="grid w-full grid-cols-1 justify-items-center gap-[var(--space-3)] md:grid-cols-2"
      >
        <CopyButton value={site.email} />

        <ClayButton variant="secondary" href={`mailto:${site.email}`}>
          Email me
        </ClayButton>

        <ClayButton variant="secondary" href={site.linkedin} external>
          LinkedIn
        </ClayButton>

        <div id="resume" className="flex scroll-mt-32 flex-col items-center gap-[var(--space-2)]">
          <ClayButton
            variant="secondary"
            href={resume.href}
            download={resume.download}
            title={resume.note}
          >
            {resume.label}
          </ClayButton>
          {resume.note ? <p className="max-w-[28ch] text-caption text-ink-soft">{resume.note}</p> : null}
        </div>
      </div>

      <p className="text-[length:var(--text-body)] text-navy-2">Bengaluru, India</p>
    </ClayCard>
  );
}
