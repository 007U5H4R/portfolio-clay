import { ArrowUpRight } from "lucide-react";
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { VisuallyHidden } from "./VisuallyHidden";

export interface ExternalLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className"> {
  href: string;
  children: ReactNode;
  className?: string | undefined;
}

/**
 * Inline text link that leaves the site (Design.md §3 "Common primitives"): underlined accent
 * text + a 12px trailing arrow, opens in a new tab with `rel="noopener noreferrer"` and a
 * VisuallyHidden "opens in new tab" note for screen readers.
 *
 * `data-inline-link` marks it as a running-text link — the documented WCAG 2.5.8 exception to the
 * 44×44 target-size floor — so the e2e `minTargets` allowlist can exempt it without exempting real
 * controls.
 */
export function ExternalLink({ href, children, className, ...rest }: ExternalLinkProps) {
  const classes = [
    "inline-flex items-center gap-[2px] text-rust underline underline-offset-2 focus-ring rounded-[2px]",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-inline-link=""
      className={classes}
      {...rest}
    >
      {children}
      <ArrowUpRight size={12} strokeWidth={1.75} aria-hidden="true" />
      <VisuallyHidden>(opens in new tab)</VisuallyHidden>
    </a>
  );
}
