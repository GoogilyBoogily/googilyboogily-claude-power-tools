# Mesh Editing — bpy.data.meshes + bmesh

Two mesh APIs:

- **`bpy.types.Mesh` / `from_pydata`** — fast bulk construction, simple read-back.
- **`bmesh`** — interactive editing semantics: verts/edges/faces objects with topology operations (extrude, bevel, dissolve, boolean, ...).

Use `from_pydata` for procedural generation when you already know the geometry. Use `bmesh` when you need to edit topology or query connectivity.

## from_pydata — bulk construction

```python
import bpy

mesh = bpy.data.meshes.new("Quad")
mesh.from_pydata(
    vertices=[(0,0,0), (1,0,0), (1,1,0), (0,1,0)],
    edges=[],          # blender derives edges from faces
    faces=[(0,1,2,3)],
)
mesh.update()                    # validate + recompute

obj = bpy.data.objects.new("Quad", mesh)
bpy.context.collection.objects.link(obj)
```

Notes:
- Pass `edges=[]` if all your edges are bounded by faces. Blender adds them.
- `mesh.update()` is mandatory; without it the mesh is in a half-built state.
- Vertex order is preserved; index into `mesh.vertices[i].co` later.

## Reading mesh data

```python
mesh = obj.data
for v in mesh.vertices:
    print(v.co, v.normal)
for e in mesh.edges:
    print(e.vertices[:])
for p in mesh.polygons:
    print(p.vertices[:], p.normal, p.material_index)
# UVs:
uv_layer = mesh.uv_layers.active
for loop_idx, loop in enumerate(mesh.loops):
    uv = uv_layer.data[loop_idx].uv
```

`MeshLoop`s are per-corner (per face-vertex), which is where UVs and per-vertex-per-face data live.

### Loop triangles for renderers

`MeshPolygon` can be n-gons. To export to a renderer that wants triangles only:

```python
mesh.calc_loop_triangles()
for lt in mesh.loop_triangles:
    print(lt.vertices[:])  # always 3 indices
```

## bmesh — topology ops

bmesh is a separate, mutable mesh data structure. You read your `Mesh` into a `BMesh`, edit it, then write back.

### Object mode pattern

```python
import bpy, bmesh

obj = bpy.context.active_object
mesh = obj.data

bm = bmesh.new()
bm.from_mesh(mesh)

# ... edit ...

bm.to_mesh(mesh)
bm.free()
mesh.update()
```

### Edit mode pattern

If the mesh is currently in edit mode, use the live BMesh — don't load a new one.

```python
bm = bmesh.from_edit_mesh(mesh)
# ... edit ...
bmesh.update_edit_mesh(mesh)
# Don't bm.free() — the BMesh is owned by the editor.
```

### Building geometry

```python
import bpy, bmesh, math
from mathutils import Vector

bm = bmesh.new()
verts = [bm.verts.new((math.cos(t), math.sin(t), 0)) for t in
         (i * 2*math.pi/16 for i in range(16))]
bm.verts.ensure_lookup_table()
bm.faces.new(verts)        # n-gon face

mesh = bpy.data.meshes.new("Disc")
bm.to_mesh(mesh); bm.free()
obj = bpy.data.objects.new("Disc", mesh)
bpy.context.collection.objects.link(obj)
```

`ensure_lookup_table()` is required after creating verts/edges/faces if you want to index `bm.verts[i]`.

### bmesh.ops — the topology operations

These mirror Blender's modeling tools. All take a `bm` and a `geom` selection.

