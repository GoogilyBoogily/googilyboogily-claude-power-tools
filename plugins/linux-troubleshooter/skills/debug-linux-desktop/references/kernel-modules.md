# Kernel Modules & DKMS Troubleshooting

Out-of-tree drivers (`nvidia`, `vboxdrv`, `zfs`, `v4l2loopback`, `wireguard` on old kernels, custom Wi-Fi drivers) build via DKMS against each installed kernel. When DKMS fails, the next kernel boots without the module.

## Quick Triage

```bash
uname -r                                              # running kernel
dkms status                                           # DKMS-managed modules per kernel
ls /lib/modules/$(uname -r)/build                     # are headers installed for running kernel?
ls /lib/modules/$(uname -r)/extra/                    # built-by-DKMS modules live here
ls /lib/modules/$(uname -r)/updates/dkms/             # alternate DKMS path
modinfo <module>
lsmod | head
journalctl -k -b | grep -iE 'module|firmware|signature'
```

If `dkms status` shows `installed` for current kernel but `lsmod | grep <name>` is empty, the module exists but didn't load. Reasons: blacklist, signature rejection, conflicting in-tree driver.

## DKMS Core Commands

```bash
sudo dkms status
sudo dkms install <module>/<version> -k $(uname -r)
sudo dkms remove <module>/<version> -k $(uname -r)
sudo dkms autoinstall                                 # build all modules for all installed kernels
sudo dkms unbuild <module>/<version> -k <ver>         # remove built artifacts
```

After installing modules, refresh module dependencies:

```bash
sudo depmod -a
```

## Build Failures

### Kernel headers missing

```
Error! Your kernel headers for kernel <ver> cannot be found at /lib/modules/<ver>/build
```

Install the matching headers package:

| Distro | Package |
|--------|---------|
| Debian/Ubuntu | `linux-headers-$(uname -r)` (or `linux-headers-generic` meta) |
| Fedora | `kernel-devel-$(uname -r)` |
| Arch | `linux-headers` (or `linux-lts-headers` / `linux-zen-headers` matching your kernel pkg) |
| RHEL | `kernel-devel-$(uname -r)` |

After install:

```bash
sudo dkms autoinstall
```

### Compiler / API mismatch

A kernel update may break out-of-tree drivers if the upstream module hasn't released a patch yet. Symptoms: long compiler error wall during DKMS, ending with the module marked `failed`.

Read the build log:

```bash
sudo cat /var/lib/dkms/<module>/<version>/build/make.log
sudo cat /var/lib/dkms/<module>/<version>/<kernel-ver>/<arch>/log/make.log
```

Workarounds:
- Check upstream for a patched DKMS version.
- Pin to a previous kernel (`apt-mark hold linux-image-<ver>`, `dnf versionlock`, `IgnorePkg`) until the module catches up.
- Boot the previous kernel that still has the module built.

### gcc version mismatch

Kernel was compiled with gcc X, but distro now ships gcc Y for new builds — DKMS may complain:

```
warning: the compiler differs from the one used to build the kernel
```

Almost always benign. Hard-fail (`error:`) usually means CONFIG_RETPOLINE / mitigations support — install matching `gcc` version side-by-side and set `CC=gcc-<ver>`.

## Loading / Unloading Modules

```bash
sudo modprobe <name>
sudo modprobe -r <name>                               # remove (rmmod is lower-level)
sudo modprobe -v <name>                               # verbose: show dependency chain
modprobe -c | grep <name>                             # current options
```

Module won't unload because something is using it:

```bash
lsmod | grep <name>                                   # "Used by" column shows count
fuser -m <module-related-device>                      # what's holding it
```

For GPU modules, the X server / Wayland compositor / display manager all hold them. Unloading the GPU driver is rarely possible without dropping to multi-user.target:

```bash
sudo systemctl isolate multi-user.target
sudo modprobe -r nvidia_drm nvidia_modeset nvidia_uvm nvidia
```

## Blacklisting

