# Gotchas — common traps and how to dodge them

These are the bugs every Blender scripter hits. Prefer the data API; reach for these workarounds only when an operator is genuinely required.

## 1. Operator `poll()` failed — the most common error

```
RuntimeError: Operator bpy.ops.foo.bar.poll() failed, context is incorrect
```

Cause: the operator checks active area / mode / selection, and one of them isn't what it expects — common when:

- Running headless (`--background`) — no `VIEW_3D` area exists.
- Script runs in the Text Editor without an active object.
- Wrong Blender mode (e.g., calling a mesh-edit operator while in Object mode).

### Fix A — check before calling

```python
if bpy.ops.view3d.render_border.poll():
    bpy.ops.view3d.render_border()
```

### Fix B — context.temp_override

When the operator needs a window/area/region, build a temporary override:

```python
import bpy

# Find a 3D viewport
window = bpy.context.window_manager.windows[0]
screen = window.screen
area   = next(a for a in screen.areas if a.type == 'VIEW_3D')
region = next(r for r in area.regions if r.type == 'WINDOW')

with bpy.context.temp_override(window=window, area=area, region=region):
    bpy.ops.view3d.zoom(delta=1)
```

Override accepts: `window`, `area`, `region`, `screen`, `scene`, `view_layer`, `object` (active), `selected_objects`, `edit_object`, `active_object`, `space_data`.

In headless mode, no `VIEW_3D` area exists. Either run inside a real Blender (not `-b`), or rewrite the logic to use the data API.

### Fix C — switch to data API

Almost every operator has a non-operator equivalent. Examples:

| Operator | Data-API equivalent |
|----------|---------------------|
| `bpy.ops.transform.translate(value=(1,0,0))` | `obj.location.x += 1` |
| `bpy.ops.object.shade_smooth()` | `for p in mesh.polygons: p.use_smooth = True` |
| `bpy.ops.object.delete()` | `bpy.data.objects.remove(obj, do_unlink=True)` |
| `bpy.ops.object.duplicate()` | `obj_copy = obj.copy(); obj_copy.data = obj.data.copy(); bpy.context.collection.objects.link(obj_copy)` |
| `bpy.ops.material.new()` | `bpy.data.materials.new("X")` |

## 2. Edit-mode mesh state

In edit mode, `obj.data.vertices[i].co` is **stale** until you exit edit mode or pull a fresh BMesh. Two rules:

- To read/write the live edited mesh: `bm = bmesh.from_edit_mesh(mesh); ... ; bmesh.update_edit_mesh(mesh)`.
- To read the data outside edit mode: switch first — `bpy.ops.object.mode_set(mode='OBJECT')`.

## 3. update / update_tag / depsgraph

When you change data, downstream consumers (modifiers, drivers, viewport) may not see it until you tell them to refresh.

| Call | When |
|------|------|
| `mesh.update()` | After `from_pydata` or modifying `vertices`/`edges`/`polygons` arrays. |
| `bmesh.update_edit_mesh(mesh)` | After bmesh edits in edit mode. |
| `obj.update_tag(refresh={'OBJECT'})` | After changing object data that should re-evaluate dependents. Refresh set: `OBJECT`, `DATA`, `TIME`. |
| `bpy.context.view_layer.update()` | After bulk changes, before reading `obj.matrix_world`. |
| `depsgraph = bpy.context.evaluated_depsgraph_get(); ev = obj.evaluated_get(depsgraph)` | Read post-modifier-stack geometry. |

If you read `obj.matrix_world` immediately after parenting/transform, you may get the old value. Force a `view_layer.update()` first.

## 4. Modal operators don't run headless

`bl_options = {'REGISTER', 'UNDO'}` operators that use `modal()` need a window event loop. In `--background`, modal operators won't tick. Convert them to `execute()`-only paths or run with the GUI.

## 5. Drivers & autoexec

`bpy.app.handlers.frame_change_post` and scripted drivers don't execute by default in 4.x for security. Two enables:

```bash
blender file.blend --enable-autoexec ...
```

```python
bpy.context.preferences.filepaths.use_scripts_auto_execute = True
```

Or per-file via the "Trust Source" option in the topbar.

## 6. Threads — don't touch bpy off the main thread

