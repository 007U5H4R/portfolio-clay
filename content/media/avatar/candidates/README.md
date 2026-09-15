# Avatar candidates — 2026-09-15
Generated on Higgsfield (Nano Banana Pro route, rendered by nano_banana_2), 4:5, identity reference = portfolio/photo.jpg (media 3e422d2f-5a09-45f5-9756-c96775e00b4d). Spend: 4 × 2 = 8 credits (balance 409.9 → ~401.9).
- seated-A.png  job 027c0489-e587-4c32-bc62-c4c9bcb006ea — seated behind laptop, plant left, books right
- seated-B.png  job f0a3fbcb-7241-42df-a6d3-69f3998e4935 — seated at desk, books left, laptop + plant right
- standing-C.png job f9800263-c5b7-4e8c-b660-165c40bf574c — standing beside desk
- standing-D.png job 4f4d066f-9a1d-461a-975f-be475d5aa4c2 — standing beside desk
Chosen candidate → copied to ../avatar-source.png after Tushar's pick (decision S4).

## 2026-09-15 — cutout
- `../avatar-source.png` = standing-D (chosen, decision D5).
- `../avatar-cutout.png` = transparent PNG 1856×2304, produced locally with macOS Vision (`/Volumes/E Drive/Dev/.scratch/portfolio-clay/rembg.swift`, zero credits). Faint lavender edge fringe remains — invisible on lavender/sky clay frame; erode 1 px if it shows. WebP/AVIF exports + 2× poster happen in the avatar asset ticket.

## 2026-09-15 — avatar asset export (S02.01, TSK-02)
- Source: `../avatar-cutout.png` (unchanged, sha256 `0dcb088fe8b25c037bef3639cc939c027b86efdb3f489a22689cec91d1c7e4b2`).
- Script: `scripts/avatar.ts` v1 (this commit), sharp `0.35.4`.
- Outputs → `public/avatar/`: `avatar.webp` (1450×1800, quality 82, 94680 bytes), `avatar@2x.webp` (1856×2304, quality 80, 122444 bytes), `avatar-poster.webp` (1200×1500, flattened on `#FAF9FF`, 32162 bytes), `avatar-blur.txt` (16px base64 blurDataURL, 415 bytes).
- No paid tool calls — background removal already existed (S4 spend rule respected).
