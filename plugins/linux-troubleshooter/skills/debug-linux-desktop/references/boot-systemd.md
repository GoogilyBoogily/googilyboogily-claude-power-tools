# Boot & systemd Troubleshooting

Covers GRUB, systemd-boot, dracut/mkinitcpio initramfs, emergency mode, Plymouth, and systemd unit debugging.

## Quick Triage

```bash
systemctl --failed
systemd-analyze blame | head -20
systemd-analyze critical-chain
journalctl -b -p err --no-pager | tail -80           # this boot
journalctl -b -1 -p err --no-pager | tail -80        # previous boot
journalctl -k -b | tail -80                          # kernel messages this boot
systemctl status
```

## Boot Phases

Knowing which phase is failing narrows the fix:

1. **Firmware (UEFI/BIOS)** → boot device, NVRAM entries.
2. **Bootloader (GRUB / systemd-boot / rEFInd)** → kernel selection.
3. **Kernel + initramfs** → root device discovery, decrypt, module load.
4. **systemd PID 1** → unit ordering, target reach.
5. **Display manager / user session** → see `x11.md`, `wayland.md`.

A black screen at phase 1-2 means firmware/bootloader. A panic in phase 3 means initramfs or kernel module. Drop to emergency at phase 4 means a unit or fstab issue.

## Emergency / Maintenance Mode

Triggered when systemd can't reach `local-fs.target` or `sysinit.target`.

From the emergency shell:

```bash
journalctl -xb -p err
cat /etc/fstab
blkid                                                # are UUIDs current?
mount -a 2>&1                                        # show what's failing
ls /dev/disk/by-uuid/
systemctl --failed
```

Most common cause: bad `/etc/fstab`. Disk UUID changed (replaced/cloned), or filesystem renamed. Edit fstab to match current `blkid`. Use `nofail` on non-critical mounts so a failure doesn't block boot:

```
UUID=xxxxx /data ext4 defaults,nofail,x-systemd.device-timeout=10s 0 2
```

Reload after editing fstab in a running system:

```bash
systemctl daemon-reload
```

## Dracut Emergency Shell

```
Warning: /dev/disk/by-uuid/<x> does not exist
Generating "/run/initramfs/rdsosreport.txt"
dracut:/#
```

The kernel cmdline `root=` doesn't match any device the initramfs can see.

From the dracut shell:

```bash
lsblk
ls /dev/disk/by-uuid/
ls /dev/mapper/                                      # LVM/LUKS?
```

If you see your root device but with a different UUID, fix `root=UUID=...` in the kernel cmdline (GRUB: press `e` at the menu to edit one-shot, then commit by editing `/etc/default/grub` after boot and running `grub-mkconfig`).

If LVM root and `vg-root` is missing: ensure `lvm` dracut module is in initramfs:

```
# /etc/dracut.conf.d/lvm.conf
add_dracutmodules+=" lvm "
```

Then `dracut --force` from a chroot.

For hibernate resume: `add_dracutmodules+=" resume "` and rebuild.

## Initramfs Regen

After kernel updates, driver installs, or `/etc/mkinitcpio.conf` / `/etc/dracut.conf` edits:

```bash
sudo dracut -f --regenerate-all                      # Fedora/RHEL/Arch with dracut
sudo mkinitcpio -P                                   # Arch with mkinitcpio
sudo update-initramfs -u -k all                      # Debian/Ubuntu
```

If the build fails, the error usually names a missing module or file. Don't reboot until rebuild succeeds.

## GRUB

Config sources:
- `/etc/default/grub` (high-level options)
- `/etc/grub.d/*` (programmatic generators)

After edits:

```bash
sudo grub-mkconfig -o /boot/grub/grub.cfg            # Arch / generic
sudo update-grub                                     # Debian/Ubuntu wrapper
sudo grub2-mkconfig -o /boot/grub2/grub.cfg          # Fedora/RHEL
```

### GRUB rescue prompt

```
grub rescue>
```

GRUB found a bootable disk but couldn't load its modules. From rescue:

```
ls                                                   # list partitions like (hd0,gpt2)
ls (hd0,gpt2)/                                       # find one with /grub or /boot/grub
set root=(hd0,gpt2)
set prefix=(hd0,gpt2)/boot/grub
insmod normal
normal
```

Once booted, reinstall GRUB from a working environment:

```bash
sudo grub-install /dev/sda                           # BIOS
sudo grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB
sudo grub-mkconfig -o /boot/grub/grub.cfg
```

### Edit kernel cmdline at boot (one-time)

At GRUB menu press `e`, find the `linux` line, append parameters (e.g., `nomodeset 3` to drop to multi-user text), Ctrl+X to boot.

`nomodeset` is for **diagnosis**, not a permanent fix.

