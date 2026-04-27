# Boot, USB, & Licensing

Unraid boots from a FAT32 USB stick labeled `UNRAID`. The OS lives in compressed `bz*` files on the stick; everything is loaded into RAM at boot. The stick's hardware GUID is the license anchor — replace the stick, you replace your license binding.

## How Boot Works

```
BIOS/UEFI
  ↓
syslinux bootloader (/boot/syslinux/syslinux.cfg)
  ↓
Linux kernel (bzimage) + initrd (bzroot, bzmodules, bzfirmware)
  ↓
RAM-resident root filesystem
  ↓
mounts /boot (the USB) — read-only-ish; written only when configs change
  ↓
runs /etc/rc.d/rc.S → rc.M → rc.local
  ↓
emhttp daemon starts → loads plugins from /boot/config/plugins/
  ↓
WebGUI available
```

Critical files on the USB:

```
/boot/
  bzimage, bzroot, bzmodules, bzfirmware    ← OS payload
  syslinux/
    syslinux.cfg                             ← boot menu, kernel args
  config/                                    ← THE source of truth for everything
    super.dat                                ← array assignment binary
    disk.cfg, network.cfg, share.cfg, smb-extra.conf, ...
    shares/<name>.cfg                        ← per-share config
    plugins/<name>.plg                       ← persistent plugin manifests
    plugins/<name>/                          ← persistent plugin state
    plugins/dockerMan/templates-user/        ← Docker container templates
    docker.cfg                               ← Docker settings
    domain.cfg                               ← VM Manager settings
    go                                       ← user startup script (runs as root)
    ident.cfg                                ← server name, comment
    network-rules.cfg                        ← MAC↔interface mapping
  logs/                                      ← only if syslog mirroring is on
```

`/var/local/emhttp/super.dat` is the array's **runtime** state file (disk slot ↔ serial map). It's regenerated from `/boot/config/super.dat` at array start. Both should be backed up before risky operations.

## Quick Triage

```bash
# Boot sanity
df -h /boot                                 # USB still mounted
ls -la /boot/bzimage /boot/bzroot           # core files present
mount | grep /boot                          # should be /dev/sd?1 (or /dev/sd??1) on /boot vfat

# License
cat /boot/config/key/Pro.key 2>/dev/null | head -1   # or Plus.key, Trial.key
ls /boot/config/key/

# USB GUID
cat /sys/block/sd?/device/serial 2>/dev/null
# Or in GUI: Tools → Registration → shows USB Flash GUID

# syslinux config
cat /boot/syslinux/syslinux.cfg
```

## Symptom → Cause → Fix

### USB stick failing / read-only

`/boot` going read-only is the start of trouble — Unraid won't be able to write `super.dat` updates, plugin installs silently fail, and reboot will lose changes.

```bash
mount | grep /boot
# If it shows ro,relatime, the FS thinks it's read-only
dmesg | grep -iE 'sda|usb|vfat' | tail -30
# Check for "I/O error" or "remount-ro"
```

| Tell | Cause | Fix |
|------|-------|-----|
| Random read errors, "EIO" in dmesg | Cheap/dying USB stick | Back up `/boot/config/` immediately, replace stick, restore config. **Then** transfer license. |
| FAT32 corruption | Improper unmount | `umount /boot; fsck.vfat -a /dev/sdX1; mount /boot` (in safe mode or live USB; not while running). |
| Stick fine but USB controller flaky | Reseat, try USB 2.0 port (USB 3.0 has more issues with some cheap sticks) | Move to a USB 2.0 port. |
| Wrong drive label | Label must be `UNRAID` (uppercase) | `mlabel -i /dev/sdX1 ::UNRAID` (only when unmounted). |

**Always have a backup of `/boot/config/`.** Tools → Flash Backup writes a zip to local disk. Without a backup, USB failure means rebuilding from scratch (super.dat too — array slot map is gone).

### "Trial expired" / "Invalid Key" / license error after USB swap

The license is bound to the USB GUID. Steps to migrate:

1. Have `/boot/config/` backup of the old USB.
2. Image new USB with USB Flash Creator (downloads from `unraid.net/download`).
3. Boot from new USB to confirm it's good.
4. Power off, copy your `/boot/config/` backup over the new stick's `config/` (preserve the key directory: `/boot/config/key/`).
5. Boot Unraid, go to **Tools → Registration → Replace Key**. This emails Lime Tech a request to re-bind your license to the new GUID. Wait for the email response with a new key file.
6. Save the new key to `/boot/config/key/`.

Constraints:
- **First transfer is free, anytime.** Subsequent transfers: once per 12 months. If within 12 months, email `support@lime-technology.com` with both old and new GUIDs and a reason.
- The old USB is permanently blacklisted after the transfer.
- Counterfeit USB sticks (common on certain marketplaces) often share GUIDs across many physical sticks. They will register once and refuse to re-register. Buy from reputable sources (SanDisk Cruzer Fit / Ultra Fit, Kingston DT, etc.).
- Trial keys (free) work for 30 days, can be extended twice.

