import type { ReactNode } from "react";
import type { SourceRef } from "@/data/schema";
import { Sheet, type SheetVariant } from "@/components/paper";
import { SourceCaption } from "./SourceCaption";

/** The eight §7.3 forms — one CSS hook each (`app/globals.css`, TKT-83 block). */
export type ArtifactForm = "insight" | "hyp" | "metric" | "dec" | "eval" | "exp" | "proto" | "doc";

export interface ArtifactShellProps {
  /** Which §7.3 form this is — sets the `artifact-<form>` class the TKT-83 CSS styles. */
  form: ArtifactForm;
  /** Short type eyebrow ("Insight", "Metric", …) — Inter 11 px uppercase, aids scanning without colour alone. */
  label: string;
  /**
   * Resolved source for the provenance line every artifact carries (TKT-20 AC 1). Omit ONLY when the
   * form renders its own `SourceCaption` in a spot the shell cannot know (the insight `figcaption`, the
   * metric card's foot, the prototype `figcaption`) — every artifact still ends with a Source line.
   */
  source?: SourceRef | undefined;
  /** Optional author caption from `artifact.caption` (Inter 13). */
  caption?: string | undefined;
  /** `Sheet` material (Design.md §3.1): `card` ivory (default) · `index` ruled · `photo` frame · `tag` kraft. */
  variant?: SheetVariant | undefined;
  as?: "article" | "div" | "figure" | undefined;
  /** Fasteners (`<Pin/>`, `<Tape/>`) — rendered as DIRECT children of the `Sheet` (Design.md §3.2 rule 8). */
  fasteners?: ReactNode | undefined;
  className?: string | undefined;
  children: ReactNode;
}

/**
 * The single shared paper DNA for every artifact (TKT-83 / Design.md §7.3 "all `data-paper`"): one
 * `Sheet` whose `variant` picks the material and whose `artifact-<form>` class picks the §7.3 shape
 * (padding, fill, type sizes live in the TKT-83 CSS block — never per-card Tailwind forks). It fixes
 * the Inter eyebrow at the top and the caption + `SourceCaption` footer at the bottom; the per-type
 * cards carry only their own body. Content paper is never counted by EVAL-018 and Caveat appears
 * inside only through `Hand` exemptions (§3.4). Server component.
 */
export function ArtifactShell({
  form,
  label,
  source,
  caption,
  variant = "card",
  as = "div",
  fasteners,
  className,
  children,
}: ArtifactShellProps) {
  return (
    <Sheet as={as} variant={variant} className={["artifact", `artifact-${form}`, className].filter(Boolean).join(" ")}>
      {fasteners}
      <p className="artifact-eyebrow">{label}</p>
      {children}
      {caption ? <p className="artifact-caption">{caption}</p> : null}
      {source ? <SourceCaption source={source} className="artifact-src" /> : null}
    </Sheet>
  );
}
