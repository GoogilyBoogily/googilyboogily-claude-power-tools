---
name: blender-python
description: "Interface with Blender (3D modeling, animation, rendering) through its Python API (bpy). Use whenever the user mentions Blender, .blend files, bpy, bmesh, geometry nodes, shader nodes, Cycles, EEVEE, Workbench, scene/object/material manipulation, mesh editing, armatures/rigging, keyframe animation, F-curves, drivers, NLA, importing/exporting 3D formats (GLTF/glb, FBX, OBJ, USD, STL, Alembic, Collada), batch rendering, headless render farms, CLI invocation (`blender --background --python`), authoring add-ons, custom operators/panels/menus, modal operators, PropertyGroups, Geometry Nodes trees, baking, simulation (cloth/fluid/rigid body), grease pencil, compositor nodes, or hooking Blender up to MCP / live AI control. Trigger even on vague asks like 'script Blender', 'automate Blender', 'render this from a script', or any 3D-graphics task where Blender is implied. Also trigger when the user asks to install bpy as a pip module or run Blender headless on a server."
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch
---

# Blender Python API

Drive Blender via its embedded Python interpreter (`bpy`). Covers GUI scripting, headless `--background` automation, addon authoring, the bpy-as-pip-module path, and live MCP control. Reference files in `references/` deepen each area — load on demand, not all at once.

## Operating Principles

1. **Work through the data API, not operators, when possible.** `bpy.ops.*` calls depend on context (active area, mode, selection). They fail with `RuntimeError: poll() failed, context is incorrect` from scripts. Direct manipulation through `bpy.data.objects["Cube"].location.z = 1.0` is faster, deterministic, and works headless. Use operators only when the data API has no equivalent (e.g., complex modeling tools, file I/O wrappers).

2. **Identify the target environment first.** Three execution modes — pick one before writing code:
   - **Inside Blender GUI** — Text Editor / Python Console. Full context, full UI redraws.
   - **Headless `--background`** — `blender file.blend -b -P script.py`. No UI, no event loop. Modal operators don't run, redraws don't happen, viewport context is empty.
   - **bpy as Python module** — `pip install bpy`, then `import bpy` from any script. Behaves like `--background --factory-startup`. Same headless caveats.

3. **Match the Blender version.** API breaks across major versions. Blender 4.x changed animation slots/layers, geometry nodes interfaces, and the OBJ/STL operators (now `bpy.ops.wm.obj_export` / `obj_import`, not `export_scene.obj`). When the user states a version, match it; otherwise default to Blender 4.5 LTS and confirm.

4. **Read the source for poll failures.** When an operator refuses to run, check `bpy.ops.foo.bar.poll()` first. If `False`, the fix is usually a `bpy.context.temp_override(...)` block or switching to data-API equivalents. See `references/gotchas.md`.

5. **Don't auto-overwrite the user's `.blend` file.** Always confirm before `bpy.ops.wm.save_mainfile()` against the original path. Prefer `save_as_mainfile(filepath=..., copy=True)`.

## Step 0: Identify the Task Mode

Before writing any code, classify the request into one of these. Each mode has different constraints and reference files.

| User wants | Mode | Primary reference |
|------------|------|-------------------|
| Render N frames from a `.blend` file unattended | **Headless render** | `references/cli.md` |
| Batch-process many `.blend` files | **Headless automation** | `references/cli.md` + `references/core-api.md` |
| Build/edit a scene, mesh, material from scratch | **Scene authoring** | `references/core-api.md` + topic ref |
| Procedurally generate geometry | **bmesh / nodes** | `references/mesh.md` or `references/materials-shaders.md` |
| Animate / rig / apply drivers | **Animation** | `references/animation.md` |
| Convert between formats (FBX→GLB, etc.) | **Import/Export** | `references/io.md` |
| Build a UI panel / custom operator / addon | **Addon authoring** | `references/addons.md` |
| Run Blender from a CI pipeline / Docker | **bpy as module** | `references/live-control.md` |
| AI-driven live Blender control | **MCP integration** | `references/live-control.md` |

