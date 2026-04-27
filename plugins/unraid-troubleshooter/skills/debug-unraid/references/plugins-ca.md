# Plugins & Community Applications (CA)

Unraid plugins are `.plg` XML files that act as install scripts. They live in `/boot/config/plugins/` (persistent) and re-extract to `/usr/local/emhttp/plugins/<name>/` (ephemeral) at every boot. Community Applications (CA) is itself a plugin — and the de facto app store for the platform, providing a search GUI for both plugins and Docker container templates.

## How Plugins Work

Boot sequence relevant to plugins:

1. Unraid loads its base OS into RAM from `bz*` files on `/boot`
2. emhttp starts, scans `/boot/config/plugins/*.plg`
3. For each `.plg`, emhttp parses the XML, runs `<FILE>` directives to download package(s), and `<INLINE>` shell scripts
4. Plugin runtime files (PHP for GUI pages, scripts) extract to `/usr/local/emhttp/plugins/<name>/`
5. Plugin install logs go to `/var/log/plugins/<name>.plg`
6. Persistent plugin config (settings, state) lives in `/boot/config/plugins/<name>/`

If the install fetch fails (no internet, dead URL, GitHub rate limit), plugins may silently skip with a stale runtime — sometimes hiding the problem until next reboot.

## Quick Triage

```bash
# Installed plugins (the .plg files are the source of truth)
ls -la /boot/config/plugins/

# Per-plugin install logs (errors during boot install)
ls /var/log/plugins/
tail /var/log/plugins/<name>.plg 2>/dev/null

# Runtime extraction (should mirror /boot/config/plugins/ minus the .plg files)
ls /usr/local/emhttp/plugins/

# CA-specific
ls /boot/config/plugins/community.applications/
ls /boot/config/plugins/dockerMan/templates-user/    # CA-installed Docker templates
```

## Symptom → Cause → Fix

### Plugin install fails

```bash
# What did it actually try?
cat /boot/config/plugins/<name>.plg | head -50
# Last error
tail -50 /var/log/plugins/<name>.plg
```

Common:

| Cause | Fix |
|-------|-----|
| Network down at install time | Check `ping 8.8.8.8` and DNS (`cat /etc/resolv.conf`). Retry: Plugins → Update or remove and reinstall. |
| Plugin URL 404 (repo moved/deleted) | Find new URL on Unraid forum thread; install from new URL |
| GitHub rate limited (>60 anon req/hr) | Wait 1 hour or set GitHub auth token in CA |
| `.plg` MD5/checksum mismatch | Author bumped version; remove old `.plg` and reinstall |
| Plugin's required Unraid version higher than yours | Check `<MIN_OS_VERSION>` in `.plg`; upgrade Unraid first |
| `.plg` requires a removed dependency (kernel module gone) | Plugin abandoned/incompatible; find replacement |

### Plugin GUI tab missing after install

Runtime didn't extract. Check `/usr/local/emhttp/plugins/<name>/`:
- Empty or missing → emhttp didn't run the install correctly. Reinstall, or reboot (forces re-install from `.plg`).
- Present but tab still missing → clear browser cache, hard refresh (Ctrl+Shift+R), check browser console for JS errors.

### Plugin auto-uninstalled after Unraid upgrade

Lime Tech ships an "incompatible plugin" purge on major upgrades. Known:

- **7.1.0**: Patch Plugin removed (no longer needed; superseded by built-in patching).
- **7.2.0**: Theme Engine, Dark Theme, Dynamix Date Time, and Flash Remount auto-uninstalled (functionality merged into built-in WebGUI / no longer compatible).

If a plugin was auto-uninstalled, look for a replacement on the forum; don't try to manually reinstall the old `.plg` against a newer kernel.

### Plugin breaks server boot / makes WebGUI unreachable

Boot into **Safe Mode** to bypass plugins:
- At Unraid syslinux boot menu, pick **Unraid OS Safe Mode**
- No `.plg` files are processed
- Confirms whether instability is plugin-caused

If safe mode works, the offender is a plugin. Disable systematically:

```bash
# From safe mode terminal
mkdir -p /boot/config/plugins-disabled
mv /boot/config/plugins/<suspect>.plg /boot/config/plugins-disabled/
rm -rf /boot/config/plugins/<suspect>/      # if persistent state is also broken
reboot
```

