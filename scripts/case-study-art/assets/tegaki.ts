import { INK, stampFilter, svg, type Asset } from "../kit";

/**
 * Tegaki (手書き, Japanese stationery / handwriting studio): a vermilion hanko seal with drawn brush
 * strokes (no font-dependent text), and a tapered ink brush stroke used as the section underline. No Great Wave,
 * no AI imagery (TASK-127 rule for this product).
 */
const hanko = svg(
  200,
  200,
  `<defs>${stampFilter("hk", 5)}</defs><g filter="url(#hk)"><rect x="14" y="14" width="172" height="172" rx="26" fill="${INK.rust}"/><rect x="28" y="28" width="144" height="144" rx="16" fill="none" stroke="${INK.paper}" stroke-width="5"/><g fill="none" stroke="${INK.paper}" stroke-linecap="round" stroke-linejoin="round"><path d="M62 70 C 84 62, 116 62, 138 68" stroke-width="10"/><path d="M58 102 C 86 96, 116 96, 142 100" stroke-width="10"/><path d="M100 50 C 102 90, 102 124, 94 150 C 90 160, 80 158, 74 150" stroke-width="11"/><path d="M122 124 C 132 132, 140 142, 144 154" stroke-width="8"/></g></g>`,
);

/** A single tapered brush stroke with a dry-brush tail. */
const brush = svg(
  600,
  40,
  `<path d="M6 26 C 90 12, 210 8, 330 13 S 520 22, 594 14 C 560 24, 470 30, 360 27 S 150 30, 6 26 Z" fill="${INK.navy}"/><path d="M430 22 C 480 21, 530 20, 585 16" stroke="${INK.navy}" stroke-width="1.6" fill="none" opacity="0.55"/><path d="M420 27 C 470 26, 520 25, 570 21" stroke="${INK.navy}" stroke-width="1.2" fill="none" opacity="0.4"/>`,
);

export const tegakiAssets: Asset[] = [
  { file: "hanko.svg", svg: hanko },
  { file: "brush.svg", svg: brush },
];
