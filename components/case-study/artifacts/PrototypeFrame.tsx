import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { SourceRef } from "@/data/schema";
import type { PrototypeArtifact } from "./types";
import { ClayFrame } from "@/components/clay/ClayFrame";
import { Icon } from "@/components/common/Icon";
import { SourceCaption } from "./SourceCaption";

export interface PrototypeFrameProps {
  artifact: PrototypeArtifact;
  source: SourceRef;
  /** `next/image` `sizes`; override when the chapter-column width is known. */
  sizes?: string | undefined;
}

const DEFAULT_SIZES = "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw";

/**
 * PrototypeFrame (Design.md §3): a 16:9 `ClayFrame` bezel around a prototype image or video, plus
 * its caption and the shared source line. Unlike the text artifacts this one is a frame, not a
 * text card, but it still carries the mandatory source caption (AC 1). A `kind:'placeholder'`
 * media (or the real hero media not being supplied yet) renders a labelled placeholder — never a
 * broken `<img>` (A13). Real interactive demo playback with poster/duration lives in `DemoVideo`
 * (used by the case-study hero); prototype clips here are short inline media.
 */
export function PrototypeFrame({ artifact, source, sizes = DEFAULT_SIZES }: PrototypeFrameProps) {
  const { media } = artifact;
  const caption = artifact.caption ?? media.caption;

  return (
    <figure className="flex flex-col gap-[var(--space-3)]">
      <ClayFrame ratio="16/9" tier="card" tone="lavender" bezel>
        {media.kind === "image" ? (
          <Image
            src={media.src}
            alt={media.alt}
            fill
            sizes={sizes}
            className="rounded-[var(--radius-clay)] object-cover"
          />
        ) : media.kind === "video" ? (
          // Short inline prototype clip; muted + controls, first frame only until played.
          <video
            src={media.src}
            aria-label={media.alt}
            controls
            muted
            playsInline
            preload="metadata"
            className="h-full w-full rounded-[var(--radius-clay)] object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-[var(--space-2)] bg-navy/5 text-center text-ink-soft">
            <Icon icon={ImageOff} size={24} />
            <span className="text-caption font-medium">{media.alt}</span>
          </div>
        )}
      </ClayFrame>
      <figcaption className="flex flex-col gap-[var(--space-1)]">
        {caption ? <span className="text-caption text-navy-2">{caption}</span> : null}
        <SourceCaption source={source} />
      </figcaption>
    </figure>
  );
}
