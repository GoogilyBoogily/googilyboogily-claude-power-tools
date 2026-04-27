# Nvidia Driver Troubleshooting

Covers proprietary `nvidia` and open kernel module `nvidia-open` (driver 470 → 590 series). For Mesa/nouveau-only systems see `mesa.md`.

## Quick Triage

```bash
lsmod | grep nvidia                                  # modules loaded?
modinfo nvidia | grep ^version                       # which driver?
nvidia-smi                                           # exit 9 = driver not loaded
dmesg | grep -iE 'nvidia|NVRM|Xid'                  # kernel-side errors
cat /sys/module/nvidia_drm/parameters/modeset       # should be Y
cat /sys/module/nvidia_drm/parameters/fbdev         # should be Y on kernel 6.11+
dkms status                                         # build state
mokutil --sb-state                                  # Secure Boot on?
```

## Architecture vs Driver Series

| GPU family | Min driver | Notes |
|-----------|-----------|-------|
| Kepler (GTX 6xx/7xx) | 470xx legacy | EOL — no Wayland, dying support |
| Maxwell (GTX 9xx) | 470xx or 550xx | Proprietary only — `nvidia-open` does NOT support |
| Pascal (GTX 10xx) | 550xx series | Proprietary only — Arch dropped from main repo at 590 |
| Volta | 550xx | Proprietary only |
| Turing (RTX 20xx) and newer | 550+ | `nvidia-open` works |

`nvidia-open` (MIT/GPLv2 kernel modules) became default in driver 560+ and on Arch's main `nvidia`/`nvidia-dkms` packages at 590. Pre-Turing users who run `pacman -Syu` without reading the news boot to a blank TTY.

## Wayland Compatibility Timeline

| Driver | Status |
|-------|--------|
| 535 LTS | EGLStreams + GBM, frequent flicker |
| 550 | GBM default, EGLStreams deprecated |
| 555 | Explicit sync — fixes XWayland flicker on KDE/GNOME/Hyprland |
| 560 | Open modules default; `nvidia_drm.fbdev=1` becomes default |
| 570 | 32-bit GBM compat; HDMI VRR detection regression |
| 575+ | GLX front-buffer XWayland; `__NV_DISABLE_EXPLICIT_SYNC` extended; `conceal_vrr_caps` parameter |

Mandatory kernel parameters for Wayland on Nvidia:

```
nvidia_drm.modeset=1
nvidia_drm.fbdev=1
nvidia.NVreg_PreserveVideoMemoryAllocations=1
```

Add via GRUB (`/etc/default/grub` → `GRUB_CMDLINE_LINUX_DEFAULT`) or systemd-boot (`/boot/loader/entries/*.conf` → `options` line).

Mandatory initramfs modules (`/etc/mkinitcpio.conf` `MODULES=` line, or Dracut `force_drivers+=`):

```
nvidia nvidia_modeset nvidia_uvm nvidia_drm
```

Wayland env vars for wlroots compositors (Hyprland/sway). Set in `/etc/environment` or compositor config:

```
GBM_BACKEND=nvidia-drm
__GLX_VENDOR_LIBRARY_NAME=nvidia
LIBVA_DRIVER_NAME=nvidia
```

GNOME Mutter and KDE KWin auto-detect — these env vars aren't strictly needed.

## Symptom Playbook

### Black screen after kernel update

```bash
dmesg | grep -iE 'NVRM|RmInitAdapter|module version mismatch'
ls /lib/modules/$(uname -r)/build      # are headers present?
dkms status
```

Likely: kernel headers missing or DKMS rebuild failed.

Fix:
```bash
# Boot previous kernel from GRUB recovery menu first
sudo dkms autoinstall -k $(uname -r)
sudo mkinitcpio -P                     # Arch
sudo update-initramfs -u               # Debian/Ubuntu
sudo dracut -f                         # Fedora/RHEL
```

If kernel headers package not installed: install matching `linux-headers-$(uname -r)` (Debian/Ubuntu) or `linux-headers` matching kernel pkg (Arch — `linux`/`linux-lts`/`linux-zen` each has its own headers).

