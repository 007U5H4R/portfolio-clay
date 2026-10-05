import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { SourceRef } from "@/data/schema";
import type { PrototypeArtifact } from "./types";
import { Tape } from "@/components/paper";
import { Icon } from "@/components/common/Icon";
import { ArtifactShell } from "./ArtifactShell";
import { SourceCaption } from "./SourceCaption";

export interface PrototypeFrameProps {
  artifact: PrototypeArtifact;
  source: SourceRef;
  /** `next/image` `sizes`; override when the chapter-column width is known. */
  sizes?: string | undefined;
}

const DEFAULT_SIZES = "(min-width: 1024px) 480px, (min-width: 768px) 50vw, 100vw";

/**
 * PrototypeFrame (Design.md §7.3 `prototype`): a taped photo frame (`Sheet photo` + two `Tape`
 * fasteners) around a 16:9 prototype image or video, then the caption + Source in the `figcaption`.
 * A `kind:'placeholder'` media renders the alt text as a labelled caption inside the frame — never a
 * broken `<img>` (A13). Real demo playback with poster/duration lives in `DemoVideo`; prototype clips
 * here are short inline media (muted, controls, first frame until played).
 */
export function PrototypeFrame({ artifact, source, sizes = DEFAULT_SIZES }: PrototypeFrameProps) {
  const { media } = artifact;
  const caption = artifact.caption ?? media.caption;

  return (
    <ArtifactShell
      as="figure"
      form="proto"
      variant="photo"
      label="Prototype"
      fasteners={[<Tape key="l" side="l" />, <Tape key="r" side="r" />]}
    >
      <div className="proto-frame">
        {media.kind === "image" ? (
          <Image src={media.src} alt={media.alt} fill sizes={sizes} />
        ) : media.kind === "video" ? (
          <video src={media.src} aria-label={media.alt} controls muted playsInline preload="metadata" />
        ) : (
          <div className="proto-placeholder">
            <Icon icon={ImageOff} size={24} />
            <span>{media.alt}</span>
          </div>
        )}
      </div>
      <figcaption>
        {caption ? <span className="artifact-caption">{caption}</span> : null}
        <SourceCaption as="span" source={source} className="artifact-src" />
      </figcaption>
    </ArtifactShell>
  );
}
