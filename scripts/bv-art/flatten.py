"""TASK-276: flattens a generated paper-craft master onto an exact page colour, then feathers its edges.
   python3 scripts/bv-art/flatten.py <in.png> <out.webp> <#target> <out-width> [crop=l,t,r,b fractions] [feather=0.06]
No colour keying: the model's near-flat background drifts a few levels region to region (and tiles in sheets), so we
estimate that local background (median of background-like pixels per cell, nearest-fill, edge-preserving median) and scale
each pixel by target / estimate. Shadows and objects keep their relative values; the background lands on the page colour.
Edges are then faded to transparent with a smoothstep so the art melts into the page (no rectangle)."""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

src, out, hexc, width = sys.argv[1], sys.argv[2], sys.argv[3], int(sys.argv[4])
crop = [float(v) for v in sys.argv[5].split(",")] if len(sys.argv) > 5 and sys.argv[5] != "-" else [0, 0, 1, 1]
feather = float(sys.argv[6]) if len(sys.argv) > 6 else 0.06
target = np.array([int(hexc[i:i + 2], 16) for i in (1, 3, 5)], dtype=np.float64)

im = Image.open(src).convert("RGB")
W, H = im.size
im = im.crop((int(crop[0] * W), int(crop[1] * H), int(crop[2] * W), int(crop[3] * H)))
a = np.asarray(im, dtype=np.float64)
h, w, _ = a.shape

# global background colour = median of a border ring
ring = np.concatenate([a[:6].reshape(-1, 3), a[-6:].reshape(-1, 3), a[:, :6].reshape(-1, 3), a[:, -6:].reshape(-1, 3)])
g = np.median(ring, axis=0)
dist = np.linalg.norm(a - g, axis=2)
inc = dist < (22 if target.mean() > 128 else 14)  # background-like pixels (shadows excluded: they are darker)
# a pixel is only a background sample if its neighbourhood is smooth too
sm = ndi.uniform_filter(a.mean(axis=2), 5)
sq = ndi.uniform_filter(a.mean(axis=2) ** 2, 5)
inc &= np.sqrt(np.maximum(sq - sm ** 2, 0)) < 2.2

C = 24
gh, gw = h // C, w // C
est = np.full((gh, gw, 3), np.nan)
for j in range(gh):
    for i in range(gw):
        m = inc[j * C:(j + 1) * C, i * C:(i + 1) * C]
        if m.mean() > 0.35:
            est[j, i] = np.median(a[j * C:(j + 1) * C, i * C:(i + 1) * C][m], axis=0)
valid = ~np.isnan(est[..., 0])
idx = ndi.distance_transform_edt(~valid, return_distances=False, return_indices=True)
est = est[idx[0], idx[1]]
est = np.stack([ndi.median_filter(est[..., c], size=3) for c in range(3)], -1)
est = np.stack([ndi.gaussian_filter(est[..., c], 0.8) for c in range(3)], -1)
B = np.stack([np.asarray(Image.fromarray(est[..., c].astype(np.float32), "F").resize((w, h), Image.BILINEAR)) for c in range(3)], -1)
out_rgb = np.clip(a * (target / B), 0, 255)
# residual bias: land the median of the background-like pixels exactly on the target (kills the last 1-2 levels)
near = (np.abs(out_rgb - target).max(axis=2) < 7) & inc
out_rgb = np.clip(out_rgb + (target - np.median(out_rgb[near], axis=0)), 0, 255)

# snap the last few levels of generator grain / block noise / region seams to the exact page colour: weight 1 within 2 levels of
# the target, 0 beyond 5 (smoothed so soft shadows and paper edges keep a continuous gradient)
dev = ndi.gaussian_filter(np.abs(out_rgb - target).max(axis=2), 1.5)
wgt = np.clip((5 - dev) / 3, 0, 1)[..., None]
out_rgb = out_rgb * (1 - wgt) + target * wgt

# feathered alpha
yy = np.minimum(np.arange(h), h - 1 - np.arange(h))[:, None] / (feather * h)
xx = np.minimum(np.arange(w), w - 1 - np.arange(w))[None, :] / (feather * w)
t = np.clip(np.minimum(yy, xx), 0, 1)
alpha = t * t * (3 - 2 * t)
rgba = np.dstack([out_rgb, alpha * 255]).astype(np.uint8)
img = Image.fromarray(rgba, "RGBA")
ow = min(width, w)
img = img.resize((ow, round(h * ow / w)), Image.LANCZOS)
img.save(out, "WEBP", quality=84, method=6, alpha_quality=95)
chk = np.asarray(Image.open(out).convert("RGBA"), dtype=float)
print(out, img.size, "bg est range", B.reshape(-1, 3).min(0).round(), B.reshape(-1, 3).max(0).round(), "->", target)
