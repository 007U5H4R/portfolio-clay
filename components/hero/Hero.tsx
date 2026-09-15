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
      className="grid gap-16 pt-32 pb-24 lg:grid-cols-[35fr_65fr] 2xl:gap-24"
    >
      <div className="flex justify-center lg:justify-start">
        <AvatarStage />
      </div>

      <div className="flex flex-col items-start gap-6 text-left">
        <p className="text-[length:var(--text-caption)] font-semibold uppercase tracking-[var(--tracking-eyebrow)] text-ink-3">
          {hero.eyebrow.text}
        </p>

        <h1 className="text-[length:var(--text-hero)] font-extrabold tracking-[var(--tracking-hero)] leading-[var(--leading-hero)] text-ink">
          {hero.headline.before}
          <span className="hero-highlight">{hero.headline.highlight}</span>
          {hero.headline.after}
        </h1>

        <p className="max-w-[44ch] text-[length:var(--text-lead)] text-ink-2">{hero.support.text}</p>

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
