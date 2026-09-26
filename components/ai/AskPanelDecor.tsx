/**
 * AskPanelDecor (TKT-104, Tushar direction 2026-09-26; Design.md §11 Dev-47/Dev-48) — the AskPanel's
 * hand-drawn furniture and its idle intro. Imported ONLY by `AskPanel`, so every doodle, the lucide
 * card icons and the Tushky mascot live in the lazy panel chunk and never in `/` first-load JS
 * (EVAL-005). Every doodle is an inline `aria-hidden` SVG stroked / filled with `currentColor`, so its
 * colour comes from a paper token (or a `color-mix()` on one) set in the TKT-104 CSS block (EVAL-020).
 *
 * The panel is a `<dialog>` outside every `section` / `header` / `footer` unit, so the EVAL-018
 * decoration budget does not count it (Dev-47 records this); the doodles are still decorative-only
 * and hidden from assistive tech (§3.2 rule 6), and the Caveat notes are `aria-hidden` annotations.
 */
import Image from "next/image";
import {
  Briefcase,
  ChartNoAxesColumn,
  FileText,
  Lightbulb,
  Search,
  Star,
  type LucideIcon,
} from "lucide-react";
import { Icon } from "@/components/common/Icon";
import { Hand } from "@/components/paper/Hand";
import { illustration } from "@/lib/illustrations";
import { Microcopy } from "./AnswerView";
import type { PromptCardStyle } from "./SuggestedPrompts";

const TUSHKY = illustration("tushky");

/** Card icon per tint, in the target's order (pink/blue/green/lilac/yellow/rose). */
const CARD_ICONS: readonly LucideIcon[] = [Briefcase, ChartNoAxesColumn, Star, Lightbulb, FileText, Search];

/**
 * A stable icon + tint per prompt: its position in the six panel prompts (so an empty-state
 * suggestion keeps the colour and icon it had in the idle grid), else its position in the list.
 */
export function panelCardStyle(panelPrompts: readonly string[]) {
  return (prompt: string, index: number): PromptCardStyle => {
    const at = panelPrompts.indexOf(prompt);
    const tone = (at >= 0 ? at : index) % CARD_ICONS.length;
    return { tone, icon: <Icon icon={CARD_ICONS[tone]!} size={20} /> };
  };
}

const svgProps = {
  "aria-hidden": true,
  focusable: false,
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Two four-point sparkles (kraft-yellow + navy) beside the "Ask AI" lettering. */
export function Sparkles({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 56" className={className} {...svgProps} strokeWidth={2.2}>
      <path className="ask-doodle-sun" d="M22 4c1.6 8.4 4.6 11.4 13 13-8.4 1.6-11.4 4.6-13 13-1.6-8.4-4.6-11.4-13-13 8.4-1.6 11.4-4.6 13-13Z" />
      <path d="M48 28c1 5 2.8 6.8 7.8 7.8-5 1-6.8 2.8-7.8 7.8-1-5-2.8-6.8-7.8-7.8 5-1 6.8-2.8 7.8-7.8Z" />
    </svg>
  );
}

/** A small curly arrow (the note → the greeting; the tape label → the cards). */
export function CurlyArrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 56" className={className} {...svgProps} strokeWidth={2}>
      <path d="M10 4c14 4 22 14 16 26-3 6-10 8-12 3-2-6 8-8 12-2 4 6 2 14-4 20" />
      <path d="M17 45l5 7 7-4" />
    </svg>
  );
}

/** A steel paperclip clipped over the notebook's punched edge. */
export function Paperclip({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 72" className={className} {...svgProps} strokeWidth={2.4}>
      <path d="M19 20v32a6.5 6.5 0 0 1-13 0V14a10 10 0 0 1 20 0v38a13 13 0 0 1-26 0V24" />
    </svg>
  );
}

/** A light-bulb doodle with three rays, beside the "Suggested questions" tape. */
export function BulbDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 44" className={className} {...svgProps} strokeWidth={2}>
      <path d="M14 30c0-4-6-7-6-14a10 10 0 0 1 20 0c0 7-6 10-6 14Z" />
      <path d="M15 35h8M16 40h6" />
      <path d="M30 4l2-3M35 10l4-1M24 1l0-1" />
    </svg>
  );
}

/** A two-peak mountain sketch for the bottom-left corner. */
export function MountainDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 44" className={className} {...svgProps} strokeWidth={1.6}>
      <path d="M2 42l24-30 10 12 12-18 22 36" />
      <path d="M20 20l6 4 5-5M42 12l6 5 5-5" />
      <path d="M58 42l14-16 22 16" />
    </svg>
  );
}

/** A leafy sprig for the bottom-right corner. */
export function LeafDoodle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 64" className={className} {...svgProps} strokeWidth={1.8}>
      <path d="M22 62c0-18 4-34 16-50" />
      <path d="M30 26c-10-2-14-10-12-20 8 4 13 11 12 20Z" />
      <path d="M26 40c10-4 18-2 20 6-8 3-15 1-20-6Z" />
      <path d="M23 50c-8-6-18-6-21 0 7 5 14 5 21 0Z" />
    </svg>
  );
}

/**
 * The panel's idle intro (target: the pink torn honesty note, Tushky with a hand note, the greeting
 * card and the green "Suggested questions" tape). The honesty line is the shared `Microcopy` (S7 —
 * same text on every surface), styled here as the note. The tape label is `aria-hidden` because the
 * list below it is already named "Suggested questions".
 */
export function PanelIntro() {
  return (
    <div className="ask-intro">
      <div className="ask-intro-note">
        <Microcopy className="ask-note" />
        <CurlyArrow className="ask-intro-arrow" />
      </div>
      <div className="ask-intro-row">
        <div className="ask-mascot">
          <span aria-hidden="true" className="ask-mascot-hand font-hand">
            Ask anything about my journey!
          </span>
          <Image
            src={TUSHKY.publicSrc!}
            alt={TUSHKY.alt}
            width={TUSHKY.width}
            height={TUSHKY.height}
            unoptimized
            className="ask-mascot-img"
          />
        </div>
        <div className="ask-speech">
          <p className="ask-speech-title">Hi! I’m Tushky, your portfolio assistant.</p>
          <p className="ask-speech-body">
            I can answer questions about this portfolio’s work, experience, skills, projects, and process.
          </p>
        </div>
      </div>
      <div aria-hidden="true" className="ask-tape-row">
        <Hand kind="label" className="ask-tape">
          Suggested questions
        </Hand>
        <BulbDoodle className="ask-bulb" />
      </div>
    </div>
  );
}