If the request crosses modes (e.g., "build a scene then render it headless"), do scene authoring first inside the script, then invoke headless. Keep the script idempotent.

## Step 1: Detect the Blender Install

```bash
# macOS — usually bundled inside the .app
ls "/Applications/Blender.app/Contents/MacOS/Blender" 2>/dev/null
# Linux
which blender
# Windows
where blender 2>nul
# Or ask the user for the absolute path. Don't guess.
```

Confirm version: `blender --version`. The major.minor governs which API is valid.

## Step 2: Quick API Map

The whole API surface, in one table. Drill into the reference file when you need depth.

| Module | Purpose | When to reach for it |
|--------|---------|----------------------|
| `bpy.data` | Read/write all data-blocks (`.objects`, `.meshes`, `.materials`, `.scenes`, `.images`, `.actions`, `.node_groups`, ...) | Almost always — preferred over `bpy.ops` |
| `bpy.context` | Active scene / object / area / selection | Reading current state; passing to operators |
| `bpy.ops` | UI-equivalent operators (add cube, extrude, render, import) | When the data API has no equivalent or for complex modeling |
| `bpy.types` | Class definitions for everything (`Object`, `Mesh`, `Operator`, `Panel`) | Subclassing for addons; type-checks |
| `bpy.props` | Property descriptors (`FloatProperty`, `EnumProperty`, `PointerProperty`) | Defining custom props on data-blocks/operators |
| `bpy.utils` | `register_class`, `unregister_class`, `previews`, `script_paths` | Addon registration |
| `bpy.app` | Version info, handlers (`bpy.app.handlers.frame_change_post`), timers, drivers namespace | Hooking into events |
| `bpy.path` | Filepath helpers (`abspath`, `relpath`, `clean_name`) | Cross-platform path handling |
| `bmesh` | Low-level mesh editing (verts, edges, faces, ops) | Procedural mesh generation, complex topology edits |
| `mathutils` | `Vector`, `Matrix`, `Quaternion`, `Euler`, geometry helpers | All math involving 3D transforms |
| `bpy_extras` | Convenience helpers (`object_utils.object_data_add`, `view3d_utils`) | UI add-ons, screen-to-world conversions |
| `aud` | Audio playback / mixing | Audio-driven animation |
| `gpu` / `gpu_extras` | Custom OpenGL drawing in viewport | Drawing overlays from Python |
| `blf` | Drawing text in viewport | HUD/debug overlays |

## Step 3: Minimal Working Examples

Copy-paste starting points. Adjust paths/names.

### Headless render of a single frame

```bash
blender input.blend --background \
  --render-output "/tmp/render_####.png" \
  --render-format PNG \
  --render-frame 1
```

### Headless render with a Python script that configures everything

```bash
blender input.blend --background --python configure_and_render.py
```

```python
# configure_and_render.py
import bpy

scene = bpy.context.scene
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'
scene.cycles.samples = 64
scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = "/tmp/out_####.png"
bpy.ops.render.render(animation=True)  # writes frame_start..frame_end
```

### Build a scene from scratch

```python
import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)  # blank scene

mesh = bpy.data.meshes.new("Cube")
mesh.from_pydata(
    vertices=[(0,0,0),(1,0,0),(1,1,0),(0,1,0),(0,0,1),(1,0,1),(1,1,1),(0,1,1)],
    edges=[],
    faces=[(0,1,2,3),(4,7,6,5),(0,4,5,1),(1,5,6,2),(2,6,7,3),(3,7,4,0)],
)
mesh.update()
obj = bpy.data.objects.new("Cube", mesh)
bpy.context.collection.objects.link(obj)
```

### Pass args to a headless script

Anything after `--` is forwarded to the script:

```bash
blender -b file.blend -P render.py -- --frame 42 --output /tmp/r.png
```

```python
# render.py
import sys, argparse, bpy
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--frame", type=int, default=1)
ap.add_argument("--output", required=True)
args = ap.parse_args(argv)
bpy.context.scene.render.filepath = args.output
bpy.context.scene.frame_set(args.frame)
bpy.ops.render.render(write_still=True)
```

## Step 4: Route by Topic

