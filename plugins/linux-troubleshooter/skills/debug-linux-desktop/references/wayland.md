# Wayland Troubleshooting

Covers GNOME Mutter, KDE KWin, Hyprland, Sway/wlroots, weston. For X11/Xorg see `x11.md`. For Nvidia-on-Wayland specifics see `nvidia.md`.

## Quick Triage

```bash
echo "type=$XDG_SESSION_TYPE display=$WAYLAND_DISPLAY desk=$XDG_CURRENT_DESKTOP"
loginctl show-session $(loginctl --no-legend | awk '{print $1; exit}') -p Type
wayland-info 2>/dev/null | head -40                  # protocol/compositor info
weston-info                                          # weston only
wlr-randr                                            # wlroots compositors
systemctl --user status xdg-desktop-portal*
systemctl --user status pipewire wireplumber
```

If `$XDG_SESSION_TYPE` says `tty` you're on a console — not in a graphical session at all.

If it says `x11` but you launched a Wayland compositor: display manager isn't passing env. Edit `/etc/gdm/custom.conf` (`WaylandEnable=true`), `/etc/sddm.conf.d/wayland.conf` (`DisplayServer=wayland`), or your DM config.

## Compositor Quick Map

| Compositor | Stack | Notes |
|-----------|-------|-------|
| GNOME / Mutter | gnome-shell | HDR experimental in 48+; auto-detects Nvidia |
| KDE / KWin | Plasma 6.x | Most mature HDR + fractional scaling; `kscreen-doctor` for outputs |
| Hyprland | wlroots-based | Fast-moving; tiling; `hyprctl` for inspection |
| Sway | wlroots | i3 clone; `swaymsg` for inspection |
| weston | reference compositor | Mostly for testing |
| Cosmic | iced/wgpu | Pop!_OS new desktop, separate from wlroots |

## Display Manager → Login Issues

```bash
journalctl -u display-manager -b -p err --no-pager | tail -50
journalctl -u gdm   -b --no-pager | tail -50         # GNOME
journalctl -u sddm  -b --no-pager | tail -50         # KDE
journalctl -u lightdm -b --no-pager | tail -50
```

Common loops:

- **GNOME login loop after entering password**: broken `~/.bash_profile` or missing `dbus-launch`. Test: switch to TTY, run `gnome-session --wayland` — read errors.
- **SDDM black after Hyprland logout**: known. Workaround: `systemctl restart sddm`. Better: configure UWSM with `hyprland-session.target`.
- **SDDM Wayland greeter blank with Nvidia**: edit `/etc/sddm.conf.d/10-wayland.conf` → `DisplayServer=x11` until Nvidia driver is sane on the SDDM Wayland greeter (or use the X11 greeter).
- **LightDM + Hyprland**: LightDM doesn't pass Wayland env. Switch DM to SDDM or GDM.
- **GDM + Nvidia**: ensure `nvidia-drm.modeset=1`. If GDM still uses X11 greeter despite `WaylandEnable=true`, edit `/etc/gdm/custom.conf` and remove `# WaylandEnable=false`.

## Screen Recording / Sharing (PipeWire Portal)

When OBS, Teams, Zoom, Discord show "no sources" or black screen:

```bash
systemctl --user status xdg-desktop-portal
systemctl --user status xdg-desktop-portal-gnome     # or -kde / -hyprland / -wlr
busctl --user list | grep portal
pw-cli ls Node | grep -i screen
```

Required backend per compositor:

| Compositor | Backend pkg |
|-----------|-------------|
| GNOME / Mutter | `xdg-desktop-portal-gnome` |
| KDE / KWin | `xdg-desktop-portal-kde` |
| Hyprland | `xdg-desktop-portal-hyprland` (also needs `slurp`) |
| Sway / wlroots | `xdg-desktop-portal-wlr` (needs `slurp` chooser) |
| weston | `xdg-desktop-portal-wlr` (manual config) |

Conflict: multiple backends installed. Force preference in `~/.config/xdg-desktop-portal/portals.conf`:

```ini
[preferred]
default=hyprland
org.freedesktop.impl.portal.ScreenCast=hyprland
org.freedesktop.impl.portal.FileChooser=gtk
```

Restart after edits:

```bash
systemctl --user restart xdg-desktop-portal xdg-desktop-portal-<backend>
```

## Fractional Scaling

Wayland uses `wp-fractional-scale-v1` protocol. Native-Wayland apps render at fractional scale crisp. XWayland apps render at integer then compositor downscales → blur.

| Surface | Status |
|---------|--------|
| GNOME | Settings → Displays → fractional checkbox; gaming on fractional broken (use integer for fullscreen games) |
| KDE | Most mature; per-output scale; XWayland still blurry at non-integer |
| Hyprland | `xwayland:force_zero_scaling = true` to push apps to render at 1.0 then set per-app `GDK_SCALE`/`QT_SCALE_FACTOR` |
| Sway | `output <name> scale 1.5` then `xwayland force_scale 1` |
| Firefox 146+ | Native fractional |
| Chromium 140+ | Native fractional |
| Electron < 38 | XWayland blur; force `--ozone-platform=wayland` if app supports |

XWayland sharpness fix (Hyprland example):

```
# hyprland.conf
xwayland {
  force_zero_scaling = true
}
```

Then per-app launcher:

