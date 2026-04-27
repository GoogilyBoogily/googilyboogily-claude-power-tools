# Mesa / AMD / Intel GPU Troubleshooting

Covers `amdgpu` + RADV/radeonsi, `i915`/`xe` + iris/anv, and shared Mesa stack. For Nvidia see `nvidia.md`.

## Quick Triage

```bash
lspci -k | grep -EA3 'VGA|3D|Display'                # which kernel driver bound?
glxinfo | grep -E "OpenGL renderer|version|Mesa"
vulkaninfo --summary 2>/dev/null | head -30
vainfo 2>&1 | head -20                                # VA-API hardware decode
sudo dmesg | grep -iE 'amdgpu|radeon|i915|xe|drm|firmware|GuC|HuC|ring|timeout|reset|hang' | tail -50
ls -la /dev/dri/ /dev/dri/by-path/                   # render nodes + perms
```

If `glxinfo` shows `llvmpipe` as renderer the KMS driver isn't loaded — software fallback. Kernel module not bound; check `lsmod` and `dmesg`.

## Mesa Version Compatibility

Rule: never run `.0` releases on production. Pin to the latest `.x` of a stable branch.

| Mesa branch | Notable issues |
|------------|---------------|
| 24.3.x | Stable baseline; no RDNA4 |
| 25.0.x | RDNA4 init support; GTA V Enhanced GPU hangs on RADV; Polaris regressions |
| 25.1.x | Emergency 25.1.3 for RDNA4 firmware regression; STALKER 2 crashes ANV; Cyberpunk -18% Vega 64 |
| 25.2.x | DOTA 2 texture flicker; Civ VII hangs |
| 25.3.x | Doom: The Dark Ages + FF XVI artifacts on RADV/ANV |
| 26.0.x | Current dev as of early 2026 |

Rollback paths:
- Arch: `downgrade mesa mesa-radeon mesa-vulkan-radeon` then `IgnorePkg = mesa*` in `/etc/pacman.conf`
- Debian/Ubuntu: `apt-mark hold mesa-vulkan-drivers libgl1-mesa-dri`
- Fedora: `dnf versionlock add 'mesa*'`

## AMD: amdgpu vs radeon Kernel Driver

| GPU family | Driver |
|-----------|--------|
| Pre-GCN | `radeon` only |
| GCN 1/2 (Southern/Sea Islands) | both — kernel 6.19+ defaults to `amdgpu` (~30% perf gain) |
| GCN 3+ (Fiji, Polaris, Vega, RDNA*) | `amdgpu` only |

Force `amdgpu` on GCN1/2 with old kernels:

```
# /etc/modprobe.d/amdgpu.conf
options amdgpu si_support=1 cik_support=1
options radeon si_support=0 cik_support=0
blacklist radeon
```

Never load both simultaneously — blacklist `radeon` if forcing `amdgpu`.

## RADV vs AMDVLK

AMDVLK was discontinued by AMD in September 2025. RADV (Mesa) is the only maintained AMD Vulkan driver.

```bash
vulkaninfo --summary 2>/dev/null | grep -E "driverName|driverInfo"
AMD_VULKAN_ICD=RADV vulkaninfo --summary
```

Force RADV in `/etc/environment` or per-app launcher:

```
AMD_VULKAN_ICD=RADV
# or
VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/radeon_icd.x86_64.json
```

RADV experimental flags (`RADV_PERFTEST=`):
- `sam` — Smart Access Memory / Resizable BAR
- `nggc` — NGG culling (RDNA3+)
- `cswave32` / `pswave32` — Wave32 compute/pixel (GFX10+)

RDNA4 video decode: not yet in RADV (Mesa 25.1). Use `radeonsi` (OpenGL path) for VAAPI until 25.2+ HW decode lands.

## Intel: i915 vs xe

| Hardware | Default | Recommended |
|---------|---------|------------|
| Gen 8-11 (Broadwell-Ice Lake) | i915 | i915 |
| Tiger Lake / Alder Lake / Raptor Lake | i915 | i915 |
| Meteor Lake | i915 (transitional) | xe (force-probe) |
| Lunar Lake | xe | xe |
| Arc Alchemist (A-series) | i915 | xe (kernel 6.19+: ~50% compute uplift) |
| Arc Battlemage (B-series) | xe | xe (kernel 6.11+ required) |

Force xe on Alchemist:

```
# /etc/modprobe.d/xe.conf
options xe force_probe=*
# or kernel cmdline
i915.force_probe=! xe.force_probe=<PCI_ID>
```

If both `i915` and `xe` are loaded for the same device, iGPU hangs result. Pick one per device.

## AMD Symptom Playbook

### Ring timeout / GPU hang

```
[drm:amdgpu_job_timedout] *ERROR* ring gfx_0.0.0 timeout
```

Causes: power-gating race, DMA fence timeout, RDNA3 TLB fence bug, stale firmware.

```bash
sudo dmesg | grep -E "amdgpu|ring|timeout|fence|reset" | tail -30
```

