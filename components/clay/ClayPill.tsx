import { ArrowRight } from "lucide-react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from "react";
import { Icon } from "@/components/common/Icon";
import { tierClass } from "./tiers";

export type ClayPillVariant = "filter" | "tag" | "link";

/**
 * Utility-radius pill (Design.md §3). Three deliberately-distinguishable variants (Law of
 * Similarity — a static tag must never read as a control):
 *   - `filter` → interactive `<button>` (FilterTabs / SuggestedPrompts): hover + active states,
 *                44px tall for Fitts. `active` marks the selected tab (bg-lavender + ink text).
 *   - `tag`    → static `<span>`, NO hover state, `ink-2` text.
 *   - `link`   → `<a>` pill with a trailing arrow (EvidenceLinks, "View RailCite →").
 */

const pillBase =
  "inline-flex items-center justify-center gap-[var(--space-2)] rounded-[var(--radius-pill)] px-[var(--space-4)] text-caption font-semibold";

/** Interactive variants get the 44px target floor + colour transition + shared focus ring. */
const interactivePill =
  "min-h-11 transition-colors duration-200 ease-[var(--ease-hover)] focus-ring";

type ClayPillFilterProps = {
  variant: "filter";
  /** Selected/active tab state (bg-lavender + ink text). */
  active?: boolean | undefined;
  className?: string | undefined;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "type">;

type ClayPillTagProps = {
  variant?: "tag" | undefined;
  className?: string | undefined;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLSpanElement>, "className">;

type ClayPillLinkProps = {
  variant: "link";
  href: string;
  className?: string | undefined;
  children: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "href">;

export type ClayPillProps = ClayPillFilterProps | ClayPillTagProps | ClayPillLinkProps;

export function ClayPill(props: ClayPillProps) {
  if (props.variant === "filter") {
    const { active, className, children, ...rest } = props;
    const classes = [
      pillBase,
      interactivePill,
      active ? "bg-lavender text-ink shadow-[var(--shadow-utility)]" : "bg-transparent text-ink-2 hover:bg-lavender/40",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <button type="button" className={classes} aria-pressed={active} {...rest}>
        {children}
      </button>
    );
  }

  if (props.variant === "link") {
    const { href, className, children, ...rest } = props;
    const classes = [
      pillBase,
      interactivePill,
      tierClass.utility,
      "bg-surface text-ink hover:bg-lavender/40",
      className,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      <a href={href} className={classes} {...rest}>
        {children}
        <Icon icon={ArrowRight} size={20} />
      </a>
    );
  }

  // Default: static tag — no hover, never mistaken for a control.
  const { variant: _variant, className, children, ...rest } = props;
  void _variant;
  const classes = [pillBase, tierClass.utility, "text-ink-2", className].filter(Boolean).join(" ");
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}
