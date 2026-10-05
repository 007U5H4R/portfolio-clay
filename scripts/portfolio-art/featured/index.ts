import type { Collage } from "../collage";
import { campfireBoardFeatured } from "./campfire-board";
import { railciteFeatured } from "./railcite";
import { slagCityFeatured } from "./slag-city";

/** The home Featured Work collages (TASK-133), in featured-rank order. */
export const featuredCollages: readonly Collage[] = [railciteFeatured, slagCityFeatured, campfireBoardFeatured];
