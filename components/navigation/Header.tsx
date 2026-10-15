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
import { MoreMenu } from "./MoreMenu";
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
 * ≥ 1280, one row, grid `auto 1fr auto`: brand · `PrimaryNav` · pill + Ask + theme toggle. Below 1280 two rows
 * (TASK-112, Tushar 2026-09-27: tabs, no hamburger): brand · pill + Ask + toggle on row 1, and the five
 * folded-paper tabs as a full-width strip on row 2 (it scrolls horizontally when they do not fit). There is no menu button at any width.
 * TASK-192 (origami paper tabs): the sheet carries a paper-grain image and a thin terrain band; each tab is CSS
 * geometry (`clip-path` face, thickness, fold, one upper-left light) built in `PrimaryNav`.
 * TASK-205 (mobile redesign, < 640): a compact header — brand, Ask, theme chip and a "More" button (the `MoreMenu` sheet) over a 44 px
 * tab strip; the "Let's connect" pill moves into the sheet (its `/contact` route is unchanged) and ≥ 640 is untouched.
 * The brand's Caveat subline is the header's single counted decoration (§3.3: header = 1); it goes
 * through `MediaGate min={640}` so it is removed from the DOM below 640 (TP14), not hidden by CSS.
 * The wordmark is Inter 600 13 px — a brand micro-label (`data-micro-label`, EXE-7), not content.
 */
export function Header() {
  return (
    <header data-site-header="" className="site-header">
      <HeaderScroll />
      <SecretTrigger />
      {/* TASK-192: the paper sheet (grain, torn lower edge) with the thin terrain band inside it — decorative layers behind the real HTML. */}
      <span className="header-paper" aria-hidden="true">
        <span className="header-paper-sheet">
          <span className="header-terrain">
            <span className="ht-mid" />
            <span className="ht-left" />
            <span className="ht-right" />
          </span>
        </span>
      </span>
      <Container className="site-header-row">
        <Link href="/" aria-label={`${site.name} — home`} className="header-brand focus-ring">
          <span className="header-tile" aria-hidden="true">
            <Monogram />
          </span>
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
            <span className="hp-shadow" aria-hidden="true" />
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
          {/* TASK-205: phone-only secondary destinations; CSS hides the button at >= 640. */}
          <MoreMenu />
        </div>
      </Container>
    </header>
  );
}
