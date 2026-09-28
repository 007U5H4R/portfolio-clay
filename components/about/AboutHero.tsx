import { Container } from "@/components/layout/Container";
import { ContactEntrance } from "@/components/contact/ContactEntrance";
import { AboutCollage } from "./hero/AboutCollage";
import { AboutNarrative } from "./hero/AboutNarrative";

export { ABOUT_PULL_QUOTE, ABOUT_STATS, ABOUT_STATS_HOW } from "./hero/about-hero-data";

/**
 * `/about` hero (TASK-117 — Tushar's About hero spec 2026-09-28, the reference of record:
 * `docs/redesign-mockups/m-009/tushar-2026-09-28/about-hero-spec.md`; supersedes the TKT-86 layout,
 * Design.md §7.4 "Hero" + §11). Server component, directly under TKT-95's `SceneOpener`.
 *
 *   ≥ 900: two columns `56fr 44fr` — the story (eyebrow, h1, hand subline, stats card, personal note)
 *          left, the scrapbook collage (philosophy note, polaroid, Venn notebook page, hand line) right.
 *   < 900: one column in spec §24 order — eyebrow → h1 → subline → stats → quote → polaroid →
 *          notebook → personal note (the note is `aria-hidden`, so moving it changes no reading order).
 *
 * Structure (spec §28): `AboutHero` → `AboutNarrative` (`AboutEyebrow`, `AboutHeadline`,
 * `AboutSubline`, `AboutMetrics`, `AboutPersonalNote`) + `AboutCollage` (`PhilosophyNote`,
 * `JourneyPolaroid`, `IntersectionSketch`).
 *
 * EVAL-018 (Design.md §3.3 `/about` hero = 4, at every width): subline annotation · personal-note
 * annotation · "same curiosity, still here." annotation · the sprig `collage`. Stats card, quote
 * note, polaroid and notebook page are content paper; tape and pins are fasteners. No `DraftTag`
 * (spec §5 — Tushar's direction for this section only).
 *
 * Motion (spec §22, §27): `ContactEntrance` (the shared arm-then-reveal wrapper — no JS-off hider,
 * no motion library) sets `data-in` once the grid is 20 % in view; the TASK-117 CSS block staggers
 * the `data-enter` pieces over ≈ 1.1 s. Nothing moves under `prefers-reduced-motion: reduce`.
 */
export function AboutHero() {
  return (
    <Container as="section" aria-labelledby="about-hero-heading" className="ahero">
      <ContactEntrance className="ahero-grid">
        <AboutNarrative />
        <AboutCollage />
      </ContactEntrance>
    </Container>
  );
}
