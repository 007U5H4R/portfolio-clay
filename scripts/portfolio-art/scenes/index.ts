import type { Scene } from "../kit";
import { bhaktiVilas } from "./bhakti-vilas";
import { campfireBoard } from "./campfire-board";
import { cinematicPortfolio } from "./cinematic-portfolio";
import { cubicle } from "./cubicle";
import { dinoArcadePwa } from "./dino-arcade-pwa";
import { nuptis } from "./nuptis";
import { pratyasa } from "./pratyasa";
import { railcite } from "./railcite";
import { slagCity } from "./slag-city";
import { teachspark } from "./teachspark";
import { tegaki } from "./tegaki";
import { tokenToli } from "./token-toli";
import { velora } from "./velora";

/** Every product cover scene, in `data/portfolio.ts` order (TASK-127). */
export const scenes: readonly Scene[] = [
  teachspark,
  railcite,
  velora,
  cubicle,
  nuptis,
  bhaktiVilas,
  tokenToli,
  pratyasa,
  tegaki,
  dinoArcadePwa,
  cinematicPortfolio,
  campfireBoard,
  slagCity,
];
