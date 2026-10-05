# TASK-143.1 - Gummy bear GLB (Blender-authored, procedural)

Generator: `scripts/blender/gummy.py` (deterministic). Rebuild:
`Blender -b --factory-startup --python scripts/blender/gummy.py -- public/lab/gummy.glb [PREVIEW_DIR]` (Blender 5.2.2).

Output `public/lab/gummy.glb`: 325,456 bytes (plain GLB, under the 400 kB budget).

- Nodes: `GummyBear` (render mesh) and `GummyCollider` (convex proxy, no material/morphs). Both at the origin.
- Render mesh: 3,626 tris, 1,823 verts, 2 primitives in one mesh (shared morph targets): `GummyBody` material (candy orange, roughness 0.3), `GummyFace` material (dark plum). Face (eyes/nose/smile) is part of the same mesh so face morphs work.
- Shape keys (glTF morph targets, in `mesh.extras.targetNames`, Basis excluded; 15): SquishVertical, StretchVertical, SquishHorizontal, BellyImpact, HeadWobbleLeft, HeadWobbleRight, EarBounceLeft, EarBounceRight, ArmLagLeft, ArmLagRight, Happy, Surprised, Worried, Panic, Blink. Spec's `Dizzy` not authored (shader/rotation can cover it).
- Collision proxy `GummyCollider`: single convex hull of body/head/feet ellipsoids, 182 tris. Hull half-width x 0.34 (arm tips reach ~0.41 and are intentionally outside).
- Frame: origin at base centre, 1.0 unit tall, +Y up, bear faces +Z in glTF (-Y in Blender). Transforms applied.
- Export: GLB, export_apply=False (keeps keys), morph normals/tangents off, sparse morph accessors on (20 sparse accessors), no images, no animations/cameras/lights, UVs smart-projected, smooth normals.

## Decisions
- Dev-155: body built as ellipsoid union -> voxel remesh -> smooth -> decimate (~3.2k tris); far under the spec's 15-50k hero range because the web shader carries the translucent look.
- Dev-156: no Draco/meshopt: three.js needs decoder setup/new files for them and the file is already 325 kB; sparse morph accessors do the size work.
- Dev-157: face geometry merged into the body mesh as a second material primitive (one mesh = one morph dictionary) rather than separate Eyes/Mouth/Nose meshes.
- Dev-158: `Panic` and `Blink` added; `Dizzy` skipped. Blender material colours are placeholders; final colour/transmission is set in the browser.
- Dev-159: collider uses a single hull, not compound; bounding arms excluded for stable physics.

## Known / untested
- Verified: GLB JSON parsed (2 meshes, 15 targets); previews rendered with Workbench (not Eevee). Not yet loaded in three.js / browser lighting. Panic/Surprised mouth is stretched tall (reads as a scream); tune weights at runtime.
