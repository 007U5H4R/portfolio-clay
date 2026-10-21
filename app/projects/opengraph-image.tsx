import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { OG_PROJECTS_ALT } from "@/lib/og-projects";
import { site } from "@/lib/site";

// TASK-338 (DES-029): the site-wide og.jpg's small tagline is illegible at a ~400 px thumbnail. /projects gets a
// type-led card instead: every line is >= 40 px at 1200 wide, so it still reads at a third of the size.
// Palette = the light tokens in app/globals.css (paper, navy, rust). No product logos or posters.
export const alt = OG_PROJECTS_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PAPER = "#f7f1e7";
const NAVY = "#0d1735";
const RUST = "#b64927";
const KRAFT = "#d7be93";

export default async function Image() {
  const [fraunces, inter] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/Fraunces_144pt-Medium.ttf")),
    readFile(join(process.cwd(), "assets/fonts/Inter-SemiBold.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: PAPER,
          color: NAVY,
          padding: "0 80px",
          borderLeft: `24px solid ${RUST}`,
        }}
      >
        <div style={{ display: "flex", fontFamily: "Inter", fontSize: 44, color: RUST, letterSpacing: 2 }}>
          TUSHARPATHAK.COM
        </div>
        <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 150, lineHeight: 1.05, marginTop: 16 }}>
          Portfolio
        </div>
        <div style={{ display: "flex", height: 8, width: 220, background: KRAFT, margin: "28px 0" }} />
        <div style={{ display: "flex", fontFamily: "Inter", fontSize: 54, lineHeight: 1.25 }}>
          Products I built and shipped,
        </div>
        <div style={{ display: "flex", fontFamily: "Inter", fontSize: 54, lineHeight: 1.25 }}>
          plus enterprise cloud, data and ML.
        </div>
        <div style={{ display: "flex", fontFamily: "Fraunces", fontSize: 48, marginTop: 36, color: RUST }}>
          {site.name}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 500, style: "normal" },
        { name: "Inter", data: inter, weight: 600, style: "normal" },
      ],
    },
  );
}
