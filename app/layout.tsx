import type { Metadata } from "next";
import { Manrope, Caveat } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
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
