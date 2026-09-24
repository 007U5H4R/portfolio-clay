import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { Annotation } from "@/components/paper";
import { MediaGate } from "@/components/paper/MediaGate";
import { site } from "@/lib/site";
import { AskAIButton } from "./AskAIButton";
import { HeaderScroll } from "./HeaderScroll";
import { MobileMenu } from "./MobileMenu";
import { Monogram } from "./Monogram";
import { PrimaryNav } from "./PrimaryNav";

/**
 * Sticky paper header (Design.md §4.1; decisions D12, D8, S21; TKT-71). Server shell: one height
 * (~72 px — a 44 px control row + 14 px padding-block), `--header-bg` + 10 px blur,
 * `top: env(safe-area-inset-top)`, and a 1 px `--line` bottom border that appears only once
 * `HeaderScroll` sets `data-scrolled` (after 8 px). **No rest→compact height change** — the F6
 * scroll-hysteresis hook, the padding animation and the active-link pill are deleted with the
 * motion system (D12).
 *
 * Grid `auto 1fr auto`: brand · `PrimaryNav` (≥ lg) · [pill + Ask ghost (≥ lg) | menu button (< lg)].
 * The brand's Caveat subline is the header's single counted decoration (§3.3: header = 1); it goes
 * through `MediaGate min={640}` so it is removed from the DOM below 640 (TP14), not hidden by CSS.
 * The wordmark is Inter 600 13 px — a brand micro-label (`data-micro-label`, EXE-7), not content.
 */
export function Header() {
  return (
    <header data-site-header="" className="site-header">
      <HeaderScroll />
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
            Let&apos;s connect <span aria-hidden="true">→</span>
          </Link>
          <AskAIButton />
          <MobileMenu />
        </div>
      </Container>
    </header>
  );
}
