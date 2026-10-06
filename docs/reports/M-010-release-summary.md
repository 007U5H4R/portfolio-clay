# M-010 release summary: paper-cut system, dark mode and delight features

For Tushar · 2026-10-06 · branch `m-009-redesign` · **preview only, production frozen** (S26; S34 ships M-010 and M-011 together in one production release, on your explicit go).

## What shipped (on preview)

| Track | Ticket | What a visitor sees |
|---|---|---|
| T1 hero | TASK-140 | Home hero is a paper-cut still (likeness from the locked character sheet), with a dark twin. |
| T2 dark mode | TASK-141 | Full dark theme in the navy family (never pure black), set before first paint, with a sun/moon cut-paper toggle. |
| T2b cursor | TASK-142 | Paper Trail cursor on fine pointers only, lazy-loaded after page load. |
| T2c Gummy Lab | TASK-143 | Hidden game at `/lab`, reached only by 5 quick clicks on the name or TP monogram. noindex, never linked; ESC or "← Back to Portfolio" exits. |
| T3 scenes | TASK-144 | Seven tab scenes, one paper world with a metaphor per tab, each as a light + dark WebP pair with mobile crops. |
| T4 chrome | TASK-145 | Paper nav tabs with a terracotta active strip, a footer ocean with a cut-paper ship, SVG ridge dividers, and one depth scale. |
| T5 card | TASK-146 | `/card` digital business card: flip, raised QR, `/card/vcard` download (no phone, no DOB, no Wallet). |
| Docs | TASK-147, 148 | Stage docs; Bhakti screens. |

## Style-gate calls I made on your behalf (EXE-26)
- **EXE-28 (T1):** passed. Likeness matches; carried one note into T3 (push layered depth harder).
- **EXE-32 (T2 + T2b):** passed. Dark mode stays navy; type and chrome flip by role.
- **EXE-34 (T3):** passed. **No case-study scenes**: case studies open on their own product hero, so the scene would never be seen. Tushky's scene is kept in the library but not shipped.
- **EXE-35 (T5, T2c, T4):** passed. T5's dark front was re-tuned once (it was navy-on-navy). The card title stays "Senior Product Manager", taken from your data rather than the spec's unsourced "AI Product Manager". `/lab` alone gets `wasm-unsafe-eval` in its CSP (physics engine).
- **EXE-37 (security):** no Critical, High or Medium findings; 3 Lows fixed.
- **EXE-39 (Gummy Lab fix):** see below.

## Gummy Lab fix (TASK-143)
The two remaining `/lab` failures (canvas never sizing, ESC not exiting) had one cause. The footer's never-ending animations (ocean + rotating verb) kept running underneath the full-screen lab and starved its 3D start-up. The footer is no longer rendered on `/lab`; you can't see it there anyway. A regression test asserts nothing animates under the lab.

## Needs your decision before production
1. **Set `NEXT_PUBLIC_SITE_URL` on Vercel production.** Without it, the card's QR code and vCard point at the preview URL.
2. **"Draft — pending sign-off" labels** (pre-existing, `DraftTag`) are still on: the footer hiring line, Ask Tushky (panel + answers), How I Think on Home, Thinking list and essays. Each needs your copy sign-off, or removal.
3. **Production release itself.** Not delegated: S34 puts it after M-011.

## Known nits (carried, not blocking)
- Dark back wave in the footer ocean reads slightly violet.
- Faint olive line on the top of the dark ridge divider.
- Intro-video poster and the About band's mini-collage are still watercolour, not paper-cut.

## Open, outside M-010
- **TASK-149:** every page view preloads all tabs' hero scenes through route prefetch (from M-009, likely on production too). Fix after the release; it falls under the new no-lag rule (TASK-155).
- TASK-150 (footer sailboat clipped), TASK-152–155 and M-011 (TASK-151) are being handled in parallel sessions.

## Evidence
Final gate on the pushed tree: GATE_RESULTS. Preview deploy: PREVIEW_DEPLOY.
