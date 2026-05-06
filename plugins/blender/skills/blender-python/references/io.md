# Import / Export

Format support is mostly through addons (built-in but registered). Operator names changed in 4.x for OBJ and STL — check version.

## Quick map

| Format | Import | Export |
|--------|--------|--------|
| GLTF / GLB | `bpy.ops.import_scene.gltf(filepath=...)` | `bpy.ops.export_scene.gltf(filepath=..., export_format='GLB'\|'GLTF_SEPARATE'\|'GLTF_EMBEDDED')` |
| FBX | `bpy.ops.import_scene.fbx(filepath=...)` | `bpy.ops.export_scene.fbx(filepath=..., use_selection=False)` |
| OBJ (4.x, fast C importer) | `bpy.ops.wm.obj_import(filepath=...)` | `bpy.ops.wm.obj_export(filepath=...)` |
| OBJ (legacy Python) | `bpy.ops.import_scene.obj` | `bpy.ops.export_scene.obj` (3.x) |
| STL (4.x, C-based) | `bpy.ops.wm.stl_import(filepath=...)` | `bpy.ops.wm.stl_export(filepath=...)` |
| STL (legacy) | `bpy.ops.import_mesh.stl` | `bpy.ops.export_mesh.stl` |
| USD / USDC / USDA / USDZ | `bpy.ops.wm.usd_import(filepath=...)` | `bpy.ops.wm.usd_export(filepath=...)` |
| Alembic (.abc) | `bpy.ops.wm.alembic_import(filepath=...)` | `bpy.ops.wm.alembic_export(filepath=...)` |
| Collada (.dae) | `bpy.ops.wm.collada_import(filepath=...)` | `bpy.ops.wm.collada_export(filepath=...)` |
| PLY (4.x) | `bpy.ops.wm.ply_import(filepath=...)` | `bpy.ops.wm.ply_export(filepath=...)` |
| X3D / VRML | `bpy.ops.import_scene.x3d` | `bpy.ops.export_scene.x3d` |
| SVG (vector → curves) | `bpy.ops.import_curve.svg` | n/a |

Detect availability:

```python
hasattr(bpy.ops.wm, "obj_import")   # 4.x
hasattr(bpy.ops.import_scene, "obj") # legacy
```

## glTF — the modern interchange format

Most reliable cross-tool format. Default to `GLB` (single binary file).

```python
bpy.ops.export_scene.gltf(
    filepath="/tmp/scene.glb",
    export_format='GLB',
    use_selection=False,
    export_apply=True,           # apply modifiers
    export_yup=True,             # Y-up (standard for glTF)
    export_animations=True,
    export_morph=True,
    export_skins=True,
    export_lights=True,
    export_cameras=True,
    export_extras=True,          # custom props
)
```

Import:

```python
bpy.ops.import_scene.gltf(filepath="/tmp/scene.glb", merge_vertices=True)
```

## FBX

Game-engine pipelines (Unity/Unreal). Watch axes.

```python
bpy.ops.export_scene.fbx(
    filepath="/tmp/scene.fbx",
    use_selection=True,
    apply_scale_options='FBX_SCALE_ALL',
    axis_forward='-Z',
    axis_up='Y',
    bake_anim=True,
    add_leaf_bones=False,        # avoid Unity-incompat extra bones
    object_types={'MESH', 'ARMATURE', 'EMPTY'},
)
```

## OBJ (4.x)

The 4.x importer/exporter is the C `wm.obj_*` family — much faster than the legacy Python addon.

```python
bpy.ops.wm.obj_export(
    filepath="/tmp/out.obj",
    export_selected_objects=True,
    export_materials=True,
    export_uv=True,
    export_normals=True,
    apply_modifiers=True,
)

bpy.ops.wm.obj_import(filepath="/tmp/in.obj")
```

## STL (4.x)

```python
bpy.ops.wm.stl_export(filepath="/tmp/print.stl", export_selected_objects=True, ascii_format=False)
bpy.ops.wm.stl_import(filepath="/tmp/in.stl")
```

## USD

Pixar's interchange format. Good for large scenes and round-tripping with Houdini/Maya/Omniverse.

```python
bpy.ops.wm.usd_export(
    filepath="/tmp/scene.usdc",
    selected_objects_only=False,
    export_animation=True,
    export_hair=False,
    export_uvmaps=True,
    export_normals=True,
    export_materials=True,
)
```

## Alembic

Cached geometry / animation. Good for hand-off to compositing or render farms.

```python
bpy.ops.wm.alembic_export(
    filepath="/tmp/cache.abc",
    start=1, end=240,
    selected=True,
    flatten=False,
    uvs=True, packuv=True,
    normals=True,
    vcolors=False,
)
```

## Image I/O

```python
img = bpy.data.images.load("/tmp/in.png", check_existing=True)
img.scale(1024, 1024)
img.save_render(filepath="/tmp/out.png")          # current render colorspace
# Or save as the image's stored data:
img.filepath_raw = "/tmp/copy.png"
img.file_format = 'PNG'
img.save()
```

## Batch convert pattern

Headless one-liner for FBX → GLB:

```bash
blender -b --factory-startup --python-expr "
import bpy, sys
for fp in sys.argv[sys.argv.index('--')+1:]:
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=fp)
    out = fp.rsplit('.',1)[0] + '.glb'
    bpy.ops.export_scene.gltf(filepath=out, export_format='GLB')
" -- model_a.fbx model_b.fbx
```

For many files use a Bash for-loop or a manifest CSV.

## File handlers (4.1+)

Drag-and-drop importers. Register a `FileHandler` so `.fooext` files invoke an operator.

```python
class IMPORT_FH_foo(bpy.types.FileHandler):
    bl_idname = "IMPORT_FH_foo"
    bl_label = "Foo Importer"
    bl_import_operator = "import_scene.foo"
    bl_file_extensions = ".foo"

    @classmethod
    def poll_drop(cls, context):
        return context.area and context.area.type == 'VIEW_3D'

bpy.utils.register_class(IMPORT_FH_foo)
```

## Pitfalls

- **`bpy.ops.import_scene.obj` AttributeError** — you're on Blender 4.x; switch to `bpy.ops.wm.obj_import`.
- **Axes wrong after FBX export to Unity/Unreal** — set `axis_forward='-Z'`, `axis_up='Y'` (or use the engine's preset).
- **glTF animation lost** — `export_animations=False`, or actions are on the NLA but not exported as glTF clips. Make sure each desired clip is on a separate NLA strip.
- **Materials missing on OBJ import** — companion `.mtl` not in the same dir, or the importer's `import_mtl` flag is off.
- **USD round-trip flips Y/Z** — explicitly set the convert axes flags; defaults differ between exporter versions.
- **Alembic file huge** — `flatten=True` bakes per-frame transforms into geometry. Leave `False` for skeletal data.
- **Default import in `--background`** brings the active 3D view into context — works without a real viewport, but operators that rely on a `VIEW_3D` area need `temp_override`.
