"use client";

/**
 * HowIThink (home section, TKT-13; redesigned M-008 Stage B / TASK-55 to mockup 3 "A product
 * journey, not a process"). Design.md §3 "How I Think" describes the pre-redesign row-of-tiles
 * layout; this pass restyles it into a connected journey path per the mockup while preserving
 * every behavioural contract from that spec verbatim (see below) — nothing here re-opens the
 * interaction model, only its visual presentation.
 *
 * Six round icon "nodes" in a row (≥1024) / stack (<1024), one per framework stage, each keyed to
 * its own `tone` (Law of Similarity — one stage, one colour, everywhere the stage is referenced),
 * connected by a decorative path (a static inline-SVG wave at ≥1024, a straight left-edge line
 * below it — both `aria-hidden`, purely visual). Clicking (or Enter/Space on) a node reveals a
 * single shared "sticky-note" card below the row holding that stage's DRAFT principle framing plus
 * its real, sourced example — quote, attribution, and a link into the case study that proves it.
 * Only one stage is open at a time; opening a second closes the first. `Escape` closes without
 * moving focus off the node; a `pointerdown` outside the module also closes it.
 *
 * `ClayTile` only ever renders a `<div>` (no polymorphic `as`, unlike `ClayCard`), and its `utility`
 * tier structurally forbids `interactive` (Design.md §2 / D1 — a utility surface has no press
 * state). Each node is therefore wrapped in a real `<button>` that owns focus/click/keyboard
 * handling — the same "div carries the visual, a wrapping control owns focus" pattern `ClayTile`'s
 * own docstring already uses for the card-tier interactive tiles (the former hero proof-tile stack,
 * removed at TSK-38).
 *
 * Motion deviation (documented, same reasoning as `AskPortfolio`'s TKT-10 report): the plan named
 * `m.div layout` for the expand/collapse, but Design.md §4's own "How-I-Think stage expand" row
 * specifies a plain CSS transition (`ease-out`, 200ms) — and `layout` animations need `domMax`,
 * which `LazyMotionRoot` deliberately does not load (A6 bundle budget). A CSS `grid-template-rows`
 * transition on the shared expand region gives the same in-place height change without the extra
 * bundle weight; `motion-reduce:transition-none` collapses it to instant, matching the table's
 * reduced-motion mapping exactly. The decorative SVG path is static (no draw-in animation), so it
 * needs no reduced-motion handling of its own.
 *
 * Every `principle` line is unsigned-off editorial framing (see `data/thinking-framework.ts`'s
 * header), so it always renders the same "Draft" badge `AnswerView` already established for DRAFT
 * Ask copy — one visual convention for "this line is DRAFT", reused rather than re-invented. It now
 * renders inside the expanded sticky-note card (alongside the real quote) rather than on the node
 * itself, since the mockup's nodes are icon+label only.
 */
import {
  CircleAlert,
  Dice5,
  FlaskConical,
  Hammer,
  Lightbulb,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Icon } from "@/components/common/Icon";
import { ClayTile } from "@/components/clay/ClayTile";
import { ClayCard } from "@/components/clay/ClayCard";
import { ClayPill } from "@/components/clay/ClayPill";
import { Section } from "@/components/layout/Section";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { Tone } from "@/components/clay/tiers";
import type { StageId } from "@/lib/stages";

export interface HowIThinkStage {
  id: StageId;
  label: string;
  principle: string;
  tone: Tone;
  example: {
    quote: string;
    attribution: string;
    href: string;
    /** Resolved project display name (e.g. "Nuptis → Velora") — resolved server-side (A1). */
    projectName: string;
  };
}

export interface HowIThinkProps {
  /** Already in CONTENT_INVENTORY §1.5 order (`lib/stages.ts` `orderStages`) — rendered as given. */
  stages: HowIThinkStage[];
}

const STAGE_ICON: Record<StageId, LucideIcon> = {
  problem: CircleAlert,
  insight: Lightbulb,
  bet: Dice5,
  build: Hammer,
  evaluate: FlaskConical,
  impact: TrendingUp,
};

const PANEL_ID = "how-i-think-panel";

function DraftBadge() {
  return (
    <span className="inline-flex items-center rounded-[var(--radius-utility)] bg-kraft/50 px-[var(--space-2)] py-[2px] text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy">
      Draft
    </span>
  );
}

