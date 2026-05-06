# Materials, Shaders, Geometry Nodes, Compositor

Blender's three node systems share an API — `node_tree.nodes`, `node_tree.links`. Sockets are typed (`NodeSocketColor`, `NodeSocketFloat`, `NodeSocketVector`, `NodeSocketGeometry`, ...).

## Material with Principled BSDF

```python
import bpy

mat = bpy.data.materials.new("Red")
mat.use_nodes = True
nt = mat.node_tree
nt.nodes.clear()

bsdf   = nt.nodes.new('ShaderNodeBsdfPrincipled')
output = nt.nodes.new('ShaderNodeOutputMaterial')
bsdf.location   = (0, 0)
output.location = (300, 0)

bsdf.inputs['Base Color'].default_value = (0.8, 0.1, 0.1, 1.0)
bsdf.inputs['Metallic'].default_value   = 0.5
bsdf.inputs['Roughness'].default_value  = 0.3

nt.links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])

obj = bpy.context.active_object
if obj and obj.type == 'MESH':
    if obj.data.materials:
        obj.data.materials[0] = mat
    else:
        obj.data.materials.append(mat)
```

Naming: `ShaderNode...` lives in shader trees, `GeometryNode...` in geometry trees, `CompositorNode...` in compositor trees. `bpy.types.Node.bl_rna_get_subclass_py()` is the lookup, but you usually just know the class.

## Image texture

```python
img = bpy.data.images.load("/path/diffuse.png", check_existing=True)
tex = nt.nodes.new('ShaderNodeTexImage')
tex.image = img
tex.location = (-300, 0)
nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
```

For non-color (normal/roughness): `img.colorspace_settings.name = 'Non-Color'`.

### Normal map

```python
nrm_img = bpy.data.images.load("/path/normal.png")
nrm_img.colorspace_settings.name = 'Non-Color'

ntex = nt.nodes.new('ShaderNodeTexImage'); ntex.image = nrm_img
nmap = nt.nodes.new('ShaderNodeNormalMap')
nt.links.new(ntex.outputs['Color'], nmap.inputs['Color'])
nt.links.new(nmap.outputs['Normal'], bsdf.inputs['Normal'])
```

## Procedural

```python
tc    = nt.nodes.new('ShaderNodeTexCoord')
noise = nt.nodes.new('ShaderNodeTexNoise')
ramp  = nt.nodes.new('ShaderNodeValToRGB')      # ColorRamp
noise.inputs['Scale'].default_value = 5.0
ramp.color_ramp.elements[0].position = 0.3
ramp.color_ramp.elements[1].position = 0.7

nt.links.new(tc.outputs['Generated'], noise.inputs['Vector'])
nt.links.new(noise.outputs['Fac'], ramp.inputs['Fac'])
nt.links.new(ramp.outputs['Color'], bsdf.inputs['Base Color'])
```

## Animating shader inputs

Shader sockets are F-Curve-keyable through their owning ID:

```python
bsdf.inputs['Base Color'].default_value = (1,0,0,1)
bsdf.inputs['Base Color'].keyframe_insert('default_value', frame=1)
bsdf.inputs['Base Color'].default_value = (0,0,1,1)
bsdf.inputs['Base Color'].keyframe_insert('default_value', frame=60)
```

The action lives on `mat.node_tree.animation_data` (not the object).

## Geometry Nodes

A `Mesh` modifier of type `'NODES'` runs a `GeometryNodeTree`.

```python
import bpy

obj = bpy.context.active_object
mod = obj.modifiers.new("GN", type='NODES')

gnt = bpy.data.node_groups.new("MyGN", 'GeometryNodeTree')
mod.node_group = gnt

# Define interface (4.x uses node_tree.interface, not inputs/outputs):
gnt.interface.new_socket("Geometry", in_out='INPUT',  socket_type='NodeSocketGeometry')
gnt.interface.new_socket("Geometry", in_out='OUTPUT', socket_type='NodeSocketGeometry')
gnt.interface.new_socket("Density",  in_out='INPUT',  socket_type='NodeSocketFloat')

# Add input/output endpoints
gin  = gnt.nodes.new('NodeGroupInput')
gout = gnt.nodes.new('NodeGroupOutput')
gin.location  = (-400, 0)
gout.location = ( 400, 0)

# A processing node
distribute = gnt.nodes.new('GeometryNodeDistributePointsOnFaces')
gnt.links.new(gin.outputs['Geometry'], distribute.inputs['Mesh'])
gnt.links.new(distribute.outputs['Points'], gout.inputs['Geometry'])

# Set the modifier input value (per-object override):
mod["Socket_2"] = 50.0   # the Density socket — Blender names sockets Socket_N
```

