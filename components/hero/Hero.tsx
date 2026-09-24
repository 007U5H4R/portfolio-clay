import { Container } from "@/components/layout/Container";
import { ClayButton } from "@/components/clay/ClayButton";
import { AvatarStage } from "@/components/hero/AvatarStage";
import { FloatingTiles } from "@/components/hero/FloatingTiles";
import { Annotation } from "@/components/hero/Annotation";
import { hero } from "@/data/hero";
import { resumeAction } from "@/lib/site";

/**
 * Home hero (redesign — Design.md §3, evolved for the "WoW" visual pass). Two-column at ≥1024
 * (42fr AvatarStage / 58fr content); below that it stacks avatar → eyebrow/headline → CTAs → tiles,
 * left-aligned (Law of Continuity — one vertical reading axis). The avatar sits inside a soft
 * animated glow halo (`.glow-halo`, decorative, reduced-motion-safe); the whole section floats over
 * the fixed aurora background painted in globals.css.
 *
 * Server component: the only interactivity (cursor parallax) is isolated in the `Parallax` client
 * leaves inside `AvatarStage` / `FloatingTiles`.
 */
export function Hero() {
  const resume = resumeAction();

  return (
    <Container
      as="section"
      className="grid gap-8 pt-8 pb-20 lg:grid-cols-[42fr_58fr] lg:items-center lg:gap-16 lg:pt-28 lg:pb-24 2xl:gap-24"
    >
      <div className="glow-halo flex justify-center lg:justify-start">
        <AvatarStage />
      </div>

      {/* lg:min-w-0 lets this grid item shrink below its content's min-content so the avatar's 42fr
          track claims its full share at lg; paired with min-w-0 on the FloatingTiles items so the
          tile row reflows narrower instead of overflowing. */}
      <div className="flex min-w-0 flex-col items-start gap-5 text-left md:gap-6">
        <span className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] bg-ivory px-4 py-2 text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-navy-2 shadow-[var(--shadow-utility)]">
          <span
            aria-hidden="true"
            className="inline-block h-2 w-2 rounded-full bg-rust"
          />
          {hero.eyebrow.text}
        </span>

        <h1 className="text-[length:var(--text-hero)] font-extrabold tracking-[var(--tracking-hero)] leading-[var(--leading-hero)] text-navy lg:text-[length:var(--text-hero-lg)]">
          {hero.headline.before}
          <span className="hero-highlight">{hero.headline.highlight}</span>
          {hero.headline.after}
        </h1>

        {/* EXE-9: hidden below md so the primary CTA + first proof tile clear the mobile fold. */}
        <p className="hidden max-w-[46ch] text-[length:var(--text-lead)] text-navy-2 md:block">
          {hero.support.text}
        </p>

        <div className="flex w-full flex-col items-start gap-4 md:w-auto md:flex-row md:items-center">
          <ClayButton variant="primary" href="/work" className="w-full md:w-auto">
            View My Work →
          </ClayButton>
          <ClayButton
            variant="secondary"
            href={resume.href}
            download={resume.download}
            title={resume.note}
            className="w-full md:w-auto"
          >
            {resume.label}
          </ClayButton>
          <Annotation className="md:ml-2" />
        </div>

        <FloatingTiles tiles={hero.tiles} />
      </div>
    </Container>
  );
}
