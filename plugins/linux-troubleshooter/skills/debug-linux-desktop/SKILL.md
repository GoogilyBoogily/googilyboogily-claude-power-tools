---
name: debug-linux-desktop
description: "Diagnose and fix Linux desktop issues — graphics drivers (Nvidia, AMD/Mesa, Intel), display servers (Wayland, X11, XWayland), audio (PipeWire, PulseAudio, Bluetooth), boot failures, systemd unit errors, suspend/hibernate, NetworkManager/Wi-Fi, kernel module problems, Flatpak/Snap sandbox breakage, and general desktop environment failures. Use this whenever the user reports ANY Linux desktop symptom — black screen, login loop, no audio, screen tearing, frozen cursor, GPU hangs, crashes after kernel update, broken external monitor, suspend doesn't work, app won't launch under Wayland, screen recording missing, Bluetooth pairing fails, or anything else where their Linux machine isn't behaving. Trigger even when the user just says 'my Linux is broken' or describes a vague desktop problem without naming the subsystem. Also use for proactive triage of dmesg/journalctl logs the user pastes, even if no explicit fix is requested."
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch
---

# Debug Linux Desktop

Symptom-first diagnostic playbook for Linux desktop systems. The user is in pain — be systematic, prove each hypothesis with a command, and don't guess.

## Operating Principles

1. **Prove before fixing.** Every hypothesis needs a confirming diagnostic command before you suggest a fix. Linux desktop issues are heavily multi-causal — a black screen could be GPU driver, display server, display manager, kernel module, or kmsfb fighting fbcon. Running `dmesg | tail -50` and `journalctl -b -p err` is almost always step one.

2. **Identify the environment first.** Fixes are distro-, init-, session-, and driver-specific. Before recommending anything, capture the baseline:

   ```bash
   . /etc/os-release && echo "$PRETTY_NAME" && uname -r
   echo "Session: ${XDG_SESSION_TYPE:-unset} / Desktop: ${XDG_CURRENT_DESKTOP:-unset}"
   loginctl show-session "$(loginctl | awk '/seat/{print $1; exit}')" -p Type -p Remote 2>/dev/null
   lspci -k | grep -EA3 'VGA|3D|Display'
   ```

3. **Don't reset the system without explicit user approval.** Reinstalling drivers, regenerating initramfs, or rebooting are user-confirmed actions. The user's CLAUDE.md is explicit on this.

4. **Read logs before reading forums.** `dmesg`, `journalctl`, `~/.local/share/xorg/Xorg.0.log`, `~/.cache/gdm/session.log` are authoritative. Forum posts may be outdated or distro-mismatched. If you do search the web (via WebSearch/WebFetch), prefer Arch wiki, Fedora docs, freedesktop.org, kernel.org bug tracker, and Phoronix over random Stack Overflow answers.

5. **Use sequential thinking on complex multi-symptom issues.** Multi-monitor + Nvidia + Wayland + suspend bug is a 4-axis problem. Externalize the reasoning.

## Step 0: Capture Context

Before suggesting anything, ask the user (or detect from terminal access) the answers to these. Don't loop more than once — make reasonable assumptions if the user is short on time.

| What | How |
|------|-----|
| Distro + version | `cat /etc/os-release` |
| Kernel | `uname -r` |
| GPU | `lspci -k \| grep -EA3 'VGA\|3D\|Display'` |
| Driver in use | check `Kernel driver in use:` line of above |
| Session type | `echo $XDG_SESSION_TYPE` (wayland or x11) |
| Desktop | `echo $XDG_CURRENT_DESKTOP` (GNOME, KDE, Hyprland, sway, etc.) |
| Display manager | `systemctl status display-manager` |
| Recent change | "What changed? kernel update? driver install? config edit?" |
| Reproducer | "Does it happen every boot? Only on resume? Only with X app?" |

The "what changed" question solves more cases than any log line. Linux desktop almost always breaks in response to a specific event.

## Step 1: Route by Symptom

Match the user's report to a row, then load the linked reference file with `Read`. The references contain detailed playbooks per subsystem.

