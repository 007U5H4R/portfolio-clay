import {
  ClipboardList,
  File,
  FileText,
  Link2,
  Presentation,
  type LucideIcon,
} from "lucide-react";
import type { SourceRef } from "@/data/schema";
import type { GenericArtifact } from "./types";
import { ClayIcon } from "@/components/clay/ClayIcon";
import { ExternalLink } from "@/components/common/ExternalLink";
import { ArtifactShell } from "./ArtifactShell";

export interface ArtifactCardProps {
  artifact: GenericArtifact;
  source: SourceRef;
}

type GenericKind = GenericArtifact["kind"];

/** kind → {icon, label} for the generic document/link card. */
const kindMap: Record<GenericKind, { icon: LucideIcon; label: string }> = {
  prd: { icon: FileText, label: "PRD" },
  deck: { icon: Presentation, label: "Deck" },
  ledger: { icon: ClipboardList, label: "Ledger" },
  doc: { icon: File, label: "Doc" },
  link: { icon: Link2, label: "Link" },
};

const isExternal = (href: string): boolean => !href.startsWith("/");

/**
 * ArtifactCard (Design.md §3): the generic PRD/deck/ledger/doc/link card — a type icon, the title
 * (a link when the artifact has an `href`), an optional note, and the shared source line. The link
 * is scoped to the title, NOT the whole card: the card's source caption is itself a link when the
 * source has a public url, and an anchor may never nest inside another anchor (valid HTML + a11y).
 * External title links open in a new tab with the standard "(opens in new tab)" note.
 */
export function ArtifactCard({ artifact, source }: ArtifactCardProps) {
  const { icon, label } = kindMap[artifact.kind];
  const href = artifact.href;

  return (
    <ArtifactShell source={source} label={label} caption={artifact.note}>
      <div className="flex items-start gap-[var(--space-3)]">
        <ClayIcon icon={icon} size={40} tone="lavender" />
        <div className="flex flex-1 flex-col gap-[var(--space-1)]">
          {href ? (
            isExternal(href) ? (
              <ExternalLink href={href} className="text-[length:var(--text-body)] font-semibold text-navy">
                {artifact.title}
              </ExternalLink>
            ) : (
              <a
                href={href}
                className="w-fit rounded-[2px] text-[length:var(--text-body)] font-semibold text-rust underline underline-offset-2 focus-ring"
              >
                {artifact.title}
              </a>
            )
          ) : (
            <span className="text-[length:var(--text-body)] font-semibold text-navy">
              {artifact.title}
            </span>
          )}
        </div>
      </div>
    </ArtifactShell>
  );
}
