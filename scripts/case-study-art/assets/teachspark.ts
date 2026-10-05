import { INK, stampFilter, svg, type Asset } from "../kit";

/**
 * TeachSpark (teacher's desk / classroom workbook): a ruled worksheet page with numbered answer
 * lines, a tick column and pencil doodles (text-free — the product's words stay in HTML), and a
 * red-pen "checked" stamp. No WhatsApp or other logos: the chat motif is plain bubbles in CSS.
 */
function worksheet(): string {
  const rows: string[] = [];
  for (let i = 0; i < 6; i++) {
    const y = 150 + i * 62;
    rows.push(
      `<circle cx="78" cy="${y}" r="13" fill="none" stroke="${INK.navy2}" stroke-width="3"/>`,
      `<rect x="104" y="${y - 5}" width="${i % 3 === 2 ? 170 : 240}" height="9" rx="4.5" fill="${INK.navy2}" opacity="0.55"/>`,
      `<rect x="104" y="${y + 16}" width="300" height="3" fill="${INK.steel}" opacity="0.5"/>`,
      i < 4 ? `<path d="M${392} ${y - 2}l9 10 18-22" fill="none" stroke="${INK.rust}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>` : "",
    );
  }
  const lines = Array.from({ length: 17 }, (_, i) => `<path d="M24 ${60 + i * 31}H456" stroke="${INK.steel}" stroke-opacity="0.2" stroke-width="2"/>`).join("");
  return svg(
    480,
    620,
    `<rect x="10" y="14" width="460" height="600" rx="6" fill="${INK.navy}" opacity="0.18"/><rect x="4" y="4" width="460" height="600" rx="6" fill="${INK.ivory}" stroke="${INK.navy}" stroke-width="3"/>${lines}<path d="M56 4V604" stroke="${INK.rust}" stroke-opacity="0.45" stroke-width="3"/><rect x="104" y="40" width="210" height="18" rx="4" fill="${INK.forest}"/><rect x="104" y="72" width="130" height="9" rx="4.5" fill="${INK.inkSoft}" opacity="0.6"/>${rows.join("")}<g fill="none" stroke="${INK.navy2}" stroke-width="3" stroke-linecap="round"><path d="M330 520c20-26 52-26 70 0s48 26 60 0" /><circle cx="120" cy="540" r="22"/><path d="M120 518v44M98 540h44"/><path d="M190 560l26-44 26 44z"/></g><g transform="translate(-46 40) rotate(-38 400 90)"><rect x="330" y="80" width="150" height="20" rx="3" fill="${INK.note}" stroke="${INK.navy}" stroke-width="3"/><path d="M480 80l26 10-26 10z" fill="${INK.kraft}" stroke="${INK.navy}" stroke-width="3" stroke-linejoin="round"/><rect x="316" y="80" width="16" height="20" rx="2" fill="${INK.rust}" stroke="${INK.navy}" stroke-width="3"/></g>`,
  );
}

const checked = svg(
  200,
  200,
  `<defs>${stampFilter("tk", 6)}</defs><g filter="url(#tk)" fill="none" stroke="${INK.rust}" stroke-linecap="round" stroke-linejoin="round"><circle cx="100" cy="100" r="86" stroke-width="7"/><circle cx="100" cy="100" r="72" stroke-width="2.5" stroke-dasharray="3 7"/><path d="M58 104l30 30 56-66" stroke-width="15"/></g>`,
);

export const teachsparkAssets: Asset[] = [
  { file: "worksheet.svg", svg: worksheet() },
  { file: "stamp-checked.svg", svg: checked },
];
