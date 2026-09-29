import { INK, stampFilter, svg, type Asset } from "../kit";

/**
 * Nuptis → Velora (sourcing & onboarding dossier): a "Day 7 ✕" rejection stamp for the killed first
 * bet, and a fabric swatch tag on a string (apparel sourcing, not lifestyle). No "verified" art:
 * Velora's trust scores are authored, so nothing here implies a real verification.
 */
const killed = svg(
  240,
  150,
  `<defs>${stampFilter("vk", 11)}</defs><g filter="url(#vk)"><rect x="8" y="8" width="224" height="134" rx="12" fill="none" stroke="${INK.rust}" stroke-width="6"/><text x="120" y="68" text-anchor="middle" font-family="Georgia, serif" font-size="40" font-weight="700" letter-spacing="4" fill="${INK.rust}">DAY 7</text><path d="M84 88l72 38M156 88l-72 38" stroke="${INK.rust}" stroke-width="9" stroke-linecap="round"/></g>`,
);

function swatch(): string {
  const weave = Array.from({ length: 12 }, (_, i) => `<path d="M${40 + i * 12} 92V232" stroke="${INK.ivory}" stroke-opacity="0.22" stroke-width="4"/>`).join("") +
    Array.from({ length: 12 }, (_, i) => `<path d="M34 ${98 + i * 12}H188" stroke="${INK.navy}" stroke-opacity="0.16" stroke-width="4"/>`).join("");
  return svg(
    220,
    300,
    `<path d="M110 6 C 150 30 90 50 110 76" fill="none" stroke="${INK.navy2}" stroke-width="3"/><rect x="18" y="70" width="184" height="222" rx="10" fill="${INK.kraft}" stroke="${INK.navy}" stroke-width="3"/><circle cx="110" cy="84" r="7" fill="${INK.paper}" stroke="${INK.navy}" stroke-width="3"/><rect x="34" y="92" width="152" height="140" rx="4" fill="${INK.forest}"/>${weave}<path d="M34 232 l8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 4 5" fill="${INK.forest}"/><rect x="40" y="254" width="96" height="9" rx="4.5" fill="${INK.navy2}" opacity="0.7"/><rect x="40" y="272" width="60" height="7" rx="3.5" fill="${INK.navy2}" opacity="0.45"/>`,
  );
}

export const veloraAssets: Asset[] = [
  { file: "stamp-day7.svg", svg: killed },
  { file: "swatch.svg", svg: swatch() },
];
