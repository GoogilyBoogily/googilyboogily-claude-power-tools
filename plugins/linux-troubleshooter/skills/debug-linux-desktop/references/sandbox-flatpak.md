# Flatpak / Snap / AppImage Sandbox Troubleshooting

Sandboxed apps don't have full filesystem, GPU, or device access by default. Most "broken" sandbox apps are permission issues, not code bugs.

## Flatpak

### Quick Triage

```bash
flatpak --version
flatpak list
flatpak info <app-id>
flatpak info --show-permissions <app-id>
flatpak override --user --show
flatpak update
```

### Permission System

Flatpaks declare baseline permissions in their manifest. Users can tighten or loosen via overrides.

User override:

```bash
flatpak override --user --filesystem=/media <app-id>
flatpak override --user --filesystem=home:ro <app-id>          # read-only home
flatpak override --user --filesystem=~/Documents <app-id>
flatpak override --user --device=all <app-id>                  # webcams, GPUs, etc.
flatpak override --user --talk-name=org.freedesktop.secrets <app-id>
```

Reset overrides:

```bash
flatpak override --user --reset <app-id>
```

GUI alternative: install Flatseal (`com.github.tchx84.Flatseal`).

### Common Symptoms

#### Can't access files outside home / specific path

Cause: app declares `home` access only (or less); doesn't see `/media`, external mounts, etc.

Fix:

```bash
flatpak override --user --filesystem=/run/media <app-id>
# or for a mountpoint:
flatpak override --user --filesystem=/mnt
```

Better: prefer using xdg-desktop-portal file picker (the app calls into the portal which prompts the user; no broad filesystem grant required). If the app supports portal pickers, the right answer is upstream — not a wide override.

#### GPU not working in Flatpak (software rendering)

```bash
flatpak run --env=LIBGL_DEBUG=verbose --env=MESA_DEBUG=1 <app-id>
```

Look for missing DRI driver. Fix: install matching GL extension.

```bash
flatpak install flathub org.freedesktop.Platform.GL.default
flatpak install flathub org.freedesktop.Platform.GL.nvidia-<exact-version>
flatpak update
```

For Nvidia, Flatpak needs an extension matching the exact host driver version. The `flathub` repo auto-publishes these but lag a few hours behind upstream Nvidia releases.

#### Theme / icons / fonts wrong

```bash
flatpak install flathub org.gtk.Gtk3theme.<ThemeName>
flatpak install flathub org.kde.KStyle.Adwaita
flatpak override --user --filesystem=~/.local/share/fonts <app-id>
flatpak override --user --filesystem=~/.fonts <app-id>
flatpak override --user --filesystem=xdg-config/gtk-3.0:ro <app-id>
flatpak override --user --filesystem=xdg-config/gtk-4.0:ro <app-id>
```

#### Screen recording / audio share doesn't appear

The app must use the `org.freedesktop.portal.ScreenCast` portal, and the host must run a compatible portal backend. See `wayland.md` Screen Recording section.

#### Cannot connect to D-Bus (passwords, secrets, autostart)

```bash
flatpak override --user --talk-name=org.freedesktop.secrets <app-id>     # KWallet/keyring
flatpak override --user --talk-name=org.freedesktop.portal.Autostart <app-id>
```

#### Bubblewrap permission denied

```
bwrap: ... Permission denied
```

Cause: kernel hardening (`/proc/sys/kernel/unprivileged_userns_clone=0` on some distros) or AppArmor profile. Fix:

```bash
sudo sysctl -w kernel.unprivileged_userns_clone=1
# persist in /etc/sysctl.d/
```

On Ubuntu 24.04+ AppArmor restricts unprivileged user namespaces by default — distros usually ship a Flatpak profile, but custom builds break this.

### Diagnostic Run

```bash
flatpak run --command=sh <app-id>                        # shell inside sandbox
# from inside:
ls /                                                     # see sandbox filesystem
ls /run/host                                             # parts of host visible
env                                                      # what env did sandbox get
```

## Snap

```bash
snap list
snap info <pkg>
snap connections <pkg>
snap services
snap logs <pkg>
```

