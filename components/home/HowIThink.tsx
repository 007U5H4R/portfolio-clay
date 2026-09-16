"use client";

/**
 * HowIThink (home section, TKT-13; technical-plan.md §B S13.02/S13.03, Design.md §3 "How I Think").
 *
 * Six `ClayTile` (utility tier) disclosure buttons in a row (≥1024) / stack (<1024), one per
 * framework stage, each keyed to its own `tone` (Law of Similarity — one stage, one colour,
 * everywhere the stage is referenced). Clicking (or Enter/Space on) a tile reveals a single shared
 * card below the row holding that stage's real, sourced example — quote, attribution, and a link
 * into the case study that proves it. Only one stage is open at a time; opening a second closes the
 * first. `Escape` closes without moving focus off the tile; a `pointerdown` outside the module also
 * closes it.
 *
 * `ClayTile` only ever renders a `<div>` (no polymorphic `as`, unlike `ClayCard`), and its `utility`
 * tier structurally forbids `interactive` (Design.md §2 / D1 — a utility surface has no press
 * state). Each tile is therefore wrapped in a real `<button>` that owns focus/click/keyboard
 * handling — the same "div carries the visual, a wrapping control owns focus" pattern `ClayTile`'s
 * own docstring already uses for the card-tier interactive tiles (`components/hero/FloatingTiles`).
 * The only hover effect on the tile itself is the principle line's text-colour shift (Design.md §3:
 * "200ms, desktop only") — never a shadow/lift, which utility tier doesn't have.
 *
 * Motion deviation (documented, same reasoning as `AskPortfolio`'s TKT-10 report): the plan named
 * `m.div layout` for the expand/collapse, but Design.md §4's own "How-I-Think stage expand" row
 * specifies a plain CSS transition (`ease-out`, 200ms) — and `layout` animations need `domMax`,
 * which `LazyMotionRoot` deliberately does not load (A6 bundle budget). A CSS `grid-template-rows`
 * transition on the shared expand region gives the same in-place height change without the extra
 * bundle weight; `motion-reduce:transition-none` collapses it to instant, matching the table's
 * reduced-motion mapping exactly.
 *
 * Every `principle` line is unsigned-off editorial framing (see `data/thinking-framework.ts`'s
 * header), so it always renders the same "Draft" badge `AnswerView` already established for DRAFT
 * Ask copy — one visual convention for "this line is DRAFT", reused rather than re-invented.
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
    <span className="inline-flex items-center rounded-[var(--radius-utility)] bg-butter/50 px-[var(--space-2)] py-[2px] text-caption font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink">
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
        eyebrow="Process"
        title="How I think"
        lead="Six stages I return to on every product, each grounded in one real, sourced example."
        className="mb-[var(--space-8)]"
      />

      <ol
        ref={listRef}
        className="relative flex flex-col gap-[var(--space-4)] pl-[var(--space-6)] before:absolute before:left-[var(--space-2)] before:top-[var(--space-2)] before:bottom-[var(--space-2)] before:w-px before:bg-ink-3 before:content-[''] lg:flex-row lg:flex-wrap lg:gap-[var(--space-3)] lg:pl-0 lg:before:inset-x-0 lg:before:bottom-[-14px] lg:before:top-auto lg:before:left-0 lg:before:h-px lg:before:w-auto"
      >
        {stages.map((stage, index) => {
          const isOpen = stage.id === openId;
          const StageIcon = STAGE_ICON[stage.id];

          return (
            <li key={stage.id} className="relative">
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
                className="group block rounded-[var(--radius-utility)] text-left focus-ring"
              >
                {/* Design.md §3 spec's literal "~160px wide"; ClayTile's discrete sizes are
                    40/56/120/140/180 (components/clay/ClayTile.tsx) — 140 is the nearest without
                    widening that shared primitive's size union out of this ticket's scope.
                    `!h-auto` relaxes ClayTile's square default so the icon/label/principle stack
                    can grow the box (same relaxed-aspect idiom as `components/hero/FloatingTiles`),
                    while width stays pinned at the fixed 140px (Design.md wants fixed-width tiles
                    in a row, not stretched-to-fill). */}
                <ClayTile
                  tier="utility"
                  tone={stage.tone}
                  size={140}
                  className="!h-auto flex-col items-start gap-[var(--space-2)] p-[var(--space-4)] text-left"
                >
                  <Icon icon={StageIcon} size={24} />
                  <span className="text-[length:var(--text-body)] font-bold text-ink">{stage.label}</span>
                  <span className="text-caption leading-snug text-ink-2 transition-colors duration-200 ease-[var(--ease-hover)] motion-reduce:transition-none [@media(hover:hover)]:group-hover:text-ink">
                    {stage.principle}
                  </span>
                </ClayTile>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="flex items-center gap-[var(--space-2)] pt-[var(--space-3)] lg:pt-[var(--space-6)]">
        <DraftBadge />
        <span className="text-caption text-ink-3">Principle lines are my own framing, not yet signed off.</span>
      </div>

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
              className="mt-[var(--space-6)] flex flex-col items-start gap-[var(--space-3)]"
            >
              <blockquote className="max-w-[65ch] text-[length:var(--text-lead)] text-ink">
                “{openStage.example.quote}”
              </blockquote>
              <p className="text-caption text-ink-2">— {openStage.example.attribution}</p>
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
