import { BrainCircuit, Building2, Cloud, Cog, type LucideIcon } from "lucide-react";
import { Icon } from "@/components/common/Icon";
import { ClayTile } from "@/components/clay/ClayTile";
import type { Tone } from "@/components/clay/tiers";
import { Reveal } from "@/components/interactions/Reveal";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";

interface ProductJourneyStage {
  id: string;
  /** Big display year/marker (mockup panel 5's "2016"/"2022"/"2026"/"NOW") — the same start year
   * `range` already carries below, just pulled out for the large clay-prop caption. */
  year: string;
  /**
   * Short milestone name for the clay-prop caption (mockup panel 5: "Products" / "Cloud & Data" /
   * "Enterprise Platforms" / "AI-Native Products"). Each is derived from that stage's own `context`/
   * `label`/`description` below — see the component docstring for the exact source per stage.
   */
  milestone: string;
  icon: LucideIcon;
  tone: Tone;
  range: string;
  label: string;
  description: string;
}

// source: CONTENT_INVENTORY §4.2 — the 2019–2022 gap note (education/patent/paper) is deliberately
// OMITTED here (M-006 default): it renders only once Tushar confirms the framing (Design.md TKT-40
// AC 3). This is a DIFFERENT 4-stage framing than `data/experience.ts`'s 4 roles — that file backs
// TKT-41's `ExperienceTimeline` (click-through `StoryCard`s per role); this is the decorative,
// reduced-scale "arc of the career" read. `range`/`label`/`description` are unchanged from the
// pre-redesign copy (content truth) — only `year`/`milestone`/`icon`/`tone` are new, added for the
// M-008 Stage-B visual redesign (see docstring).
const STAGES: ProductJourneyStage[] = [
  {
    id: "physical-enterprise",
    year: "2016",
    milestone: "Products",
    icon: Cog,
    tone: "peach",
    range: "Sep 2016 – Dec 2018",
    label: "Physical / enterprise",
    description:
      "Godrej Infotech — Assistant PM on the Godrej Smartnet platform; 12 features shipped in 11 months.",
  },
  {
    id: "cloud-data",
    year: "2022",
    milestone: "Cloud & Data",
    icon: Cloud,
    tone: "sky",
    range: "Aug 2022 – Jun 2026",
    label: "Cloud & data",
    description:
      "Quantiphi (GCP) — cloud-native programs across data engineering, API modernization, and GenAI initiatives; Shellkode (AWS) delivery programs.",
  },
  {
    id: "ai-enabled",
    year: "2026",
    milestone: "Enterprise Platforms",
    icon: Building2,
    tone: "lavender",
    range: "Jun 2026 – present",
    label: "AI-enabled",
    description: "American Express — Devin GenAI adoption across the MARS engineering ecosystem.",
  },
  {
    id: "ai-native",
    year: "Now",
    milestone: "AI-Native Products",
    icon: BrainCircuit,
    tone: "mint",
    range: "Aug – Sep 2026",
    label: "AI-native",
    description:
      "TeachSpark (Claude-generated worksheets on WhatsApp), RailCite (cite-or-refuse RAG), Cubicle (multi-agent, unlaunched).",
  },
];