```bash
# /etc/modprobe.d/blacklist-<name>.conf
blacklist <module>
install <module> /bin/false                          # stronger — even on-demand load fails
```

`blacklist` only stops auto-load; `install ... /bin/false` stops *any* attempt.

After editing blacklist, regen initramfs to take effect at boot:

```bash
sudo dracut -f                                       # Fedora/RHEL/Arch dracut
sudo mkinitcpio -P                                   # Arch mkinitcpio
sudo update-initramfs -u                             # Debian/Ubuntu
```

## Module Parameters

```bash
modinfo <name> | grep ^parm                          # what params are accepted
cat /sys/module/<name>/parameters/<param>            # current value
```

Set at load time — `/etc/modprobe.d/<name>.conf`:

```
options <name> <param>=<value>
```

Set at boot time via kernel cmdline:

```
<module>.<param>=<value>
```

## Secure Boot Module Signing

If Secure Boot is enabled (`mokutil --sb-state`), unsigned modules are refused.

```bash
dmesg | grep -i "module verification failed\|Lockdown"
```

See `nvidia.md` Secure Boot section for the full MOK enrollment + sign-file procedure. The same procedure works for any out-of-tree module.

Distros wrapping this:
- Ubuntu / Debian: `dkms` integrates with `update-secureboot-policy --enroll-key` if you ran the prompt during driver install.
- Fedora: akmods / kmod with optional MOK signing via `mokutil` + `pesign`.
- Arch: manual — no distro wrapper.

## In-Tree vs Out-of-Tree Conflict

Two drivers claiming the same hardware. Symptom: out-of-tree builds + installs, but `lsmod` shows the in-tree version.

```bash
lspci -k | grep -A3 <device>                         # which Kernel driver in use:
modinfo <in-tree-name>
```

Blacklist the in-tree driver, regen initramfs.

Common pairs:
- nouveau (in-tree) vs nvidia (proprietary) — see `nvidia.md`.
- radeon vs amdgpu — see `mesa.md`.
- i915 vs xe — see `mesa.md`.

## Firmware Loading Failures

Modules often need firmware blobs from `linux-firmware`.

```bash
dmesg | grep -i firmware | tail -20
ls /lib/firmware/<vendor>/                            # check the file is there
```

If firmware exists on disk but module reports "Direct firmware load failed":
- Wrong path expected by module — read kernel docs for that driver.
- Initramfs missing the firmware: distros now bundle firmware into initramfs for early-boot drivers (like microcode). Regen.
- Permissions wrong: firmware should be world-readable.

## Common Symptom Map

| Symptom | First check |
|---------|-----------|
| `nvidia-smi` works on kernel A, fails on kernel B | `dkms status` for kernel B; rebuild |
| VirtualBox `vboxdrv` won't load after kernel update | `sudo /sbin/vboxconfig` (or `dkms autoinstall`) |
| `wg-quick` says "module not found" | install `wireguard-tools` and ensure module shipped with kernel (built-in since 5.6) |
| ZFS pool won't import after kernel update | `zfs-dkms` not built for new kernel — boot previous |
| New laptop Wi-Fi not detected | check kernel version vs hardware support matrix; may need `linux-firmware-git` / backports kernel |
| Module loads but device not detected | `lspci -nn` to get vendor:device; check upstream driver supports that ID |
| "Operation not permitted" loading module | Secure Boot rejecting unsigned — sign via MOK |

## Useful Files

- `/lib/modules/<kver>/modules.order`
- `/lib/modules/<kver>/modules.dep`
- `/etc/modules-load.d/*.conf` — auto-load at boot
- `/etc/modprobe.d/*.conf` — options + blacklists
- `/var/lib/dkms/<module>/<version>/<kver>/<arch>/log/make.log` — DKMS build log

## Cross-Reference

- Nvidia / AMD / Intel module specifics: `nvidia.md`, `mesa.md`
- Boot fails because module not in initramfs: `boot-systemd.md`
- Module signed but Secure Boot still refuses: `nvidia.md` Secure Boot section