### Permission denied / interface not connected

Snaps declare interfaces (camera, audio, removable-media, etc.). User connects them.

```bash
snap connections <pkg>
```

Output shows which are connected; `-` means disconnected.

```bash
sudo snap connect <pkg>:removable-media :removable-media
sudo snap connect <pkg>:camera :camera
sudo snap connect <pkg>:audio-record :audio-record
```

### Cursor theme / font issues

Snaps run with bundled libraries; theme bridging is partial. KDE / GTK themes only via the snap-specific connection:

```bash
sudo snap connect <pkg>:gtk-2-themes gtk-common-themes:gtk-2-themes
sudo snap connect <pkg>:gtk-3-themes gtk-common-themes:gtk-3-themes
sudo snap connect <pkg>:icon-themes  gtk-common-themes:icon-themes
```

### Slow startup

Known Snap UX problem: cold start uncompresses squashfs. Common workarounds:
- Switch to Flatpak / native if available.
- Increase systemd `MountFlags=` if it conflicts with networked mounts.

### Snap blocking removable media access

After connecting `removable-media`, the path inside the snap is `/media/<user>/...`. Wayland portals don't help here — the override must be at the snap interface level.

## AppImage

No package manager, no sandbox by default. A self-extracting squashfs with a fuse mount.

### Won't run: "fuse: failed to exec fusermount"

Modern AppImages need `fuse2`/`libfuse2` and may not work with FUSE3-only systems.

Install `fuse2`:

```bash
# Debian/Ubuntu
sudo apt install libfuse2

# Fedora 38+
sudo dnf install fuse-libs

# Arch
sudo pacman -S fuse2
```

If FUSE2 isn't available (rare), extract and run:

```bash
chmod +x app.AppImage
./app.AppImage --appimage-extract
./squashfs-root/AppRun
```

Or env-var:

```bash
APPIMAGE_EXTRACT_AND_RUN=1 ./app.AppImage
```

### Sandboxing AppImages

AppImages aren't sandboxed by themselves. Tools to add sandboxing:

- `bubblewrap` directly (manual)
- `firejail` (declarative profiles)
- AppImageLauncher with optional firejail integration

Recommended for untrusted AppImages: a firejail profile or Flatpak alternative when available.

### AppImage update / signature

```bash
./app.AppImage --appimage-help
./app.AppImage --appimage-version
./app.AppImage --appimage-updateinformation
./AppImageUpdate <path>                                  # if AppImageUpdate installed
```

### Desktop integration

AppImages don't auto-add menu entries. Either run AppImageLauncher (which prompts on first launch) or write your own `.desktop` file in `~/.local/share/applications/`.

## Cross-Cutting: Portal Versions

xdg-desktop-portal version mismatch between sandbox app and host can cause:
- File picker blank / fails to open
- Color picker errors
- Print dialog blank

Confirm portal versions match host. Flatpak rebuilds happen via runtime updates:

```bash
flatpak update org.freedesktop.Platform//<version>
```

## Common Symptoms Map

| Symptom | First check |
|---------|-----------|
| Flatpak app shows "Could not save settings" | `--filesystem=xdg-config/<app>` override; or use portal-based settings |
| Snap can't read USB drive | `snap connections` → connect `removable-media` |
| AppImage refuses to launch | `libfuse2` installed? Try `--appimage-extract` |
| Flatpak app no GPU | install `org.freedesktop.Platform.GL.<driver>` extension |
| Sandboxed app no audio | host PipeWire OK? Then check `--socket=pipewire` already declared in manifest; `flatpak override --user --socket=pipewire` if missing |
| Sandboxed app can't access camera | Flatpak: `--device=all` override; Snap: connect `camera` interface |
| Hyprland/sway portal prompt never appears | `xdg-desktop-portal-hyprland` / `xdg-desktop-portal-wlr` not running — see `wayland.md` |

## Cross-Reference

- Portal not present at all: `wayland.md`
- Audio in sandbox needs PipeWire host running: `audio-pipewire.md`
- GPU extension version mismatch on Nvidia: `nvidia.md`
