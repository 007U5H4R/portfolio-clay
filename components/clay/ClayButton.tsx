import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ClayButtonVariant = "primary" | "secondary" | "ghost";

type ClayButtonBase = {
  variant?: ClayButtonVariant | undefined;
  trailingIcon?: ReactNode | undefined;
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
  "inline-flex items-center justify-center gap-[var(--space-2)] min-h-11 min-w-11 px-6 rounded-[var(--radius-clay-sm)] transition-transform duration-[180ms] ease-out hover:-translate-y-[3px] active:duration-[90ms] active:scale-[.98] motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100 focus-ring";

/** Primary = `bg` text on `accent` (4.9:1, AA) — `ink` on `accent` is 3.4:1 and fails AA (E-7). */
const variantClass: Record<ClayButtonVariant, string> = {
  primary: "bg-accent text-bg hover:bg-accent-deep",
  secondary: "border border-ink/15 text-ink bg-surface",
  ghost: "bg-transparent text-ink",
};

export function ClayButton(props: ClayButtonProps) {
  const { variant = "primary", trailingIcon, children, className, iconOnly, href, ...rest } = props;
  const classes = [baseClass, variantClass[variant], className].filter(Boolean).join(" ");

  if (href) {
    return (
      <a
        href={href}
        className={classes}
        data-icon-only={iconOnly ? "" : undefined}
        {...(rest as Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">)}
      >
        {children}
        {trailingIcon}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={classes}
      data-icon-only={iconOnly ? "" : undefined}
      {...(rest as Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "className">)}
    >
      {children}
      {trailingIcon}
    </button>
  );
}
