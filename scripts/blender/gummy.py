"""Procedural generator for the Gummy Lab bear (TASK-143.1).

Run:  Blender -b --factory-startup --python scripts/blender/gummy.py -- OUT.glb [PREVIEW_DIR]
Blender 5.x. Z-up in Blender -> +Y up in glTF. Bear faces -Y in Blender (+Z in glTF).
Deterministic: no randomness.
"""
import sys, math, os
import bpy, bmesh
from mathutils import Vector, Matrix, Euler

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = argv[0] if argv else "gummy.glb"
PREVIEW_DIR = argv[1] if len(argv) > 1 else None
TARGET_BODY_TRIS = 3200

bpy.ops.wm.read_factory_settings(use_empty=True)


def ellipsoid(bm, c, r, rot=(0, 0, 0), seg=24, rings=14):
    """Add a UV ellipsoid to bm; return its verts."""
    res = bmesh.ops.create_uvsphere(bm, u_segments=seg, v_segments=rings, radius=1.0)
    verts = res["verts"]
    m = (Matrix.Translation(c) @ Euler(tuple(math.radians(a) for a in rot)).to_matrix().to_4x4()
         @ Matrix.Diagonal((*r, 1.0)))
    bmesh.ops.transform(bm, matrix=m, verts=verts)
    return verts


def tube(bm, pts, radii, sides=6):
    """Open-ended tube through pts with capped ends; returns verts."""
    rings = []
    allv = []
    for i, p in enumerate(pts):
        t = (pts[min(i + 1, len(pts) - 1)] - pts[max(i - 1, 0)]).normalized()
        a = Vector((0, 1, 0))
        n1 = t.cross(a).normalized()
        n2 = t.cross(n1).normalized()
        ring = [bm.verts.new(p + (n1 * math.cos(2 * math.pi * k / sides)
                                  + n2 * math.sin(2 * math.pi * k / sides)) * radii[i]) for k in range(sides)]
        rings.append(ring); allv += ring
    for i in range(len(rings) - 1):
        for k in range(sides):
            bm.faces.new((rings[i][k], rings[i][(k + 1) % sides], rings[i + 1][(k + 1) % sides], rings[i + 1][k]))
    for ring, flip in ((rings[0], True), (rings[-1], False)):
        bm.faces.new(ring[::-1] if flip else ring)
    return allv


# ---------------------------------------------------------------- body (union)
bm = bmesh.new()
HEAD_C = Vector((0, 0, 0.72))
ellipsoid(bm, (0, 0.00, 0.37), (0.27, 0.23, 0.27))                       # belly/body
ellipsoid(bm, HEAD_C, (0.25, 0.23, 0.235))                               # oversized head
ellipsoid(bm, (0, -0.15, 0.675), (0.10, 0.085, 0.07))                    # muzzle
for s in (-1, 1):
    ellipsoid(bm, (s * 0.17, 0.02, 0.915), (0.075, 0.055, 0.075), seg=16, rings=10)   # ears
    ellipsoid(bm, (s * 0.31, -0.02, 0.43), (0.075, 0.085, 0.14), (0, s * 28, 0), seg=16, rings=10)  # arms
    ellipsoid(bm, (s * 0.135, -0.02, 0.125), (0.115, 0.14, 0.125), seg=16, rings=10)  # legs/feet
me = bpy.data.meshes.new("body_src"); bm.to_mesh(me); bm.free()
body = bpy.data.objects.new("Body", me); bpy.context.scene.collection.objects.link(body)
bpy.context.view_layer.objects.active = body; body.select_set(True)

# voxel union -> single watertight shell
me.remesh_voxel_size = 0.016
me.remesh_voxel_adaptivity = 0.0
bpy.ops.object.voxel_remesh()
sm = body.modifiers.new("smooth", "SMOOTH"); sm.factor = 0.9; sm.iterations = 12
bpy.ops.object.modifier_apply(modifier=sm.name)
dec = body.modifiers.new("dec", "DECIMATE"); dec.ratio = min(1.0, TARGET_BODY_TRIS / max(1, len(me.polygons) * 2))
bpy.ops.object.modifier_apply(modifier=dec.name)
tri = body.modifiers.new("tri", "TRIANGULATE")
bpy.ops.object.modifier_apply(modifier=tri.name)
n_body = len(me.vertices)

