# Portfolio tab rebuild — Tushar's spec (2026-09-28, verbatim)

Source: Tushar's chat message of 2026-09-28 (TASK-116). He attached two reference images (#47, #48) in chat; they were not available to the orchestrator as files, so this text is the reference of record. Project sources he named: `/Users/tushar/Library/Mobile Documents/com~apple~CloudDocs/Downloads/Portfolio - Tushar Pathak - Project Manager V2.0.pdf` and `/Users/tushar/Desktop/Resume/Tushar-Resume.pdf` ("In these documents you will find the projects for the portfolio").

---

I want to completely rebuild the existing **Project** tab of my portfolio into a new **Portfolio** tab.

This is not a cosmetic redesign. It is a structural and interaction redesign.

The Portfolio page should have TWO clearly differentiated sections:

SECTION 1 — Products I built independently / AI-native products
SECTION 2 — Enterprise & Client Work from previous organizations

The first section should be highly interactive and expressive. The second section should be more structured and restrained. Do not make them visually identical.

## 1. RENAME THE PAGE
Rename the visible navigation label: Project → Portfolio. Also update: page heading, active nav state, accessibility labels, metadata/title where appropriate. Do not break the existing route unnecessarily. If the current URL is `/projects` or `/work`, prefer keeping the route stable unless there is a strong reason to change it.

## 2. REMOVE THE CURRENT PROJECT PAGE CONTENT
Inspect the current Project page first. Remove the existing page structure except for reusable: imagery, textures, shared paper components, shared motion primitives, useful project data.
Remove: old project grids, old case-study summaries, existing generic cards, duplicate headings, redundant CTAs, filters that no longer fit, legacy sections.
Do not hide them with CSS. Actually remove obsolete structures from the rendered page.

## 3. NEW PAGE STRUCTURE
```
<PortfolioPage>
  <PortfolioIntro />
  <IndependentProductsShowcase>
    <MainMediaStage />
    <ProductInfoPanel />
    <ProductCarousel />
  </IndependentProductsShowcase>
  <EnterpriseClientWork>
    <EnterpriseIntro />
    <EnterpriseCaseGrid />
  </EnterpriseClientWork>
</PortfolioPage>
```

## 4. PORTFOLIO INTRO
Keep the page intro compact. EYEBROW: PORTFOLIO. HEADLINE: **Products I’ve built, tested, and shipped.** SUBLINE: **Pick one. Watch the pitch. Open the demo. Explore the build.**
Do not create a large hero before the carousel. The carousel / media experience is the hero.
Optional small retro label: **SELECT A PRODUCT** or **CHOOSE YOUR BUILD**. Use this only as a small 90s-game reference. Do not turn the entire page into a retro-game UI.

## 5. SECTION 1 — INDEPENDENT PRODUCTS
This section should represent products I built / explored independently. Examples currently represented in my portfolio include: TeachSpark, RailCite, Cubicle, Tegaki, Vendor Passport, Velora.
IMPORTANT: Do not assume this list is permanently fixed. Source the final product list from the existing project/product data where possible. Use a reusable data model.

## 6. SECTION 1 — OVERALL COMPOSITION
LEFT: large media stage. RIGHT: active product information + actions. BOTTOM: horizontal product carousel.
Desktop ratio: media ~62%, info ~38%. Carousel: full width below both.
The page should feel like: a physical scrapbook + a product showcase + a 90s game-selection screen. NOT: a generic case-study grid.

## 7. MAIN MEDIA STAGE
The left side should be a large ripped-paper media frame. It must support: pitch video, demo video, optional fallback poster. Preferred: 16:9.
Visual treatment: torn-paper edge, layered paper backing, subtle shadow, optional tape, subtle doodle marks, no glassmorphism, no browser-window chrome.

## 8. DEFAULT MEDIA BEHAVIOR
When a product becomes active: default media mode must be `pitch`. The left media stage should show that product’s pitch-video poster with a large central play button. Do not autoplay with sound. Preferred: no autoplay.