```python
import bmesh

# Extrude selected faces
result = bmesh.ops.extrude_face_region(bm, geom=[f for f in bm.faces if f.select])
new_verts = [g for g in result["geom"] if isinstance(g, bmesh.types.BMVert)]
for v in new_verts:
    v.co.z += 1.0

# Inset
bmesh.ops.inset_individual(bm, faces=selected_faces, thickness=0.1)

# Bevel
bmesh.ops.bevel(bm, geom=selected_edges, offset=0.05, segments=4, profile=0.5)

# Subdivide
bmesh.ops.subdivide_edges(bm, edges=selected_edges, cuts=2, use_grid_fill=True)

# Boolean
bmesh.ops.boolean(bm, target=bm_a, operands=[bm_b], operation='UNION')

# Dissolve
bmesh.ops.dissolve_faces(bm, faces=selected_faces, use_verts=True)

# Triangulate
bmesh.ops.triangulate(bm, faces=bm.faces[:])
```

Full list: `dir(bmesh.ops)` inside Blender. Names follow C operator names.

### Selecting

```python
for v in bm.verts: v.select = v.co.x > 0
bm.select_flush(True)              # propagate vert selection to edges/faces
selected_faces = [f for f in bm.faces if f.select]
```

### Custom layers (per-vert / per-loop / per-face data)

```python
key = bm.verts.layers.float.new("density")    # custom float per vert
v[key] = 0.5

uv_lay = bm.loops.layers.uv.new("UVMap")      # UVs per loop
for loop in face.loops:
    loop[uv_lay].uv = (...)
```

## Modifiers — non-destructive

Don't `bmesh` something that a modifier already does. Set up a modifier instead:

```python
mod = obj.modifiers.new(name="Subsurf", type='SUBSURF')
mod.levels = 2
mod.render_levels = 3

# Apply non-destructively becomes destructive — only when intended:
bpy.context.view_layer.objects.active = obj
bpy.ops.object.modifier_apply(modifier=mod.name)
```

Common modifier types: `SUBSURF`, `MIRROR`, `ARRAY`, `BEVEL`, `BOOLEAN`, `SOLIDIFY`, `WIREFRAME`, `DISPLACE`, `LATTICE`, `ARMATURE`, `CLOTH`, `OCEAN`, `PARTICLE_SYSTEM`, `NODES` (geometry nodes — see `materials-shaders.md`).

## Vertex groups

```python
vg = obj.vertex_groups.new(name="Top")
vg.add(index=[0, 1, 2], weight=1.0, type='REPLACE')
```

Used by Armature, Lattice, particle distribution, etc.

## Shape keys (morph targets)

```python
basis = obj.shape_key_add(name="Basis")
key   = obj.shape_key_add(name="Open")
key.data[0].co.z += 1.0     # offset for vertex 0 in this shape
key.value = 0.5             # blend
```

## Smoothing & normals

```python
mesh.shade_smooth()                          # mark all faces smooth
for p in mesh.polygons: p.use_smooth = True  # per-face
mesh.use_auto_smooth = True; mesh.auto_smooth_angle = math.radians(30)
mesh.calc_normals_split()                    # split normals from shading
```

In 4.1+, `mesh.use_auto_smooth` was removed in favor of the "Smooth by Angle" modifier — check version.

## Common pitfalls

- **Lookup table stale.** After adding/removing geometry call `bm.verts.ensure_lookup_table()` (and `.edges`, `.faces`) before integer indexing.
- **Edit mode + new BMesh.** Don't do `bm = bmesh.new(); bm.from_mesh(obj.data)` while the object is in edit mode — you'll be editing a copy that gets thrown away. Use `bmesh.from_edit_mesh`.
- **Forgetting `mesh.update()`.** Without it, F-curves, modifiers, viewport see stale data.
- **`from_pydata` with bad indices.** Faces must reference existing vertex indices; a single bad index silently corrupts the mesh.
- **Normals look wrong after construction.** Call `bmesh.ops.recalc_face_normals(bm, faces=bm.faces)` or `mesh.calc_normals()` (deprecated post-4.1; let Blender recompute via `mesh.update()`).
- **Memory leaks with `bmesh.new()`.** Always pair with `bm.free()`.
- **Operators in bmesh need `bm` instances, not selection lists from `bpy.context`.** The selection in bmesh is independent of viewport selection.
