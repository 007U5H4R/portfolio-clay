import { Loader2 } from "lucide-react";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/common/Icon";
import { VisuallyHidden } from "@/components/common/VisuallyHidden";

export type ClayButtonVariant = "primary" | "secondary" | "ghost";
export type ClayButtonSize = "md" | "lg";

type ClayButtonBase = {
  variant?: ClayButtonVariant | undefined;
  /** md = default (44px min); lg = the primary hero/contact CTA size. */
  size?: ClayButtonSize | undefined;
  trailingIcon?: ReactNode | undefined;
  /** Shows a spinner + sets `aria-busy`; the control is inert while loading. */
  loading?: boolean | undefined;
  /**
   * Marks a link that leaves the site: adds `target=_blank` + `rel="noopener noreferrer"` and a
   * VisuallyHidden "(opens in new tab)" note. Only meaningful together with `href`.
   */
  external?: boolean | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
};

/** `iconOnly` demands `aria-label` at the type level — an icon-only button with no accessible name doesn't compile. */
type IconOnlyProps =
  | { iconOnly: true; "aria-label": string }
  | { iconOnly?: false | undefined; "aria-label"?: string | undefined };

type ClayLinkProps = ClayButtonBase &
  IconOnlyProps & { href: string } & Omit<
    AnchorHTMLAttributes<HTMLAnchorElement>,
    "className" | "href" | "aria-label"
  >;

type ClayNativeButtonProps = ClayButtonBase &
  IconOnlyProps & { href?: undefined } & Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "className" | "type" | "aria-label"
  >;

/** Renders `<a>` when `href` is present, else `<button type="button">` (technical-plan.md §B S03.03). */
export type ClayButtonProps = ClayLinkProps | ClayNativeButtonProps;

/** min 44×44 target (Fitts's Law) + `--radius-clay-sm`; press/hover physics collapse under `motion-reduce`. */
const baseClass =
  "inline-flex items-center justify-center gap-[var(--space-2)] min-h-11 min-w-11 rounded-[var(--radius-clay-sm)] transition-transform duration-[180ms] ease-out hover:-translate-y-[3px] active:duration-[90ms] active:scale-[.98] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-ring aria-[busy=true]:pointer-events-none aria-[busy=true]:opacity-80";

/** md keeps the 44px floor; lg is the taller primary CTA (still token-driven padding). */
const sizeClass: Record<ClayButtonSize, string> = {
  md: "px-6 text-[length:var(--text-body)]",
  lg: "min-h-12 px-8 text-[length:var(--text-lead)]",
};

/** Primary = `bg` text on `accent` (4.9:1, AA) — `ink` on `accent` is 3.4:1 and fails AA (E-7). */
const variantClass: Record<ClayButtonVariant, string> = {
  primary: "bg-accent text-bg hover:bg-accent-deep",
  secondary: "border border-ink/15 text-ink bg-surface",
  ghost: "bg-transparent text-ink",
};

export function ClayButton(props: ClayButtonProps) {
  const {
    variant = "primary",
    size = "md",
    trailingIcon,
    loading = false,
    external = false,
    children,
    className,
    iconOnly,
    href,
    ...rest
  } = props;

  const classes = [baseClass, sizeClass[size], variantClass[variant], className]
    .filter(Boolean)
    .join(" ");

  // Spinner respects reduced motion (no continuous rotation — Design.md §4); it still signals
  // "busy" via aria-busy + the visible partial ring.
  const spinner = loading ? (
    <Icon icon={Loader2} size={20} className="animate-spin motion-reduce:animate-none" />
  ) : null;

  const externalNote = external && href ? <VisuallyHidden>(opens in new tab)</VisuallyHidden> : null;

  const inner = (
    <>
      {spinner}
      {children}
      {trailingIcon}
      {externalNote}
    </>
  );

  if (href) {
    const externalRel = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
    return (
      <a
        href={href}
        className={classes}
        data-icon-only={iconOnly ? "" : undefined}
        aria-busy={loading || undefined}
        {...externalRel}
        {...(rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">)}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      data-icon-only={iconOnly ? "" : undefined}
      aria-busy={loading || undefined}
      disabled={loading || undefined}
      {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "className">)}
    >
      {inner}
    </button>
  );
}