## 9. MEDIA STATE
Use explicit state, e.g.
```
const [activeProductId, setActiveProductId] = useState(...)
const [mediaMode, setMediaMode] = useState<'pitch' | 'demo'>('pitch')
```
When product changes: `setActiveProductId(newId); setMediaMode('pitch')`. When Demo Video is clicked: `setMediaMode('demo')`. When Pitch Video is clicked: `setMediaMode('pitch')`. Do not manipulate media state through DOM hacks.

## 10. VIDEO SWITCHING
If user selects a new product: stop current video; unmount or pause old player; reset media mode to pitch; load new product pitch poster; update all right-side content.
If user clicks Demo Video: stop pitch playback; switch same LEFT media stage to demo; reset demo to beginning; show poster; user presses play.
If user clicks Pitch Video again: same behavior in reverse.
Never allow two videos to continue playing simultaneously.

## 11. PRODUCT INFO PANEL
Right side should show: PRODUCT NAME, tagline, short description, then five actions where available: 1. Pitch Video 2. Demo Video 3. Product Link 4. GitHub 5. PRD. Keep description short. Ideal: 2–4 lines. Do not put full case-study prose here.

## 12. ACTION BEHAVIOR
Pitch Video → switch LEFT media stage to pitch. Demo Video → switch LEFT media stage to demo. Product Link → NEW TAB. GitHub → NEW TAB. PRD → NEW TAB. Use `target="_blank" rel="noopener noreferrer"` for external links. Do not load Product/GitHub/PRD inside the media frame.

## 13. ACTION BUTTON VISUALS
Make them ripped-paper strips. Suggested accents: Pitch Video: muted blue; Demo Video: terracotta / coral; Product Link: sage / mint; GitHub: muted lavender; PRD: soft yellow. Icons: Pitch: play; Demo: video; Product: link; GitHub: GitHub; PRD: document. Keep saturation restrained.

## 14. 90s GAME PRODUCT CAROUSEL
The bottom carousel is one of the most important elements. Each product thumbnail should look like: a 90s game-box cover or cartridge label or arcade title card. Do NOT use normal UI screenshots.
The thumbnail should emphasize: product logo, product name, one symbolic hero visual, bold retro composition, faux packaging details, optional product number, subtle halftone / pixel / print texture.
Think: SNES-era packaging, Sega-era packaging, arcade title screens, early PC-game artwork. BUT: do not copy any copyrighted game artwork or specific branded packaging. Create an original nostalgic visual language.

## 15. PRODUCT THUMBNAIL CONTENT
```
┌─────────────────────┐
│  PRODUCT CODE       │
│    PRODUCT LOGO     │
│   HERO SYMBOL       │
│ PRODUCT TAGLINE     │
└─────────────────────┘
```
Example: TeachSpark — AI WORKSHEETS FOR TEACHERS; RailCite — RESEARCH ON TRACK; Cubicle — MAKE WORK LESS WORK. These are examples only. Use existing product positioning where available.

## 16. CAROUSEL BEHAVIOR
Desktop: show ~5–7 products. Selected product: clear outline, slight lift, subtle shadow, handwritten/doodle accent, underline or tape accent. Hover: lift 2–3px, stronger shadow, subtle title emphasis. Do not scale excessively.

## 17. CAROUSEL NAVIGATION
Include: left arrow, right arrow, keyboard navigation, touch swipe, horizontal trackpad scrolling. Use accessible carousel semantics. Preferred: infinite looping if implementation remains clean.

## 18. CAROUSEL CLICK BEHAVIOR
Clicking a thumbnail must: 1. update active product 2. update right panel 3. reset media mode to pitch 4. load that product’s pitch video in the left media stage 5. update active-state styling 6. remain on same page. Do not navigate away.

## 19. GAME-STYLE DETAILS
Optional small details: RC-01, TS-01, CB-01 or PRODUCT 01, PRODUCT 02 or PLAYER SELECT. Use them sparingly. Do not make every font pixelated.

