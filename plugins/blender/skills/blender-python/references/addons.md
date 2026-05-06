# Addon Authoring

How to ship a custom Blender feature: operators, panels, menus, properties, preferences, keymaps, and the install flow.

## Minimal addon

```python
# my_addon.py
bl_info = {
    "name": "My Addon",
    "author": "You",
    "version": (1, 0, 0),
    "blender": (4, 2, 0),
    "location": "View3D > Sidebar > My Tab",
    "description": "Does X",
    "warning": "",
    "doc_url": "",
    "category": "3D View",
}

import bpy

class MY_OT_hello(bpy.types.Operator):
    """Print hello"""
    bl_idname = "my.hello"
    bl_label = "Say Hello"
    bl_options = {'REGISTER', 'UNDO'}

    def execute(self, context):
        self.report({'INFO'}, "Hello")
        return {'FINISHED'}

class MY_PT_panel(bpy.types.Panel):
    bl_idname = "MY_PT_panel"
    bl_label = "My Panel"
    bl_space_type = 'VIEW_3D'
    bl_region_type = 'UI'
    bl_category = "My Tab"

    def draw(self, context):
        self.layout.operator("my.hello")

CLASSES = (MY_OT_hello, MY_PT_panel)

def register():
    for c in CLASSES: bpy.utils.register_class(c)

def unregister():
    for c in reversed(CLASSES): bpy.utils.unregister_class(c)

if __name__ == "__main__":
    register()
```

Install: Blender → Edit → Preferences → Add-ons → Install → pick `my_addon.py` → enable. Or copy to `<scripts>/addons/`.

## Naming conventions

`bl_idname` follows `<CATEGORY>_<TYPE>_<name>` for classes; operators use `category.name` snake_case for `bl_idname`.

| Type | Class prefix | `bl_idname` style |
|------|-------------|-------------------|
| Operator | `XX_OT_thing` | `xx.thing` |
| Panel | `XX_PT_thing` | `XX_PT_thing` |
| Menu | `XX_MT_thing` | `XX_MT_thing` |
| Header | `XX_HT_thing` | `XX_HT_thing` |
| UIList | `XX_UL_thing` | `XX_UL_thing` |
| PropertyGroup | `XX_PG_thing` | n/a |

`XX` is your addon's 2–4 letter tag.

## Operator anatomy

```python
class MY_OT_thing(bpy.types.Operator):
    bl_idname = "my.thing"
    bl_label = "Thing"
    bl_options = {'REGISTER', 'UNDO'}      # 'INTERNAL' to hide from search

    # Properties — appear in the F6 redo panel
    factor: bpy.props.FloatProperty(name="Factor", default=1.0, min=0)
    mode:   bpy.props.EnumProperty(items=[('A','A',''),('B','B','')])

    @classmethod
    def poll(cls, context):
        return context.object is not None

    def invoke(self, context, event):
        # Called when triggered from UI; can show modal dialog.
        return self.execute(context)
        # Or: return context.window_manager.invoke_props_dialog(self)

    def execute(self, context):
        # The work.
        return {'FINISHED'}   # 'CANCELLED' | 'RUNNING_MODAL' | 'PASS_THROUGH'

    def draw(self, context):
        # Optional — custom redo / dialog layout.
        self.layout.prop(self, "factor")
        self.layout.prop(self, "mode")
```

`bl_options`:

| Flag | Effect |
|------|--------|
| `REGISTER` | Appears in undo / redo panel and operator search |
| `UNDO` | Pushes an undo step — almost always wanted |
| `MACRO` | Used by macros only |
| `BLOCKING` | Disables user input while running |
| `MODAL_PRIORITY` | Modal wins over default keymap |
| `INTERNAL` | Hidden from operator search (`F3`) |

## Modal operator

For tools that respond to user input over time (drag, paint, transform-like).

```python
class MY_OT_modal(bpy.types.Operator):
    bl_idname = "my.modal"; bl_label = "Modal"

    def invoke(self, context, event):
        self._initial = context.object.location.copy()
        context.window_manager.modal_handler_add(self)
        return {'RUNNING_MODAL'}

    def modal(self, context, event):
        if event.type == 'MOUSEMOVE':
            context.object.location.x += event.mouse_x * 0.001
        elif event.type == 'LEFTMOUSE':
            return {'FINISHED'}
        elif event.type in {'RIGHTMOUSE', 'ESC'}:
            context.object.location = self._initial
            return {'CANCELLED'}
        return {'RUNNING_MODAL'}
```

Modal operators **don't run in `--background`** — there's no event loop to feed events.

## Panels

Most live in the 3D-view N-panel sidebar:

```python
class MY_PT_panel(bpy.types.Panel):
    bl_idname = "MY_PT_panel"
    bl_label = "My Panel"
    bl_space_type = 'VIEW_3D'      # or 'PROPERTIES', 'NODE_EDITOR', 'IMAGE_EDITOR', 'OUTLINER', etc.
    bl_region_type = 'UI'           # 'WINDOW', 'TOOLS', 'TOOL_PROPS', 'HEADER', 'UI'
    bl_category = "My Tab"          # tab name in N-panel

    def draw(self, context):
        layout = self.layout
        layout.label(text="Stuff")
        layout.prop(context.scene, "my_setting")
        layout.operator("my.thing")
```

