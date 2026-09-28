import type { VideoMedia } from "@/lib/video-providers";

/**
 * TEST-ONLY video fixtures for `/dev/media-player` (TASK-122). NEVER product data — no real pitch or
 * demo video exists yet (`data/portfolio.ts` has no ids; the Portfolio shows "coming" tags).
 *
 * `M7lc1UVf-VE` is Google for Developers' public "YouTube Developers Live: Embedded Web Player
 * Customization" — the sample video YouTube's own IFrame API docs embed: public, embeddable, harmless.
 */
export const FIXTURE_YOUTUBE_ID = "M7lc1UVf-VE";
/** Blender Foundation's official "Big Buck Bunny" upload — public, embeddable, harmless. */
export const FIXTURE_YOUTUBE_ID_2 = "aqz-KE-bpKQ";

export const FIXTURE_PITCH: VideoMedia = {
  provider: "youtube",
  videoId: FIXTURE_YOUTUBE_ID,
  title: "Fixture product pitch video",
};