Try in order:
1. Update `linux-firmware` (or `linux-firmware-git` for newest cards).
2. Kernel cmdline: `amdgpu.gpu_recovery=1 amdgpu.gfx_off=0`
3. RDNA3 specifically: `amdgpu.tmz=0 amdgpu.sg_display=0`
4. Disable runtime PM: `amdgpu.runpm=0` (sledgehammer; only if 1-3 don't help)

### Black screen / display init failure on RDNA3/RDNA4

Cause: Display Core (DC) bug, firmware mismatch, kernel regression (Linux 6.18/6.19 hit RDNA3/4 hard early on).

Try:
- Boot kernel 6.15-6.17 if stuck on broken 6.18/6.19.
- Update `linux-firmware`.
- Last resort: `amdgpu.dc=0` (disables HDMI audio + advanced features).

### Suspend/resume black screen

Cause: VRAM eviction OOM (fixed in 6.14+), Display Core resume failure.

Fix: `amdgpu.sg_display=0` plus kernel ≥ 6.14. For older kernels, ensure substantial swap.

### RDNA4 + old firmware (Mesa 25.1.0-25.1.2)

Update to Mesa 25.1.3+ or update `linux-firmware` to a build with new RDNA4 fw.

## Intel Symptom Playbook

### GuC/HuC firmware load failure

```
i915: GuC firmware failed to load
i915: HuC firmware failed to load
```

Fix:
1. Rebuild initramfs to include firmware: `update-initramfs -u` / `mkinitcpio -P` / `dracut -f`
2. Update `linux-firmware`.
3. Force enable: kernel cmdline `i915.enable_guc=3`.
4. If GuC causes freezes (rare): `i915.enable_guc=0`.

### Iris Xe falling back to llvmpipe

Renderer reports `llvmpipe` → KMS driver not loaded.

```bash
lsmod | grep -E '^i915|^xe'
```

Add `i915` (or `xe`) to initramfs `MODULES=()`.

### Battlemage OpenCL compute broken

Cause: `intel-compute-runtime` (Level Zero) not updated for `xe` driver path on Ubuntu 24.04 LTS.

Fix: Ubuntu 24.10+, or manually install updated `intel-opencl-icd` from upstream PPA.

### Display engine reset / TDR on Arc

```
[drm] *ERROR* Resetting chip...
```

Use `xe` driver on Battlemage; ensure kernel 6.11+.

## Diagnostic Commands

```bash
# OpenGL
glxinfo | grep -E "renderer|version"

# Vulkan
vulkaninfo --summary
RADV_DEBUG=hang ./game            # dumps to ~/radv_dumps_<pid>_<ts>/ on hang

# VA-API hardware decode
vainfo
vainfo --display drm --device /dev/dri/renderD128

# DRM debug (heavy — use briefly)
sudo sh -c 'echo 0x19F > /sys/module/drm/parameters/debug'
sudo dmesg -w > /tmp/drm.log &
# capture, then:
sudo sh -c 'echo 0 > /sys/module/drm/parameters/debug'

# AMD power state
cat /sys/class/drm/card0/device/power_dpm_force_performance_level
echo high | sudo tee /sys/class/drm/card0/device/power_dpm_force_performance_level   # for stability test
```

## Mesa Environment Variables

| Var | Purpose | Example |
|-----|---------|---------|
| `MESA_LOADER_DRIVER_OVERRIDE` | Force driver | `radeonsi`, `iris`, `zink` |
| `MESA_GL_VERSION_OVERRIDE` | Lie to broken apps | `4.5` or `4.5COMPAT` |
| `AMD_VULKAN_ICD` | RADV vs AMDVLK | `RADV` |
| `RADV_DEBUG` | RADV debug | `hang,info,shaders,nocache` |
| `RADV_PERFTEST` | Experimental | `sam,nggc,cswave32` |
| `VK_ICD_FILENAMES` | Explicit ICD path | `/usr/share/vulkan/icd.d/radeon_icd.x86_64.json` |
| `LIBVA_DRIVER_NAME` | VA-API driver | `radeonsi` (AMD), `iHD` (Intel modern), `i965` (Intel legacy) |
| `VDPAU_DRIVER` | VDPAU driver | `radeonsi` |

## Hardware Video Acceleration

AMD:
- VA-API: `mesa-va-drivers` (provides `radeonsi_drv_video.so`)
- VDPAU: `mesa-vdpau-drivers`
- Set `LIBVA_DRIVER_NAME=radeonsi` if autodetect fails.

Intel:
- Gen 8+ modern: `intel-media-driver` → `LIBVA_DRIVER_NAME=iHD`
- Gen 6-9 legacy: `libva-intel-driver` → `LIBVA_DRIVER_NAME=i965`

Common VAAPI failure:

```
vainfo: failed with error code -1
```

```bash
ls -la /dev/dri/renderD128                          # check perms
sudo usermod -aG render,video $USER                 # then re-login
```

## Firmware Packages

| Pkg | Provides | Notes |
|-----|---------|-------|
| `linux-firmware` | amdgpu, GuC/HuC, Wi-Fi | Always update for RDNA3/4 |
| `linux-firmware-git` (AUR) | Bleeding-edge | Required for new RDNA4 cards at launch |
| `amd-ucode` | CPU microcode | Fix Zen 4/5 stability |
| `intel-ucode` | CPU microcode | Apply before debugging iGPU |

```bash
sudo dmesg | grep -iE "amdgpu.*firmware|direct fw load"
# good: "amdgpu: psp_v13_0: loaded firmware"
# bad: "amdgpu: Failed to load firmware"
```

## When to Cross-Reference

- Display server can't start: `wayland.md` / `x11.md`
- Game-specific Vulkan crashes: try `RADV_DEBUG=hang` capture, then check ProtonDB / GamingOnLinux for known regressions
- Hardware video decode broken in Firefox/Chromium: also check browser-side `media.ffmpeg.vaapi.enabled` and `MOZ_DISABLE_RDD_SANDBOX=1`
- Kernel suspect: `boot-systemd.md` for kernel rollback