# ---------------------------------------------------------------- face parts
fbm = bmesh.new()
face_idx = {"eyeL": [], "eyeR": [], "nose": [], "mouth": []}
base = 0
def track(key, verts):
    face_idx[key] = verts
EYE_Y = -0.218
eyes = {}
for key, s in (("eyeL", -1), ("eyeR", 1)):
    eyes[key] = ellipsoid(fbm, (s * 0.085, EYE_Y, 0.745), (0.032, 0.022, 0.044), seg=10, rings=7)
nose = ellipsoid(fbm, (0, -0.232, 0.685), (0.036, 0.022, 0.026), seg=10, rings=7)
mouth_pts = [Vector((x, -0.226 + 0.012 * (x / 0.05) ** 2 * -1 * -1 - 0.0, 0.625 - 0.012 * (1 - (x / 0.05) ** 2) + 0.0))
             for x in [-0.05, -0.034, -0.017, 0, 0.017, 0.034, 0.05]]
# smile: corners higher than centre
mouth_pts = [Vector((x, -0.2235 - 0.012 * (1 - (x / 0.05) ** 2) * 0, 0.628 - 0.014 * (1 - (x / 0.05) ** 2))) for x in
             [-0.05, -0.034, -0.017, 0, 0.017, 0.034, 0.05]]
mouth = tube(fbm, mouth_pts, [0.0065, 0.008, 0.009, 0.009, 0.009, 0.008, 0.0065], sides=5)
fbm.verts.index_update(); fbm.verts.ensure_lookup_table()
face_ranges = {}
all_face = []
for key, vs in (("eyeL", eyes["eyeL"]), ("eyeR", eyes["eyeR"]), ("nose", nose), ("mouth", mouth)):
    face_ranges[key] = [v.index for v in vs]
fme = bpy.data.meshes.new("face_src"); fbm.to_mesh(fme); fbm.free()
face = bpy.data.objects.new("Face", fme); bpy.context.scene.collection.objects.link(face)

# materials (kept simple; translucent gummy look lives in the web shader)
def mat(name, rgba, rough):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = rgba; b.inputs["Roughness"].default_value = rough
    m.diffuse_color = rgba
    return m
m_body = mat("GummyBody", (1.0, 0.43, 0.22, 1.0), 0.3)       # candy orange
m_face = mat("GummyFace", (0.16, 0.08, 0.13, 1.0), 0.45)     # Design.md dark plum ink
body.data.materials.append(m_body)
face.data.materials.append(m_face)

# join: body verts first, face verts after (offset known)
n_face_off = n_body
bpy.ops.object.select_all(action="DESELECT")
face.select_set(True); body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.object.join()
bear = bpy.context.active_object
bear.name = "GummyBear"; bear.data.name = "GummyBear"
me = bear.data
for p in me.polygons:
    p.use_smooth = p.material_index == 0 or True
# smooth normals on body; face stays smooth too (tiny parts)
for k in face_ranges: face_ranges[k] = [i + n_face_off for i in face_ranges[k]]

# UVs
bpy.ops.object.mode_set(mode="EDIT")
bpy.ops.mesh.select_all(action="SELECT")
bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.02)
bpy.ops.object.mode_set(mode="OBJECT")

# origin at base centre, scale to ~1 tall
zs = [v.co.z for v in me.vertices]
zmin, zmax = min(zs), max(zs)
for v in me.vertices:
    v.co.z -= zmin
H = zmax - zmin
sc = 1.0 / H
for v in me.vertices:
    v.co *= sc
bear.location = (0, 0, 0)

# ---------------------------------------------------------------- shape keys
def sstep(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)

