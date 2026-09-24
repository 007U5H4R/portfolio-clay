import { ILLUSTRATIONS, type Illustration } from "@/content/media/illustrations/manifest";

export type { Illustration, IllustrationKind } from "@/content/media/illustrations/manifest";
export type IllustrationId = Illustration["id"];

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