License tier (in `/boot/config/key/`):
- **Trial.key** — 30 days, full features
- **Basic.key** — 6 disks (legacy)
- **Plus.key** — 12 disks
- **Pro.key** — unlimited disks
- **Starter.key** / **Lifetime.key** — 7.0+ subscription model

### Boot hangs / never reaches WebGUI

Possible causes, in order of likelihood:

```bash
# Watch boot from console (HDMI plugged in)
# Or capture the syslog of the failed boot via syslog mirror to USB:
cat /boot/logs/syslog 2>/dev/null | tail -200
```

| Symptom | Cause | Fix |
|---------|-------|-----|
| Stuck at "Loading bzroot" | Bad USB read | Replace USB. |
| Kernel panic, "VFS: Unable to mount root" | Hardware change confused initramfs | Try Safe Mode boot menu entry. |
| Stuck at "Loading 64-bit kernel" forever | UEFI vs Legacy mismatch | Reflash USB; change BIOS boot mode. |
| Boots but no WebGUI | Network not up, or emhttp crashed | Check `cat /etc/rc.d/rc.local`; check `tail /var/log/syslog | grep -i emhttp`. |
| Boots straight to GUI mode unexpectedly | `kernel ...gui` argument added to syslinux.cfg | Edit `/boot/syslinux/syslinux.cfg`, remove `gui` from default APPEND line. |
| Boots but with no array | super.dat missing/corrupted | Check `/boot/config/super.dat` size; restore from flash backup if zero bytes. |

**Safe Mode**: `Unraid OS Safe Mode` in syslinux menu. Skips plugin loading. Use to isolate plugin-induced boot issues.

**Memtest86+**: Unraid bundles it on the USB. From syslinux menu pick `Memtest86+` to run against installed RAM. Critical when seeing call traces, parity errors, or BTRFS corruption.

### Settings don't persist after reboot

Either the USB is read-only (see above), or something is racing the write.

```bash
# Touch a file and check it survives reboot
echo "test-$(date +%s)" > /boot/test-persist.txt
reboot
# After reboot:
cat /boot/test-persist.txt
```

If the file vanishes, the USB write didn't commit. Causes:
- USB read-only (most common)
- Improper shutdown (use `powerdown` or GUI shutdown, not power button)
- A plugin that tries to write to `/boot` after rc.shutdown ran

### Internal boot? (Future Unraid)

Lime Tech announced internal boot support is on the 2026 roadmap (boot from a non-USB internal drive), but as of Unraid 7.3 RC it's **not** shipped. If a user thinks they need internal boot today, the answer is "still USB."

## Boot-Time Customizations

`/boot/config/go` runs as root before emhttp starts. Use for:
- modprobe blacklists (`modprobe -r mei_hdcp`)
- sysctl tweaks
- mount additional filesystems (`mount /dev/sde1 /mnt/extra`)
- start custom services

Example go-script additions:

```bash
# Disable a noisy module
echo "blacklist mei_hdcp" > /etc/modprobe.d/blacklist-mei.conf

# Increase network buffers for high-speed NIC
sysctl -w net.core.rmem_max=16777216
sysctl -w net.core.wmem_max=16777216

# Enable IOMMU passthrough mode for AMD
# (better done in syslinux.cfg with 'iommu=pt')
```

`/boot/syslinux/syslinux.cfg` controls kernel args. Common entries on the `APPEND` line:
- `intel_iommu=on` / `amd_iommu=on iommu=pt` — VFIO passthrough
- `vfio-pci.ids=10de:2204,10de:1aef` — pre-bind GPU
- `pcie_acs_override=downstream,multifunction` — split IOMMU groups (security tradeoff)
- `isolcpus=2-7` — reserve CPUs for VMs
- `nomodeset` — fallback if console video is broken
- `mem=16G` — cap RAM (rare; debugging only)

## Version-Specific Gotchas

- **7.0.0**: Memtest86 (BSD-licensed) replaced with Memtest86+ (GPL). Memory test interface changed. ReiserFS formatting disabled at this point.
- **7.0.0**: License model added Starter/Lifetime tiers; existing Basic/Plus/Pro keys still work.
- **7.1.0**: Wireless networking enabled — but USB+wireless interplay means recovery scenarios may now require both ethernet and a working wlan0 if user re-IPs.
- **7.2.0**: `http://localhost` requires authentication. Custom go-script `wget`s against the local GUI break unless given credentials.
- **7.2.0**: SSO login support; existing local accounts continue to work.
- **7.3.0**: Onboarding wizard (first-boot UX). TPM-based licensing groundwork. **Internal boot support shipped** (per 7.3.0 RC notes — confirm in stable release notes if user is on stable).

## When to Escalate

- WebGUI works but a specific page is broken → likely plugin-induced; `references/plugins-ca.md`
- USB physically OK but server hangs at parity → `references/array-storage.md`
- BIOS won't see USB → not Unraid; BIOS troubleshooting
- License email never arrives → `support@lime-technology.com` direct
