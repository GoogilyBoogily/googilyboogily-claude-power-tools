# Core bpy API

The data, context, operator, type, property, and math layers — what every script touches.

## bpy.data — data-blocks

Everything in a `.blend` file is a **data-block** (object, mesh, material, image, action, scene, collection, etc.). `bpy.data` is the registry of all of them. Each collection acts like a dict-by-name plus list-by-index.

```python
import bpy
bpy.data.objects["Cube"]            # by name
bpy.data.objects[0]                  # by index
"Cube" in bpy.data.objects          # contains
for o in bpy.data.objects: ...      # iterate
bpy.data.objects.get("Cube")        # None if missing
```

Major collections worth knowing:

| Attribute | Holds |
|-----------|-------|
| `objects` | `Object` data-blocks (transforms + ref to mesh/light/camera/...) |
| `meshes` | Mesh data (vertices/edges/faces). One mesh can back many objects. |
| `materials` | Material data-blocks. |
| `images` | Loaded image data. |
| `textures` | Legacy/non-node textures. |
| `node_groups` | Reusable shader/geometry/compositor node trees. |
| `actions` | Animation actions (collections of F-curves). |
| `scenes` | Scenes (a `.blend` can have many). |
| `collections` | Outliner collections. |
| `worlds`, `lights`, `cameras`, `armatures`, `curves`, `metaballs`, `volumes`, `grease_pencils`, `lattices`, `speakers`, `texts`, `fonts`, `particles`, `linestyles`, `brushes`, `palettes`, `workspaces`, `screens`, `windowmanagers` | Self-explanatory. |

### Creating data-blocks

Always create the data first, then wrap in an Object:

```python
mesh = bpy.data.meshes.new("MyMesh")
mesh.from_pydata(vertices, edges, faces)
mesh.update()

obj = bpy.data.objects.new("MyObj", mesh)
bpy.context.collection.objects.link(obj)   # add to current collection
```

Lights / cameras follow the same shape:

```python
cam_data = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_data)
bpy.context.collection.objects.link(cam)
bpy.context.scene.camera = cam   # mark as render camera
```

### Removing data-blocks

```python
bpy.data.objects.remove(obj, do_unlink=True)  # also unlinks from scenes
bpy.data.meshes.remove(mesh)
```

Without `do_unlink=True` you'll leak references and the data stays alive.

### Linking from another file

```python
with bpy.data.libraries.load("/path/external.blend", link=True) as (src, dst):
    dst.objects = [n for n in src.objects if n.startswith("Asset_")]
for o in dst.objects:
    bpy.context.collection.objects.link(o)
```

## bpy.context — current state

What's "active" right now: scene, view layer, area, mode, selected objects.

```python
bpy.context.scene                # active Scene
bpy.context.view_layer           # active ViewLayer
bpy.context.active_object        # the highlighted one
bpy.context.selected_objects     # list
bpy.context.mode                 # 'OBJECT' | 'EDIT_MESH' | 'POSE' | 'SCULPT' | ...
bpy.context.object               # active object alias
bpy.context.collection           # active collection (where new objects land)
bpy.context.window               # active window (None in --background)
bpy.context.area                 # the area under the mouse / where the script runs
bpy.context.region               # ditto
```

In `--background` many of these are `None`. Use `temp_override` (see `gotchas.md`) when an operator needs them.

## bpy.ops — operators

The same operators that fire from buttons/menus. Naming: `bpy.ops.<category>.<name>(args)`.

```python
bpy.ops.mesh.primitive_cube_add(size=2, location=(0,0,0))
bpy.ops.object.modifier_add(type='SUBSURF')
bpy.ops.render.render(write_still=True)
bpy.ops.wm.save_as_mainfile(filepath="/tmp/out.blend", copy=True)
```

Always check `.poll()` first when running from a non-default context:

```python
if bpy.ops.view3d.render_border.poll():
    bpy.ops.view3d.render_border(...)
```

If it returns `False`, you're in the wrong context — see `gotchas.md` for `temp_override`.

**Prefer the data API where possible.** `bpy.ops.transform.translate(value=(0,0,1))` works only with proper context; `obj.location.z += 1` always works.

## bpy.types — the class catalog

Every kind of data-block, operator, panel, modifier, node, constraint, etc. is a class under `bpy.types`. Use cases:

```python
isinstance(obj.data, bpy.types.Mesh)         # type check
issubclass(MyOp, bpy.types.Operator)          # subclass check
bpy.types.Object.my_prop = bpy.props.FloatProperty()  # add a custom prop
```

## bpy.props — property descriptors

Used inside `Operator`, `Panel`, `PropertyGroup`, `AddonPreferences`, or attached to existing types.

| Descriptor | For |
|-----------|-----|
| `BoolProperty`, `IntProperty`, `FloatProperty`, `StringProperty` | Scalars |
| `BoolVectorProperty`, `IntVectorProperty`, `FloatVectorProperty` | Vectors of scalars (size=N) |
| `EnumProperty` | Dropdown — `items=[(id,name,desc), ...]` |
| `PointerProperty` | Reference to another data-block or `PropertyGroup` |
| `CollectionProperty` | List of `PropertyGroup`s |

