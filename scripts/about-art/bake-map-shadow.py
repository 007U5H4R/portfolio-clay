"""Bake the /about pinboard map's drop shadow into a plain RGBA image (TASK-342).

The map was `filter: drop-shadow(0 12px 16px <shadow-ink> 18%)` on a 1193 x 548 px raster; WebKit re-composites
that filter on every scroll frame. The shadow is static, so it is rendered once here: the map's alpha, cropped the way
`object-fit: cover` crops it into the board (aspect 1000 : 460, centred), offset and Gaussian-blurred, coloured with the
theme's --shadow-ink at 18 %, on a canvas with a bleed so the blur is not cut. CSS (about.css `.crx-map::before`)
stretches it over the board with the same bleed.

  python3 scripts/about-art/bake-map-shadow.py
Needs Pillow + numpy. Reads public/media/about-paper/, writes public/media/portfolio/decor/.
"""
import numpy as np
from PIL import Image, ImageFilter

BOARD_W, BOARD_H = 1000, 460          # .crx-board aspect-ratio
CSS_W = 1193                          # board width at the 1440 viewport: native px -> css px = CSS_W / native width
OFFSET_Y, BLUR, ALPHA = 12, 16, 0.18  # the old drop-shadow(0 12px 16px ink 18%)
BLEED = 70                            # native px of canvas around the cropped map
INK = {"light": (13, 23, 53), "dark": (11, 21, 48)}  # --shadow-ink resolved to sRGB per theme

for theme in ("light", "dark"):
    im = Image.open(f"public/media/about-paper/pin-map-{theme}.webp").convert("RGBA")
    w, h = im.size
    scale = CSS_W / w
    crop_h = round(w * BOARD_H / BOARD_W)
    y0 = (h - crop_h) // 2
    alpha = im.getchannel("A").crop((0, y0, w, y0 + crop_h))
    canvas = Image.new("L", (w + 2 * BLEED, crop_h + 2 * BLEED), 0)
    canvas.paste(alpha, (BLEED, BLEED + round(OFFSET_Y / scale)))
    canvas = canvas.filter(ImageFilter.GaussianBlur(BLUR / 2 / scale))
    a = (np.asarray(canvas, dtype=np.float32) * ALPHA).round().astype(np.uint8)
    out = np.zeros((*a.shape, 4), dtype=np.uint8)
    out[..., :3] = INK[theme]
    out[..., 3] = a
    Image.fromarray(out).save(f"public/media/portfolio/decor/pin-map-shadow-{theme}.webp", quality=90, method=6)
    print(theme, out.shape[:2][::-1], "bleed %", BLEED / w * 100, BLEED / crop_h * 100)