bpy is **not** thread-safe. From a worker thread, schedule work back to the main thread via `bpy.app.timers.register`:

```python
def _on_main():
    bpy.context.scene.frame_set(42)
    return None   # don't reschedule

bpy.app.timers.register(_on_main, first_interval=0.0)
```

Multiprocessing and asyncio are fine if they don't call bpy from the workers.

## 7. Redrawing during a long script

Blender locks while a script runs — no viewport updates. Don't try to "force redraw"; either:

- Convert to a **modal operator** with a timer.
- Use **app handlers** + `bpy.app.timers.register(...)`.
- Accept that headless = no redraw.

`bpy.context.view_layer.update()` does **not** redraw the screen.

## 8. Names get suffixed

When you create a data-block with a name that already exists, Blender appends `.001`, `.002`, ... silently. Always read back `obj.name` rather than relying on the string you passed.

```python
mat = bpy.data.materials.new("Steel")
print(mat.name)   # may be "Steel.003"
```

## 9. Removing iterating

```python
for obj in bpy.data.objects:           # don't do this
    bpy.data.objects.remove(obj)
```

Mutating during iteration corrupts the iterator. Instead:

```python
for obj in list(bpy.data.objects):
    bpy.data.objects.remove(obj, do_unlink=True)
```

## 10. Linked vs appended

`bpy.data.libraries.load(..., link=True)` keeps a live reference to the source file. Editing the linked data fails (it's read-only). Use `link=False` for "append" semantics, or call `bpy.ops.object.make_local(type='ALL')` after linking.

## 11. Material slots vs material_index

A mesh has a list of material slots (`obj.material_slots`) and per-face `material_index` referencing those slots. Setting `mat = obj.active_material` only changes slot 0. To assign a new material to all faces:

```python
obj.data.materials.append(mat)
slot_idx = len(obj.data.materials) - 1
for p in obj.data.polygons:
    p.material_index = slot_idx
```

## 12. `bpy.context.copy()` is gone

In 3.x people did `override = bpy.context.copy(); override["area"] = ...; bpy.ops.foo(override, ...)`. **That's deprecated/removed in 4.x.** Use `bpy.context.temp_override(...)`.

## 13. Saving

- `bpy.ops.wm.save_mainfile()` overwrites the loaded file. Confirm before using.
- `bpy.ops.wm.save_as_mainfile(filepath="/x", copy=True)` writes a copy without changing the loaded path.
- Pre-existing autosaves & version backups are governed by `preferences.filepaths.save_version`.

## 14. Naming custom props vs props on classes

`obj["foo"] = 1` adds a custom property on the data-block (visible in the Properties N-panel under "Custom Properties"). Different from `bpy.types.Object.foo = bpy.props.FloatProperty(...)` which adds a typed RNA property to all Objects. Mixing them causes confusion.

## 15. F-Curve interpolation defaults

Newly inserted keyframes inherit the **user's** preferred interpolation (`preferences.edit.keyframe_new_interpolation_type`). For deterministic scripts, set `kp.interpolation` explicitly on each keypoint.

## 16. Scene reuse across runs

In headless `--background`, `bpy.context.scene` is whatever the loaded `.blend` says. If you forget `bpy.ops.wm.read_factory_settings(use_empty=True)`, you might inherit objects from the file. Always start from a known state.

## 17. `--background` exits 0 even on Python errors

By default. Pass `--python-exit-code 1` or wrap in try/except + `sys.exit(1)`.

## 18. Properties panel not seeing your `PropertyGroup`

Forgot the `PointerProperty` attachment:

```python
bpy.types.Scene.my_settings = bpy.props.PointerProperty(type=MyPG)
```

Without this, your properties exist as a class but aren't attached to anything.

## 19. `obj.copy()` shares mesh data

`obj.copy()` only copies the wrapper — the new object points at the **same** mesh. To get an independent mesh:

```python
new = obj.copy()
new.data = obj.data.copy()
bpy.context.collection.objects.link(new)
```

Same for materials, animation actions, etc.

## 20. Unicode names

Blender accepts Unicode in names but some exporters mangle them. Run `bpy.path.clean_name(...)` before exporting to FBX/OBJ.