### `nvidia-smi` returns exit 9 / "no devices probed"

Module didn't bind. Causes:

- `nouveau` still claiming the card → blacklist:
  ```
  # /etc/modprobe.d/blacklist-nouveau.conf
  blacklist nouveau
  options nouveau modeset=0
  ```
  Then rebuild initramfs.
- Secure Boot rejecting unsigned module — see Secure Boot section below.
- BIOS has integrated GPU forced primary on hybrid systems → check BIOS for "discrete primary" or use `nvidia-prime` profile.

### Suspend → black screen on wake / kernel panic

Symptom dmesg: NULL pointer in `nvidia.ko` paths or "GPU has fallen off the bus" Xid 79 on resume.

```bash
systemctl status nvidia-suspend nvidia-resume nvidia-hibernate
cat /sys/power/mem_sleep                # which sleep state in use? [s2idle] vs deep
```

Fixes:
1. Enable Nvidia suspend services:
   ```bash
   sudo systemctl enable nvidia-suspend nvidia-resume nvidia-hibernate
   ```
2. Confirm `nvidia.NVreg_PreserveVideoMemoryAllocations=1` is on the kernel cmdline.
3. If hybrid Wayland + RTX laptop with multi-second black wake on s2idle, force `deep`:
   ```
   # add to kernel cmdline
   mem_sleep_default=deep
   ```
4. Open driver wake-from-suspend bug: switch to proprietary `nvidia` package.

Caveat: `NVreg_PreserveVideoMemoryAllocations=1` plus the systemd suspend services can break **hibernate** on some configs. If only suspend is needed, disable hibernate. If hibernate matters, test both states explicitly.

### Xorg (X11) screen tearing

`/etc/X11/xorg.conf.d/20-nvidia.conf`:

```
Section "Screen"
    Identifier "Screen0"
    Option "ForceFullCompositionPipeline" "on"
    Option "AllowGSYNCCompatible" "on"
EndSection
```

Or use a compositor with vsync (KWin, Mutter, Picom with `vsync = true`).

### Multi-monitor mixed refresh rate / monitor not detected at boot

Known driver bug: if one display is powered off at a different refresh rate, both are disabled at boot.

Workarounds:
- Use exact fractional refresh in compositor config (`144.00` not `144`)
- Power on all displays before boot
- Force a single refresh rate across displays

### VRR / G-Sync not working

```bash
cat /sys/class/drm/card*/card*-*/vrr_capable           # 1 = monitor supports
cat /sys/class/drm/card*/card*-*/vrr_enabled           # 1 = active
```

X11: requires single G-Sync monitor; multi-monitor VRR doesn't work.

Wayland: works on 545+ but unreliable in multi-monitor; KDE Plasma and Hyprland are best. HDMI VRR detection broken on driver 570 — upgrade to 575+ and try `conceal_vrr_caps` param.

### XWayland app flickering / tearing

Cause: explicit sync mismatch on driver < 555.

Fix: upgrade to 555+. Per-app workaround if upgrade impossible: `__NV_DISABLE_EXPLICIT_SYNC=1`.

### Hybrid graphics (Optimus / PRIME)

```bash
xrandr --listproviders                                 # provider 0 + 1?
__NV_PRIME_RENDER_OFFLOAD=1 __GLX_VENDOR_LIBRARY_NAME=nvidia glxinfo | grep -i vendor
prime-run glxinfo | grep -i vendor                     # if prime-run installed
```

`optimus-manager` is incompatible with Wayland — uninstall on Wayland systems. Use compositor-native GPU selection:
- Hyprland: `env = AQ_DRM_DEVICES,/dev/dri/card1:/dev/dri/card0`
- KDE: System Settings → Display → Per-app GPU offload (Plasma 6.x)
- GNOME: right-click app → "Launch using Discrete GPU"

RTD3 power management bug: GPU may not sleep after monitor hot-plug cycle (open kernel module, issue 759). Workaround: power-cycle suspend the laptop.

### CUDA fails but display works

Subsystems are independent. `nvidia-smi` shows max CUDA the driver supports — if your toolkit is newer, compute apps fail with display unaffected.

