# blender

Interface with Blender through its Python API (`bpy`). Single skill — `blender-python` — that covers scripting, headless rendering, addon authoring, and live MCP control, with deep references for each subsystem.

## Install

```
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools
/plugin install blender
```

## What it covers

| Area | Reference file |
|------|----------------|
| CLI invocation, `--background`, render flags, args after `--` | `cli.md` |
| `bpy.data` / `bpy.context` / `bpy.ops` / `bpy.types` / `bpy.props` / `bpy.app` / `bpy.utils` / `bpy.path` / `mathutils` | `core-api.md` |
| Procedural mesh construction, bmesh editing, modifiers | `mesh.md` |
| Keyframes, F-Curves, drivers, armatures, NLA, frame handlers | `animation.md` |
| Shader nodes, Principled BSDF, geometry nodes, compositor, world shaders | `materials-shaders.md` |
| GLTF / FBX / OBJ / USD / STL / Alembic / Collada / PLY | `io.md` |
| Custom operators, panels, menus, property groups, addon preferences, keymaps, extensions | `addons.md` |
| Operator poll failures, `temp_override`, threading, undo, depsgraph, names | `gotchas.md` |
| `pip install bpy`, blender-mcp setup, custom socket bridges | `live-control.md` |

## When it triggers

Any mention of Blender, `.blend` files, `bpy`, `bmesh`, geometry nodes, shader nodes, Cycles, EEVEE, scene/object/material manipulation, mesh editing, armatures/rigging, keyframe animation, F-curves, drivers, NLA, importing/exporting 3D formats (GLTF, FBX, OBJ, USD, STL, Alembic), batch rendering, headless render farms, CLI invocation (`blender --background --python`), authoring add-ons, custom operators/panels/menus, modal operators, geometry-nodes trees, baking, simulation, grease pencil, compositor nodes, MCP / live AI control, or the bpy pip module.

Triggers even on vague asks like "script Blender", "automate Blender", "render this from a script", or any 3D-graphics task where Blender is implied.

## Structure

```
plugins/blender/
├── .claude-plugin/plugin.json
├── README.md
└── skills/blender-python/
    ├── SKILL.md
    └── references/
        ├── cli.md
        ├── core-api.md
        ├── mesh.md
        ├── animation.md
        ├── materials-shaders.md
        ├── io.md
        ├── addons.md
        ├── gotchas.md
        └── live-control.md
```

## License

MIT.
