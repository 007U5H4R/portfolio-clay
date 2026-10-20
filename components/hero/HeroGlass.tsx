import Link from "next/link";
import { HeroExploreLink } from "@/components/hero/HeroExploreLink";

/** TASK-289: the glass hero's copy, verbatim from Tushar's brief. Nothing else renders in the panel. */
export const HERO_GLASS_COPY = {
  eyebrow: "PRODUCT MANAGER · AI BUILDER",
  headline: "I turn complex ideas into products that matter.",
  support: "Building AI-powered products for real people, from enterprise systems to indie experiments.",
  primary: "Explore my work →",
  secondary: "Let's connect",
} as const;

/**
 * The one frosted-glass surface of the home hero (TASK-289; rendered by `Hero` only while
 * `HOME_GLASS_HERO_ENABLED`). Server component. It is a child of `.hero-banner`, so it rides the banner's
 * existing scroll parallax with the art; the art layers themselves are untouched. Placement and the glass
 * itself are CSS (app/globals.css "TASK-289" block). Shown only ≥ 1024 (CSS `display: none` below, which also takes its h1 out of the accessibility tree); its h1 id is unique (the previous hero keeps `hero-h`).
 */
export function HeroGlass() {
  return (
    <div className="hero-glass" data-hero-glass="">
      <p className="hero-glass-eyebrow">{HERO_GLASS_COPY.eyebrow}</p>
      <h1 id="hero-glass-h" className="hero-glass-h1">
        {HERO_GLASS_COPY.headline}
      </h1>
      <p className="hero-glass-support">{HERO_GLASS_COPY.support}</p>
      <div className="hero-glass-cta">
        <HeroExploreLink className="hero-btn hero-btn-primary focus-ring">{HERO_GLASS_COPY.primary}</HeroExploreLink>
        <Link href="/contact" className="hero-btn hero-btn-secondary focus-ring">
          {HERO_GLASS_COPY.secondary}
        </Link>
      </div>
    </div>
  );
}
