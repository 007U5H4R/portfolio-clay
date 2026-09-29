# TASK-130 · Nuptis → Velora: audit and narrative (spec §51 steps 1–5)

Sources: `data/projects.ts` (`velora`, plus `nuptis` for the pivot), CONTENT_INVENTORY §8.4–8.5, `docs/trace/velora.md`, and `docs/case-study-sources/velora/` (seven real app screens from the mock-data build) plus `…/nuptis/dashboard.jpg`.

## "Vendor Passport" (brief §4)

- **Why not a separate page:** "Vendor Passport" is not a product in this repo, so it gets no page.
- **What the record does support:** a **portable trust profile**.
  - The Velora PRD's problem line names trust that is "unverified and **non-portable**" (V-PRD).
  - The app ships a Trust profile screen: a vendor's score out of 100 and its "Verified" label.
- **So it is told as Velora's bet, with the record's own caveat:** the Trust Scores are *authored*, "shown as if verified", and real government-API verification is out of scope (V-PRD :80).
- **Velora stays apparel sourcing and vendor onboarding** (not the spec's lifestyle direction, §8). Its visual language is a sourcing dossier.

## 1. Audit (spec §40)

| # | Question | Answer from the records |
|---|---|---|
| 1 | Strongest problem | "Founders find manufacturers through cold referrals, trade fairs, or Alibaba-style directories where trust is unverified and non-portable." (V-PRD) |
| 2 | Strongest decision | Kill Nuptis on day seven: "Weddings were blue — but a shallow pool." (CS3-9DAY-SERIES) |
| 3 | Strongest evidence | Team-pooled procurement interviews and the queue-time insight (CS3-TEAM-PRD). Team work, labelled as such; the day counts are "verify before external use", so no numbers are shown |
| 4 | Strongest measured outcome | None on the demand side (no users, no pilot). Build signals only: 10/10 tests, 0 overflow at 375/768, 156 kB gzip (V-REVIEW) |
| 5 | Most interesting system | Brand ↔ manufacturer: swipe → match → RFP → bids → chat, over one Zustand store and an env-gated Supabase path with a mock fallback that was never run live (V-README, V-SUPABASE) |
| 6 | Most memorable learning | "Nine days. Two products. One survived." Kill your own work when the pool is shallow |
| 7 | Screenshots / videos | Seven real screens (mock data). `discover.jpg` and `profile.jpg` are not used (third-party certification marks; a drawn founder avatar). No video |
| 8 | PRDs / research / evals | Velora PRD, Apparel Discovery PRD (confidence tags), team PRD (interviews, ERRC), nine-day series, README, Supabase notes, task-6.3 review |

## 2. Narrative

- **Problem:** vendor trust is found by asking around, and it doesn't travel.
- **Research:** procurement said so. The delay is idle queue-time between hand-offs, not effort (team research).
- **Pivot:** Nuptis ✕, then the evidence (a shallow pool), then the decision (same trust problem, deeper market), then Velora.
- **Bet:** a portable trust profile in a two-sided marketplace (swipe, match, bid), with scores honestly authored.
- **Evidence:** it's a live prototype, measured as a build; no users.
- **Learning:** kill without flinching; attack hand-offs; label honestly.

Dominant story (spec §41): **killing the wrong bet.**

## 3. Metaphor

A sourcing and onboarding dossier:
- a kraft folder ground;
- section numbers as round inspection stamps;
- a swatch-tag hero;
- the pivot drawn as a struck-through Nuptis screen with a "Day 7" stamp, beside the Velora phone.

Accents: forest, terracotta, kraft. There is no "verified" stamp art, because nothing was verified.

## 4. Sections

1. Hero (pivot layout): the product's own line "Where brands and makers find their fit.", the proposition, two proofs (2 products in nine days ◇ · killed on day 7 ◇), and the Nuptis dashboard struck under the Velora role-select screen.
2. Problem (anchors 01–02).
3. Research (anchor 03): two team-pooled interview quotes and the queue-time insight (no day counts).
4. Pivot (anchor 04): Nuptis ✕ → evidence → decision → Velora.
5. The bet, portable trust (anchor 05): trust profile, RFPs and bids screens.
6. Evidence (anchors 06–07): build proofs and the gaps.
7. Learnings (anchor 08): three.

## 5. Cut

- **Cut:**
  - the 30-second overview and the eight chapters;
  - the stack list (React 19, react-router 7…);
  - the ERRC detail;
  - the seven-table schema list;
  - the fourth learning.
- **Not used:** the 15–30 days, <10 %, 2–5× baseline (team secondary research marked "verify before external use"); the APQC median.

## Claims → sources

| Claim | Source id |
|---|---|
| Tagline, role-select, trust profile, RFP and bid screens | V-LIVE |
| Proposition (B2B apparel sourcing; swipe to connect; matches turn into bids) | V-PRD |
| Two products in nine days; killed on day seven; "shallow pool"; "Nine days. Two products. One survived." | CS3-9DAY-SERIES |
| Interview quotes; queue-time insight (team research) | CS3-TEAM-PRD |
| Nuptis line (vendor ops for wedding agencies; unmeasured metrics) | NP-DASH (extra source → `nuptis` record, CONTENT_INVENTORY §8.4) |
| Trust Scores authored; verification out of scope | V-PRD |
| Supabase path built, not run live | V-SUPABASE |
| One-day build (11 Aug 2026) | V-README |
| 10/10 tests, 0 overflow, 156 kB | V-REVIEW |
| H1 coordination hypothesis, confidence tags | V-DISCOVERY-PRD |
