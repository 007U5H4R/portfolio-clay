import { Container } from "@/components/layout/Container";
import { ClayButton } from "@/components/clay/ClayButton";
import { AvatarStage } from "@/components/hero/AvatarStage";
import { FloatingTiles } from "@/components/hero/FloatingTiles";
import { Annotation } from "@/components/hero/Annotation";
import { hero } from "@/data/hero";
import { resumeAction } from "@/lib/site";

/**
 * Home hero (technical-plan.md §B S05.05, Design.md §3). Two-column at ≥1024 (35fr AvatarStage /
 * 65fr content); below that it stacks into the fixed mobile order avatar → eyebrow/headline →
 * CTAs → tiles, left-aligned throughout (Law of Continuity — one vertical reading axis).
 *
 * Server component: the only interactivity (cursor parallax) is isolated in the `Parallax`
 * client leaves inside `AvatarStage` / `FloatingTiles`.
 */
export function Hero() {
  const resume = resumeAction();

  return (
    <Container
      as="section"
      className="grid gap-8 pt-8 pb-20 lg:grid-cols-[42fr_58fr] lg:gap-16 lg:pt-32 lg:pb-24 2xl:gap-24"
    >
      <div className="flex justify-center lg:justify-start">
        <AvatarStage />
      </div>

      {/* lg:min-w-0 lets this grid item shrink below its content's min-content so the avatar's 42fr
          track claims its full share at lg (EXE-9); paired with min-w-0 on the FloatingTiles items so
          the tile row reflows narrower instead of overflowing. */}
      <div className="flex min-w-0 flex-col items-start gap-5 text-left md:gap-6">
        <p className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-3">
          {hero.eyebrow.text}
        </p>

        <h1 className="text-[length:var(--text-hero)] font-extrabold tracking-[var(--tracking-hero)] leading-[var(--leading-hero)] text-ink lg:text-[length:var(--text-hero-lg)]">
          {hero.headline.before}
          <span className="hero-highlight">{hero.headline.highlight}</span>
          {hero.headline.after}
        </h1>

        {/* EXE-9: hidden below md so the primary CTA + first proof tile clear the ~844px mobile
            fold (the eyebrow + headline highlight already carry the value prop on mobile; the tiles
            carry the proof). Shown from md up, where the vertical budget has room for the context. */}
        <p className="hidden max-w-[44ch] text-[length:var(--text-lead)] text-ink-2 md:block">
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
