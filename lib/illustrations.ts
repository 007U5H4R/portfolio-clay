import type { StaticImageData } from "next/image";
import { ILLUSTRATIONS, type Illustration } from "@/content/media/illustrations/manifest";
import sceneWork from "@/content/media/illustrations/scene-work.webp";
import sceneWorkDark from "@/content/media/illustrations/scene-work-dark.webp";
import sceneCasestudy from "@/content/media/illustrations/scene-casestudy.jpg";
import sceneAbout from "@/content/media/illustrations/scene-about.webp";
import sceneAboutDark from "@/content/media/illustrations/scene-about-dark.webp";
import sceneThinking from "@/content/media/illustrations/scene-thinking.webp";
import sceneThinkingDark from "@/content/media/illustrations/scene-thinking-dark.webp";
import scenePlayground from "@/content/media/illustrations/scene-playground.webp";
import scenePlaygroundDark from "@/content/media/illustrations/scene-playground-dark.webp";
import sceneContact from "@/content/media/illustrations/scene-contact.webp";
import sceneContactDark from "@/content/media/illustrations/scene-contact-dark.webp";
import sceneExperience from "@/content/media/illustrations/scene-experience.webp";
import sceneExperienceDark from "@/content/media/illustrations/scene-experience-dark.webp";
import sceneCertifications from "@/content/media/illustrations/scene-certifications.webp";
import sceneCertificationsDark from "@/content/media/illustrations/scene-certifications-dark.webp";
import heroBanner from "@/content/media/illustrations/hero-banner.webp";
import heroBannerDark from "@/content/media/illustrations/hero-banner-dark.webp";

export type { Illustration, IllustrationKind } from "@/content/media/illustrations/manifest";
export type IllustrationId = Illustration["id"];
export type SceneId = "scene-work" | "scene-casestudy" | "scene-about" | "scene-thinking" | "scene-playground" | "scene-contact" | "scene-experience" | "scene-certifications";
/** Every illustration that ships through `next/image` as a static import (the scenes + the hero banner, TKT-93). */
export type StaticIllustrationId = SceneId | "hero-banner";

/**
 * Static imports of the eight scenes (Design.md §6.4; TASK-114 added `scene-experience` / `scene-certifications`) and the hero banner (Dev-21/Dev-23) so
 * `next/image` receives `StaticImageData` (intrinsic size, AVIF/WebP) — the clip + poster are served
 * as-is from `public/media/illustrations/` via `illustration(id).publicSrc` instead (§6.1).
 */
const SCENE_IMAGES: Record<StaticIllustrationId, StaticImageData> = {
  "scene-work": sceneWork,
  "scene-casestudy": sceneCasestudy,
  "scene-about": sceneAbout,
  "scene-thinking": sceneThinking,
  "scene-playground": scenePlayground,
  "scene-contact": sceneContact,
  "scene-experience": sceneExperience,
  "scene-certifications": sceneCertifications,
  "hero-banner": heroBanner,
};

/**
 * The matched dark-theme twins (S23, EV9; manifest `darkFile`): one static import per paired id, identical pixel
 * size to its light twin (EVAL-025). T3 (TASK-144.5) paired every scene but `scene-casestudy` (144.4, deferred),
 * which has no dark art and renders its light scene in both themes.
 */
const DARK_SCENE_IMAGES: Partial<Record<StaticIllustrationId, StaticImageData>> = {
  "hero-banner": heroBannerDark,
  "scene-work": sceneWorkDark,
  "scene-about": sceneAboutDark,
  "scene-thinking": sceneThinkingDark,
  "scene-playground": scenePlaygroundDark,
  "scene-contact": sceneContactDark,
  "scene-experience": sceneExperienceDark,
  "scene-certifications": sceneCertificationsDark,
};

/** The dark twin's static import, or `undefined` when the scene has no dark art yet. */
export function darkSceneImage(id: StaticIllustrationId): StaticImageData | undefined {
  return DARK_SCENE_IMAGES[id];
}

/** The static image import for a scene / banner id — pass to `next/image`'s `src`. */
export function sceneImage(id: StaticIllustrationId): StaticImageData {
  return SCENE_IMAGES[id];
}

/** Every manifest id, in manifest order. */
export const ILLUSTRATION_IDS: readonly IllustrationId[] = ILLUSTRATIONS.map((entry) => entry.id);

const BY_ID = new Map<string, Illustration>(ILLUSTRATIONS.map((entry) => [entry.id, entry]));

/**
 * The manifest entry for `id` (Design.md §6.1). Throws on an unknown id in every environment —
 * every call site is static, so a typo fails `next build` at prerender rather than shipping an
 * image without its alt.
 */
export function illustration(id: IllustrationId): Illustration {
  const entry = BY_ID.get(id);
  if (!entry) {
    throw new Error(`Unknown illustration id "${String(id)}" — expected one of: ${ILLUSTRATION_IDS.join(", ")}`);
  }
  return entry;
}
