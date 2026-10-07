# Local key: pixels close to the flat backdrop become transparent (soft edge band).
# v2 (EVAL-038 P2 gate): magenta-hued pixels DARKER than the backdrop are cast shadows on the backdrop,
# not object pixels. They become soft, semi-transparent warm ink (alpha <= 0.35, blurred ~2 px) instead of
# being kept opaque and despilled to near-black.
import sys
from PIL import Image, ImageFilter
import numpy as np
src, dst = sys.argv[1], sys.argv[2]
im = np.asarray(Image.open(src).convert("RGB")).astype(np.float32)
h, w, _ = im.shape
c = im[:16, w//3:].reshape(-1,3)  # top band, right two-thirds: always backdrop in our layer prompts
bg = np.median(c, axis=0)
d = np.sqrt(((im - bg) ** 2).sum(axis=2))
lo, hi = 18.0, 42.0
a = np.clip((d - lo) / (hi - lo), 0, 1)
is_magenta_bg = bg[0] > bg[1] + 80 and bg[2] > bg[1] + 80
shadow = np.zeros_like(a, dtype=bool)
if is_magenta_bg:
    R, G, B = im[:,:,0], im[:,:,1], im[:,:,2]
    hue_mag = (R - G > 40) & (B - G > 40)
    lum = im.mean(axis=2); bg_lum = bg.mean()
    shadow = hue_mag & (lum < bg_lum - 8)
    dark = np.clip(1 - lum / bg_lum, 0, 1)
    a = np.where(shadow, np.clip(dark * 0.33, 0, 0.35), a)
alpha = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.MedianFilter(3))
if shadow.any():
    soft = np.asarray(alpha.filter(ImageFilter.GaussianBlur(2))).astype(np.float32)
    al = np.asarray(alpha).astype(np.float32)
    alpha = Image.fromarray(np.where(shadow, soft, al).astype(np.uint8))
    im[shadow] = (52, 30, 22)  # warm dark-paper ink (≈ --mat-side family), never pure black
# despill: pull the background's dominant channels back toward the others (magenta: R,B > G)
if bg[0] > bg[1] and bg[2] > bg[1]:
    m = np.minimum(im[:,:,0], im[:,:,2]); ex = np.clip(m - im[:,:,1], 0, None) * 1.0
    im[:,:,0] -= ex; im[:,:,2] -= ex
out = Image.fromarray(np.clip(im,0,255).astype(np.uint8)).convert("RGBA"); out.putalpha(alpha); out.save(dst)
print("bg", bg.round(1), "transparent%", round(float((a == 0).mean() * 100), 1), "shadow%", round(float(shadow.mean()*100), 2))
