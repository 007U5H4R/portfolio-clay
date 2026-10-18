import type { ProductLogo as ProductLogoFiles } from "@/lib/portfolio";

/**
 * TASK-250 (Tushar 2026-10-18): a product's own logo in place of its name text. Both theme files are in the DOM and CSS
 * (`.pf-logo-img`, `[data-theme]` on <html>) shows the matching one, so there is no flash and no client theme state.
 * Both images are decorative (`alt=""`, `aria-hidden`); the product name rides along as a visually-hidden span, so the
 * heading it sits in keeps the name as its accessible name (and `aria-labelledby` on the heading still reads it).
 */
export function ProductLogo({ name, logo }: { name: string; logo: ProductLogoFiles }) {
  return (
    <>
      {(["dark", "light"] as const).map((theme) => (
        // eslint-disable-next-line @next/next/no-img-element -- pre-sized, pre-compressed static WebP, one per theme
        <img key={theme} className="pf-logo-img" data-theme-variant={theme} src={logo[theme]} alt="" aria-hidden="true" width={logo.width} height={logo.height} loading="eager" decoding="async" />
      ))}
      <span className="sr-only">{name}</span>
    </>
  );
}
