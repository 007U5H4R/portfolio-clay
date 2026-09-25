import Link from "next/link";
import { Section } from "@/components/layout/Section";
import { Sketch } from "@/components/paper/Sketch";

/**
 * `app/not-found.tsx` (TSK-47, TKT-88, M-009 — Design.md §4.3) — the site-wide 404. Next's App
 * Router renders this file, inside the root layout, for any unmatched path and for an explicit
 * `notFound()` call elsewhere (e.g. `app/work/[slug]/page.tsx` on an unknown slug), and sets the
 * HTTP 404 status itself — this file only supplies the content. `Header`/`BandFooter`/`SkipLink`
 * are inherited from `app/layout.tsx`, so nothing here duplicates them (TC-171 step 2's "exactly
 * one footer" holds for free).
 *
 * One flat `paper` `<section>` (the site's default background — no `data-paper` override, per
 * Design.md §4.3): eyebrow "Lost?" (plain label, deliberately NOT the `Annotation` component —
 * §4.3 calls it "annotation-free"), h1, a short lead, and three ways back. The pencil-and-tape
 * `tools` sketch is REUSED verbatim from `/playground` (`components/paper/sketch-paths.ts`) — no
 * new illustration spend (§12.4) — and is this section's only counted decoration (TC-171 step 2).
 * It hides below `lg` (1024px), mirroring the same sketch's own `display:none` breakpoint on the
 * `/playground` bench board mockup, so it never risks overflow at 390 (TC-171 step 4).
 */
export default function NotFound() {
  return (
    <Section
      aria-label="Page not found"
      containerClassName="grid items-center gap-[var(--space-8)] lg:grid-cols-[1fr_auto]"
    >
      <div className="flex max-w-[52ch] flex-col gap-[var(--space-4)]">
        <span className="inline-flex w-fit items-center gap-[var(--space-2)] rounded-[var(--radius-pill)] bg-ivory px-[var(--space-4)] py-[var(--space-2)] text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy-2 shadow-[var(--shadow-paper)]">
          <span aria-hidden="true" className="inline-block h-2 w-2 rounded-full bg-rust" />
          Lost?
        </span>
        <h1 className="text-[length:clamp(42px,5.2vw,76px)] font-extrabold tracking-[var(--tracking-hero)] text-navy">
          This page wandered off.
        </h1>
        <p className="text-[length:var(--text-lead)] text-navy-2">
          Whatever you were looking for isn&apos;t at this address. Here are a few places that are still there.
        </p>
        <div className="mt-[var(--space-2)] flex flex-wrap items-center gap-[var(--space-4)]">
          <Link
            href="/"
            data-hand="cta"
            className="focus-ring inline-flex min-h-[44px] items-center rounded-[var(--radius-pill)] bg-rust px-[var(--space-5)] font-hand text-[22px] font-semibold text-paper shadow-[var(--shadow-paper)] transition-transform duration-150 ease-out hover:-translate-y-px motion-reduce:hover:translate-y-0"
          >
            Back home
          </Link>
          <Link
            href="/work"
            data-hand="cta"
            className="focus-ring inline-flex min-h-[44px] items-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-ivory px-[var(--space-5)] font-hand text-[22px] font-semibold text-navy transition-colors duration-150 ease-out hover:border-[var(--color-navy-2)]"
          >
            See the work
          </Link>
          <Link
            href="/contact"
            data-hand="cta"
            className="focus-ring inline-flex min-h-[44px] items-center rounded-[var(--radius-pill)] border border-[var(--line)] bg-ivory px-[var(--space-5)] font-hand text-[22px] font-semibold text-navy transition-colors duration-150 ease-out hover:border-[var(--color-navy-2)]"
          >
            Get in touch
          </Link>
        </div>
      </div>

      <Sketch variant="tools" className="hidden w-[220px] shrink-0 justify-self-end lg:block" />
    </Section>
  );
}