## 20. MEDIA TRANSITION
Product change: old opacity 1 → 0, translateY 0 → 5px; new opacity 0 → 1, translateY 5px → 0. Duration 250–350ms. Pitch ↔ Demo switching: 180–250ms. Keep responsiveness high.

## 21. PRODUCT DATA MODEL
Create a reusable schema, e.g.
```
const portfolioProducts = [{
  id: 'teachspark', name: 'TeachSpark', tagline: '...', description: '...', logo: '...', thumbnail: '...',
  pitchVideo: '...', pitchPoster: '...', demoVideo: '...', demoPoster: '...',
  productUrl: '...', githubUrl: '...', prdUrl: '...', category: '...',
  gameTheme: { code: 'TS-01', accent: '...' }
}]
```
Do not create separate JSX implementations per product.

## 22. MISSING PRODUCT ACTIONS
Some products may not have: GitHub, PRD, demo, product URL. If missing: hide the unavailable action. Do NOT show disabled dead buttons.

## 23. VIDEO SOURCE SUPPORT
Support: local MP4, YouTube, Vimeo. Use an abstraction such as `<ProductVideo />`. Do not mount all embeds simultaneously. Only load active media.

## 24. PERFORMANCE
Lazy-load: video players, posters, carousel thumbnails. Do not mount six YouTube/Vimeo iframes simultaneously. Preload only: active poster, possibly next/previous poster.

## 25. SECTION 2 — ENTERPRISE & CLIENT WORK
Below the independent product showcase, add: EYEBROW: ENTERPRISE & CLIENT WORK. HEADLINE: **Projects built inside larger systems.** SUBLINE: **Cloud, data, APIs, healthcare, analytics and ML programs delivered across enterprise environments.** This section should visually feel more structured and mature than Section 1.

## 26. SECTION 2 — VISUAL DIRECTION
Do NOT reuse the 90s-game style. Instead use: paper case files, dossiers, client-program cards, subtle stamps, paperclips, technical tags, restrained typography, muted enterprise aesthetic. Think: “case files from complex enterprise programs” rather than “product cards.”

## 27. ENTERPRISE CARD GROUPING
Do NOT create one card for every individual engagement. Group related engagements logically. Create these six primary enterprise cards: 1. Pear Health Labs 2. Mojix 3. Google Cloud — HMLE Benchmarking 4. Telus Health / LifeWorks 5. LifePoint Health 6. Indiana University Health. Use only source-supported information. Do NOT invent new clients or project outcomes.

## 28. PEAR HEALTH LABS CARD
Title: **Pear Health Labs**. Subtitle: Cloud & Data Modernization. Include three related programs: AWS → GCP Foundation / Infrastructure Migration; Enterprise API Migration; Snowflake → BigQuery Migration.
The source supports: AWS→GCP foundation work including organizational structure, networking, access, security and technical design. Enterprise API migration: refactoring and migration from AWS to GCP. Snowflake→BigQuery: DBT rewrites, Airflow/Dagster migration, SQL refactoring, BigQuery implementation.
Keep card concise. Do not paste paragraphs. Suggested tags: Cloud Migration, GCP, APIs, BigQuery, Data Modernization, Program Delivery.

## 29. MOJIX CARD
Title: **Mojix**. Subtitle: Inventory & Data Pipeline Modernization. Source-supported themes: Inventory Discrepancy use case; MongoDB → GCP; streaming pipeline; GCP data warehouse; Databricks-to-GCP advisory/support; downstream analytics. Suggested tags: Data Pipelines, GCP, Analytics, Inventory, Modernization.

## 30. GOOGLE CLOUD HMLE CARD
Title: **Google Cloud**. Subtitle: Healthcare ML Engine Benchmarking. Source-supported themes: HMLE benchmarking; model performance; efficiency; cost comparison; competitive benchmarking; Google UXR feedback study; benchmarking report; model source code. Suggested tags: ML, Benchmarking, Healthcare, Research, UXR, Analytics. Do NOT combine this card with IU Health. They are separate engagements.