Note: Geometry-node modifier inputs are accessed by `Socket_N` keys on the modifier (not the node group's interface socket name). Inspect with `list(mod.keys())`.

### Common geometry nodes (4.5 catalog highlights)

| Node | Purpose |
|------|---------|
| `GeometryNodeMeshCube` / `Sphere` / `Cylinder` / `Cone` / `Grid` | Primitive sources |
| `GeometryNodeDistributePointsOnFaces` | Surface scattering |
| `GeometryNodeInstanceOnPoints` | Instance objects/collections at points |
| `GeometryNodeRealizeInstances` | Convert instances to real geometry |
| `GeometryNodeJoinGeometry` | Merge streams |
| `GeometryNodeMeshBoolean` | Boolean ops |
| `GeometryNodeSubdivisionSurface` | Subsurf in nodes |
| `GeometryNodeSetPosition` | Move vertices procedurally |
| `GeometryNodeAttributeStatistic` / `StoreNamedAttribute` / `NamedAttribute` | Attribute pipeline |
| `GeometryNodeRaycast` | Sample geometry from another mesh |
| `GeometryNodeSampleNearest` / `SampleIndex` | Attribute sampling |
| `GeometryNodeSimulationInput` / `SimulationOutput` | 4.x simulation zone |
| `GeometryNodeRepeatInput` / `RepeatOutput` | 4.x repeat zone |

## Compositor

Per-scene node tree: `bpy.context.scene.use_nodes = True; tree = bpy.context.scene.node_tree`.

```python
scene = bpy.context.scene
scene.use_nodes = True
tree = scene.node_tree
tree.nodes.clear()

rl   = tree.nodes.new('CompositorNodeRLayers')
glare = tree.nodes.new('CompositorNodeGlare')
glare.glare_type = 'FOG_GLOW'
comp = tree.nodes.new('CompositorNodeComposite')

tree.links.new(rl.outputs['Image'], glare.inputs['Image'])
tree.links.new(glare.outputs['Image'], comp.inputs['Image'])
```

## World shaders

```python
world = bpy.context.scene.world
world.use_nodes = True
nt = world.node_tree
bg = nt.nodes['Background']
bg.inputs['Color'].default_value = (0.05, 0.05, 0.08, 1.0)
bg.inputs['Strength'].default_value = 1.0

# Add HDRI environment:
env = nt.nodes.new('ShaderNodeTexEnvironment')
env.image = bpy.data.images.load("/path/sky.hdr")
nt.links.new(env.outputs['Color'], bg.inputs['Color'])
```

## Render engine settings

```python
scene = bpy.context.scene

# Cycles
scene.render.engine = 'CYCLES'
scene.cycles.device = 'GPU'                 # or 'CPU'
scene.cycles.samples = 128
scene.cycles.use_denoising = True
scene.cycles.denoiser = 'OPENIMAGEDENOISE'  # 'OPTIX' for NV GPUs
scene.cycles.preview_samples = 16

# EEVEE Next (4.2+ replaces classic EEVEE)
scene.render.engine = 'BLENDER_EEVEE_NEXT'
scene.eevee.taa_render_samples = 64

# Workbench
scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
```

### Choose Cycles compute device by name

```python
prefs = bpy.context.preferences.addons['cycles'].preferences
prefs.compute_device_type = 'CUDA'   # or 'OPTIX' | 'HIP' | 'METAL' | 'ONEAPI'
for d in prefs.devices: d.use = (d.type != 'CPU')
prefs.refresh_devices()
```

## Pitfalls

- **Sockets indexed by name fail when there are duplicates.** Use `node.inputs[3]` or unique custom names.
- **Default value on linked socket** is silently ignored — Blender uses the link.
- **Color sockets need 4-tuples** `(r,g,b,a)`, not 3.
- **Geometry node modifier input not updating** — the keys are `Socket_N`, not the socket name. Re-check with `list(mod.keys())`.
- **`use_nodes = True` adds default nodes** — clear them with `nt.nodes.clear()` before building.
- **Material assigned but object renders gray** — material slot 0 exists but `material_index` per-face points at slot 1. Check `mesh.polygons[i].material_index`.
- **HDRI shows flat / not affecting lighting** — World output not connected, or `Environment Texture` color space wrong (must be `Linear Rec.709` or appropriate HDR space, not sRGB).
- **Nodes not preserved after re-open** — assigned a node-tree to a modifier that wasn't kept in `bpy.data.node_groups`. Always `bpy.data.node_groups.new(...)` first.
