import type { NextConfig } from "next";
import { portfolioEntries } from "./data/portfolio";
import { buildCsp, providersInUse } from "./lib/csp";

// Security headers (decision TP9). Every page is static (TP1 — no SSR, no middleware, no
// per-request rendering; TASK-134 added the one server function, `POST /api/tushky/speech`, and a
// dev-only audition route, both allow-listed in scripts/assert-static.ts), so a script nonce is not available; the CSP below is the pragmatic
// static-site policy TP9 specifies, with `'unsafe-inline'` on `script-src` required by Next's
// static-page inline hydration bootstrap (the `self.__next_f.push(...)` RSC-payload scripts Next
// emits inline on every page — verified in the built HTML, S01.07/A11) and on `style-src` for
// Next's inlined critical CSS. There are zero third-party scripts other than Vercel Analytics /
// Speed Insights, and no user input is ever rendered as HTML (the Ask field renders answers from
// data, never the query — A4), so the residual XSS surface from `'unsafe-inline'` is minimal.
//
// Vercel Analytics v2 / Speed Insights v2 hosts (verified against the installed packages,
// node_modules/@vercel/{analytics,speed-insights}/dist/index.js, TKT-50): in production/preview
// (the only modes these components activate in) the script tag and the event/vitals beacon both
// resolve to same-origin paths proxied by the Vercel edge — `/_vercel/insights/script.js` +
// `/_vercel/insights` (analytics), `/_vercel/speed-insights/script.js` +
// `/_vercel/speed-insights/vitals` (speed insights) — so `'self'` already covers them; no
// `*.vercel-insights.com` connect-src is needed. `va.vercel-scripts.com` is used only for the
// local-dev debug script (`getMode() === "development"`, i.e. `next dev`) and is allowlisted on
// `script-src` for that case even though it isn't exercised by the production build.
//
// The directive list itself lives in `lib/csp.ts` (unit-tested). TASK-122: `frame-src` is derived
// from the video providers `data/portfolio.ts` actually uses — the privacy-enhanced YouTube host,
// plus `player.vimeo.com` only while some product uses Vimeo. Only after the viewer presses play,
// one player at a time; nothing else may frame.
const USED_PROVIDERS = providersInUse(portfolioEntries);
const CSP = buildCsp(USED_PROVIDERS);
// TASK-143: the hidden /lab route runs Rapier (WebAssembly), so it alone carries `'wasm-unsafe-eval'`.
const LAB_CSP = buildCsp(USED_PROVIDERS, { wasm: true });

const securityHeaders = (csp: string) => [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    // Every route except `/lab` gets the base policy; `/lab` gets the same policy plus wasm. Two
    // rules never match one path, so the browser never intersects two policies.
    return [
      { source: "/((?!lab$).*)", headers: securityHeaders(CSP) },
      { source: "/lab", headers: securityHeaders(LAB_CSP) },
    ];
  },
  // Do not auto-generate AGENTS.md / CLAUDE.md into the repo root (Next 16 default);
  // this repo keeps its own docs and a surgical commit surface.
  agentRules: false,
  // TASK-155 reverses TKT-92 (EXE-17)'s inlineCss. That trade assumed ~17 kB of extra HTML; the stylesheet is now
  // 322 kB, and inlining writes it TWICE into the document (a <style> plus the RSC payload copy): the home HTML was
  // 1.25 MB (228 kB br) and 45 kB with a linked, cacheable stylesheet. Measured on the slow-network harness
  // (4x CPU, 1.6 Mbps / 150 ms, scripts/lcp-probe.ts): home LCP 2.8 s -> 1.3 s at 390, 4.3 s -> 1.6 s at 1440.
  experimental: {
    inlineCss: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 768, 1024, 1440, 1920],
    imageSizes: [56, 120, 180, 280, 360, 480, 520],
    minimumCacheTTL: 31536000,
  },
  // NOTE (BREAKER → EXE): the plan (S01.07/A5) specifies `experimental: { viewTransition: true }`,
  // but Next 16.3.5 removed that config key — it is absent from both the TS `ExperimentalConfig`
  // type and the runtime config-schema (only `transitionIndicator` / `gestureTransition` remain),
  // so setting it fails `tsc`. React `<ViewTransition>` support is built into 16.3.5's App Router
  // (`<Link transitionTypes>`, app-router-context), so the flag is obsolete rather than needed.
  // The actual View-Transition export + behaviour is verified in TSK-06 / S06.01 (E-12).
};

export default nextConfig;
