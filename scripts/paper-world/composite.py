# Recombine layers with per-layer offsets (dx, dy, scale) and optional parallax shift (px at depth 1.0).
import sys, json
from PIL import Image
P = sys.argv[1]; out = sys.argv[2]; shift = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
layers = json.load(open(P + "/" + (sys.argv[4] if len(sys.argv) > 4 else "layers.json")))
base = None
for L in layers:
    im = Image.open(P + "/" + L["file"]).convert("RGBA")
    if base is None: base = Image.new("RGBA", im.size, (0,0,0,255))
    s = L.get("scale", 1.0)
    if s != 1.0: im = im.resize((round(im.width*s), round(im.height*s)), Image.LANCZOS)
    dx = L.get("dx", 0) + shift * L["depth"] * 2.24  # 2.24 = 2688 master px per 1200 css px
    base.alpha_composite(im, (round(dx), round(L.get("dy", 0))))
o = base.convert("RGB"); o.thumbnail((1200, 1200)); o.save(out)
