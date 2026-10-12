# Analytics (Mixpanel) — TASK-194

How tusharpathak.com measures whether it turns visitors into professional opportunities, what it collects, what it deliberately does not, and what Tushar has to do in Mixpanel and Vercel.

**Status.** Everything below is implemented, unit-tested and exercised end to end in a real browser against a *stub* token with every Mixpanel request intercepted. **No event has been sent to a real Mixpanel project**: the token did not exist when this was built. Until the steps in [Setup](#1-setup-what-tushar-must-do) are done the site runs with analytics completely off. The "Live View" checks in [section 8](#8-validating-in-mixpanel-live-view) are how to verify the real thing.

Contents: [1 Setup](#1-setup-what-tushar-must-do) · [2 Architecture](#2-architecture) · [3 Event dictionary](#3-event-dictionary) · [4 Common properties, identity, attribution](#4-common-properties-identity-and-attribution) · [5 Dashboards and reports](#5-dashboards-and-reports-the-10-questions) · [6 Funnels](#6-funnels) · [7 Privacy](#7-privacy) · [8 Validating in Live View](#8-validating-in-mixpanel-live-view) · [9 Limitations](#9-limitations-and-known-gaps)

---

## 1. Setup (what Tushar must do)

1. **Create two Mixpanel projects** (Mixpanel → Create Project): `tusharpathak.com — production` and, optional but recommended, `tusharpathak.com — test`. Pick the data-residency region when creating each (US default, EU, or India); it cannot be changed later.
2. **Copy each Project Token** (Project Settings → Access Keys → *Project Token*, 32 hex characters). It is public by design (it can only add events), but keep it in Vercel, not in git. Never use or paste the *API Secret* / service-account secret anywhere in this repo.
3. **Set the Vercel environment variables** (Project → Settings → Environment Variables), then **redeploy** — `NEXT_PUBLIC_*` values are inlined at build time, so a change only takes effect on the next build.

   | Variable | Production | Preview | Development | Notes |
   |---|---|---|---|---|
   | `NEXT_PUBLIC_MIXPANEL_TOKEN` | **production project token** | *leave empty*, or the **test** project token | empty | Empty ⇒ analytics is a complete no-op: no script, no network call, no error. |
   | `NEXT_PUBLIC_ANALYTICS_ENV` | empty (reports `production`) or `production` | empty, or `staging` **only if** Preview has the test token | empty | When empty, localhost and `*.vercel.app` previews send **nothing** even if a token is present. When set, it names the `environment` property on every event. |
   | `NEXT_PUBLIC_MIXPANEL_API_HOST` | only if the project is EU/IN: `https://api-eu.mixpanel.com` or `https://api-in.mixpanel.com` | same region as its project | empty | Default is US (`https://api-js.mixpanel.com`). Any other value **disables analytics** (it never silently falls back to the US). Must match the project's region. The site's Content-Security-Policy is built from the same value. |
   | `NEXT_PUBLIC_ANALYTICS_CONSENT` | empty (`opt-out`) | empty | empty | `opt-in` ⇒ nothing is loaded or sent until a consent banner stores a grant (see [Consent](#consent)). |

   Minimum for go-live: **only** `NEXT_PUBLIC_MIXPANEL_TOKEN` on **Production**. Preview stays silent by design.
4. **Check it in Live View** (section 8). Visit the production site in a normal browser window (not Do-Not-Track, no ad-blocker) and watch Mixpanel → *Events → Live View*.
5. **Build the dashboards and funnels** from section 5 and 6 (Mixpanel cannot be configured from the site's code; these are manual).
6. **Optional tidy-ups in Mixpanel**: in *Lexicon* add descriptions from the dictionary below and mark `schema_version`, `environment`, `device_type` as "hidden from dashboards"; in *Project Settings → Privacy* leave "Geolocation" and "Session replay" off (the site already sends no IP and no replay).

Local development: `pnpm dev` and `pnpm start` on localhost send nothing. To exercise analytics locally against the **test** project: `NEXT_PUBLIC_MIXPANEL_TOKEN=<test token> NEXT_PUBLIC_ANALYTICS_ENV=development pnpm build && pnpm start`.

**Testing a campaign link.** Append UTM tags to any URL, e.g.
`https://tusharpathak.com/?utm_source=linkedin&utm_medium=social&utm_campaign=portfolio-launch&utm_content=post-1`
Open it in a fresh window; in Live View the `page_viewed` event shows `utm_source=linkedin`, `utm_medium=social`, `utm_campaign=portfolio-launch`, `utm_content=post-1`. Only the five `utm_*` keys are read; values are lower-cased, ≤100 characters of letters/digits/`space _ . - + : /`; anything that looks like an email or contains other characters is dropped. Use lower-case, consistent values (`linkedin` not `LinkedIn`) to keep reports clean.

**Opting yourself out.** Visit any page once with `?analytics=off` (e.g. `https://tusharpathak.com/?analytics=off`): it is remembered in that browser (`localStorage`) and nothing is sent again. `?analytics=on` reverses it. Do this in every browser you use to look at your own site, so your visits do not inflate the numbers. (Do Not Track and Global Privacy Control also switch analytics off.)

---

## 2. Architecture

```
app/layout.tsx
└─ components/analytics/AnalyticsLoader.tsx   first-load, ~0.3 kB: publishes the pathname; after `load` + idle
                                              (or at the first interaction that has to wait) imports ↓
lib/analytics/track.ts                        first-load facade: `track(name, props)`; queue until the runtime attaches;
                                              a compiled-out no-op when no token is set
─── lazy chunk (never in any route's first-load JS, never fetched unless every gate passes) ───
lib/analytics/runtime.ts                      gates → SDK → super properties → listeners
├─ config.ts + consent.ts                     token/host/environment/DNT/GPC + stored choice
├─ client.ts                                  the ONLY importer of `mixpanel-browser` (dynamic import, init once)
├─ tracker.ts + events.ts + schema.ts         validate against the catalogue, then send
├─ page-tracking.ts                           page_viewed, sections, scroll depth, carousel, case study (observers only)
├─ click-delegation.ts + clicks.ts            one capture-phase click listener; rules are pure functions
├─ use-video-analytics.ts + video-progress.ts player postMessage → start / milestones
├─ lab.ts                                     read-only observer of the Gummy Lab HUD store
├─ chat.ts                                    local categorisation of Ask Tushky text (the text never leaves)
└─ sanitize.ts + pages.ts + device.ts         URL, referrer, page-name and device-class helpers
```

Rules the code enforces:

- **One tracking module.** Components call `track(EventName, props)` from `lib/analytics/track.ts`. Nobody imports the SDK. `track()` is typed against the catalogue (a wrong name or property is a compile error), and the runtime validates the same schema again: unknown events, missing/extra properties, free text and out-of-range numbers are dropped (and `console.warn`-ed outside production). It never throws into the UI.
- **No free text can be sent.** Property values are closed enums, length-bounded `[a-z0-9_.-]` slugs, site paths, bounded integers or booleans (`lib/analytics/schema.ts`). There is no "string" kind.
- **Minimal component edits.** Most events come from *where a link points* (the delegated click listener), not from per-button code: `IndependentProductsShowcase` (project selected, pitch/demo opened), `ProductMediaPlayer` (video), `AskPanel` + `AskProvider` (Ask Tushky), `SecretTrigger` (Lab discovery) and `LabApp` (one `observeLab` call, one `exit` call) are the only component files that call analytics.
- **No work on scroll.** Sections and the carousel use `IntersectionObserver`; scroll depth uses four invisible sentinel blocks observed by one `IntersectionObserver` (a `ResizeObserver` on `<body>` repositions them when the page height changes). There is **no** scroll, wheel, touch, mousemove or animation-frame listener.
- **Never awaits analytics.** The click listener is passive, never calls `preventDefault`/`stopPropagation`, and never waits for the network. A blocked, offline or failing Mixpanel leaves the site fully working (covered by an e2e test).
- **Loads late.** The runtime and the SDK are requested only after the window `load` event and a browser idle slot (≤4 s), or immediately when the first interaction (e.g. a click) needs them. Never on the LCP path. Without a token the whole branch is compiled out.
- **One init.** The SDK is initialised once per document (state is held on `globalThis`, so hot reloads or a duplicated chunk cannot double-install listeners).
- **Schema versioning.** `schema_version` (currently `1`, `lib/analytics/events.ts`) is a super property. Bump it when a property is renamed/removed or an event changes meaning, and note the date here.

### Consent

The site has no cookie banner. It previously used only cookie-less Vercel Analytics / Speed Insights (unchanged, still active on Vercel). For Mixpanel the policy, in order:

1. **Do Not Track and Global Privacy Control always win** → no script is downloaded, nothing is sent.
2. A **stored opt-out** (`?analytics=off`) wins → same.
3. Otherwise `NEXT_PUBLIC_ANALYTICS_CONSENT` decides: `opt-out` (default; collection starts, the visitor can stop it) or `opt-in` (nothing until a banner calls `setAnalyticsConsent`-style `applyConsent("granted")` in `lib/analytics/runtime.ts`).

Mixpanel is configured to be as light-touch as possible — **no cookies** (`localStorage` only), **no IP/geolocation**, no replay, no autocapture, no cross-site anything — which is why `opt-out` is the shipped default for a personal portfolio. **If the audience includes EU/UK visitors and Tushar wants strict ePrivacy/GDPR compliance, set `NEXT_PUBLIC_ANALYTICS_CONSENT=opt-in` and add a banner** (the hook is in place; the banner is a design task outside this ticket). This is a judgement call, not legal advice.

Withdrawal (`applyConsent("denied")`) removes every listener and observer, drops queued events, and calls the SDK's `opt_out_tracking`, which clears what the SDK stored locally.

---

## 3. Event dictionary

Names are `snake_case`; each event is defined once in `lib/analytics/events.ts` (the table below is generated from it and a unit test fails if the two drift). 32 events. *Not implemented because the site has no such UI* (the spec says not to invent them): `contact_form_started`, `contact_form_submitted` (the contact page is links, no form), `meeting_link_clicked` (no scheduling link), `resume_downloaded` (the résumé is a Google Drive **view** link that opens in a new tab: an open can never be verified as a download). One event was **added**: `chatbot_response_failed`, so that errors are kept apart from successful responses as the spec asks.

**Double counting.** One click on the résumé link sends three events — `outbound_link_clicked`, `resume_opened` and `professional_cta_clicked` — by design (different questions). In reports count **unique users** on a single event; do not add `resume_opened + linkedin_profile_clicked + email_contact_clicked` to get "leads" — use `professional_cta_clicked` (one per click, `cta_type` splits it) with *unique users*, or the "any conversion" cohort in section 5. `cta_type=contact_page` (the "Let's connect" pill / email link that leads to /contact) is a lead-in, not a conversion: filter it out of the primary metric.


### A. Website and navigation

#### `page_viewed`

- **Trigger:** A route becomes active: the first load, and each client-side route change (once per transition).
- **Code:** `lib/analytics/page-tracking.ts`
- **Properties:**
  - `page_name`: `home` \| `experience` \| `portfolio` \| `case_study` \| `about` \| `contact` \| `thinking` \| `essay` \| `playground` \| `certifications` \| `card` \| `gummy_lab` \| `other`
  - `page_path`: path ≤120
  - `navigation_type`: `direct` \| `client_navigation` \| `back_forward` \| `reload`
  - `is_landing`: bool
  - `session_type`: `new` \| `returning`
  - `theme` (optional): `light` \| `dark`

#### `section_viewed`

- **Trigger:** A `main section[id]` is at least 40% visible: once per section per page view.
- **Code:** `lib/analytics/page-tracking.ts`
- **Properties:**
  - `section_name`: slug ≤40
  - `section_index`: int 0–60
  - `page_name`: `home` \| `experience` \| `portfolio` \| `case_study` \| `about` \| `contact` \| `thinking` \| `essay` \| `playground` \| `certifications` \| `card` \| `gummy_lab` \| `other`

#### `navigation_clicked`

- **Trigger:** An internal link is activated in the header or the footer band.
- **Code:** `lib/analytics/click-delegation.ts (rules: clicks.ts)`
- **Properties:**
  - `destination`: path ≤120
  - `navigation_location`: `header` \| `footer` \| `other`

#### `outbound_link_clicked`

- **Trigger:** A link to another site is activated (any external anchor, including those that also fire a conversion event).
- **Code:** `lib/analytics/click-delegation.ts (rules: clicks.ts)`
- **Properties:**
  - `destination_domain`: slug ≤80
  - `link_type`: `linkedin` \| `resume` \| `github` \| `product` \| `prd` \| `video_provider` \| `credential` \| `other`
  - `cta_location`: `header` \| `hero` \| `footer` \| `contact_page` \| `about` \| `case_study` \| `projects` \| `card` \| `ask_tushky` \| `other`

#### `scroll_depth_reached`

- **Trigger:** 25 / 50 / 75 / 90 % of the page has been scrolled past: once per milestone per page view.
- **Code:** `lib/analytics/page-tracking.ts`
- **Properties:**
  - `depth_percent`: int 25–90
  - `page_name`: `home` \| `experience` \| `portfolio` \| `case_study` \| `about` \| `contact` \| `thinking` \| `essay` \| `playground` \| `certifications` \| `card` \| `gummy_lab` \| `other`

#### `theme_changed`

- **Trigger:** The visitor presses the theme switch. Never the initial theme, never a system-preference flip.
- **Code:** `lib/analytics/click-delegation.ts (on [data-theme-toggle])`
- **Properties:**
  - `theme_from`: `light` \| `dark`
  - `theme_to`: `light` \| `dark`


### B. Project explorer

#### `project_carousel_viewed`

- **Trigger:** The product carousel is at least 50% visible: once per page view.
- **Code:** `lib/analytics/page-tracking.ts`
- **Properties:**
  - `project_count`: int 0–50
  - `page_name`: `home` \| `experience` \| `portfolio` \| `case_study` \| `about` \| `contact` \| `thinking` \| `essay` \| `playground` \| `certifications` \| `card` \| `gummy_lab` \| `other`

#### `project_selected`

- **Trigger:** A different product is chosen in the carousel (never on init, never the already-active product).
- **Code:** `components/portfolio/IndependentProductsShowcase.tsx`
- **Properties:**
  - `project_id`: slug ≤40
  - `selection_method`: `arrow` \| `keyboard` \| `direct_selection`

#### `project_asset_opened`

- **Trigger:** A product asset is opened: pitch or demo video chosen, product link or case study followed.
- **Code:** `components/portfolio/IndependentProductsShowcase.tsx; lib/analytics/click-delegation.ts (rules: clicks.ts)`
- **Properties:**
  - `project_id`: slug ≤40
  - `asset_type`: `pitch_video` \| `demo_video` \| `product_link` \| `case_study`

#### `project_video_started`

- **Trigger:** The embedded player REPORTS playback (YouTube playerState 1). Pressing Play alone does not count.
- **Code:** `components/portfolio/ProductMediaPlayer.tsx → lib/analytics/use-video-analytics.ts`
- **Properties:**
  - `project_id`: slug ≤40
  - `video_type`: `pitch` \| `demo`

#### `project_video_progressed`

- **Trigger:** Playback passes 25 / 50 / 75 / 100 % by watching (seeks do not credit), once per milestone per play session.
- **Code:** `components/portfolio/ProductMediaPlayer.tsx → lib/analytics/use-video-analytics.ts`
- **Properties:**
  - `project_id`: slug ≤40
  - `video_type`: `pitch` \| `demo`
  - `progress_percent`: int 25–100

#### `case_study_viewed`

- **Trigger:** A /work/<slug> case-study page becomes active (once per page view).
- **Code:** `lib/analytics/page-tracking.ts`
- **Properties:**
  - `project_id`: slug ≤40
  - `entry_point`: `portfolio_page` \| `experience_page` \| `home_page` \| `other_internal` \| `external_or_direct`

#### `product_link_clicked`

- **Trigger:** A product / GitHub / PRD link on the portfolio sheet is activated.
- **Code:** `lib/analytics/click-delegation.ts (rules: clicks.ts)`
- **Properties:**
  - `project_id`: slug ≤40
  - `destination_domain`: slug ≤80


### C. Professional conversion

#### `professional_cta_clicked` (counts toward the primary metric)

- **Trigger:** The résumé, LinkedIn or email CTA is activated (the umbrella event: count unique visitors, not events).
- **Code:** `lib/analytics/click-delegation.ts (rules: clicks.ts)`
- **Properties:**
  - `cta_type`: `resume` \| `linkedin` \| `email` \| `contact_page`
  - `cta_location`: `header` \| `hero` \| `footer` \| `contact_page` \| `about` \| `case_study` \| `projects` \| `card` \| `ask_tushky` \| `other`
  - `destination_type`: `external_document` \| `external_profile` \| `email_client` \| `internal_page`

#### `resume_opened`

- **Trigger:** The résumé link (Google Drive viewer, new tab) is activated. An open, not a download or a read.
- **Code:** `lib/analytics/click-delegation.ts (rules: clicks.ts)`
- **Properties:**
  - `cta_location`: `header` \| `hero` \| `footer` \| `contact_page` \| `about` \| `case_study` \| `projects` \| `card` \| `ask_tushky` \| `other`
  - `open_method`: `external_viewer`

#### `linkedin_profile_clicked`

- **Trigger:** A link to Tushar's LinkedIn profile is activated.
- **Code:** `lib/analytics/click-delegation.ts (rules: clicks.ts)`
- **Properties:**
  - `cta_location`: `header` \| `hero` \| `footer` \| `contact_page` \| `about` \| `case_study` \| `projects` \| `card` \| `ask_tushky` \| `other`

#### `email_contact_clicked`

- **Trigger:** A mailto: link is activated. Not proof an email was written or sent.
- **Code:** `lib/analytics/click-delegation.ts (rules: clicks.ts)`
- **Properties:**
  - `cta_location`: `header` \| `hero` \| `footer` \| `contact_page` \| `about` \| `case_study` \| `projects` \| `card` \| `ask_tushky` \| `other`


### D. Ask Tushky

#### `chatbot_opened`

- **Trigger:** The Ask Tushky drawer opens.
- **Code:** `components/ai/AskPanel.tsx`
- **Properties:**
  - `entry_point`: `header_button` \| `hero_cta` \| `home_section` \| `other`

#### `chatbot_prompt_selected`

- **Trigger:** A suggested question or follow-up chip is chosen (the text itself is never sent).
- **Code:** `components/ai/AskPanel.tsx`
- **Properties:**
  - `prompt_category`: `projects` \| `experience` \| `ai_product_management` \| `cloud_architecture` \| `contact` \| `other`

#### `chatbot_message_sent`

- **Trigger:** A typed message is submitted. Only a locally derived category leaves the browser.
- **Code:** `components/ai/AskPanel.tsx`
- **Properties:**
  - `message_category`: `projects` \| `experience` \| `ai_product_management` \| `cloud_architecture` \| `contact` \| `other`

#### `chatbot_response_received`

- **Trigger:** A turn resolves with an answer or an honest "no match": once per turn, retries do not repeat it.
- **Code:** `components/ai/AskProvider.tsx`
- **Properties:**
  - `response_status`: `answered_faq` \| `answered_index` \| `no_match`
  - `latency_ms`: int 0–600000

#### `chatbot_response_failed`

- **Trigger:** A turn ends in the error state (provider threw). Kept apart from successful responses.
- **Code:** `components/ai/AskProvider.tsx`
- **Properties:**
  - `latency_ms`: int 0–600000

#### `chatbot_cta_clicked`

- **Trigger:** A source / recommended destination link inside the drawer is activated.
- **Code:** `lib/analytics/click-delegation.ts (links inside .ask-panel)`
- **Properties:**
  - `destination_type`: `case_study` \| `project` \| `page` \| `external` \| `contact` \| `resume`

#### `chatbot_closed`

- **Trigger:** The drawer closes. `session_message_count` is the number of questions asked in that session.
- **Code:** `components/ai/AskPanel.tsx`
- **Properties:**
  - `session_message_count`: int 0–500


### E. Gummy Lab

#### `easter_egg_discovered`

- **Trigger:** The hidden five-click brand sequence fires and the Lab is entered.
- **Code:** `components/easter-egg/SecretTrigger.tsx`
- **Properties:**
  - `trigger_type`: `brand_click_sequence`

#### `game_intro_viewed`

- **Trigger:** The Lab's intro card is shown (state INTRO): once per Lab visit.
- **Code:** `lib/analytics/lab.ts`
- **Properties:**
  - `game_version`: `pinball_v1`

#### `game_started`

- **Trigger:** A first run reaches PLAYING (the countdown ended).
- **Code:** `lib/analytics/lab.ts`
- **Properties:**
  - `input_method`: `touch` \| `pointer`
  - `device_type`: `mobile` \| `tablet` \| `desktop`

#### `game_interaction_performed`

- **Trigger:** First time per run a mechanic is used (launch, nudge, power-up, escaping the danger zone). Bounded: 4 per run at most.
- **Code:** `lib/analytics/lab.ts`
- **Properties:**
  - `interaction_type`: `launch` \| `nudge` \| `power_up` \| `danger_escape`

#### `game_milestone_reached`

- **Trigger:** Once per run each: 30 s survived, 60 s survived, combo x5, all four targets (TP MODE).
- **Code:** `lib/analytics/lab.ts`
- **Properties:**
  - `milestone_type`: `survived_30s` \| `survived_60s` \| `combo_5` \| `tp_mode`

#### `game_over`

- **Trigger:** A run ends (the gummy drained). Exactly once per run.
- **Code:** `lib/analytics/lab.ts`
- **Properties:**
  - `survival_time_seconds`: int 0–86400
  - `score`: int 0–100000000
  - `end_reason`: `drained`

#### `game_replayed`

- **Trigger:** A new run starts from the results screen.
- **Code:** `lib/analytics/lab.ts`
- **Properties:**
  - `previous_score`: int 0–100000000

#### `game_exited_to_portfolio`

- **Trigger:** The visitor leaves the Lab for the portfolio.
- **Code:** `components/lab/LabApp.tsx → lib/analytics/lab.ts`
- **Properties:**
  - `exit_location`: `portal` \| `intro` \| `playing` \| `paused` \| `results` \| `fallback`



### Property enumerations used across events

- `cta_location`: `header`, `hero`, `footer`, `contact_page`, `about`, `case_study`, `projects`, `card`, `ask_tushky`, `other`. Derived from the DOM landmark of the clicked link (header, footer, `.hero`, the portfolio sheet, the Ask drawer) and otherwise from the page.
- Ask Tushky categories: `projects`, `experience`, `ai_product_management`, `cloud_architecture`, `contact`, `other` (derived locally; see [Privacy](#7-privacy)).
- `destination_type` (drawer links): `case_study`, `project`, `page`, `external`, `contact`, `resume`.

---

## 4. Common properties, identity and attribution

**Sent with every event (Mixpanel super properties):** `environment` (`production` | `staging` | `development`), `schema_version`, `device_type`. **Per event, only where useful:** `page_name`/`page_path` on page, section and scroll events; `theme` and `session_type` on `page_viewed`; `project_id` on project events. Nothing else is attached.

- `device_type` — documented classification by viewport width **at the page view**: `mobile` < 768 px ≤ `tablet` < 1024 px ≤ `desktop`. A device that rotates mid-visit is reclassified at the next page view.
- `theme` — `light`/`dark` as the page shows it at the page view (`<html data-theme>`); descriptive of use, not proof of preference. Omitted if unknown.
- `session_type` — `new` when this browser had no earlier visit recorded by this site (a `localStorage` flag), `returning` otherwise; evaluated once per document load. Blocked storage ⇒ always `new` (stated limitation). This is *per browser*, not per person.
- `environment` — the value of `NEXT_PUBLIC_ANALYTICS_ENV`, or `production` on the live host.

**Built-in Mixpanel properties kept** (not duplicated): `$browser`, `$browser_version`, `$os`, `$device`, `$screen_width/height`, `$referring_domain`, `distinct_id`/`$device_id`, `time`, `$insert_id`. **Switched off / removed:** `$current_url`, `$referrer` (full URLs can carry query strings), the SDK's own UTM/click-id capture, referrer persistence, IP-based geolocation (`ip: false`). Country/city will therefore be empty in Mixpanel; that is intentional.

**Attribution.** The SDK's own URL-based capture is disabled (see above) and replaced by a sanitised equivalent:
- **Last touch:** if the landing URL has `utm_*` tags, they are registered as super properties (`utm_source` … `utm_term`) and so ride on every later event until replaced by a newer tagged visit. Report "by source" with *any* event to get last-touch.
- **First touch:** the same tags are also stored once as `initial_utm_*`, and the first external referrer host as `initial_referring_domain` (never a path or query). They never change after the first value.
- **Referrer:** only `$referring_domain` (host) is sent. With no UTM and no referrer, nothing is invented — the source is simply "direct / none".
- No click ids (`gclid`, `fbclid`, `li_fat_id` …), no other query parameter, no fragment is ever sent. `page_path` is the canonical path: no query, no fragment, no trailing slash. In-place URL updates such as `/projects?product=nuptis` therefore never count as a new page view.

**Identity.** Anonymous only. The SDK generates a random `$device_id` and `distinct_id` stored in `localStorage`; there is **no `identify()`**, no user profile, no email/name/ID, no fingerprinting, no cross-device resolution, no custom session id. A returning visitor on the same browser keeps the same id; clearing site data, a private window or another device is a new visitor. Mixpanel computes *sessions* itself from event timing (Insights → "Session" analysis); the site adds no session id. Nobody is labelled a recruiter, hiring manager or lead: the metric is "professional conversion actions per unique eligible visitor", each conversion type reported separately.

---

## 5. Dashboards and reports (the 10 questions)

Create the four dashboards by hand in Mixpanel (Dashboards → New). Use *Insights* unless stated. Always filter `environment = production`. **Eligible visitor** = a unique user with ≥1 `page_viewed`. Exclude yourself (see "Opting yourself out") and, optionally, `device_type`-less bots by requiring `page_viewed` (bots that never execute the lazy load simply never appear).

Rates: unless stated, **rate = unique users who did X ÷ unique users with `page_viewed` in the same period** (a *unique-user* rate, not an event rate). When a denominator is narrower (carousel reach, chatbot opens, Lab discovery) it is named.

### Dashboard A — Portfolio performance
| Report | How to build it |
|---|---|
| Unique visitors over time | Insights → `page_viewed`, *Unique users*, line by day. |
| New vs returning | `page_viewed` unique users, breakdown `session_type`. *New* = first visit seen in that browser; *returning* = the browser had a prior visit. Per browser, not per person; blocked storage reads as new. |
| Top landing pages | `page_viewed` with filter `is_landing = true`, breakdown `page_name` (or `page_path`), unique users. |
| Traffic source & campaign | `page_viewed` where `is_landing = true`: breakdown `utm_source`, then `utm_campaign`; for unlabelled traffic breakdown `$referring_domain` (empty = direct/none). First-touch view: breakdown `initial_utm_source`. |
| Section reach | `section_viewed`, unique users, breakdown `section_name`, filtered by `page_name`; divide by that page's unique `page_viewed` users. |
| Scroll depth distribution | `scroll_depth_reached`, unique users, breakdown `depth_percent`, filter `page_name`. Pages that fit in about one screen send none. |
| Mobile vs desktop engagement | Any report above, breakdown `device_type`. Compare *rates*, not counts. |
| Light vs dark usage | `page_viewed` breakdown `theme` (descriptive), plus `theme_changed` unique users. A visitor who toggles may be in both groups. |

Answers: *which channels attract visitors; which pages/sections get attention; does mobile differ* (Q1, Q2, Q6, Q7).

### Dashboard B — Career conversion
Denominator for every rate = unique `page_viewed` users in the period, unless noted.

| Report | How to build it |
|---|---|
| Résumé interaction rate | unique users `resume_opened` ÷ unique `page_viewed`. (An open of the Drive viewer, not a download or a read.) |
| LinkedIn click rate | unique `linkedin_profile_clicked` ÷ unique `page_viewed`. |
| Email click rate | unique `email_contact_clicked` ÷ unique `page_viewed`. (A click, not a sent email.) |
| Contact form rate | Not applicable: the site has no form. |
| **Primary metric** | Unique users with `professional_cta_clicked` where `cta_type` ∈ {`resume`,`linkedin`,`email`} ÷ unique `page_viewed`. Report each `cta_type` separately beside it; the three are *overlapping* (a visitor can do all), so never sum them as "leads". |
| By CTA location | `professional_cta_clicked` (filter above), unique users, breakdown `cta_location`. |
| By landing page | Funnel/Insights with the user's *first* `page_viewed` `page_name` (Mixpanel: "First time" property via a cohort of users whose first `page_viewed` had `is_landing = true`) vs. conversion. Simplest: Insights `professional_cta_clicked` unique users, breakdown by user property cohort per landing page. |
| By acquisition source | `professional_cta_clicked`, breakdown `utm_source` (last touch) or `initial_utm_source` (first touch); denominator = unique visitors of that source. |
| Exploration → action | Funnel 1 below. |

### Dashboard C — Project effectiveness
Use `project_id` for logic and add a *Lexicon display name* (or a custom property mapping) per id for readable labels: ids are the data slugs (e.g. `teachspark`, `railcite`, `nuptis`, `velora`).

| Report | How to build it |
|---|---|
| Carousel reach | `project_carousel_viewed` unique users ÷ unique `page_viewed` where `page_name = portfolio`. |
| Selection distribution | `project_selected` unique users, breakdown `project_id`, and breakdown `selection_method`. Remember the default project is seen without any selection event: normalise against *carousel reach*, never raw counts. |
| Pitch / demo starts and completion | Starts: `project_video_started` by `project_id` × `video_type`. Completion rate = unique users with `project_video_progressed` `progress_percent = 100` ÷ unique users with `project_video_started` (same `project_id`, `video_type`). Also show the 25/50/75 drop-off. |
| Case study views | `case_study_viewed`, breakdown `project_id` and `entry_point`. |
| Product link clicks | `product_link_clicked`, breakdown `project_id`. |
| Project-specific conversion | Funnel 2 (below) breakdown `project_id`. |

Do not rank projects by raw event counts: a project earlier in the carousel is seen by more people. Normalise by the unique users who *had the opportunity* — those with `project_carousel_viewed`, and for selection those who selected anything.

### Dashboard D — Interactive experiences (keep separate from conversion)
| Report | How to build it |
|---|---|
| Ask Tushky open rate | unique `chatbot_opened` ÷ unique `page_viewed`. |
| Suggested prompt selection | `chatbot_prompt_selected` unique users ÷ unique `chatbot_opened`; breakdown `prompt_category`. |
| Typed vs suggested | `chatbot_message_sent` vs `chatbot_prompt_selected`, ÷ unique `chatbot_opened`. |
| Successful response rate | `chatbot_response_received` ÷ (`chatbot_response_received` + `chatbot_response_failed`), events; plus breakdown `response_status` (`answered_faq`, `answered_index`, `no_match` — a high `no_match` share is the content gap to fix) and the `latency_ms` median/p90. |
| Destination clicks | `chatbot_cta_clicked`, breakdown `destination_type`; unique users ÷ unique `chatbot_opened`. |
| Gummy Lab discovery | unique `easter_egg_discovered` ÷ unique `page_viewed` (expect tiny: it is hidden by design). |
| Start / replay | `game_started` ÷ `easter_egg_discovered`; `game_replayed` ÷ `game_over` (unique users). |
| Survival-time & score distributions | `game_over`, histogram/percentiles of `survival_time_seconds` and `score`. |
| Theme changes, device | `theme_changed` unique users, breakdown `device_type`; `game_started` breakdown `device_type` and `input_method`. |

### Which dashboard answers which question
1 sources → A · 2 attention → A, C · 3 best projects → C · 4 videos → C · 5 CTAs → B · 6 strongest sources/landing pages → A, B · 7 mobile vs desktop → A (and B/C with a `device_type` breakdown) · 8 Ask Tushky → D · 9 Gummy Lab → D · 10 what to improve → read B and C together (below).

**Q10 — what to improve first.** Rank by *rate*, not count, once ≥ a few hundred eligible visitors: (a) the page/section with high reach but low downstream action (Dashboard A reach vs B conversion by landing page), (b) projects with strong video completion but weak product-link/CTA follow-through (C), (c) `no_match` questions in Ask Tushky (D → content to add), (d) the device whose conversion rate lags (A/B by `device_type`), (e) sources with traffic but zero conversion.

---

## 6. Funnels

Mixpanel → Funnels. Common settings: *Counting* = **Unique users**; *Order* = "In this order" except where noted; filter `environment = production`.

| # | Steps | Conversion window | Notes |
|---|---|---|---|
| 1. Portfolio → professional action | `page_viewed` → `project_selected` → (`project_video_started` **or** `case_study_viewed`) → `professional_cta_clicked` (filter `cta_type` ≠ `contact_page`) | 1 day (session-ish); also look at 7 days | Diagnostic. Middle steps are optional paths: in Mixpanel make step 3 an *OR* of the two events (Funnel step → "Add event" → "Any of"), and compare against the variant that drops steps 2–3 to see the lift. |
| 2. Project effectiveness | `project_selected` → (`project_video_started` **or** `case_study_viewed`) → (`product_link_clicked` **or** `professional_cta_clicked`) | 1 day | **Breakdown by `project_id`** (use the `project_id` on the first step). `case_study_viewed` opens in a new tab and still carries `project_id`. |
| 3. Résumé | `page_viewed` → (`resume_opened`) | 1 day | A click is not proof the résumé was read. `resume_downloaded` does not exist. |
| 4. Ask Tushky | `chatbot_opened` → (`chatbot_prompt_selected` **or** `chatbot_message_sent`) → `chatbot_response_received` → `chatbot_cta_clicked` | 1 hour | Typing without a suggestion is a valid path (the OR). Step 3 will be near 100 %: the interesting drop is step 4 and the `response_status` breakdown. |
| 5. Gummy Lab | `easter_egg_discovered` → `game_started` → `game_over` → `game_replayed` | 1 day | Observable sequence only: leaving is not a failure. `game_started` fires only for a visit's first run; later runs are `game_replayed`. |

Counting rule recap: funnels count **unique users**; Insights rates use **unique users ÷ unique `page_viewed` users**; event counts are only for volume/latency charts.

---

## 7. Privacy

**What is collected**, and why:

| Data | Why |
|---|---|
| Anonymous random id (`$device_id`/`distinct_id`) in `localStorage` | Count unique visitors and returning browsers. |
| Page name/path (canonical), section names, scroll milestones, navigation type | Where attention goes. |
| Source: sanitised `utm_*` tags and the referrer's **host** | Which channels bring visitors. |
| Coarse device class (viewport width), browser/OS/screen from the SDK, theme | Mobile vs desktop; descriptive theme use. |
| CTA clicks (résumé, LinkedIn, email, contact page) with their placement, product/GitHub/PRD link clicks with the destination **host** | Conversion. |
| Project id, selection method, video start and 25/50/75/100 % milestones | Which projects and videos work. |
| Ask Tushky: that it was opened, a **category** (one of six) for each question, the response status and latency, the number of questions, destination type of a clicked source | Whether the assistant helps. |
| Gummy Lab: discovery, started/over/replayed, first-per-run mechanics, score and whole seconds survived | Engagement with the game, kept apart from conversion. |

**Never collected** (enforced by the schema, a test per rule): the text of any Ask Tushky question or answer; any form field, keystroke, clipboard or DOM text; email addresses (the mailto *click* is recorded, not the address); the résumé's file id or contents; LinkedIn profile path; full URLs, query strings (other than the five sanitised `utm_*`), fragments, click ids, tokens or codes; IP address or geolocation (`ip: false`); names or any identifier of a person; session replay or autocapture; cookies of any kind; cross-site or cross-device identifiers.

**Controls.** Do Not Track and Global Privacy Control → analytics never loads. `?analytics=off` → permanent opt-out in that browser. `NEXT_PUBLIC_ANALYTICS_CONSENT=opt-in` → nothing until a banner grants. Withdrawal clears the SDK's local data. Localhost and previews send nothing by default. The Content-Security-Policy allows exactly one extra origin — the chosen Mixpanel ingestion host, in `connect-src` only, and only in builds that have a token — and nothing for scripts (the SDK is bundled and served from the site itself). A unit test pins this and an e2e test proves every other third-party host (and Mixpanel itself, in a token-less build) is still blocked by the browser.

Existing Vercel Analytics / Speed Insights are untouched and still cookie-less. The existing `Ask Tushky Cache Hit/Miss` custom events (Vercel Analytics, FAQ id + category only) and the voice events are also untouched.

---

## 8. Validating in Mixpanel Live View

Open the production project → *Events → Live View*, then use a normal window **without** an ad-blocker, Do Not Track or `?analytics=off`. Events appear within ~2–5 s (the SDK batches for 2 s). Expect the first events a few seconds after load (the SDK loads at idle). Use the *test* project for rehearsals (`NEXT_PUBLIC_ANALYTICS_ENV=staging`).

| UI action | Expected event(s) and key properties | Repeat behaviour / edge cases |
|---|---|---|
| Open `/` in a fresh tab | `page_viewed` (`page_name=home`, `is_landing=true`, `navigation_type=direct`, `session_type=new`, `device_type`, `theme`) | Reload ⇒ `navigation_type=reload`, `session_type=returning`. In-place URL changes do not repeat it. |
| Click a header link (e.g. Portfolio) | `navigation_clicked` (`destination=/projects`, `navigation_location=header`) then `page_viewed` (`client_navigation`, `is_landing=false`) | Exactly one `page_viewed` per route change; Back ⇒ `back_forward`. |
| Click "Let's connect" | `professional_cta_clicked` (`cta_type=contact_page`, `destination_type=internal_page`, `cta_location=header`) + `navigation_clicked` | Not part of the primary metric. |
| Scroll a long page | `section_viewed` per `main section[id]` (once each), `scroll_depth_reached` 25/50/75/90 (once each) | A jump straight to the bottom (End key, anchor link) reports every milestone it passed, still once each; navigating away and back is a new page view, so they can fire again. Short pages send no depth. |
| Press the theme switch | `theme_changed` (`theme_from`, `theme_to`) | Not on load, not on an OS theme flip. |
| Scroll the carousel into view | `project_carousel_viewed` (`project_count`) | Once per page view. |
| Click the carousel arrow / press ←→ / tap a cover | `project_selected` (`selection_method=arrow` / `keyboard` / `direct_selection`, `project_id`) | Not at load; not when re-choosing the active project. Swiping the strip scrolls it without selecting, so it emits nothing. |
| Press Pitch/Demo on the sheet | `project_asset_opened` (`asset_type=pitch_video`/`demo_video`) | Only when the mode actually changes. |
| Press Play on a video | nothing yet; once the player reports playback: `project_video_started`; then `project_video_progressed` 25/50/75/100 | Pause/resume stays in the session; seeking does not credit; replay after the end starts a new session. Vimeo is not instrumented. |
| Click Product / GitHub / PRD on the sheet | `product_link_clicked` (`project_id`, host only), `project_asset_opened` (`product_link`), `outbound_link_clicked` | One set per click. |
| Click "Read the case study" | `project_asset_opened` (`case_study`); in the new tab `page_viewed` + `case_study_viewed` (`entry_point`) | Opening it directly or from another site ⇒ `external_or_direct`. |
| Click the Résumé link (footer or /contact) | `resume_opened` (`open_method=external_viewer`) + `professional_cta_clicked` (`resume`) + `outbound_link_clicked` (`link_type=resume`, `drive.google.com`) | One click ⇒ one of each. |
| Click LinkedIn | `linkedin_profile_clicked` + `professional_cta_clicked` (`linkedin`) + `outbound_link_clicked` | Another LinkedIn profile is only `outbound_link_clicked`. |
| Click an email link | `email_contact_clicked` + `professional_cta_clicked` (`email`, `destination_type=email_client`) | No address is sent. The copy-to-clipboard button is not tracked. |
| Open Ask Tushky (header button / hero link / Home section) | `chatbot_opened` (`entry_point`) | |
| Choose a suggestion or follow-up chip | `chatbot_prompt_selected` (`prompt_category`) then `chatbot_response_received` | |
| Type a question and send | `chatbot_message_sent` (`message_category`) then `chatbot_response_received` (`response_status`, `latency_ms`) | The question text must not appear anywhere. Retry after an error ⇒ at most one `chatbot_response_received` per question. |
| Click a source link in an answer | `chatbot_cta_clicked` (`destination_type`) | |
| Close the drawer | `chatbot_closed` (`session_message_count` = questions asked) | Reopening starts a new session. |
| Click the name/monogram five times | `easter_egg_discovered`, then in `/lab`: `page_viewed` (`gummy_lab`), `game_intro_viewed` | Fewer clicks / too slow ⇒ nothing. |
| Play the Lab | `game_started` (first run), `game_interaction_performed` (`launch`, `nudge`, `power_up`, `danger_escape`, each at most once per run), `game_milestone_reached` (`survived_30s`, `survived_60s`, `combo_5`, `tp_mode`, once each per run), `game_over` (once per run) | Replay ⇒ `game_replayed` (`previous_score`). |
| Leave the Lab (portal, button, Esc) | `game_exited_to_portfolio` (`exit_location`) | Once per visit. |
| Visit with Do Not Track on, or `?analytics=off` | nothing at all (Network tab: no `mixpanel.com` request) | Stays silent on later visits in that browser. |

Also check: the Network tab shows requests only to the one `api-js|eu|in.mixpanel.com` host, with `ip=0` in the query; no cookie is set by Mixpanel; Application → Local Storage holds an `mp_*` key.

---

## 9. Limitations and known gaps

- **Not verified against real Mixpanel.** Everything above was run against a stub token with requests intercepted. The payload shape, batching and property blocking were checked against the installed SDK (`mixpanel-browser` 2.84.0) source and decoded in tests, but a real Live View check (section 8) is still owed.
- **Video: YouTube only, and the protocol was exercised with a stub.** Start and milestones come from the YouTube iframe's own `postMessage` reports (`infoDelivery`: player state, time, duration) over the handshake the site already uses; no YouTube SDK is added. The tests drive a stub player speaking that protocol; the real YouTube player was not reachable from the build environment. If real playback does not report (e.g. YouTube changes the message), `project_video_started` simply does not fire — it never falls back to counting the Play click. Vimeo videos report nothing (no product uses Vimeo). Milestones follow *watching*, not position (a seek credits nothing; a milestone needs at least half the span actually watched); completion is the ENDED state after enough watching.
- **Events before the SDK loads.** The SDK arrives after `load` + idle (≤4 s) or at the first waiting interaction. Interactions in that window are queued (max 40) and sent once ready; a visitor who leaves within the first moments is not counted at all. `page_viewed` for the landing page is sent when the runtime starts.
- **Swipe is not a selection method.** The carousel is a native scroll-snap strip: swiping scrolls it but selects nothing (a tap selects). So `selection_method` has `arrow`, `keyboard`, `direct_selection` only.
- **Résumé is an open, not a download.** It is a Google Drive viewer link (new tab); the site cannot know whether it was read or saved.
- **Not tracked:** the copy-email button, the digital business-card vCard download (`/card`), clicks on in-body internal links outside the header/footer (only the ones named above), Vimeo, the unused inline `AskPortfolio` surface, ad-blocked or Do-Not-Track visitors (by design), and visitors with blocked `localStorage` (their id is not kept, so they count as new each page load).
- **Gummy Lab.** The lab is a pinball game, so `drag`/`flick`/`squish` do not exist and are not instrumented; the mechanics measured are `launch`, `nudge`, `power_up` and escaping the danger zone (`danger_escape`, which is *close to* but not identical to the engine's "save" bonus rule). The only way a run ends is draining (`end_reason=drained`). `game_over` uses the engine's own end-of-run summary (score, whole seconds); a visitor who leaves in the ~1.3 s between draining and the results card still gets that run reported from the last HUD values. Input method is `touch` when the primary pointer is coarse.
- **`session_type` and "unique visitors" are per browser**, and `localStorage` can be cleared or unavailable.
- **No geography** (IP is not sent), by design.
- **Preview deployments** send nothing unless `NEXT_PUBLIC_ANALYTICS_ENV` is set; the Vercel *Production* environment must therefore be where the token lives.