## 31. TELUS HEALTH / LIFEWORKS CARD
Title: **Telus Health / LifeWorks**. Subtitle: Global Partner Reporting Validation. Source-supported themes: automated validation pipeline; spreadsheet validation; 45+ global partners; GCP data ingestion; flagging/correcting data; test plan; Figma UI mockup; global reporting workflow. Suggested tags: Data Validation, Automation, GCP, Reporting, Figma, Global Operations.

## 32. LIFEPOINT HEALTH CARD
Title: **LifePoint Health**. Subtitle: Healthcare Data & FHIR Modernization. Group related engagements: Verato SFTP → GCS migration; Healthcare Data Engine managed services; FHIR reconciliation & testing. Source-supported themes: Goldenview / Crosswalk CSV ingestion; Python; GCS; HDE; FHIR reconciliation; matching/merging rules; EHR data; project governance. Suggested tags: FHIR, Healthcare Data, GCP, Data Engineering, APIs, Governance.

## 33. INDIANA UNIVERSITY HEALTH CARD
Title: **Indiana University Health**. Subtitle: Nurse Workload Demand Forecasting. Source-supported themes: Looker dashboard; scheduling data; Kronos; Teletracking; Oracle; Cerner; data pipelines; demand-driven scheduling; analytics. Suggested tags: Looker, Analytics, Healthcare, BigQuery, Scheduling, Forecasting.

## 34. ENTERPRISE CARD STRUCTURE
Each card should contain: client; program title; 1–2 sentence summary; 2–4 sub-projects if applicable; 4–6 technical/domain tags. Optional: **Open case file →** — only show this if there is an actual detail experience/page. If no detail page exists yet: omit the CTA. Do not create dead links.

## 35. CONFIDENTIALITY / PUBLIC-SAFE PRESENTATION
Do not automatically expose project budgets. The source contains budget figures, but do not render them publicly by default. Only include commercial figures if explicitly configured. Also avoid: internal confidential data, unapproved client metrics, unsupported impact claims. Use source-supported scope, architecture, responsibilities and outcomes.

## 36. ENTERPRISE CARD VISUALS
Use restrained visual cues: paperclip; stamped client/program label; client icon/logo if legally/visually appropriate; technical tags; light dossier border; torn-paper corners. Avoid: game cover art, bright colors, giant logos, playful cartoon styling.

## 37. ENTERPRISE GRID
Desktop: 3 columns × 2 rows, or responsive 2–3 column grid. Cards should be similar height. Tablet: 2 columns. Mobile: 1 column.

## 38. ENTERPRISE CARD HOVER
Very subtle: lift 2px, stronger shadow, border/tape highlight. No scale >1.01.

## 39. SECTION 1 VS SECTION 2 CONTRAST
Section 1: expressive, interactive, retro-game-inspired, media-heavy, product personality. Section 2: quiet, structured, enterprise, case-file inspired, systems-oriented. This contrast is intentional.

## 40. PAGE STORY
FIRST: “I can independently identify, build and test products.” THEN: “I can also operate inside complex enterprise systems, clients, stakeholders and technical programs.” That contrast is a key part of my positioning.

## 41. BACKGROUND TRANSITION
Between Section 1 and Section 2: use a subtle paper transition. Possible: torn horizontal paper seam; change from lighter scrapbook paper to slightly more structured dossier paper. Do not use a hard colored divider.

## 42. SECTION 2 SMALL ANNOTATION
Optional handwritten note near the enterprise section: **inside larger systems** with a curved arrow. Keep it subtle.

## 43. ANALYTICS
If Mixpanel already exists: track `Portfolio Product Selected` {product_id, product_name, position, source: "portfolio_carousel"}; `Portfolio Media Played` {product_name, media_type: "pitch" | "demo"}; `Portfolio External Link Clicked` {product_name, link_type: "product" | "github" | "prd"}; `Enterprise Case Viewed` {client_name, program_name}. Do not add Mixpanel if not already configured.

