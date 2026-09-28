import { Sheet } from "@/components/paper/Sheet";
import { Tape } from "@/components/paper/Tape";
import { ABOUT_STATS, ABOUT_STATS_HOW } from "./about-hero-data";

/**
 * Spec §7–§9: one wide ivory stats card — three columns with thin rules between them, one tape strip
 * near the top-left, the footnote under a dotted rule. Content paper (`data-paper="card"` + a tape
 * fastener): not an EVAL-018 decoration. Values are derived (`about-hero-data.ts`), never typed in.
 */
export function AboutMetrics() {
  return (
    <div className="ahero-stats-wrap" data-enter="metrics">
      <Sheet variant="card" rotate={-0.2} className="ahero-stats">
        <Tape side="l" />
        <ul className="ahero-stat-list" aria-label="Three quick facts">
          {ABOUT_STATS.map((stat) => (
            <li key={stat.label} className="ahero-stat">
              <b data-tone={stat.tone}>{stat.value}</b>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>
        <p className="ahero-how">{ABOUT_STATS_HOW}</p>
      </Sheet>
    </div>
  );
}