Add back one at a time until you find the culprit. The Realtek NIC driver plugin and old kernel-module plugins (Nvidia driver, ZFS old-style) are common offenders post-major-upgrade.

### Community Applications (CA) won't load / "Apps" tab broken

```bash
# CA install URL (current canonical)
# https://raw.githubusercontent.com/Squidly271/community.applications/master/plugins/community.applications.plg
# (or unraid/community.applications since the repo moved)

ls /boot/config/plugins/community.applications/
ls /boot/config/plugins/community.applications/appdata/
tail /var/log/plugins/community.applications.plg
```

Recovery:
- Plugins → Community Applications → click **Update** (forces re-fetch of appfeed JSON).
- If GUI is unusable: remove and reinstall via Plugins → Install Plugin URL.
- Check CA's appfeed cache freshness: `ls -la /boot/config/plugins/community.applications/appfeed.json` — should be hours old, not weeks.

### Docker container template lost after upgrade

CA stores user-customized Docker templates in `/boot/config/plugins/dockerMan/templates-user/`. After install, the template `.xml` lives there persistently. Upstream repository templates are fetched on demand.

```bash
ls /boot/config/plugins/dockerMan/templates-user/
ls /boot/config/plugins/dockerMan/templates/   # cached upstream
```

Recover from CA: **Apps → Previous Apps** shows previously-installed containers based on the `templates-user/` history. Click "Install" to re-add a container with prior config.

### Plugin update notifications stuck / wrong

CA polls plugin URLs for version bumps. If a plugin's version bump was bad and the user wants to pin:
- Edit `/boot/config/plugins/<name>.plg` to set `<VERSION>` to the desired version (or remove the bumped install marker).
- Check CA Settings → Plugin Update Notifications.

### Trusted plugin sources

Lime Tech does not formally vet community plugins. Trust signals:
- **Squidly271 / Andrew Z**: maintainer of CA, Fix Common Problems, User Scripts — high trust
- **dlandon**: Unassigned Devices, NerdPack legacy — high trust
- **ich777**: Nvidia/Intel driver plugins, Gaming-related — high trust
- **binhex / linuxserver.io**: Docker templates (not plugins, but high trust container source)
- **Lime Technology official**: Unraid Connect, signed plugins from `s3.amazonaws.com/dnld.lime-technology.com/`

Random forum-posted `.plg` URLs without forum thread or GitHub history → review the script before installing. A `.plg` is a shell script; it can run arbitrary commands as root.

## Useful Plugins Worth Recommending

These come up constantly in diagnostics:

| Plugin | Why |
|--------|-----|
| **Fix Common Problems** | Active syslog scanner, alerts on call traces, share misconfigs, almost-full pools, deprecated configs |
| **Unassigned Devices (+ Plus)** | Mount external drives, network shares, ISOs without putting them in the array |
| **CA Backup / Appdata Backup** | Snapshot appdata + flash + VM XML on schedule |
| **User Scripts** | Cron-style script runner with GUI logs |
| **Tips and Tweaks** | Common kernel param + sysctl knobs |
| **Open Files** | Lists processes holding mount points (great for "array won't stop") |
| **Parity Check Tuning** | Pause/resume parity checks, schedule by date, throttle |
| **Mover Tuner** | Conditional mover (only run if cache > X% full) |
| **GPU Statistics** | Monitor passthrough/host GPU |
| **CA Auto Update Applications** | Auto-update plugins/containers (use with caution — pin critical containers) |
| **Disk Spinup Group** | Group disks so they spin up together for batch reads |

## Version-Specific Gotchas

- **CA itself** has moved between forks (Squidly271 → unraid org). Both URLs work; the unraid-org one is canonical going forward.
- **Plugins relying on NerdPack** (legacy package manager) — NerdPack is unmaintained on 7.x. Use **NerdTools** (community fork) or install via `slackpkg`.
- **Plugin requires Nvidia driver** (e.g., GPU Statistics) — must match Unraid's kernel version. ich777's Nvidia plugin handles this; out-of-date plugin will fail post-upgrade.

## When to Escalate

- Plugin causes kernel call traces → `references/diagnostics-logs.md`
- Plugin breaks Docker → `references/docker-networking.md`
- Plugin breaks VM → `references/vm-passthrough.md`
- Compatibility unclear with current Unraid version → `references/release-notes.md` to fetch the version's notes