```python
class MySettings(bpy.types.PropertyGroup):
    intensity: bpy.props.FloatProperty(default=1.0, min=0.0, max=10.0)
    mode: bpy.props.EnumProperty(items=[('A','A',''),('B','B','')])

bpy.utils.register_class(MySettings)
bpy.types.Scene.my_settings = bpy.props.PointerProperty(type=MySettings)
# Read/write:
bpy.context.scene.my_settings.intensity = 2.0
```

## bpy.app — application data + handlers

```python
bpy.app.version                  # (4, 5, 0) tuple
bpy.app.binary_path              # path to current Blender
bpy.app.background               # True if --background
bpy.app.debug                    # debug flag

# Persistent timers (run while Blender is running):
def tick():
    print("tick")
    return 1.0  # next call in 1.0s; return None to stop
bpy.app.timers.register(tick)

# Frame-change handlers:
@bpy.app.handlers.persistent
def on_frame(scene, depsgraph):
    print("frame", scene.frame_current)
bpy.app.handlers.frame_change_post.append(on_frame)

# Available handler lists:
# load_pre, load_post, save_pre, save_post,
# render_init, render_pre, render_post, render_complete, render_cancel,
# frame_change_pre, frame_change_post, depsgraph_update_pre, depsgraph_update_post,
# undo_pre, undo_post, redo_pre, redo_post,
# version_update, animation_playback_pre/post.
```

`@persistent` is required if the handler must survive `.blend` reload.

## bpy.utils — registration + utility

```python
bpy.utils.register_class(cls)        # required for Operator/Panel/Menu/PropertyGroup
bpy.utils.unregister_class(cls)
bpy.utils.user_resource('SCRIPTS')   # user scripts dir
bpy.utils.script_paths()             # all script search paths
bpy.utils.preset_paths(...)
bpy.utils.previews.new()             # icon previews for UI
bpy.utils.register_cli_command(name, fn)  # 4.2+, adds `blender --command <name>`
```

Order matters when registering a tree of classes — register the leaves before classes that point to them via `PointerProperty`. Mirror in `unregister`.

## bpy.path — path helpers

```python
bpy.path.abspath("//textures/a.png")     # `//` = relative to .blend file
bpy.path.relpath("/abs/path", start=...)
bpy.path.clean_name("my name 1")         # legal data-block name
bpy.path.basename(...)
bpy.path.ensure_ext("file", ".png")
```

The `//` prefix is Blender-specific; always run paths through `bpy.path.abspath` before opening files.

## mathutils — Vector / Matrix / Quaternion / Euler

Always use these instead of raw tuples for transforms.

```python
from mathutils import Vector, Matrix, Quaternion, Euler
import math

obj.location = Vector((1, 2, 3))
obj.rotation_euler = Euler((0, 0, math.radians(90)), 'XYZ')

# Combine transforms:
m = Matrix.Translation((1,0,0)) @ Matrix.Rotation(math.radians(45), 4, 'Z')
obj.matrix_world = m

# Decompose:
loc, rot, scale = obj.matrix_world.decompose()  # rot is Quaternion

# Geometry helpers:
from mathutils.geometry import (
    intersect_line_line, intersect_line_plane, intersect_ray_tri,
    distance_point_to_plane, area_tri,
)

# Bounding box of an object in world space:
bbox = [obj.matrix_world @ Vector(c) for c in obj.bound_box]
```

Quaternion vs Euler: Blender stores rotation in whichever mode `obj.rotation_mode` is set (`'XYZ'` etc., or `'QUATERNION'`). Read the matching attribute (`rotation_euler` or `rotation_quaternion`).

## bpy_extras — convenience

```python
from bpy_extras.object_utils import object_data_add
object_data_add(context, mesh, name="Foo")  # mesh + object + link in one call

from bpy_extras import view3d_utils
# screen-pixel → world ray:
ray_origin = view3d_utils.region_2d_to_origin_3d(region, rv3d, mouse_xy)
ray_dir    = view3d_utils.region_2d_to_vector_3d(region, rv3d, mouse_xy)

from bpy_extras.io_utils import ExportHelper, ImportHelper  # mixins for file dialogs
```

## Patterns to memorize

### Iterate selected mesh objects

```python
for obj in (o for o in bpy.context.selected_objects if o.type == 'MESH'):
    ...
```

### Switch modes safely

```python
prev_mode = bpy.context.object.mode
bpy.ops.object.mode_set(mode='EDIT')
try:
    ...  # edit-mode work
finally:
    bpy.ops.object.mode_set(mode=prev_mode)
```

### Clean scene

```python
bpy.ops.wm.read_factory_settings(use_empty=True)
```

### Save without overwriting

```python
bpy.ops.wm.save_as_mainfile(filepath="/tmp/out.blend", copy=True)
# `copy=True` keeps the original .blend as the active file.
```

### Find data-blocks by partial name

```python
[o for o in bpy.data.objects if o.name.startswith("Tree_")]
```
