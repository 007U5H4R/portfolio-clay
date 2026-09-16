import type { Metadata } from "next";
import { Manrope, Caveat } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/seo";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/layout/Footer";

// Self-hosted at build by next/font/google (no runtime request to fonts.googleapis.com).
// The CSS variables are mapped into @theme's --font-display / --font-hand in globals.css.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["500", "600"],
  display: "swap",
  variable: "--font-caveat",
});

// `metadataBase` (A8/A11 env chain) resolves any relative URL the App Router still emits on its
// own (e.g. the `/favicon.ico` icon) to an absolute one; every OG/Twitter/canonical URL built by
// `buildMetadata()` (per-page, S06.01) is already absolute regardless.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${site.name} · ${site.title}`,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${manrope.variable} ${caveat.variable}`}>
      <body>
        <SkipLink />
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
