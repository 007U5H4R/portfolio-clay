# Discovery PRD — Clay Portfolio

Status: reconstructed 2026-09-15 from the approved brief (`~/Downloads/prompt.md`), the verified source audit (`AUDIT.md`) and the approved `Solution-PRD.md` §1–3. Stage 1 was compressed into those inputs rather than run as a separate grilling session; this file records the **what and why** so the canonical artifact set is complete. It defines no solution.

## 1. Problem
Tushar Pathak's public footprint is inconsistent and shows almost none of his work. Three different titles are in circulation ("AI Product Manager" on the old one-pager, "Enterprise Product Leader – GenAI & Cloud" on the resume and the live cinematic site, "Senior Product Manager" on LinkedIn). Eleven real builds — including two live AI products with real corpora and a measured pilot funnel — sit in private repositories and local PRDs where no recruiter or product leader can see them. The live cinematic site is a striking film, not evidence of product thinking.

## 2. Why it matters
He is applying for Senior / Lead / AI / Technical Product Manager roles. Those screens are decided in seconds (recruiter) and minutes (hiring manager). Today neither audience can verify the two claims that matter most — *he thinks like a senior PM* and *he actually builds* — because the evidence is not public, not structured, and not attributed.

## 3. Target users
| User | Situation | Job to be done |
|---|---|---|
| Recruiter / sourcer | 30 seconds, often on a phone, between other profiles | Confirm name, level, domain (AI products), 2–3 proof points, grab the resume, find a contact route |
| Senior product leader / hiring manager | 3–5 minutes before or after an interview | Judge how he finds problems, makes bets, prioritises, evaluates, works with AI, and what he learned when assumptions failed |
| Peer engineer / PM | 2 minutes, sceptical | Verify technical depth: architecture, evals, live apps, code where public |

## 4. Evidence base (verified 2026-09-15 — see `AUDIT.md`)
- Personal builds: TeachSpark (live pilot, measured funnel), RailCite (live cite-or-refuse RAG, 5,760 docs), Cubicle (built, not deployed), Nuptis → Velora (two live products, documented pivot), Token Toli and Bhakti-Vilas (discovery work), Pratyasa, Tegaki, dino-arcade PWA, cinematic portfolio.
- Professional: American Express (Triumph → MARS, 35+ AR capabilities, Devin GenAI adoption), Quantiphi, Shellkode, Godrej Smartnet — resume-verified numbers only.
- Credentials: patent No. 429867, two peer-reviewed papers, three awards, M.Tech NIT Calicut, B.E. BIT Durg.
- Gaps: no supplied avatar, no demo videos except one oversized TeachSpark mp4, no RailCite screenshots, no articles, repos private, resume PDF contains PII and a wrong patent number.

## 5. In scope (problem level)
A public, self-owned web presence that (a) states one consistent positioning, (b) shows the personal builds as evidence-backed case studies, (c) presents corporate experience as proof of level and scale without implying public products, (d) is reachable and legible on mobile, and (e) never states a number, quote or technology that cannot be traced to a source.

## 6. Out of scope
Replacing or altering the live cinematic site or the old one-pager · publishing anything unverified (PMP/SAFe claims, testimonials, invented metrics) · personal data (DOB, phone, address) · a hosted AI service · a blog platform · dark mode · a contact form backend.

## 7. Success criteria (measurable; carried into `Solution-PRD.md` §8 and `evaluation-plan.md`)
1. Five-second test on the home page passes 6/6 at 390 px and 1440 px (name · Senior PM · builds AI products · cares about user problems · actually builds · projects to explore).
2. Recruiter path (home → work → case study → about → resume → contact) completes in ≤ 6 clicks with every hop live.
3. Each of the eight product-leader questions in the brief (§43) is answered by at least one case-study artifact.
4. Lighthouse ≥ 90 / 95 / 95 / 95 on the four key routes; WCAG AA with zero critical/serious axe issues; no horizontal scroll at four widths.
5. Zero unsourced claims — enforced mechanically at build time.
6. Link previews render correctly on LinkedIn.

## 8. Assumptions to watch
- Claymorphism can read "senior" rather than "toy" (mitigated by design tiers and a critique stage).
- A generated avatar can be recognisably Tushar (mitigated by identity-referenced generation and his sign-off — confirmed 2026-09-15).
- Private repos will eventually be made public or live demos are proof enough (mitigated by hiding code links until visibility flips).