Container CUDA error 803 ("unsupported display driver / cuda driver combination"): host driver < container's bundled CUDA compat. Either upgrade host driver or set `LD_LIBRARY_PATH=/usr/lib/x86_64-linux-gnu` to force host libcuda.

### Xid error decoder

```bash
dmesg | grep -i "Xid"
```

Common Xid codes:
- **8**: ECC double-bit error (hardware)
- **13**: graphics engine exception (driver/app bug)
- **31**: display engine fault (often app bug, sometimes driver)
- **43**: reset channel (TDR) — GPU hang
- **45**: preempted timeout — long-running compute kernel
- **62**: internal microcontroller halt — bad driver state, reboot
- **79**: GPU has fallen off the bus — hardware fault, PCIe issue, power, or driver bug
- **94/95**: contained ECC errors (Hopper+)

Xid 79 is severe — recommend power-cycle, check PCIe seating, check PSU rails.

## Secure Boot

```bash
mokutil --sb-state                                     # is SB enforced?
dmesg | grep -i "module verification failed"
mokutil --list-enrolled                                # is your key in?
```

If module verification failed:

1. Generate MOK keypair (one time):
   ```bash
   sudo openssl req -new -x509 -newkey rsa:2048 -keyout /var/lib/shim-signed/mok/MOK.priv \
        -outform DER -out /var/lib/shim-signed/mok/MOK.der -nodes -days 36500 \
        -subj "/CN=Local Module Signing/"
   ```
2. Enroll on next boot:
   ```bash
   sudo mokutil --import /var/lib/shim-signed/mok/MOK.der
   # reboot, blue MOK Manager screen, choose Enroll MOK
   ```
3. Sign module:
   ```bash
   sudo /usr/src/linux-headers-$(uname -r)/scripts/sign-file sha256 \
        /var/lib/shim-signed/mok/MOK.priv /var/lib/shim-signed/mok/MOK.der \
        $(modinfo -n nvidia)
   ```
4. Verify: `modinfo nvidia | grep signer`.

For zstd-compressed modules (`.ko.zst`) decompress first or rely on distro auto-signing (recent Ubuntu/Fedora dkms wraps this).

Ubuntu specific: `sudo update-secureboot-policy --enroll-key` after kernel/driver updates.

## Distribution Quirks

| Distro | Issue | Fix |
|-------|-------|-----|
| Arch | 590+ drops Pascal/Maxwell from main repo | Install `nvidia-470xx-dkms` or `nvidia-550xx-dkms` from AUR |
| Arch | nouveau auto-loads after pacman update | `blacklist nouveau` in `/etc/modprobe.d/`, regen initramfs |
| Ubuntu | `ubuntu-drivers` lags by months on point releases | `sudo ubuntu-drivers install nvidia:570` explicit, or use `graphics-drivers` PPA |
| Ubuntu | Secure Boot key needs re-enroll post-kernel-update | `sudo update-secureboot-policy --enroll-key` |
| Fedora | New driver often broken 1-2 days post-release | RPM Fusion fixes fast; pin with `dnf versionlock` if needed |
| Fedora | 0% GPU usage despite install | `sudo akmods --force` to rebuild kmods |
| NixOS | `hardware.nvidia.open=true` breaks NVENC on some Turing GPUs | Set `hardware.nvidia.open = false` for affected cards |
| NixOS | `linuxPackages_latest` builds may fail | Pin to `linuxPackages` LTS |
| Pop!_OS | `system76-power` fights manual PRIME | Don't mix; use one or the other |

## Capture Bug Report

For escalation to Nvidia or distro forums:

```bash
sudo nvidia-bug-report.sh              # writes nvidia-bug-report.log.gz to cwd
```

Attach to forum post along with `dmesg`, kernel version, exact reproducer.

## When to Escalate

- Repeating Xid 79 → hardware (GPU, PSU, PCIe slot)
- Repeating Xid 8 → ECC failure → run hardware diagnostic
- `nvidia-bug-report` shows "GPU does not appear in lspci" → BIOS, PCIe, power
- Driver builds successfully but `modprobe nvidia` fails with "Operation not permitted" and Secure Boot is on → signing
