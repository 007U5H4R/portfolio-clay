import { BookOpen, ClipboardList, Code2, FileText, FlaskConical, Gauge, LayoutTemplate, MessageSquareQuote, Network, Newspaper, NotebookPen, Presentation, ScrollText, Search, TestTube2, type LucideIcon } from "lucide-react";
import type { EvidenceItem } from "@/data/schema";
import type { z } from "zod";
import { EvidenceDrawer, type EvidenceRow } from "@/components/case-study/system/EvidenceDrawer";

type EvidenceType = z.infer<typeof EvidenceItem>["type"];

const TYPE_ICON: Record<EvidenceType, LucideIcon> = {
  PRD: FileText,
  Design: LayoutTemplate,
  Evaluation: ClipboardList,
  Research: Search,
  Architecture: Network,
  "Build ledger": NotebookPen,
  Deck: Presentation,
  Code: Code2,
  "Live data": Gauge,
  Post: Newspaper,
  "Test run": TestTube2,
  Feedback: MessageSquareQuote,
  Analytics: Gauge,
  Paper: FlaskConical,
  Readme: BookOpen,
};

/**
 * The evidence strip (TASK-130 redesign brief §48). Collapsed: "Evidence — everything here is backed
 * by real artifacts", one chip per artifact type, and "View all evidence →". Expanded: the shared
 * accessible drawer (modal dialog; name · type · date · the claim it supports · a link only when the
 * source is public). Nothing is listed on the page itself beyond the types.
 */
export function CaseStudyEvidenceDrawer({ items, rows, name, compact = false }: { items: readonly z.infer<typeof EvidenceItem>[]; rows: readonly EvidenceRow[]; name: string; compact?: boolean | undefined }) {
  const types = Array.from(new Set(items.map((item) => item.type)));
  return (
    <section className="csx-evidence jx-evidence" data-compact={compact ? "" : undefined} aria-labelledby="evidence-drawer-section-h">
      <div className="jx-evidence-in" data-paper="card">
        <div className="jx-evidence-head">
          <p className="csx-eyebrow" data-micro-label="">
            Source material
          </p>
          <h2 id="evidence-drawer-section-h" className="csx-h2 csx-h2-sm">
            Everything here is backed by real artifacts.
          </h2>
        </div>
        <ul className="jx-evidence-types" aria-label="Evidence types">
          {types.map((type) => {
            const Icon = TYPE_ICON[type] ?? ScrollText;
            return (
              <li key={type} className="jx-evidence-type">
                <Icon aria-hidden="true" focusable="false" size={20} strokeWidth={1.6} />
                <span>{type}</span>
              </li>
            );
          })}
        </ul>
        <EvidenceDrawer rows={rows} name={name} />
      </div>
    </section>
  );
}