| Symptom | Most likely subsystem | Reference |
|---------|----------------------|-----------|
| Black screen at boot, blank after BIOS, no TTY, kernel panic | Boot / kernel module / GPU | `references/boot-systemd.md` then `references/nvidia.md` or `references/mesa.md` |
| Black screen after login, but TTY (Ctrl+Alt+F2-F6) works | Display server / GPU driver | `references/wayland.md` and `references/x11.md` |
| Login loop (returns to display manager after entering password) | Session startup / GPU | `references/x11.md` (check `~/.xsession-errors`), `references/wayland.md` |
| Screen tearing, flickering, artifacts | GPU driver, compositor | `references/nvidia.md`, `references/mesa.md`, `references/wayland.md` |
| Suspend/resume hangs, wakes to black screen | Power mgmt + GPU | `references/suspend.md`, then GPU ref |
| Hibernate fails or doesn't restore | swap config + initramfs | `references/suspend.md`, `references/boot-systemd.md` |
| External monitor not detected, wrong refresh rate, HDR missing | KMS / driver / compositor | `references/wayland.md`, GPU ref |
| Fractional scaling blurry / broken | Compositor + toolkit | `references/wayland.md` (and Electron section) |
| No audio / mic not working | PipeWire / PulseAudio | `references/audio-pipewire.md` |
| Bluetooth won't pair, no audio over BT | bluez + audio stack | `references/audio-pipewire.md` (Bluetooth section) |
| Wi-Fi not connecting, DNS broken, VPN issues | NetworkManager + resolved | `references/network.md` |
| Boot stuck on Plymouth, "A start job is running" | systemd unit hang | `references/boot-systemd.md` |
| Emergency / recovery mode | initramfs / fstab / disk | `references/boot-systemd.md` |
| Flatpak app can't access files, GPU, fonts, mic | xdg-desktop-portal / sandbox | `references/sandbox-flatpak.md` |
| Snap app slow start / theme broken | Snap confinement | `references/sandbox-flatpak.md` |
| Screen recording / sharing missing or fails | xdg-desktop-portal-* + PipeWire | `references/wayland.md`, `references/sandbox-flatpak.md` |
| Game crashes / poor performance / Vulkan errors | Mesa / Nvidia / Proton | `references/mesa.md`, `references/nvidia.md` |
| Cursor freezes, input laggy, peripherals drop | libinput / kernel / DE | `references/wayland.md`, `references/x11.md` |
| Filesystem full / btrfs full despite df showing space / read-only root | filesystem | `references/filesystem.md` |
| Package manager broken, dependencies fail, partial upgrade | pkg manager | `references/package-manager.md` |
| Slow boot / system feels laggy after boot | systemd timing | `references/boot-systemd.md` |

If symptom doesn't match cleanly, gather more logs first:

```bash
journalctl -b -p err            # all errors this boot
journalctl -b -1 -p err         # all errors previous boot (if just rebooted)
dmesg -T --level=err,warn | tail -80
```

## Step 2: Apply the Reference Playbook

Each reference file uses the same structure:

- **Quick triage commands** — run these first to narrow the cause
- **Symptom → cause → fix** rows
- **Common gotchas** — distro/version-specific traps
- **When to escalate** — what to check next or which other reference to load

Read the relevant reference file in full before recommending fixes. Don't skim — these problems recur for narrow reasons and the wrong fix often masks the issue.

## Step 3: Verify the Fix

After applying any change, verify by running the diagnostic that proved the original cause. A "fix" without a re-verification command is a guess.

If the fix involves reboot or driver reload, set the user's expectation up front: "We need to reboot to verify. After reboot, run X to confirm."

## Step 4: Document the Fix Path

For non-obvious fixes (kernel parameter, module blacklist, custom systemd override, env var in `/etc/environment`), tell the user **where** the change lives so they can find it again or reverse it. Linux desktop fixes have a habit of being forgotten until the next kernel/driver update breaks them again.

## Cross-Cutting Diagnostics

These commands surface across many subsystems. When in doubt, run them:

```bash
# Hardware + kernel snapshot
inxi -Fxz                                # if installed; rich one-shot summary
lspci -k                                 # PCI devices + kernel drivers
lsmod | head -40                         # loaded kernel modules
dmesg -T --level=err,warn,crit | tail -100

# systemd state
systemctl --failed
systemd-analyze blame | head -20
systemd-analyze critical-chain
journalctl -b -p warning

# Session
loginctl
loginctl show-session "$(loginctl --no-legend | awk '{print $1; exit}')"
env | grep -E 'XDG|WAYLAND|DISPLAY|DESKTOP'

# Storage / RAM
df -h; df -i                             # disk + inode usage
free -h
```

## Anti-Patterns

Recognize and refuse these "fixes" — they're popular online but mask root causes or cause data loss:

- **`sudo dd` / `mkfs`** as a "fix" for anything other than the literal "I want to wipe this device" case. Confirm with the user before any block-device write.
- **`rm -rf ~/.config`** to "reset" a desktop. It nukes user state. Move to a backup directory instead.
- **Force-reinstalling Nvidia drivers** before checking which module is actually loaded (`lsmod | grep nvidia`) and why a regression occurred.
- **Disabling Wayland globally** to fix one app. The right fix is per-app (env var, `.desktop` override). Disabling Wayland regresses other capabilities (security, HDR, smooth fractional scaling).
- **Running `sudo pacman -Syyu` partial upgrade workaround** — "y y" forces refresh and on Arch a partial upgrade later breaks ABI. Always full upgrade or hold packages.
- **Adding `nomodeset` permanently** to GRUB. It's a temporary recovery tool, not a fix.
- **Editing /etc/X11/xorg.conf** when an Xorg.conf.d snippet would do the same job and won't conflict with the package manager.

## When to Escalate Beyond This Skill

- **Hardware failure suspected**: thermal shutdowns, ECC errors, repeating I/O errors on a specific block device, MCEs (`journalctl -k | grep -i mce`). Recommend memtest86+, smartctl long test, or vendor diagnostics. Don't try to fix software-side.
- **Filesystem corruption on root**: route to live USB. Don't attempt fsck on a mounted root.
- **Kernel bug confirmed**: capture `dmesg`, kernel version, reproducer; point user at the relevant kernel.org bug tracker or distro bugzilla. Don't carry custom kernel patches forward without warning.

## Reference Files

Loaded on-demand via `Read` from `${CLAUDE_SKILL_DIR}/references/`:

- `nvidia.md` — Nvidia proprietary + nvidia-open driver issues, Wayland status, kernel params, suspend, hybrid graphics
- `mesa.md` — AMD (radeonsi/RADV) and Intel (iris/anv/i915/xe) Mesa stack issues
- `wayland.md` — Wayland compositors, XWayland, fractional scaling, screen sharing, HDR/VRR
- `x11.md` — Xorg issues, display managers, login loops, input device hot-plug
- `audio-pipewire.md` — PipeWire, PulseAudio legacy, Bluetooth audio, codec issues
- `boot-systemd.md` — boot failures, initramfs, GRUB/systemd-boot, systemd unit debugging
- `suspend.md` — suspend/resume, hibernate, s2idle vs deep, GPU power state
- `network.md` — NetworkManager, systemd-resolved, iwd, Wi-Fi regulatory, VPN
- `filesystem.md` — ext4, btrfs, xfs, zfs common breakages, full disk, fsck
- `sandbox-flatpak.md` — Flatpak/Snap/AppImage sandbox + portal debugging
- `package-manager.md` — apt/dnf/pacman/AUR breakage recovery
- `kernel-modules.md` — DKMS, signing for Secure Boot, blacklisting, modprobe debugging

## Final Note to Self

Linux desktop debugging rewards humility. The same symptom (black screen, no audio) has dozens of causes across the stack. Resist the urge to recommend the most common fix without first proving it applies. The user's time spent running `dmesg | tail` is cheaper than the user's time spent recovering from an unnecessary `sudo apt purge nvidia-*`.
