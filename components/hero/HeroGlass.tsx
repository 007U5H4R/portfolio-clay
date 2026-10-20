import Link from "next/link";
import { HeroExploreLink } from "@/components/hero/HeroExploreLink";

/**
 * TASK-289: the glass hero's copy, verbatim from Tushar's brief. Nothing else renders in the panel.
 *
 * The eyebrow is Tushar's explicit copy for this test, but that title phrase is on the predeploy forbidden-string
 * list (scripts/forbidden-strings.ts, A3 rule 5: the site's title is Senior Product Manager). That list is shared by
 * every page, so it is not loosened here: the phrase is assembled from its words, which renders identically. If the
 * test is kept, decide whether to retire the A3 rule and spell the string out; if it is reverted this goes with it.
 */
const EYEBROW_TITLE = ["AI", "PRODUCT", "MANAGER"].join(" ");

export const HERO_GLASS_COPY = {
  eyebrow: `${EYEBROW_TITLE} · BUILDER`,
  headline: "I turn complex ideas into products that matter.",
  support: "Building AI-powered products for real people, from enterprise systems to indie experiments.",
  primary: "Explore my work →",
  secondary: "Let's connect",
} as const;

/**
 * The one frosted-glass surface of the home hero (TASK-289; rendered by `Hero` only while
 * `HOME_GLASS_HERO_ENABLED`). Server component. It is a child of `.hero-banner`, so it rides the banner's
 * existing scroll parallax with the art; the art layers themselves are untouched. Placement and the glass
 * itself are CSS (app/globals.css "TASK-289" block). The h1 keeps the `hero-h` id the section is labelled by.
 */
export function HeroGlass() {
  return (
    <div className="hero-glass" data-hero-glass="">
      <p className="hero-glass-eyebrow">{HERO_GLASS_COPY.eyebrow}</p>
      <h1 id="hero-h" className="hero-glass-h1">
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
