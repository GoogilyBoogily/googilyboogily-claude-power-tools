# linux-troubleshooter

Diagnostic skill for Linux desktop issues. Symptom-first router that escalates into per-subsystem reference playbooks.

## Coverage

- **GPU drivers**: Nvidia (proprietary + open kernel modules), Mesa (AMD radeonsi/RADV, Intel iris/anv/i915/xe)
- **Display servers**: Wayland (Mutter, KWin, Hyprland, Sway, wlroots), X11 (Xorg), XWayland, display managers
- **Audio**: PipeWire, PulseAudio legacy, Bluetooth (bluez), ALSA
- **Boot**: systemd, dracut/initramfs, GRUB, systemd-boot, Plymouth, emergency mode
- **Power**: suspend/resume, hibernate, s2idle vs deep
- **Network**: NetworkManager, systemd-resolved, iwd vs wpa_supplicant, VPN
- **Sandboxing**: Flatpak, Snap, AppImage portal/permission issues
- **Filesystems**: ext4, btrfs, xfs, zfs common breakages
- **Package managers**: apt, dnf, pacman, AUR

## Skill

- `debug-linux-desktop` — autonomous symptom-routed diagnostic playbook

## Install

```
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools
/plugin install linux-troubleshooter@googilyboogily-claude-power-tools
```
