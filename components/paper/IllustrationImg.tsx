"use client";

import Image from "next/image";
import { useState } from "react";

export type IllustrationImgProps = {
  /** Served URL; `undefined` until the asset exists (TSK-36) — renders the fallback caption. */
  src?: string | undefined;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  priority?: boolean | undefined;
  className?: string | undefined;
};

/**
 * The one `<img>` of an `Illustration` (S70.06). On a load/decode error — or with no source yet —
 * it replaces itself with the alt as visible caption text on the ivory frame, never a broken image
 * (Design.md §6.4 last bullet; schema "placeholders render the alt as visible caption text").
 */
export function IllustrationImg({ src, alt, width, height, sizes, priority = false, className }: IllustrationImgProps) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="illustration-fallback">{alt}</span>;
  }
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      preload={priority}
      // Next 16 does not derive fetchpriority from preload/priority; set it for the LCP image.
      fetchPriority={priority ? "high" : undefined}
      loading={priority ? "eager" : "lazy"}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
