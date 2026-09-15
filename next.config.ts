import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Do not auto-generate AGENTS.md / CLAUDE.md into the repo root (Next 16 default);
  // this repo keeps its own docs and a surgical commit surface.
  agentRules: false,
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
