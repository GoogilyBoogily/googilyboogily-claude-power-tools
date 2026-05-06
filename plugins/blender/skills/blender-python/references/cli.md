# Blender CLI Reference

Headless and command-line invocation. Argument **order matters** — they execute left-to-right.

## Locate the binary

| OS | Typical path |
|----|--------------|
| macOS | `/Applications/Blender.app/Contents/MacOS/Blender` |
| Linux (deb/rpm) | `/usr/bin/blender` |
| Linux (Steam/snap/flatpak) | `~/.steam/.../blender`, `/var/lib/snapd/snap/bin/blender`, `/var/lib/flatpak/exports/bin/org.blender.Blender` |
| Windows | `C:\Program Files\Blender Foundation\Blender X.Y\blender.exe` |

`alias blender=...` for the rest of this doc, or substitute the full path.

## The big four flags

| Flag | What it does |
|------|--------------|
| `-b`, `--background` | No GUI. Ideal for renders / batch jobs. |
| `-P`, `--python <file>` | Run a `.py` file inside Blender's interpreter. |
| `--python-expr "<code>"` | Run a Python expression directly. |
| `--python-text <name>` | Run a text data-block already inside the `.blend`. |

Pass a `.blend` as the first positional arg to open it. Without one, Blender starts on the default scene (or empty if `--factory-startup`).

```bash
blender file.blend -b -P script.py
blender -b --factory-startup --python-expr 'import bpy; print(bpy.app.version)'
```

## Render flags

Order: open file → tweak settings → set output → set frames → render.

| Flag | Effect |
|------|--------|
| `-o`, `--render-output <path>` | Output template. `####` becomes the zero-padded frame number. |
| `-F`, `--render-format <FMT>` | `PNG`, `JPEG`, `OPEN_EXR`, `FFMPEG`, etc. |
| `-x`, `--use-extension <0\|1>` | Add the format's extension to the filename. |
| `-f`, `--render-frame <N>` | Render frame N (use `start` / `end` keywords too). Comma list and `..` ranges OK: `-f 1,5,10..15`. |
| `-a`, `--render-anim` | Render `frame_start..frame_end`. |
| `-s`, `--frame-start <N>` | Starting frame for `-a`. |
| `-e`, `--frame-end <N>` | End frame for `-a`. |
| `-j`, `--frame-jump <N>` | Frame step for `-a`. |
| `-S`, `--scene <name>` | Pick a scene from the file. |
| `-E`, `--engine <name>` | `CYCLES`, `BLENDER_EEVEE_NEXT` (4.2+), `BLENDER_WORKBENCH`. `-E help` prints the list. |
| `-t`, `--threads <N>` | Threads for CPU rendering. `0` = autodetect. |

Common pitfall: putting `-o` **after** `-f`/`-a` means it applies to *the next* render, not the current one. Always set output first.

## Other useful flags

| Flag | Effect |
|------|--------|
| `--factory-startup` | Ignore user prefs/startup. Reproducible. |
| `--addons <a,b,c>` | Comma-list (no spaces) of addons to enable for this session. |
| `--enable-autoexec` | Allow drivers / handlers in the file to run. Off by default for safety. |
| `--python-use-system-env` | Honor `PYTHONPATH`/`PYTHONHOME` from the shell. |
| `--debug` / `--debug-cycles` / `--debug-python` / `--debug-depsgraph` | Verbose logs in their domain. |
| `--log "*"` | Enable all log categories. `--log-level <n>` 0..5. |
| `-noaudio` | Disable audio (avoids ALSA/JACK issues on servers). |
| `--python-exit-code <N>` | Exit with N if the Python script raises. **Use this in CI** — without it, Blender exits 0 even on script errors. |
| `--gpu-backend <metal\|vulkan\|opengl>` | 4.x: choose viewport/render backend. |
| `--cycles-device <CPU\|CUDA\|OPTIX\|HIP\|ONEAPI\|METAL>` | Cycles compute backend. |
| `-h`, `--help` | Print full list. Definitive source. |

## Passing args to your script

Anything after a lone `--` is forwarded; Blender ignores it. Inside Python, slice `sys.argv`:

```python
import sys, argparse
argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
ap = argparse.ArgumentParser()
ap.add_argument("--input", required=True)
ap.add_argument("--samples", type=int, default=64)
args = ap.parse_args(argv)
```

Invoke:

```bash
blender -b -P render.py -- --input scene.blend --samples 256
```

## Exit codes for CI

Blender exits 0 by default even when a Python script throws. Two fixes:

1. `--python-exit-code 1` — Blender returns N if the script raised.
2. Wrap your script in try/except and `sys.exit(1)` explicitly.

```bash
blender -b file.blend -P script.py --python-exit-code 1
```

Combine with stderr capture:

```bash
blender -b file.blend -P script.py --python-exit-code 1 2> err.log
grep -E 'Error|Traceback|RuntimeError' err.log && exit 1
```

## Recipes

### Render an image sequence to MP4

```bash
blender shot.blend -b \
  -E CYCLES \
  -o "//render/frame_####" \
  -F PNG \
  -s 1 -e 240 \
  -a
# then encode (ffmpeg) — Blender's FFMPEG output also works:
blender shot.blend -b -F FFMPEG -o "//render/out.mp4" -s 1 -e 240 -a
```

### Batch convert FBX → GLB

```bash
for f in *.fbx; do
  blender -b --factory-startup --python-expr "
import bpy, sys
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.fbx(filepath='$f')
bpy.ops.export_scene.gltf(filepath='${f%.fbx}.glb', export_format='GLB')
"
done
```

### List engines / scenes / objects

```bash
blender -b file.blend --python-expr "
import bpy
print('engine:', bpy.context.scene.render.engine)
print('scenes:', list(bpy.data.scenes.keys()))
print('objects:', [o.name for o in bpy.data.objects])
"
```

### Generate a thumbnail of every `.blend` in a folder

```bash
find . -name "*.blend" -print0 | while IFS= read -r -d '' f; do
  blender "$f" -b --python-expr "
import bpy, os
bpy.context.scene.render.filepath = os.path.splitext(bpy.data.filepath)[0] + '_thumb.png'
bpy.context.scene.render.resolution_x = 256
bpy.context.scene.render.resolution_y = 256
bpy.ops.render.render(write_still=True)
"
done
```

### Run as a Docker step

```dockerfile
FROM linuxserver/blender:latest
COPY render.py /app/render.py
COPY scene.blend /app/scene.blend
ENTRYPOINT ["blender","-b","/app/scene.blend","-P","/app/render.py","--python-exit-code","1"]
```

## CLI subcommands (4.2+)

`bpy.utils.register_cli_command()` lets addons add `blender --command <name> ...`. Inspect with `blender --help`. Useful for shipping CLI tools as Blender addons.

## Argument-order traps

These execute strictly left to right:

| Wrong | Right |
|-------|-------|
| `blender -b file.blend -a -o /tmp/out_####.png` (output set after render → ignored) | `blender -b file.blend -o /tmp/out_####.png -a` |
| `blender -b file.blend -P script.py -E CYCLES` (engine set after script may collide with what script set) | `blender -b file.blend -E CYCLES -P script.py` (or set engine inside the script) |
| `blender -b -P script.py file.blend` (file opened **after** script ran) | `blender -b file.blend -P script.py` |
