import qrcode from "qrcode-generator";

/** Boolean module matrix (error correction M — a quiet, robust default for a ~40 char URL). */
export function qrMatrix(text: string): boolean[][] {
  const qr = qrcode(0, "M");
  qr.addData(text, "Byte");
  qr.make();
  const n = qr.getModuleCount();
  return Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => qr.isDark(y, x)));
}

/**
 * One SVG path (`M x y h1 v1 h-1 z` per dark module, merged per row run) in module units, or `null`
 * when the text is empty or encoding fails — the caller then renders no QR frame at all (§32).
 */
export function qrPath(text: string): string | null {
  if (!text) return null;
  try {
    const m = qrMatrix(text);
    let d = "";
    m.forEach((row, y) => {
      let x = 0;
      while (x < row.length) {
        if (!row[x]) { x++; continue; }
        let run = 0;
        while (x + run < row.length && row[x + run]) run++;
        d += `M${x} ${y}h${run}v1h-${run}z`;
        x += run;
      }
    });
    return d || null;
  } catch {
    return null;
  }
}

export function qrSize(text: string): number {
  return qrMatrix(text).length;
}