## systemd-boot

UEFI-only, simpler than GRUB. Config files live on the ESP.

```bash
bootctl status                                       # health + entries
bootctl list
ls /boot/loader/entries/                             # *.conf per kernel
efibootmgr -v                                        # NVRAM entries
```

Each `.conf` is plain text:

```
title   Arch Linux
linux   /vmlinuz-linux
initrd  /amd-ucode.img
initrd  /initramfs-linux.img
options root=UUID=... rw nvidia_drm.modeset=1
```

Repair:

```bash
sudo bootctl install                                 # install loader to ESP
sudo bootctl update                                  # update loader binary after a systemd update
```

## /boot Full

```bash
df -h /boot
ls -lah /boot
```

Fix per distro:

- Debian/Ubuntu: `sudo apt autoremove --purge` → removes old kernel meta-pkgs.
- Fedora: `sudo dnf remove --oldinstallonly --setopt installonly_limit=2 kernel`.
- Arch: list `pacman -Q linux*`, manually remove old `linux-*` and `linux-headers-*` from another running kernel.

After freeing space, regenerate initramfs to ensure boot files are consistent.

## Plymouth Hang

Splash screen freezes; system seems hung but TTYs may work.

```bash
# At GRUB, press 'e' and add to kernel line:
plymouth.enable=0 systemd.show_status=true
# Boot, then check journalctl -b for what blocked
```

Permanent disable if not wanted:

```bash
sudo systemctl disable plymouth-start.service plymouth-quit-wait.service
```

## Slow Boot

```bash
systemd-analyze
systemd-analyze blame | head -20
systemd-analyze critical-chain
systemd-analyze critical-chain graphical.target
```

Common offenders:

- `NetworkManager-wait-online.service` — blocks until network up. Mask if not needed:
  ```bash
  sudo systemctl mask NetworkManager-wait-online.service
  ```
- `systemd-networkd-wait-online.service` — same.
- `plymouth-quit-wait.service` — fights compositor; mask if not using Plymouth.
- `apt-daily.service` / `apt-daily-upgrade.service` (Ubuntu) — disable timers to defer.
- User units stuck on `dbus-broker` waits — log out fully and back in.

## Failed Units

```bash
systemctl --failed
systemctl status <unit>                              # last exit code, journalctl tail
journalctl -u <unit> -b --no-pager
journalctl -u <unit> -b -1 --no-pager                # previous boot
```

Edit the unit non-destructively with a drop-in:

```bash
sudo systemctl edit <unit>
```

Creates `/etc/systemd/system/<unit>.d/override.conf`. Reset with `systemctl revert <unit>`.

## Masked Units (silent no-op)

```bash
systemctl list-units --state=masked
```

A masked unit looks "started" but does nothing. Unmask:

```bash
sudo systemctl unmask <unit>
sudo systemctl enable --now <unit>
```

## User vs System Unit Confusion

```bash
systemctl status <unit>                              # system
systemctl --user status <unit>                       # user session
journalctl --user -u <unit>
```

User units require an active user-session DBus. Headless / SSH may not have one — start with `loginctl enable-linger $USER` if you want user units to run without an active session.

## Common Disasters

| Symptom | Cause | Fix |
|---------|-------|-----|
| Boot hangs "A start job is running for /dev/disk/by-uuid/..." 90s+ | fstab UUID stale / device gone | Edit fstab, add `nofail` |
| Hangs at "Reached target Multi-User System" forever | stuck user unit, dbus deadlock | TTY login, `systemctl --user --failed` |
| Boot loops between GRUB and login screen | GPU driver crash, see Xorg/journal | `nomodeset` to diagnose, then GPU ref |
| `Failed to start Switch Root` | missing init binary, fs not mountable | initramfs mismatch — regen or boot older kernel |
| Kernel panic on boot, "VFS: Unable to mount root" | wrong `root=` or missing fs module in initramfs | regen initramfs with required modules |

## Recovery Toolkit

If you can't boot at all:
1. Boot a live USB matching distro (or any modern live USB).
2. Mount root: `sudo mount /dev/sdaX /mnt`. For LVM: `vgchange -ay` first. For LUKS: `cryptsetup luksOpen` first.
3. Mount additional: `for m in dev proc sys run; do sudo mount --bind /$m /mnt/$m; done`.
4. `sudo chroot /mnt` (or `arch-chroot /mnt` on Arch live).
5. Fix from inside, regenerate initramfs, reinstall bootloader if needed.
6. Exit, unmount, reboot.

## Cross-Reference

- Kernel module won't load: `kernel-modules.md`
- Disk full at root: `filesystem.md`
- Suspend resume failure: `suspend.md`
- Display manager won't bring up session: `x11.md`, `wayland.md`
