# Bake per-layer transforms onto the master canvas and encode §32-named WebPs (desktop 2400, mobile 1280).
import sys, json, io, os
from PIL import Image
src, out, scene = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)
for theme, mf in (("", "layers.json"), ("-dark", "layers-dark.json")):
    for L in json.load(open(f"{src}/{mf}")):
        name = L["name"]
        im = Image.open(f"{src}/{L['file']}").convert("RGBA")
        canvas = Image.new("RGBA", im.size, (0, 0, 0, 0))
        s = L.get("scale", 1.0)
        if s != 1.0: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        canvas.alpha_composite(im, (round(L.get("dx", 0)), round(L.get("dy", 0))))
        if name == "bg": canvas = canvas.convert("RGB")
        for suffix, w, q in (("", 2400, 70), ("-mobile", 1280, 70)):
            r = canvas.resize((w, round(canvas.height * w / canvas.width)), Image.LANCZOS)
            p = f"{out}/{scene}-{name}{theme}{suffix}.webp"
            r.save(p, "WEBP", quality=q, method=6, alpha_quality=80)
            print(os.path.basename(p), r.size, round(os.path.getsize(p) / 1024), "kB")
