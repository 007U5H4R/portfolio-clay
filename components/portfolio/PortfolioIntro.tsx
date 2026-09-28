import { Sketch } from "@/components/paper";

/**
 * The compact page intro (TASK-116, spec §4): eyebrow, the h1 with its rust underline sketch, and
 * the one-line subline. No hero after the scene opener — the media stage + carousel below it are the
 * hero. EVAL-018: the underline is this section's one sketch (Design.md §3.3 `/projects` products).
 */
export function PortfolioIntro() {
  return (
    <header className="pf-intro">
      <p className="pf-eyebrow">Portfolio</p>
      <h1 id="portfolio-h" className="pf-h1">
        Products I&rsquo;ve built, tested, and <span className="pf-h1-mark">shipped.<Sketch variant="underline" /></span>
      </h1>
      <p className="pf-sub">Pick one. Watch the pitch. Open the demo. Explore the build.</p>
    </header>
  );
}