basis_co = [v.co.copy() for v in me.vertices]
bear.shape_key_add(name="Basis", from_mix=False)
face_set = set(i for k in face_ranges for i in face_ranges[k])
BELLY_Z = 0.37 * sc if False else None  # (placeholder: positions below are in normalised units)
# normalised-unit landmarks (Blender space after scale): body ~z .0-.5, head ~ .5-1.0
def key(name, fn):
    sk = bear.shape_key_add(name=name, from_mix=False)
    for i, co in enumerate(basis_co):
        sk.data[i].co = fn(i, co.copy())
    sk.slider_min = 0.0; sk.slider_max = 1.0

def squish_v(i, c): return Vector((c.x * 1.12, c.y * 1.12, c.z * 0.80))
def stretch_v(i, c): return Vector((c.x * 0.93, c.y * 0.93, c.z * 1.14))
def squish_h(i, c): return Vector((c.x * 0.84, c.y * 1.10, c.z * 1.03))
def belly(i, c):
    w = math.exp(-(((c.z - 0.34) / 0.14) ** 2)) * (1 if c.y < 0.02 else 0.3)
    c.y += 0.07 * w; c.x *= 1 + 0.10 * w; c.z -= 0.02 * w
    return c
def wobble(sgn):
    def f(i, c):
        w = sstep(0.50, 0.80, c.z); c.x += sgn * 0.07 * w; c.z -= 0.012 * w * w; return c
    return f
def ear(sgn):
    def f(i, c):
        w = sstep(0.82, 0.93, c.z) * sstep(0.05, 0.12, sgn * c.x)
        c.z += 0.05 * w; c.x += sgn * 0.025 * w; return c
    return f
def arm(sgn):
    def f(i, c):
        w = sstep(0.22, 0.30, sgn * c.x) * math.exp(-(((c.z - 0.40) / 0.16) ** 2))
        c.z -= 0.07 * w; c.y += 0.05 * w; c.x += sgn * 0.02 * w; return c
    return f
def centroid(k): 
    pts = [basis_co[i] for i in face_ranges[k]]; return sum(pts, Vector()) / len(pts)
cen = {k: centroid(k) for k in face_ranges}

def face_fn(eye_sz, eye_dz, mouth_sx, mouth_corner_dz, mouth_sz, mouth_dz, brow_tilt=0.0):
    def f(i, c):
        for k in ("eyeL", "eyeR"):
            if i in set_of[k]:
                o = cen[k]; c.z = o.z + (c.z - o.z) * eye_sz[1] + eye_dz; c.x = o.x + (c.x - o.x) * eye_sz[0]
                c.z += brow_tilt * (1 if k == "eyeL" else -1) * (c.x - o.x) * 2
        if i in set_of["mouth"]:
            o = cen["mouth"]; rel = (c.x - o.x) / 0.075
            c.x = o.x + (c.x - o.x) * mouth_sx
            c.z = o.z + (c.z - o.z) * mouth_sz + mouth_dz + mouth_corner_dz * (rel * rel)
        return c
    return f
set_of = {k: set(v) for k, v in face_ranges.items()}

key("SquishVertical", squish_v)
key("StretchVertical", stretch_v)
key("SquishHorizontal", squish_h)
key("BellyImpact", belly)
key("HeadWobbleLeft", wobble(-1)); key("HeadWobbleRight", wobble(1))
key("EarBounceLeft", ear(-1)); key("EarBounceRight", ear(1))
key("ArmLagLeft", arm(-1)); key("ArmLagRight", arm(1))
# eye_sz=(x,z scale); Happy = eyes squint into arcs, wide smile
key("Happy", face_fn((1.15, 0.30), 0.0, 1.35, 0.016, 1.8, 0.0))
key("Surprised", face_fn((1.25, 1.45), 0.008, 0.55, -0.018, 3.2, -0.004))
key("Worried", face_fn((1.0, 1.0), 0.0, 0.9, -0.020, 1.0, 0.0, brow_tilt=0.5))
key("Panic", face_fn((1.35, 1.6), 0.012, 0.75, -0.022, 4.4, -0.006, brow_tilt=0.35))
key("Blink", face_fn((1.1, 0.12), 0.0, 1.0, 0.0, 1.0, 0.0))
bear.data.shade_smooth() if hasattr(bear.data, "shade_smooth") else None
bpy.ops.object.shade_smooth()

