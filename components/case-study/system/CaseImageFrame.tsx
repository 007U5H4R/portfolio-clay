import type { CaseImage } from "@/data/schema";

/**
 * A real product image in a light frame (spec §12, §42): `browser` adds a plain window bar,
 * `phone` a device outline, `print` a paper sheet, `plain` nothing. Real screenshots only; lazy
 * unless `priority` (the hero). The alt is the record's; provenance is never rendered.
 */
export function CaseImageFrame({ image, priority = false, className }: { image: CaseImage; priority?: boolean; className?: string }) {
  return (
    <figure className={["csx-frame", className].filter(Boolean).join(" ")} data-frame={image.frame}>
      <div className="csx-frame-screen">
        {image.frame === "browser" ? <span className="csx-frame-bar" aria-hidden="true" /> : null}
        {/* eslint-disable-next-line @next/next/no-img-element -- static WebP/SVG from public/, sized, lazy */}
        <img
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...(priority ? { fetchPriority: "high" as const } : {})}
        />
      </div>
      {image.caption ? <figcaption className="csx-frame-cap">{image.caption}</figcaption> : null}
    </figure>
  );
}