Pick the matching reference, load it with `Read`, follow its patterns.

| Need | Reference | Topics covered |
|------|-----------|----------------|
| CLI flags, headless invocation, args after `--` | `references/cli.md` | `--background`, `--python`, `--python-expr`, `--render-frame`, `--render-anim`, `--render-output`, `--engine`, `--addons`, `--factory-startup`, `-d`, exit codes |
| The data API, context, operators, properties | `references/core-api.md` | `bpy.data`, `bpy.context`, `bpy.ops`, `bpy.types`, `bpy.props`, `bpy.app.handlers`, `mathutils` cookbook |
| Procedural geometry, mesh editing | `references/mesh.md` | `from_pydata`, bmesh basics, `bmesh.ops`, edit-mode vs object-mode, normals, UVs, vertex groups, modifiers |
| Animation: keyframes, F-curves, drivers, armatures, NLA | `references/animation.md` | `keyframe_insert`, action/slot/layer/strip stack (4.x), F-Curve direct edit, drivers, bone constraints, frame handlers |
| Materials, shaders, geometry nodes | `references/materials-shaders.md` | Principled BSDF, image textures, node tree topology, geometry node trees, animating socket values |
| Importers/exporters | `references/io.md` | GLTF/glb, FBX, OBJ (`wm.obj_*` in 4.x), USD, STL, Alembic, Collada, batch convert, file handlers |
| Addons: registration, operators, panels, menus, preferences | `references/addons.md` | `bl_info`, `register_class`, custom Operator/Panel/Menu/PropertyGroup, modal operators, keymaps, install path |
| Common pitfalls, traps | `references/gotchas.md` | Operator poll failures, `temp_override`, threading & redraws, `from_edit_mesh`, `update()`/`update_tag()`, drivers namespace, dependency cycles, undo & batch ops |
| bpy as pip module, blender-mcp, remote control | `references/live-control.md` | `pip install bpy`, limitations, Docker, `blender-mcp` setup, alternative socket bridges |

## Step 5: Verify

Before declaring success:

1. **Scripted change** — re-open the file or print the changed property to confirm it stuck (`print(bpy.data.objects["Cube"].location)`).
2. **Render** — confirm the file was written, non-zero size, and the expected resolution. `ls -la /tmp/out_*.png` plus `file /tmp/out_0001.png`.
3. **Addon** — restart Blender, re-enable the addon, confirm the panel/operator appears.
4. **Headless script** — exit code 0 and no `Traceback` in stderr. Blender swallows some errors silently — grep stderr for `Error`, `Traceback`, `RuntimeError`.

## Common Failure Patterns

- **`RuntimeError: Operator bpy.ops.X.poll() failed`** — context wrong. Use `temp_override` or switch to the data API. See `references/gotchas.md`.
- **Operator works in GUI, fails headless** — usually needs an active 3D viewport. Override or replace with `bmesh` / data-API equivalent.
- **Mesh edit doesn't appear** — missing `mesh.update()` or `obj.data.update_tag()`. In edit mode, missing `bmesh.update_edit_mesh(mesh)`.
- **Property change doesn't drive UI** — depsgraph not invalidated. `obj.update_tag(refresh={'OBJECT'})` or change a tracked property.
- **Render output is empty / black** — wrong active camera (`scene.camera`), wrong frame range, missing lights, or render layer disabled.
- **`bpy` import fails outside Blender** — you need `pip install bpy` and a Python version matching the bpy wheel (currently CPython 3.11). See `references/live-control.md`.
- **Modal operator never fires** — running headless. Modal operators require an active window/event loop.

## When to Hand Off

- **Heavy GPU / CUDA debugging on the host** → these are OS/driver problems, not bpy. Use `linux-troubleshooter` (Linux Nvidia/Mesa) or have the user check Blender's System Console.
- **Real-time game-engine architecture, ECS, render pipeline design** → `game-developer` agent.
- **Generic Python errors unrelated to bpy** → handle locally with the user's Python knowledge.

Stop conditions: if the user actually wants Maya/Houdini/Unreal/Unity, say so and don't shoehorn into bpy.
