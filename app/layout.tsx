import type { Metadata } from "next";
import { Fraunces, Inter, Caveat } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { site } from "@/lib/site";
import { siteUrl } from "@/lib/seo";
import { knowledge } from "@/data/knowledge";
import { SkipLink } from "@/components/layout/SkipLink";
import { Header } from "@/components/navigation/Header";
import { BandFooter } from "@/components/layout/BandFooter";
import { AskProvider } from "@/components/ai/AskProvider";

// The 6 panel-surface prompts (PB3), resolved server-side and handed to the global AskProvider as a
// plain string[] (A1: a client leaf receives the exact props it needs, never the knowledge module).
const PANEL_PROMPTS = knowledge
  .filter((entry) => entry.surface.includes("panel"))
  .map((entry) => entry.prompt);

// Self-hosted at build by next/font/google (no runtime request to fonts.googleapis.com — the TP9 CSP
// `font-src 'self'` stays untouched; S13). The CSS variables are mapped into @theme's --font-display /
// --font-body / --font-hand in globals.css (Design.md §2.2). Fraunces is the variable font with the
// `opsz` + `SOFT` axes (per-role `font-variation-settings`); Inter is body/UI; Caveat is the hand.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "variable",
  axes: ["opsz", "SOFT"],
  display: "swap",
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "600"],
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
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${caveat.variable}`}>
      <body>
        {/*
          AskProvider is hoisted here (from app/page.tsx, TKT-10) so the deterministic Ask provider
          and the global slide-over AskPanel are shared across every route: the header AskAIButton and
          the MobileMenu Ask row (both inside <Header/>) open the same panel. AskPanel itself is a lazy
          chunk mounted only after the first open (EVAL-005), so this hoist does not add it to first-load.
        */}
        <AskProvider panelPrompts={PANEL_PROMPTS}>
          <SkipLink />
          <Header />
          <main id="main">{children}</main>
          <BandFooter />
        </AskProvider>
        {/*
          Vercel Analytics + Speed Insights (A11/TP9, TKT-50): cookie-less. QA-005 fix — these
          libraries gate their script injection on `NODE_ENV==='production'`, NOT on being served by
          Vercel, so a local `pnpm start` (a production build) injected `/_vercel/*` scripts that 404
          off-platform and tripped the "no console errors" smoke gate. Gate on `process.env.VERCEL`
          (set only on real Vercel preview/production builds, statically inlined into this SSG server
          layout at build time) so they are in the tree ONLY when actually deployed — local build/
          start stays clean, production/preview get analytics. Routes stay static (TP1).
        */}
        {process.env.VERCEL ? (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        ) : null}
      </body>
    </html>
  );
}
