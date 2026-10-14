# TASK-211 · Home: Credentials, Selected Work, Awards & Recognition

Replaces Featured Work and How I think on Home. Hero, Ask and the band footer are unchanged.

## Art (public/media/home/)
Generated with Higgsfield `gpt_image_2_5` (quality high, 1k), one generation per asset, 1.5 credits each, 16.5 credits in total (389.65 to 373.15). No retries. Scene art is opaque cream, trophies were generated with a transparent background (no `remove_background` needed). Processed with sharp: WebP, scenes 640 px (credentials) and 800 px (projects) wide, trophies trimmed and fitted to 440 px high; each file is under 45 kB. The Godrej-cup halo was removed by thresholding its semi-transparent alpha. No text or logos in the art; real logos come from `components/experience/logos.ts` and sit on a paper plaque in the UI. The Independent Builder card shows its name in type (no logo exists).

amex, quantiphi, godrej, independent, railcite, teachspark, enterprise-ai, trophy-star, trophy-medallion, trophy-cup, trophy-geometric.

## Content: where the brief and the site's data differ (the site wins)
- Amex role: site "Senior Product Manager (Accounts Receivable)", Jun 2026 – Present (brief: "AI Product Manager").
- Quantiphi role: site "Technical Project Manager – GCP Division", Aug 2022 – Apr 2026 (brief: "Senior Business Analyst / Offshore Project Manager").
- Godrej role: site "Assistant Product Manager", Sep 2016 – Dec 2018 (brief: "Product Management").
- Focus chips are words from each role's recorded highlights, not the brief's (e.g. no "LLM-powered products").
- Selected Work descriptions and tags are each project's own `tagline` / `tags`. "Enterprise AI Products" is not a project record: it links to `/projects#enterprise` and its text is the Amex role's first recorded highlight.
- Awards: site names are "Annual Unsung Hero Award, Quantiphi Analytics Solutions" (2024) and "12 in 11 Award, Godrej Infotech" (2018; the brief says Godrej & Boyce).
- **"Best AI Operator, ReThink System Buildathon" is not in `data/credentials.ts`** (About shows three awards; TASK-136 deliberately left it out). It is shown because the brief names it, from `BUILDATHON_AWARD` in `components/home/home-content.ts`, with no year. Confirm or remove.
- Shellkode (Technical Project Manager, AWS Division, Apr–Jun 2026) is in the Experience timeline but omitted here, per the brief's four credentials.
- Award tiles are not links (About has no per-award anchor, and the fourth award is not on About).