## 44. ACCESSIBILITY
Proper semantics. Carousel: buttons, aria-selected, keyboard navigation, visible focus ring. Videos: keyboard accessible, labels. External links: meaningful aria-label, target="_blank", rel="noopener noreferrer". Do not rely on color for selection.

## 45. REDUCED MOTION
Respect `prefers-reduced-motion: reduce`. Disable: carousel spring, media cross-slide, paper bounce, entrance rotations. Keep state changes immediate.

## 46. MOBILE SECTION 1
Mobile order: media ↓ product details ↓ action buttons ↓ carousel. Carousel: horizontal swipe. Show ~1.5–2.2 cards. Do not force two columns.

## 47. MOBILE SECTION 2
Enterprise cards: 1 column. Keep tags wrapping naturally. Do not shrink text too far.

## 48. PAGE PERFORMANCE
Do not: mount all video players; preload every demo; use huge full-resolution thumbnails; animate large blur filters; use unnecessary layout thrashing. Target smooth interaction.

## 49. MEDIA ERROR HANDLING
If media fails: show poster, small fallback message, optional external media link. Do not leave blank black containers.

## 50. ACTIVE PRODUCT URL
If easy to implement cleanly: sync active product to query/hash, e.g. `/portfolio#teachspark` or `/portfolio?product=teachspark`. This allows deep linking. Do not overcomplicate routing.

## 51. VISUAL DETAILS — SECTION 1
Use: ripped media border; kraft-paper carousel backing; tape; doodles; paper shadows; selected-card sketch outline; subtle 90s print texture. Do NOT make the whole page noisy.

## 52. VISUAL DETAILS — SECTION 2
Use: dossier-paper cards; subtle paperclip; stamps; small technical tags; light ruled paper; muted color accents; understated client labeling. Avoid: colorful sticker overload; cartoon doodles; bright game visuals.

## 53. WHAT NOT TO DO
Do NOT: preserve the old generic Projects grid; mix enterprise work into the 90s carousel; use screenshots as the carousel’s primary visual identity; autoplay video with sound; open demo video in another tab; open PRD inside the media stage; mount all videos; make enterprise cards look like games; expose budget data automatically; invent metrics; invent project outcomes; invent additional client work; turn the page into a dark gamer site; use neon cyberpunk styling; use glassmorphism.

## 54. BEFORE CODING
1. Inspect existing Project page. 2. Identify all current sections. 3. Identify reusable image-scene assets. 4. Identify existing product data. 5. Identify current video implementation. 6. Check carousel dependencies. 7. Check Framer Motion availability. 8. Check shared paper components. 9. Check nav/route structure. 10. Check Mixpanel integration. 11. Identify enterprise client/project data already present in code. 12. Present a concise implementation plan. Then implement.

## 55. AFTER IMPLEMENTATION
Verify — PORTFOLIO NAV: nav now says Portfolio; current route still works. PRODUCT SHOWCASE: old project grid removed; selected product updates media; pitch is default; demo plays in same left frame; pitch button restores pitch; Product opens new tab; GitHub opens new tab; PRD opens new tab; carousel loops / navigates; keyboard works; mobile swipe works; only active video loads; video stops on product switch; selected product visually obvious; 90s product-art direction is preserved. ENTERPRISE SECTION: appears below product showcase; Pear grouped correctly; Mojix shown separately; Google HMLE separate; Telus Health/LifeWorks separate; LifePoint grouped correctly; IU Health separate; no invented budget/outcome data; no fake links. GENERAL: responsive; no horizontal overflow; reduced-motion works; accessibility maintained; performance acceptable.
Finally summarize: 1. Files changed 2. New page architecture 3. Product schema 4. Carousel implementation 5. Media-switching logic 6. 90s thumbnail system 7. Enterprise data structure 8. Responsive behavior 9. Accessibility improvements 10. Analytics changes 11. Any compromises made.