# ---------------------------------------------------------------- collision proxy
cbm = bmesh.new()
for c, r in (((0, 0, 0.30), (0.34, 0.25, 0.30)), ((0, 0, 0.74), (0.25, 0.23, 0.24)), ((0, 0, 0.11), (0.30, 0.17, 0.11))):
    ellipsoid(cbm, c, r, seg=10, rings=6)
hull = bmesh.ops.convex_hull(cbm, input=cbm.verts[:], use_existing_faces=False)
bmesh.ops.delete(cbm, geom=hull["geom_unused"] + hull["geom_interior"], context="VERTS")
bmesh.ops.triangulate(cbm, faces=cbm.faces[:])
cme = bpy.data.meshes.new("GummyCollider"); cbm.to_mesh(cme); cbm.free(); cme.validate(verbose=True)
col = bpy.data.objects.new("GummyCollider", cme); bpy.context.scene.collection.objects.link(col)
# clamp proxy to the rendered mesh bounds (it is built in the same normalised space as the bear)
cm = bear.data
bx = max(abs(v.co.x) for v in cm.vertices); by_min = min(v.co.y for v in cm.vertices); by_max = max(v.co.y for v in cm.vertices)

# ---------------------------------------------------------------- export
bpy.ops.object.select_all(action="SELECT")
bpy.ops.export_scene.gltf(
    filepath=OUT, export_format="GLB", use_selection=True, export_apply=False, export_yup=True,
    export_morph=True, export_morph_normal=False, export_morph_tangent=False, export_try_sparse_sk=True,
    export_materials="EXPORT", export_image_format="NONE", export_texcoords=True, export_normals=True,
    export_cameras=False, export_lights=False, export_animations=False, export_skins=False)

tris = lambda o: sum(len(p.vertices) - 2 for p in o.data.polygons)
print("RESULT bear_tris", tris(bear), "bear_verts", len(bear.data.vertices), "collider_tris", tris(col),
      "keys", [k.name for k in bear.data.shape_keys.key_blocks],
      "bounds_x", round(bx, 3), "y", round(by_min, 3), round(by_max, 3), "H", round(H * sc, 3))

# ---------------------------------------------------------------- previews
if PREVIEW_DIR:
    os.makedirs(PREVIEW_DIR, exist_ok=True)
    col.hide_render = True
    sc_ = bpy.context.scene
    sc_.render.engine = "BLENDER_WORKBENCH"
    sc_.render.resolution_x = sc_.render.resolution_y = 800
    sc_.display.shading.light = "STUDIO"; sc_.display.shading.color_type = "MATERIAL"
    sc_.display.shading.show_cavity = False
    sc_.world = bpy.data.worlds.new("w"); sc_.world.color = (0.96, 0.92, 0.86)
    sc_.render.film_transparent = False
    cam = bpy.data.objects.new("cam", bpy.data.cameras.new("cam")); sc_.collection.objects.link(cam)
    cam.data.type = "ORTHO"; cam.data.ortho_scale = 1.35; sc_.camera = cam
    def shoot(name, az, keys=None):
        for k in bear.data.shape_keys.key_blocks[1:]: k.value = 0
        for kn, v in (keys or {}).items(): bear.data.shape_keys.key_blocks[kn].value = v
        d = 3.0; el = math.radians(8)
        cam.location = (d * math.sin(az) * math.cos(el), -d * math.cos(az) * math.cos(el), 0.5 + d * math.sin(el))
        cam.rotation_euler = (Vector((0, 0, 0.5)) - cam.location).to_track_quat("-Z", "Y").to_euler()
        sc_.render.filepath = os.path.join(PREVIEW_DIR, f"preview-{name}.png")
        bpy.ops.render.render(write_still=True)
    shoot("front", 0)
    shoot("three-quarter", math.radians(38))
    shoot("squash", 0, {"SquishVertical": 1.0})
    shoot("happy", math.radians(20), {"Happy": 1.0})
    shoot("panic", math.radians(20), {"Panic": 1.0, "HeadWobbleLeft": 0.6, "EarBounceRight": 1.0})