```bash
GDK_SCALE=2 QT_SCALE_FACTOR=2 ./oldapp
```

## HDR (2025-2026 Status)

| Compositor | Status |
|-----------|--------|
| KWin (Plasma 6.x) | Production-ready; AMD works; Nvidia 560+ with explicit sync; enable in System Settings → Display → HDR |
| GNOME Mutter 48+ | Basic HDR experimental; no scRGB yet |
| Hyprland / Sway | `color-management-v1` merged in wlroots; compositor support varies |

```bash
kscreen-doctor --outputs | grep -i hdr               # KDE
gdctl show 2>/dev/null | grep -i hdr                 # GNOME 48+
ls /sys/class/drm/card*-*/hdr_output_metadata        # kernel level
```

## VRR / FreeSync / Adaptive Sync

Wayland advantages: multi-monitor VRR works (one non-VRR display attached doesn't disable VRR on the capable one).

```bash
cat /sys/class/drm/card*-*/vrr_capable
cat /sys/class/drm/card*-*/vrr_enabled
```

Enable per compositor:

- GNOME: `gsettings set org.gnome.mutter experimental-features "['variable-refresh-rate']"`
- KDE: System Settings → Display → Adaptive Sync → "Always" or "Automatic"
- Sway: `output <name> adaptive_sync on`
- Hyprland: `monitor=<name>,2560x1440@165,0x0,1,vrr,1`

Nvidia: see `nvidia.md` — multi-monitor VRR is unreliable on Nvidia even on Wayland.

## XWayland Specifics

```bash
xlsclients -display :0                              # lists XWayland clients
xprop -id $(xdotool getwindowfocus 2>/dev/null) | grep _NET_WM_PID
```

Clipboard: Wayland and XWayland have separate primary selections. Bridge with `wl-clipboard`:

```bash
sudo pacman -S wl-clipboard      # or apt/dnf
# bidirectional middle-click:
wl-paste --primary --watch wl-copy --primary &
```

For full bidirectional bridging on Hyprland use `xwaylandvideobridge` or `clipman` + `cliphist`.

## Position-aware / Global hotkey / Color picker breakage

Wayland security model blocks:
- Cross-app key snooping → `xdotool` is X11-only; use `ydotool` (uinput-based, needs `ydotoold` running).
- Absolute window positioning → tooltips, picker overlays.
- Cross-app screen reads → color pickers must use the portal.

Per-feature replacements:
- Color picker: `hyprpicker` (Hyprland), `kcolorchooser` (KDE), GNOME built-in.
- Global shortcuts: register via compositor (KWin shortcuts, Hyprland `bind=`) or via `org.freedesktop.portal.GlobalShortcuts` (KDE 5.27+).
- Game mouse grab: SDL needs `zwp_pointer_constraints_v1` support in compositor. Force XWayland fallback: `SDL_VIDEODRIVER=x11`.

## Remote Desktop

VNC servers (x11vnc, TigerVNC) cannot grab a Wayland compositor. Wayland-native remote:

- GNOME: built-in `gnome-remote-desktop` (Settings → Sharing)
- KDE: KRfb (Plasma 6) or `krdp`
- wlroots: `wayvnc`
- Generic RDP: `gnome-remote-desktop` does RDP since GNOME 46

## Electron / Chromium / Firefox

Detect mode of a running window:

```bash
xlsclients | grep -i <appname>                       # if listed → XWayland
```

Firefox: native Wayland since v121. Snap/Flatpak builds may still need `MOZ_ENABLE_WAYLAND=1` in `~/.profile`.

Chromium / Chrome: 140+ auto-detects Wayland. Older: `--ozone-platform=wayland --enable-features=WaylandWindowDecorations`. Persistent: `~/.config/chromium-flags.conf`.

Electron apps:
- Modern (38+): Wayland by default.
- VSCode: edit `~/.config/code-flags.conf`, add `--ozone-platform=wayland`.
- Discord/Slack: launcher flag or set `ELECTRON_OZONE_PLATFORM_HINT=wayland` (deprecated 38+ but still respected by older apps).

Electron 44 had a known broken-Wayland bug (issue 44607). Force XWayland fallback by removing the flag.

## Common Wayland-only Breakages

| Symptom | Fix |
|---------|-----|
| "App didn't appear after launch" (window placement) | Run under XWayland (`SDL_VIDEODRIVER=x11`, `QT_QPA_PLATFORM=xcb`) |
| Java/JetBrains UI broken | Set `_JAVA_AWT_WM_NONREPARENTING=1` and `AWT_TOOLKIT=MToolkit` (Java 8+ on Wayland uses XWayland) |
| Steam shows blank window | Force XWayland: edit `.desktop` → `Exec=env QT_QPA_PLATFORM=xcb steam` |
| OBS no game capture | Use `xdg-desktop-portal` capture mode, not legacy X11 capture |
| KWin "Compositing was suspended due to graphics reset" | GPU driver crash recovery — check dmesg, see GPU ref |

## When to Cross-Reference

- GPU driver suspect: `nvidia.md` or `mesa.md`
- Login can't even start the compositor: `x11.md` (DM logs, fallback strategies)
- Audio breaks on screen-share: `audio-pipewire.md` (PipeWire echo cancel + screen-share interaction)
- Flatpak app can't access PipeWire/portal: `sandbox-flatpak.md`
