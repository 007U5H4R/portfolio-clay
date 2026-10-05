import { describe, expect, it } from "vitest";
import jsQR from "jsqr";
import { qrMatrix, qrPath } from "@/lib/card/qr";

/** Rasterise a module matrix with a quiet zone into RGBA for jsQR. */
function raster(matrix: boolean[][], scale = 8, quiet = 4) {
  const n = matrix.length + quiet * 2;
  const size = n * scale;
  const data = new Uint8ClampedArray(size * size * 4).fill(255);
  matrix.forEach((row, y) =>
    row.forEach((on, x) => {
      if (!on) return;
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++) {
          const i = (((y + quiet) * scale + dy) * size + (x + quiet) * scale + dx) * 4;
          data[i] = data[i + 1] = data[i + 2] = 0;
        }
    }),
  );
  return { data, size };
}

describe("QR target (TASK-146.3, EVAL-029)", () => {
  it("encodes the card URL and round-trips through a decoder", () => {
    const url = "https://example.com/card";
    const { data, size } = raster(qrMatrix(url));
    const hit = jsQR(data, size, size);
    expect(hit?.data).toBe(url);
  });

  it("is square, with finder patterns at three corners", () => {
    const m = qrMatrix("https://example.com/card");
    expect(m.every((r) => r.length === m.length)).toBe(true);
    expect(m[0]![0]).toBe(true);
    expect(m[0]![m.length - 1]).toBe(true);
    expect(m[m.length - 1]![0]).toBe(true);
  });

  it("returns a single SVG path string and never an empty one", () => {
    const p = qrPath("https://example.com/card");
    expect(p).toMatch(/^M\d/);
    expect(qrPath("")).toBeNull();
  });
});
