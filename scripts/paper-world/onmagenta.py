import sys
from PIL import Image
im=Image.open(sys.argv[1]).convert("RGBA"); bg=Image.new("RGBA",im.size,(255,0,255,255)); bg.alpha_composite(im)
box=tuple(int(v) for v in sys.argv[3].split(",")) if len(sys.argv)>3 else None
o=bg.convert("RGB"); o=o.crop(box) if box else o; o.thumbnail((1200,1200)); o.save(sys.argv[2])
