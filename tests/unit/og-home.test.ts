import { readFileSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { metadata } from "@/app/page";
import { OG_HOME_ALT } from "@/lib/og-home";

// TASK-195 - the home page's static share card.
describe("home OG image (TASK-195)", () => {
  it("public/og.jpg is a 1200x630 opaque sRGB JPEG under 1 MB", async () => {
    const bytes = readFileSync("public/og.jpg");
    const info = await sharp(bytes).metadata();
    expect(info.format).toBe("jpeg");
    expect(info.width).toBe(1200);
    expect(info.height).toBe(630);
    expect(info.hasAlpha).toBe(false);
    expect(info.space).toBe("srgb");
    expect(bytes.length).toBeLessThan(1024 * 1024);
  });

  it("home metadata points og:image and twitter:image at the absolute /og.jpg with size + alt", () => {
    const og = metadata.openGraph as { images?: { url: string; width: number; height: number; alt: string }[] };
    const image = og.images?.[0];
    expect(image?.url).toMatch(/^https?:\/\/.+\/og\.jpg$/);
    expect(image?.width).toBe(1200);
    expect(image?.height).toBe(630);
    expect(image?.alt).toBe(OG_HOME_ALT);
    const tw = metadata.twitter as { card?: string; images?: { url: string; alt: string }[] };
    expect(tw.card).toBe("summary_large_image");
    expect(tw.images?.[0]).toEqual({ url: image?.url, alt: OG_HOME_ALT });
  });
});