Sub-panels: set `bl_parent_id = "MY_PT_panel"` and same `bl_space_type`.

Properties panels: `bl_space_type = 'PROPERTIES'`, `bl_region_type = 'WINDOW'`, plus `bl_context = "object"` (or `"data"`, `"render"`, `"material"`, etc.).

## Menus & adding to existing menus

```python
class MY_MT_menu(bpy.types.Menu):
    bl_idname = "MY_MT_menu"; bl_label = "My Menu"
    def draw(self, context):
        self.layout.operator("my.thing")

def view3d_menu_extend(self, context):
    self.layout.separator()
    self.layout.menu(MY_MT_menu.bl_idname)

def register():
    bpy.utils.register_class(MY_MT_menu)
    bpy.types.VIEW3D_MT_object.append(view3d_menu_extend)

def unregister():
    bpy.types.VIEW3D_MT_object.remove(view3d_menu_extend)
    bpy.utils.unregister_class(MY_MT_menu)
```

Hook points: any class under `bpy.types.*_MT_*` (e.g. `VIEW3D_MT_object`, `VIEW3D_MT_add`, `IMAGE_MT_image`, `TOPBAR_MT_file`).

## Properties on existing types

Attach a `PropertyGroup` to `Scene`/`Object`/`Material`/etc. for storing addon state with the file:

```python
class MY_PG_settings(bpy.types.PropertyGroup):
    intensity: bpy.props.FloatProperty(default=1.0)
    mode:      bpy.props.EnumProperty(items=[('A','A',''),('B','B','')])

def register():
    bpy.utils.register_class(MY_PG_settings)
    bpy.types.Scene.my_settings = bpy.props.PointerProperty(type=MY_PG_settings)

def unregister():
    del bpy.types.Scene.my_settings
    bpy.utils.unregister_class(MY_PG_settings)

# In a panel:
layout.prop(context.scene.my_settings, "intensity")
```

## Addon preferences

Per-addon settings on the Preferences screen.

```python
class MyPrefs(bpy.types.AddonPreferences):
    bl_idname = __name__   # must match the addon module name

    api_key: bpy.props.StringProperty(name="API Key", subtype='PASSWORD')

    def draw(self, context):
        self.layout.prop(self, "api_key")

# Read elsewhere:
prefs = bpy.context.preferences.addons[__name__].preferences
print(prefs.api_key)
```

## Keymaps

```python
addon_keymaps = []

def register():
    wm = bpy.context.window_manager
    kc = wm.keyconfigs.addon
    if kc:
        km = kc.keymaps.new(name='3D View', space_type='VIEW_3D')
        kmi = km.keymap_items.new("my.thing", 'F', 'PRESS', shift=True)
        addon_keymaps.append((km, kmi))

def unregister():
    for km, kmi in addon_keymaps:
        km.keymap_items.remove(kmi)
    addon_keymaps.clear()
```

## Multi-file addon (package)

Layout:

```
my_addon/
├── __init__.py        # has bl_info + register/unregister, imports submodules
├── operators.py
├── panels.py
└── props.py
```

`__init__.py`:

```python
bl_info = {...}

from . import operators, panels, props

def register():
    props.register()
    operators.register()
    panels.register()

def unregister():
    panels.unregister()
    operators.unregister()
    props.unregister()
```

Install by zipping the `my_addon/` folder and selecting the `.zip` in Preferences → Add-ons.

## Extensions (4.2+)

Blender 4.2 introduced **Extensions**, a packaging format with manifest (`blender_manifest.toml`), permissions, and an extensions platform. Format:

```toml
schema_version = "1.0.0"
id = "my_addon"
version = "1.0.0"
name = "My Addon"
tagline = "Does X"
maintainer = "You <you@example.com>"
type = "add-on"
blender_version_min = "4.2.0"
license = ["SPDX:GPL-3.0-or-later"]
tags = ["3D View"]
```

Same code structure, but `bl_info` is replaced by the manifest. Existing addons still work.

## Install paths

| OS | User addons dir |
|----|------------------|
| macOS | `~/Library/Application Support/Blender/X.Y/scripts/addons/` |
| Linux | `~/.config/blender/X.Y/scripts/addons/` |
| Windows | `%APPDATA%/Blender Foundation/Blender/X.Y/scripts/addons/` |

Use `bpy.utils.user_resource('SCRIPTS', path="addons")` to compute it.

## Pitfalls

- **`bl_idname` collision** — operators sharing an id silently overwrite each other. Namespace with your addon tag.
- **Property group register order** — register inner classes before outer (`Pointer` references must already exist).
- **Forgot to unregister** — re-running `register()` after a code change appends duplicates. Always pair `unregister`.
- **`__name__` inside an addon zip** — for module addons it equals `my_addon`; for single-file `bpy.ops.script.reload`, it's `__name__ == "__main__"`. Preferences need `bl_idname = __name__` to match the dict key Blender uses.
- **Modifying read-only RNA props from `draw()`** — the UI redraws constantly; `draw` must be side-effect-free.
- **Modal operator never ends** — every code path in `modal()` must return one of `{'RUNNING_MODAL', 'PASS_THROUGH', 'FINISHED', 'CANCELLED'}`. Returning `None` or omitting causes leaks.
- **Keymap survives uninstall** — accumulated `addon_keymaps` list. Clear it in `unregister`.