export function HowIThink({ stages }: HowIThinkProps) {
  const [openId, setOpenId] = useState<StageId | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  const openStage = stages.find((stage) => stage.id === openId) ?? null;

  // Outside-click closes the expanded card (S13.02 gate).
  useEffect(() => {
    if (!openId) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (listRef.current?.contains(target)) return;
      if (document.getElementById(PANEL_ID)?.contains(target)) return;
      setOpenId(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openId]);

  const focusTileAt = (index: number) => {
    const count = stages.length;
    const next = ((index % count) + count) % count;
    setActiveIndex(next);
    const button = listRef.current?.querySelectorAll<HTMLButtonElement>("button[data-stage-trigger]")[next];
    button?.focus();
  };

  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        focusTileAt(index + 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        focusTileAt(index - 1);
        break;
      case "Escape":
        // Collapse without moving focus off the tile (S13.02 gate).
        setOpenId(null);
        break;
      default:
        break;
    }
  };

  const toggleStage = (id: StageId) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <Section id="how-i-think" aria-labelledby="how-i-think-heading">
      <SectionHeading
        id="how-i-think-heading"
        eyebrow="How I think"
        title="A product journey, not a process."
        lead="From ambiguity to impact — six stages I return to on every product, each grounded in one real, sourced example."
        className="mb-[var(--space-9)]"
      />

      <ol
        ref={listRef}
        className="relative flex flex-col gap-[var(--space-6)] pl-[var(--space-6)] before:absolute before:left-[var(--space-2)] before:top-[var(--space-2)] before:bottom-[var(--space-2)] before:w-px before:bg-ink-soft before:content-[''] lg:flex-row lg:items-start lg:justify-between lg:gap-[var(--space-2)] lg:pl-0 lg:pt-[var(--space-6)] lg:before:content-none"
      >
        {/* Decorative journey-path connector (≥1024 only). Static, aria-hidden — no draw-in
            animation, so it needs no reduced-motion handling of its own. */}
        <svg
          aria-hidden
          viewBox="0 0 1200 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 top-[26px] hidden h-[52px] w-full lg:block"
        >
          <path
            d="M100,66 Q200,26 300,26 T500,66 T700,26 T900,66 T1100,26"
            fill="none"
            className="stroke-ink-soft/35"
            strokeWidth="2"
            strokeDasharray="1 10"
            strokeLinecap="round"
          />
        </svg>

        {stages.map((stage, index) => {
          const isOpen = stage.id === openId;
          const StageIcon = STAGE_ICON[stage.id];

          return (
            <li key={stage.id} className="relative z-[1]">
              <button
                type="button"
                data-stage-trigger
                aria-expanded={isOpen}
                aria-controls={PANEL_ID}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => {
                  setActiveIndex(index);
                  toggleStage(stage.id);
                }}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => onTriggerKeyDown(event, index)}
                className="group flex items-center gap-[var(--space-3)] rounded-[var(--radius-utility)] text-left focus-ring lg:flex-col lg:items-center lg:gap-[var(--space-2)] lg:text-center"
              >
                {/* Node: a circular icon medallion (journey "step") — the tile's square utility
                    shape is overridden to a circle with `!rounded-full`, same override idiom this
                    file already used for `!h-auto` pre-redesign. `isOpen` gets the hover-lift ring
                    permanently on, so the currently-open step stays visually marked. */}
                <ClayTile
                  tier="utility"
                  tone={stage.tone}
                  size={56}
                  className={`!rounded-full shrink-0 transition-shadow duration-200 ease-[var(--ease-hover)] motion-reduce:transition-none ${
                    isOpen ? "shadow-[var(--shadow-clay-hover)]" : ""
                  }`}
                >
                  <Icon icon={StageIcon} size={24} />
                </ClayTile>
                <span className="text-[length:var(--text-body)] font-bold text-navy transition-colors duration-200 ease-[var(--ease-hover)] motion-reduce:transition-none [@media(hover:hover)]:group-hover:text-rust">
                  {stage.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div
        id={PANEL_ID}
        className="grid transition-[grid-template-rows] duration-200 ease-out motion-reduce:transition-none"
        style={{ gridTemplateRows: openStage ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          {openStage ? (
            <ClayCard
              tier="card"
              tone={openStage.tone}
              padding="card"
              className="relative mt-[var(--space-8)] flex max-w-[520px] -rotate-1 flex-col items-start gap-[var(--space-3)]"
            >
              {/* "Washi tape" accent — decorative, aria-hidden, one existing token (butter), no new
                  colour added (13-token gate). */}
              <span
                aria-hidden
                className="absolute -top-[var(--space-3)] left-[var(--space-7)] h-[var(--space-5)] w-[var(--space-9)] rotate-2 rounded-[3px] bg-kraft/70"
              />
              <div className="flex items-center gap-[var(--space-2)]">
                <DraftBadge />
                <span className="text-caption text-ink-soft">{openStage.label} — my own framing, not yet signed off</span>
              </div>
              <p className="text-body font-semibold text-navy">{openStage.principle}</p>
              <blockquote className="max-w-[65ch] text-[length:var(--text-lead)] text-navy">
                “{openStage.example.quote}”
              </blockquote>
              <p className="text-caption text-navy-2">— {openStage.example.attribution}</p>
              <ClayPill variant="link" href={openStage.example.href}>
                {`See how I tested this in ${openStage.example.projectName}`}
              </ClayPill>
            </ClayCard>
          ) : null}
        </div>
      </div>
    </Section>
  );
}
