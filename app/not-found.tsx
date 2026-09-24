import { ClayButton } from "@/components/clay/ClayButton";
import { ClayCard } from "@/components/clay/ClayCard";
import { Section } from "@/components/layout/Section";

/**
 * `app/not-found.tsx` (TKT-46, M-006) — the site-wide 404. Next's App Router renders this file
 * for any unmatched path (and for an explicit `notFound()` call, e.g. `app/work/[slug]/page.tsx`
 * on an unknown slug) INSIDE the root layout (`app/layout.tsx`), so `Header`/`Footer`/`SkipLink`/
 * `AskProvider` are inherited for free — nothing is duplicated here. The framework also sets the
 * HTTP 404 status itself for both paths; this file only supplies the content.
 *
 * One centred hero-tier `ClayCard` (same "flat page, one clay tile" shape `ContactCard` already
 * established for `/contact`), with a real `h1` (TKT-43 a11y scar: a heading-size token demands a
 * real heading element at a skip-free level — this page's own h1 is the only heading here, so the
 * outline stays clean) and three ways back: `/`, `/work`, `/contact`. No motion beyond the shared
 * `ClayButton` hover/press physics, which already collapse under `motion-reduce` — nothing here
 * autoplays. Static/server-rendered, same as every other route (TP1): no client data-fetching.
 */
export default function NotFound() {
  return (
    <Section id="not-found" aria-label="Page not found">
      <ClayCard
        tier="hero"
        tone="peach"
        padding="hero"
        className="mx-auto flex max-w-[640px] flex-col items-center gap-[var(--space-6)] text-center"
      >
        <h1 className="text-[length:var(--text-h2)] font-extrabold tracking-[var(--tracking-hero)] text-navy">
          This page wandered off.
        </h1>
        <p className="text-[length:var(--text-lead)] text-navy-2">
          Whatever you were looking for isn&apos;t at this address. Here are a few places that are still there.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-[var(--space-3)]">
          <ClayButton variant="primary" href="/">
            Back home
          </ClayButton>
          <ClayButton variant="secondary" href="/work">
            See the work
          </ClayButton>
          <ClayButton variant="secondary" href="/contact">
            Get in touch
          </ClayButton>
        </div>
      </ClayCard>
    </Section>
  );
}
