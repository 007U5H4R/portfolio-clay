import type { ReactNode } from "react";
import { portfolioEntries } from "@/data/portfolio";
import { productLogoSrc } from "@/lib/portfolio";

/**
 * TASK-285 (Tushar 2026-10-19): a product's name in a case-study hero h1 or next band, shown as its own logo when it has one
 * (`logo` on its `data/portfolio.ts` entry, files from TASK-250). Same markup contract as the portfolio panel's
 * `ProductLogo` (both theme files in the DOM, `.pf-logo-img` + `[data-theme]` pick one, so no flash): the images are
 * decorative and the product name rides along as a visually-hidden span, so the heading / link keeps the name as its
 * accessible name. A product without a logo returns its plain name. `onDark` pins the light-ink file for a surface that
 * stays dark in both themes (the system template's dark hero themes, the navy next band).
 * Sizing lives in the TASK-285 block in app/globals.css (`--cs-logo-h` height cap, width capped to the column).
 */
export function CaseName({ slug, name, onDark = false, fallback }: { slug: string; name: string; onDark?: boolean; fallback?: ReactNode }) {
  const entry = portfolioEntries.find((e) => e.slug === slug);
  if (!entry?.logo) return <>{fallback ?? name}</>;
  const { width, height } = entry.logo;
  return (
    <span className="cs-logo" data-on-dark={onDark ? "" : undefined} style={{ "--cs-logo-ar": (width / height).toFixed(4) } as React.CSSProperties}>
      {(["dark", "light"] as const).map((theme) => (
        // eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP, one per theme
        <img key={theme} className="pf-logo-img" data-theme-variant={theme} src={productLogoSrc(slug, theme)} alt="" aria-hidden="true" width={width} height={height} loading="eager" decoding="async" />
      ))}
      <span className="sr-only">{name}</span>
    </span>
  );
}
