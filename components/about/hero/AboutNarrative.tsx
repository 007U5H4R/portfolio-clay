import { Annotation } from "@/components/paper/Annotation";
import { ABOUT_HEADLINE, ABOUT_PERSONAL_NOTE, ABOUT_SUBLINE } from "./about-hero-data";
import { AboutMetrics } from "./AboutMetrics";

/**
 * The `/about` hero's left column (TASK-117, spec §3–§10, §28): eyebrow → h1 → hand subline →
 * metrics card → personal note. Server components; the entrance is CSS keyed off `data-enter`
 * (`AboutHero` wraps the grid in the shared arm-then-reveal `ContactEntrance`).
 */

export function AboutEyebrow() {
  return (
    <p className="ahero-eyebrow" data-enter="eyebrow">
      About <span aria-hidden="true" className="ahero-dot" /> Senior Product Manager
    </p>
  );
}

/** Spec §4: lines 1–2 navy, line 3 terracotta. Lines break only ≥ 640 (spec §25: no forced breaks on phones). */
export function AboutHeadline() {
  const [first, second, last] = ABOUT_HEADLINE;
  return (
    <h1 id="about-hero-heading" className="ahero-h1" data-enter="headline">
      <span className="ahero-line">{first}</span> <span className="ahero-line">{second}</span>{" "}
      <span className="ahero-line ahero-now" data-enter="now">
        {last}
      </span>
    </h1>
  );
}

/** Spec §6 — Dev-10: a decorative restatement of the h1, out of the accessibility tree. The terracotta stroke is inside the object. */
export function AboutSubline() {
  return (
    <div className="ahero-sub-wrap" data-enter="subline">
      <Annotation size="hero" rotate={-1.5} className="ahero-sub">
        {ABOUT_SUBLINE}
        <svg className="ahero-stroke" viewBox="0 0 300 12" preserveAspectRatio="none" focusable="false">
          <path d="M3 8 C 70 3, 140 11, 210 5 C 245 3, 275 5, 297 7" />
        </svg>
      </Annotation>
    </div>
  );
}

/** Spec §10 — a personality detail, not a headline (decorative, `aria-hidden`). */
export function AboutPersonalNote() {
  return (
    <div className="ahero-personal-wrap" data-enter="note">
      <Annotation size="lg" rotate={-1} className="ahero-personal">
        {ABOUT_PERSONAL_NOTE} <span className="ahero-emoji">☕</span>
        <svg className="ahero-stroke" viewBox="0 0 240 10" preserveAspectRatio="none" focusable="false">
          <path d="M3 6 C 60 2, 120 9, 180 4 C 205 3, 225 4, 237 6" />
        </svg>
      </Annotation>
    </div>
  );
}

export function AboutNarrative() {
  return (
    <div className="ahero-narrative">
      <AboutEyebrow />
      <AboutHeadline />
      <AboutSubline />
      <AboutMetrics />
      <AboutPersonalNote />
    </div>
  );
}
