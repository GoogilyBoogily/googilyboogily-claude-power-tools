# Animation, F-Curves, Drivers, Armatures

Blender stores animation as **Actions** containing **F-Curves**. In 4.x the model gained **slots / layers / strips** to support multi-data-block actions. Most tasks still work with the simple `keyframe_insert` API.

## Simple keyframes

```python
import bpy

obj = bpy.context.object
scene = bpy.context.scene

obj.location = (0, 0, 0)
obj.keyframe_insert(data_path="location", frame=1)

obj.location = (5, 0, 2)
obj.keyframe_insert(data_path="location", frame=60)
```

Indexed keyframes (one channel only):

```python
obj.keyframe_insert(data_path="location", frame=10, index=2)  # only Z
```

Animatable property paths:

| Path | Component |
|------|-----------|
| `"location"` | x,y,z |
| `"rotation_euler"`, `"rotation_quaternion"` | per channel |
| `"scale"` | x,y,z |
| `"hide_viewport"`, `"hide_render"` | bool |
| `"data.shape_keys.key_blocks[\"Open\"].value"` | shape-key blend |
| `'modifiers["Subsurf"].levels'` | modifier prop |
| `"material_slots[0].material.node_tree.nodes[\"Principled BSDF\"].inputs[\"Base Color\"].default_value"` | shader input |

Almost any RNA property can be keyframed if it's not read-only. Right-click in the GUI → "Copy Data Path" gives the exact string.

## F-Curves directly

```python
if obj.animation_data is None:
    obj.animation_data_create()
if obj.animation_data.action is None:
    obj.animation_data.action = bpy.data.actions.new(f"{obj.name}Action")

action = obj.animation_data.action
fcu = action.fcurves.new(data_path="location", index=2)   # Z

fcu.keyframe_points.insert(frame= 1, value=0.0)
fcu.keyframe_points.insert(frame=30, value=5.0)
fcu.keyframe_points.insert(frame=60, value=0.0)

for kp in fcu.keyframe_points:
    kp.interpolation = 'BEZIER'   # 'LINEAR' | 'CONSTANT' | 'BEZIER' | 'BACK' | 'BOUNCE' | 'ELASTIC'
    kp.handle_left_type  = 'AUTO'
    kp.handle_right_type = 'AUTO'

# F-Curve modifier — repeats:
mod = fcu.modifiers.new(type='CYCLES')
mod.mode_after = 'REPEAT'   # 'NONE' | 'REPEAT' | 'REPEAT_OFFSET' | 'MIRROR'
```

## 4.x slotted action layout

Blender 4.x added **Action Slots** so a single action can drive multiple data-blocks (e.g., rig + camera). For new code targeting 4.x:

```python
obj = bpy.context.object
action = bpy.data.actions.new("MyAction")

slot = action.slots.new(obj.id_type, obj.name)        # e.g. id_type='OBJECT'
layer = action.layers.new("Base")
strip = layer.strips.new(type='KEYFRAME')
channelbag = strip.channelbag(slot, ensure=True)

fcu = channelbag.fcurves.new(data_path="location", index=2)
fcu.keyframe_points.add(2)
fcu.keyframe_points[0].co = (1.0, 0.0)
fcu.keyframe_points[1].co = (60.0, 5.0)

adt = obj.animation_data_create()
adt.action = action
adt.action_slot = slot
```

If you only need to animate a single object, `obj.keyframe_insert(...)` is still the simplest path — it builds a slot/layer/strip for you.

## Drivers — Python expressions on properties

Drivers compute a property's value from other properties.

```python
fcu = obj.driver_add("location", 2)            # creates a driver F-curve, returns the FCurve
drv = fcu.driver
drv.type = 'SCRIPTED'                          # 'AVERAGE' | 'SUM' | 'MIN' | 'MAX' | 'SCRIPTED'

var = drv.variables.new()
var.name = 'rot_z'
var.type = 'TRANSFORMS'
tgt = var.targets[0]
tgt.id = bpy.data.objects["Empty"]
tgt.transform_type = 'ROT_Z'
tgt.transform_space = 'WORLD_SPACE'

drv.expression = "sin(rot_z) * 2"

# Allow scripted drivers to run (off by default in 4.x for security):
bpy.app.driver_namespace['my_helper'] = lambda x: x*x   # exposed in expression
```

To run drivers in headless renders, pass `--enable-autoexec` on the CLI, or set `bpy.context.preferences.filepaths.use_scripts_auto_execute = True` (and accept the security implication).

## Armatures and bones

Three different bone collections — pick the right one for the operation:

| Collection | When valid | What it is |
|------------|-----------|------------|
| `armature.bones` | Any mode | Static rest pose (read mostly) |
| `armature.edit_bones` | Edit mode only | Editable rest pose (head/tail/parent) |
| `obj.pose.bones` | Pose / object mode | Animated transforms (location/rotation/scale, constraints) |

### Build an armature

```python
import bpy
from mathutils import Vector

arm_data = bpy.data.armatures.new("Arm")
arm_obj  = bpy.data.objects.new("Arm", arm_data)
bpy.context.collection.objects.link(arm_obj)

bpy.context.view_layer.objects.active = arm_obj
bpy.ops.object.mode_set(mode='EDIT')

eb = arm_data.edit_bones.new("Root")
eb.head = Vector((0,0,0))
eb.tail = Vector((0,0,1))

eb2 = arm_data.edit_bones.new("Arm")
eb2.parent = eb
eb2.head = eb.tail
eb2.tail = eb.tail + Vector((1,0,0))

bpy.ops.object.mode_set(mode='OBJECT')
```

### Animate pose bones

```python
pb = arm_obj.pose.bones["Arm"]
pb.rotation_mode = 'QUATERNION'
pb.rotation_quaternion = (1,0,0,0)
pb.keyframe_insert("rotation_quaternion", frame=1)
import math
from mathutils import Quaternion, Vector
pb.rotation_quaternion = Quaternion(Vector((0,1,0)), math.radians(45))
pb.keyframe_insert("rotation_quaternion", frame=30)
```

### Constraints

```python
con = pb.constraints.new('COPY_ROTATION')
con.target = bpy.data.objects["TargetCube"]
con.influence = 0.5
```

Common types: `COPY_LOCATION`, `COPY_ROTATION`, `COPY_SCALE`, `LIMIT_LOCATION`, `IK`, `TRACK_TO`, `CHILD_OF`, `DAMPED_TRACK`, `STRETCH_TO`, `ARMATURE`.

### IK setup

```python
con = arm_obj.pose.bones["Forearm"].constraints.new('IK')
con.target = bpy.data.objects["Hand_IK"]
con.chain_count = 2
```

## NLA — non-linear animation

Stack actions like clips on a timeline.

```python
ad = obj.animation_data        # must exist already
track = ad.nla_tracks.new()
track.name = "Walk Cycle"
strip = track.strips.new(name="Walk", start=1, action=walk_action)
strip.action_frame_start = 1
strip.action_frame_end = 30
strip.repeat = 4
```

When a strip is on the NLA, the action no longer drives the object directly unless `ad.action` is also set; the NLA stack composites.

## Frame handlers — code per frame

```python
@bpy.app.handlers.persistent
def per_frame(scene, depsgraph):
    obj = scene.objects["Cube"]
    obj.location.x = scene.frame_current * 0.1

bpy.app.handlers.frame_change_post.append(per_frame)
```

`frame_change_post` runs after the depsgraph updates for the new frame. Use `frame_change_pre` to mutate inputs before evaluation. Decorate with `@persistent` if the handler must survive `.blend` reload.

## Render-time animation

For animation renders, set frame range and use `bpy.ops.render.render(animation=True)` or CLI `-a -s 1 -e 240`. Cycles bakes drivers + simulations per frame. Some sims (cloth, fluid) need explicit baking first:

```python
bpy.ops.ptcache.bake_all(bake=True)   # bakes all simulations across the scene
```

## Pitfalls

- **`obj.location.z = 5; obj.keyframe_insert("location", index=2)`** — works only if the property change is committed before `keyframe_insert`. Calling `keyframe_insert` first then changing the value won't capture the change.
- **Driver expression silently 0** — `--enable-autoexec` not set, or `use_scripts_auto_execute` is `False`. Drivers won't evaluate.
- **`rotation_euler` keyframed but pose looks wrong** — `obj.rotation_mode` is `'QUATERNION'`. Match the mode and the property.
- **Bone constraints don't take effect** — bone target string must match exactly; armature object must be the constraint's target with `subtarget` for bone-level targeting.
- **Action visible in GUI but doesn't play** — pushed to NLA but no strip enabled, or `animation_data.action` was cleared. Either un-push or set the action again.
- **NLA strip has no effect** — `strip.action_frame_start/end` define which slice of the action plays; if equal, nothing animates.
- **Frame handler called twice** — re-running registration appends a second handler. Always `if my_fn in bpy.app.handlers.frame_change_post: bpy.app.handlers.frame_change_post.remove(my_fn)` before appending.
