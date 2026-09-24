import type { StaticImageData } from "next/image";
import { ILLUSTRATIONS, type Illustration } from "@/content/media/illustrations/manifest";
import sceneWork from "@/content/media/illustrations/scene-work.jpg";
import sceneCasestudy from "@/content/media/illustrations/scene-casestudy.jpg";
import sceneAbout from "@/content/media/illustrations/scene-about.jpg";
import sceneThinking from "@/content/media/illustrations/scene-thinking.jpg";
import scenePlayground from "@/content/media/illustrations/scene-playground.jpg";
import sceneContact from "@/content/media/illustrations/scene-contact.jpg";

export type { Illustration, IllustrationKind } from "@/content/media/illustrations/manifest";
export type IllustrationId = Illustration["id"];
export type SceneId = "scene-work" | "scene-casestudy" | "scene-about" | "scene-thinking" | "scene-playground" | "scene-contact";

/**
 * Static imports of the six scenes (Design.md §6.4) so `next/image` receives `StaticImageData`
 * (intrinsic size, AVIF/WebP) — the clip + poster are served as-is from `public/media/illustrations/`
 * via `illustration(id).publicSrc` instead (§6.1).
 */
const SCENE_IMAGES: Record<SceneId, StaticImageData> = {
  "scene-work": sceneWork,
  "scene-casestudy": sceneCasestudy,
  "scene-about": sceneAbout,
  "scene-thinking": sceneThinking,
  "scene-playground": scenePlayground,
  "scene-contact": sceneContact,
};

/** The static image import for a scene id — pass to `next/image`'s `src`. */
export function sceneImage(id: SceneId): StaticImageData {
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
