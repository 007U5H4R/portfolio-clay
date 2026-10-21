/**
 * Colour literals for code-rendered share cards (next/og runs outside the CSS cascade, so it cannot read the
 * `--color-*` tokens). The one file under lib/ allowed colour literals (eval-020 allow-list, D11).
 * Values are the light-theme paper tokens in app/globals.css, converted from OKLCH to sRGB hex (TASK-338).
 */
export const OG_COLORS = {
  paper: "#f7f1e7",
  navy: "#0d1735",
  rust: "#b64927",
  kraft: "#d7be93",
} as const;