/**
 * `/about`'s `ProductJourney` (M-008 Stage B, redesign to `docs/redesign-mockups/
 * mockups-8panel-2026-09-23.png` panel 5 "About — Product Journey, Visual Timeline"). Restyled from
 * the earlier plain connector-line + text list (TSK-23/TKT-40) into a horizontal visual timeline
 * with one clay-prop "milestone" medallion per stage — matching the visual language `HowIThink`
 * (`components/home/HowIThink.tsx`) already established for a journey read on this same rebuild
 * (round `ClayTile` medallion nodes, one `tone` per stage, a static decorative connector) — reused
 * here rather than re-invented, per the brief ("match the established Stage-B language").
 *
 * Still deliberately NOT `ExperienceTimeline` (TKT-41, a separate component/ticket): no hover-scale,
 * no click/Enter disclosure, no URL hash per stage — every stage's full detail (`range`/`label`/
 * `description`, unchanged content) renders inline, always visible, exactly as before. Each stage is
 * still a plain `Reveal` leaf (index-staggered) beside the same static connector — only its visual
 * presentation changed, not its interaction model (still zero buttons/links in this section).
 *
 * Content truth — `year`/`milestone`/`icon`/`tone` are the only new fields; every one is derived
 * from the stage's own pre-existing, sourced fields (never a new invented fact):
 *   - `year` is that stage's own `range` start year (the last stage is mid-flight in 2026, so it is
 *     labelled "Now" rather than a second "2026" — matching the mockup's "NOW" marker for the most
 *     recent stage).
 *   - "Products" (2016) — Godrej Smartnet was a product platform; the description's own "features
 *     shipped" language.
 *   - "Cloud & Data" (2022) — verbatim from that stage's existing `label`.
 *   - "Enterprise Platforms" (2026) — from the AmEx role's own `context` field
 *     (`data/experience.ts`: "cloud-native MARS microservices platform").
 *   - "AI-Native Products" (Now) — verbatim from the existing `label` ("AI-native") plus the
 *     description's own list of products (TeachSpark, RailCite, Cubicle).
 * The closing line ("The tools changed. The curiosity didn't.") is new, DRAFT editorial framing —
 * the same convention as `AboutHero`'s DRAFT headline/subline (no invented fact, unsigned-off
 * phrasing) — echoing this component's own established "journey, not résumé" framing.
 *
 * Reduced motion (EVAL-010): unchanged — handled entirely by `Reveal`'s shared global CSS
 * (`app/globals.css` `.reveal` + its `prefers-reduced-motion` override), so this component still
 * needs no bespoke reduced-motion branch. The new decorative connector SVG is static (no draw-in
 * animation, `aria-hidden`), the same non-animating pattern `HowIThink`'s own connector already
 * uses, so it needs no reduced-motion handling either.
 */
export function ProductJourney() {
  return (
    <Section id="product-journey" aria-labelledby="product-journey-heading">
      <SectionHeading
        id="product-journey-heading"
        eyebrow="My product journey"
        title="Different tools. Same curiosity."
        lead="Four stages, from enterprise delivery to AI-native products."
        className="mb-[var(--space-9)]"
      />

      <ol className="relative flex flex-col gap-[var(--space-7)] pl-[var(--space-6)] before:absolute before:left-[var(--space-2)] before:top-[var(--space-2)] before:bottom-[var(--space-2)] before:w-px before:bg-ink-soft before:content-[''] lg:flex-row lg:flex-wrap lg:items-start lg:gap-[var(--space-4)] lg:pl-0 lg:pt-[var(--space-6)] lg:before:content-none">
        {/* Decorative journey-path connector (≥1024 only) — the same static, aria-hidden inline SVG
            pattern `HowIThink` uses for its own journey path (no draw-in animation, so no
            reduced-motion handling is needed). */}
        <svg
          aria-hidden
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-[27px] hidden h-[40px] w-full lg:block"
        >
          <path
            d="M100,40 Q250,10 400,30 T800,30 T1100,15"
            fill="none"
            className="stroke-ink-soft/35"
            strokeWidth="2"
            strokeDasharray="1 10"
            strokeLinecap="round"
          />
        </svg>

        {STAGES.map((stage, index) => {
          const StageIcon = stage.icon;
          return (
            <li key={stage.id} className="relative z-[1] lg:min-w-0 lg:flex-1">
              <Reveal index={index} className="flex flex-col gap-[var(--space-2)] lg:items-center lg:text-center">
                <div className="flex items-center gap-[var(--space-3)] lg:flex-col lg:gap-[var(--space-2)]">
                  <ClayTile tier="utility" tone={stage.tone} size={56} className="!rounded-full shrink-0">
                    <Icon icon={StageIcon} size={24} />
                  </ClayTile>
                  <div className="flex flex-col lg:items-center">
                    <span className="text-[length:var(--text-h3)] font-extrabold text-navy">{stage.year}</span>
                    <span className="text-[length:var(--text-body)] font-bold text-navy">{stage.milestone}</span>
                  </div>
                </div>

                <span className="text-caption uppercase tracking-[var(--tracking-eyebrow)] text-ink-soft">
                  {stage.range} · {stage.label}
                </span>
                <span className="text-caption text-navy-2 lg:max-w-[22ch]">{stage.description}</span>
              </Reveal>
            </li>
          );
        })}
      </ol>

      <p className="mt-[var(--space-9)] text-[length:var(--text-lead)] font-semibold text-navy-2">
        The tools changed. The curiosity didn&apos;t.
      </p>
    </Section>
  );
}
