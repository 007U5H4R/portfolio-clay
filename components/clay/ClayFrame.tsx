import type { CSSProperties, ReactNode } from "react";
import { tierClass, toneClass, type Tone } from "./tiers";

export type ClayFrameRatio = "4/5" | "16/9";

export interface ClayFrameProps {
  /** Intrinsic ratio: 4:5 avatar bezel, 16:9 prototype/case-study media (Design.md §3). */
  ratio?: ClayFrameRatio | undefined;
  tier?: "hero" | "card" | undefined;
  tone?: Tone | undefined;
  /** Second tone for the duotone volume gradient (hero avatar frame is sky/lavender). */
  tone2?: Tone | undefined;
  className?: string | undefined;
  /** Forwarded verbatim so a later `<ViewTransition>` name can be attached (TSK-06). */
  style?: CSSProperties | undefined;
  children?: ReactNode | undefined;
}

/** Intrinsic-ratio bezel around avatar/media — `AvatarStage`, case-study hero media, `PrototypeFrame`. */
export function ClayFrame({
  ratio = "4/5",
  tier = "hero",
  tone,
  tone2,
  className,
  style,
  children,
}: ClayFrameProps) {
  const classes = ["relative overflow-hidden", tierClass[tier], tone ? toneClass[tone] : "", className]
    .filter(Boolean)
    .join(" ");

  const duotone: CSSProperties | undefined =
    tone && tone2
      ? { backgroundImage: `linear-gradient(160deg, var(--color-${tone}), var(--color-${tone2}))` }
      : undefined;

  return (
    <div
      className={classes}
      style={{ aspectRatio: ratio.replace("/", " / "), ...duotone, ...style }}
    >
      {children}
    </div>
  );
}
