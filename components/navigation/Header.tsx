import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper";
import { MediaGate } from "@/components/paper/MediaGate";
import { site } from "@/lib/site";
import { AskAIButton } from "./AskAIButton";
import { ThemeToggle } from "./ThemeToggle";
import { SecretTrigger } from "@/components/easter-egg/SecretTrigger";
import { HeaderScroll } from "./HeaderScroll";
import { Monogram } from "./Monogram";
import { PrimaryNav } from "./PrimaryNav";

/**
 * Sticky paper header (Design.md §4.1; decisions D12, D8, S21; TKT-71). Server shell: one height
 * (≥ 1440 ~72 px — a 44 px control row + 14 px padding-block; below 1440 the two-row `--header-h`),
 * `--header-bg` + 10 px blur,
 * `top: env(safe-area-inset-top)`, and a 1 px `--line` bottom border that appears only once
 * `HeaderScroll` sets `data-scrolled` (after 8 px). **No rest→compact height change** — the F6
 * scroll-hysteresis hook, the padding animation and the active-link pill are deleted with the
 * motion system (D12).
 *
 * ≥ 1440, one row, grid `auto 1fr auto`: brand · `PrimaryNav` · pill + Ask ghost. Below 1440 two rows
 * (TASK-112, Tushar 2026-09-27: tabs, no hamburger): brand · pill + Ask on row 1, and the seven tabs
 * as a full-width, horizontally scrollable strip on row 2. There is no menu button at any width.
 * The brand's Caveat subline is the header's single counted decoration (§3.3: header = 1); it goes
 * through `MediaGate min={640}` so it is removed from the DOM below 640 (TP14), not hidden by CSS.
 * The wordmark is Inter 600 13 px — a brand micro-label (`data-micro-label`, EXE-7), not content.
 */
export function Header() {
  return (
    <header data-site-header="" className="site-header">
      <HeaderScroll />
      <SecretTrigger />
      {/* M-010 T4 (TASK-145.1): the paper strip — decorative layers behind the real HTML (paper-cut-2 §172–§176). */}
      <span className="header-paper" aria-hidden="true">
        <span className="header-paper-sheet" />
        <span className="header-scrap header-scrap-graph" />
        <span className="header-scrap header-scrap-rust" />
        <span className="header-scrap header-scrap-kraft" />
      </span>
      <Container className="site-header-row">
        <Link href="/" aria-label={`${site.name} — home`} className="header-brand focus-ring">
          <Monogram />
          <span className="header-wordmark">
            <span className="header-name" data-micro-label="">
              {site.name}
            </span>
            <MediaGate min={640}>
              <Annotation size="sm" className="header-subline">
                Build · Learn · Solve · Grow
              </Annotation>
            </MediaGate>
          </span>
        </Link>

        <PrimaryNav />

        <div className="header-actions">
          <Link href="/contact" data-hand="cta" className="header-pill font-hand focus-ring">
            {/* < 640 the pill reads "Connect →"; "Let's" stays in the accessible name (TASK-112). */}
            <span>
              <span className="max-sm:sr-only">Let&apos;s </span>
              <span className="max-sm:capitalize">connect</span>
            </span>
            <span aria-hidden="true" className="header-pill-arrow">
              →
            </span>
          </Link>
          <AskAIButton />
          {/* The theme switch sits on its own paper chip (TASK-145.1); the control inside is unchanged. */}
          <span className="header-chip">
            <ThemeToggle />
          </span>
        </div>
      </Container>
    </header>
  );
}
