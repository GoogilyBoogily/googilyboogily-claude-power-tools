# Live Control — bpy as pip module + blender-mcp

Two paths for driving Blender outside the GUI without launching `blender -b -P script.py` each time.

## Path A — `bpy` as a pip module

Treat Blender's Python API as a regular Python package. `import bpy` from any script. Behaves like `--background --factory-startup`.

### Install

```bash
# Blender ships matching CPython — currently 3.11 for Blender 4.x.
# Use a clean venv with that exact CPython version.
python3.11 -m venv .venv
source .venv/bin/activate
pip install bpy
```

Mismatched Python versions silently fail (binary wheel won't load). If `pip install bpy` errors, check `python --version` against [the bpy wheel matrix on PyPI](https://pypi.org/project/bpy/).

### What works

- All scene authoring through `bpy.data` / `bpy.types`.
- Most operators that don't require a 3D viewport.
- Cycles render via `bpy.ops.render.render(write_still=True)`.
- glTF/FBX/OBJ/USD import/export.
- bmesh, mathutils, geometry-nodes evaluation.

### What breaks

- Modal operators — no event loop.
- Anything that needs a `VIEW_3D` area.
- Some addons that hard-code GUI assumptions.
- Real-time playback / viewport rendering.

### Use case

CI pipelines, render farms, web services, game-asset baking, headless batch processing. Cleaner than shelling out to `blender` because you can pass Python objects directly.

```python
import bpy

bpy.ops.wm.read_factory_settings(use_empty=True)

# Build scene
mat = bpy.data.materials.new("Mat"); mat.use_nodes = True
mesh = bpy.data.meshes.new("M")
mesh.from_pydata([(0,0,0),(1,0,0),(0,1,0)], [], [(0,1,2)])
mesh.update()
obj = bpy.data.objects.new("Tri", mesh); bpy.context.collection.objects.link(obj)
obj.data.materials.append(mat)

# Camera + light
cam_data = bpy.data.cameras.new("Cam")
cam = bpy.data.objects.new("Cam", cam_data)
bpy.context.collection.objects.link(cam)
cam.location = (3,-3,3); cam.rotation_euler = (1.1, 0, 0.78)
bpy.context.scene.camera = cam

light_data = bpy.data.lights.new("L", 'SUN')
light = bpy.data.objects.new("L", light_data)
bpy.context.collection.objects.link(light)
light.rotation_euler = (0.5, 0.5, 0)

# Render
bpy.context.scene.render.engine = 'CYCLES'
bpy.context.scene.cycles.samples = 32
bpy.context.scene.render.filepath = "/tmp/out.png"
bpy.ops.render.render(write_still=True)
```

### Docker

```dockerfile
FROM python:3.11-slim
RUN apt-get update && apt-get install -y \
    libxi6 libxxf86vm1 libxfixes3 libgl1 libxrender1 libsm6 \
    libxkbcommon0 libxcb1 libxrandr2 libxinerama1 libxcursor1
RUN pip install bpy
COPY render.py .
CMD ["python", "render.py"]
```

## Path B — blender-mcp (Model Context Protocol)

`blender-mcp` is an MCP server that connects an AI client (Claude Desktop, Cursor, VS Code, Claude Code) to a **running** Blender instance. The AI can inspect the scene, run operators, set materials, and execute Python through a JSON-over-TCP socket.

Source: [github.com/ahujasid/blender-mcp](https://github.com/ahujasid/blender-mcp).

### Architecture

```
[AI client] <--MCP--> [blender-mcp server (uvx)] <--TCP localhost:9876--> [Blender addon]
```

The Blender addon listens on `localhost:9876`. The MCP server forwards calls. Requires `uv` installed on the host.

### Install (host)

```bash
brew install uv                            # macOS
# or: curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Install (Blender addon)

1. Download `addon.py` from the repo.
2. Blender → Edit → Preferences → Add-ons → Install → `addon.py`.
3. Enable "Interface: Blender MCP".
4. Open the 3D View N-panel, find the BlenderMCP tab, click "Connect to Claude" (or whichever client). The addon binds the socket.

### Wire to an MCP client

**Claude Desktop / Claude Code** — `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "blender": {
      "command": "uvx",
      "args": ["blender-mcp"]
    }
  }
}
```

**Cursor** — Settings → MCP → add global server with the same JSON.

**Windows variant**: `"command": "cmd"`, `"args": ["/c", "uvx", "blender-mcp"]`.

### Capabilities

The MCP server exposes:

- **Scene inspection** — list objects, materials, cameras, lights.
- **Object creation/deletion/transform** — primitive shapes, transform, parent.
- **Material control** — apply colors, create Principled BSDF, image textures.
- **Code execution** — run Python in Blender (the obvious foot-gun; only use with trusted prompts).
- **Asset providers (optional)** — Poly Haven HDRIs/textures/models, Hyper3D Rodin AI generation.

### Security

The Python-execution tool is dangerous. The server runs locally; only enable it for sessions where you trust the prompts. Don't expose `localhost:9876` to a network.

### Typical use

Iterative natural-language Blender editing — "make the cube red, scale it 2x, put a sun light above it." Pair with `bpy.context.view_layer.update()` so the viewport refreshes.

## Path C — roll your own socket bridge

If you don't want MCP/uv overhead, run a small HTTP server inside Blender that exposes a **fixed set of named operations**. Whitelist the surface — never accept arbitrary Python from the network.

```python
# Run inside Blender's Python console
import bpy, http.server, json, threading

# Whitelist: name -> callable
def add_cube(args):
    bpy.ops.mesh.primitive_cube_add(size=args.get("size", 1.0))
    return {"ok": True, "active": bpy.context.active_object.name}

def set_color(args):
    obj = bpy.data.objects[args["object"]]
    mat = obj.active_material or bpy.data.materials.new("M")
    mat.use_nodes = True
    mat.node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value = args["color"]
    if obj.active_material is None:
        obj.data.materials.append(mat)
    return {"ok": True}

ACTIONS = {"add_cube": add_cube, "set_color": set_color}

class H(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        n = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(n))
        fn = ACTIONS.get(body.get("action"))
        if fn is None:
            self.send_response(400); self.end_headers()
            self.wfile.write(b'{"error":"unknown action"}'); return

        # Defer to the main thread — bpy is not thread-safe
        result = []
        done = threading.Event()
        def run():
            try:    result.append(fn(body.get("args", {})))
            except Exception as e: result.append({"error": str(e)})
            done.set()
            return None
        bpy.app.timers.register(run, first_interval=0.0)
        done.wait(timeout=10)

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps(result[0]).encode())

def serve():
    http.server.HTTPServer(("127.0.0.1", 8765), H).serve_forever()
threading.Thread(target=serve, daemon=True).start()
```

Caveats:

- **Bind to `127.0.0.1` only.** Never expose to a network.
- **Whitelist actions.** Don't accept arbitrary code strings.
- **Always defer to the main thread** via `bpy.app.timers.register`. bpy is not thread-safe.
- **No auth** — rely on the loopback. If you need cross-machine, put a reverse proxy with auth in front.

## Choosing between paths

| Need | Use |
|------|-----|
| CI / render farm / batch render | `bpy` as pip module or `blender -b -P` |
| Iterative AI-driven editing of a live scene | `blender-mcp` |
| One-off automation script | `blender -b -P script.py` |
| Custom protocol / web UI | Roll your own socket bridge with a whitelisted action surface |
| Production pipeline integration | `bpy` as pip module + your own queueing |
