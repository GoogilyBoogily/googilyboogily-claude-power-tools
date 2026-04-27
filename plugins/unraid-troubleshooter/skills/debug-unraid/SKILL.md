---
name: debug-unraid
description: "Diagnose and fix Unraid (Lime Technology NAS OS) issues — array start/stop hangs, parity errors, disabled or emulated disks (red ball/red X), New Config and trust-parity, Docker macvlan/ipvlan call traces and custom networks, VM problems (KVM, libvirt, QEMU), GPU/USB/PCIe passthrough (IOMMU groups, VFIO, ACS override), BTRFS scrub/balance and ZFS pool degraded/corruption, mover and share allocation policies (high-water/most-free/fill-up), user shares vs disk shares, /mnt/user vs /mnt/cache vs /mnt/disk*, SMB/NFS permissions and newperms, Community Applications (CA) plugin and .plg install, /boot/config persistence, USB boot and GUID/license issues, syslog and diagnostics bundle interpretation, Fix Common Problems plugin, and version-aware release-notes lookup against docs.unraid.net. Use this whenever the user mentions Unraid, unRAID, Lime Tech NAS, or describes any symptom on an Unraid box — array won't stop, won't start, disk dropped, parity sync errors, container has no network, VM black screen, cache pool BTRFS/ZFS errors, shares missing, SMB auth fails, plugin won't install, upgrade broke X, syslog full of call traces, paste of diagnostics zip contents, or vague 'my Unraid is broken'. Trigger even if user names only a subsystem (Docker on Unraid, ZFS on Unraid, KVM on Unraid) since Unraid's defaults differ from generic Linux. Also use proactively when the user pastes /var/log/syslog excerpts, dmesg, or 'Fix Common Problems' notifications from an Unraid host."
disable-model-invocation: false
allowed-tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch
---

# Debug Unraid

Symptom-first diagnostic playbook for Unraid (Lime Technology NAS OS). Unraid is **not generic Linux** — it boots from USB, configs live on `/boot/config/` and regenerate every boot, and its array model (parity-protected JBOD with separate cache pools) breaks most generic-Linux assumptions. Diagnose with that model in mind.

## Operating Principles

1. **Prove before fixing.** Every hypothesis needs a confirming command. Unraid issues are often misattributed (a "disk failed" is usually a cable/controller fault; "array won't stop" is almost always docker/NFS/VM holding a mount). Run `diagnostics` (or read `/var/log/syslog`) **first**, theorize **second**.

2. **Identify the version first.** Unraid 6.12 → 7.x changed kernel, added ZFS as a first-class file system, reworked Docker network handling, and removed ReiserFS. Version-specific bugs are real: the 7.1.0 ZFS-loopback hang, the 6.12.x macvlan call traces, the 7.0.0 NVMe ZFS suspension. Always capture version before recommending a fix:

   ```bash
   cat /etc/unraid-version          # e.g. version="7.2.5"
   uname -r                         # kernel
   ```

   When unsure of a version's known issues, fetch the release notes (Step 5 below).

3. **Never propose destructive fixes without explicit confirmation.** "New Config", "format disk", "rebuild parity onto a wrong disk", `zpool destroy`, `mkfs`, removing a disk from the array — these can lose data permanently on a parity-protected array. State the risk; wait for the user.

4. **Read syslog before reading forums.** `/var/log/syslog`, `dmesg`, the diagnostics zip, and the GUI's Tools → System Log are authoritative. The forum is a great hint source but full of stale fixes for older versions. Match forum advice to the user's version before applying.

5. **Use sequential thinking for multi-axis bugs.** "Array won't stop + macvlan trace + VM crashed + cache BTRFS errors" is one root cause (often a flaky NVMe, or a kernel regression) with four downstream symptoms. Externalize the reasoning.

## Step 0: Capture Context

Before suggesting anything, ask the user (or have them run) these. Make reasonable assumptions if they're short on time, but don't skip the version.

| What | How |
|------|-----|
| Unraid version | `cat /etc/unraid-version` |
| Kernel | `uname -r` |
| Hardware summary | `lscpu \| head -10`, `free -h`, `lspci -k` |
| Array state | `mdcmd status \| head -30` |
| Pools | `zpool status; btrfs fi show 2>/dev/null` |
| Docker | `docker ps -a; docker network ls` |
| VMs | `virsh list --all` |
| Recent change | "What changed? upgrade? plugin install? new disk? BIOS update?" |
| Reproducer | "Every boot? Only on array stop? Only with VM running?" |
| Diagnostics zip | `diagnostics` (writes to `/boot/logs/<servername>-diagnostics-<date>.zip`); ask user to attach or extract relevant files |

The "what changed" question solves more cases than any log line. Unraid almost always breaks in response to a specific event — kernel upgrade, plugin install, new disk, BIOS change, docker template update.

## Step 1: Route by Symptom

Match the user's report to a row, then load the linked reference file with `Read`. The references contain detailed playbooks per subsystem.

| Symptom | Most likely subsystem | Reference |
|---------|----------------------|-----------|
| Array won't stop, "Retry unmounting disk share(s)" | Docker / NFS / VM holding mount | `references/array-storage.md` |
| Array won't start, missing disk, wrong slot | Array config, slot mapping | `references/array-storage.md` |
| Disabled disk (red ball / red X), contents emulated | SATA/SAS controller, cable, power | `references/array-storage.md` |
| Parity sync errors after reboot, drive came back | Parity validity, write-cache, unclean shutdown | `references/array-storage.md` |
| Need to swap disks, replace failed disk, expand array | Replace/rebuild procedure | `references/array-storage.md` |
| Container has no network / wrong IP / can't reach LAN | Docker custom network (macvlan vs ipvlan), br0 | `references/docker-networking.md` |
| Macvlan call traces in syslog (kernel BUG, soft lockup) | Docker macvlan on br0 | `references/docker-networking.md` |
| Container can ping LAN but not host (or vice versa) | Macvlan host isolation, host access toggle | `references/docker-networking.md` |
| Port forward broken with ipvlan + Fritzbox/Ubiquiti | ipvlan limitations | `references/docker-networking.md` |
| Container won't start after upgrade, bad image | Docker template / dockerMan | `references/docker-networking.md` |
| VM won't start, libvirt error, qcow2 issue | libvirt / qemu | `references/vm-passthrough.md` |
| GPU passthrough black screen, code 43, host loses display | VFIO bind, IOMMU group, vbios | `references/vm-passthrough.md` |
| "Multifunction" devices in same IOMMU group | ACS override, BIOS IOMMU setting | `references/vm-passthrough.md` |
| USB controller passthrough not isolating | IOMMU group, hardware ACS | `references/vm-passthrough.md` |
| BTRFS cache pool errors / read-only / scrub finds errors | BTRFS health | `references/cache-pools.md` |
| ZFS pool DEGRADED, FAULTED, data corruption | zpool status | `references/cache-pools.md` |
| Cache pool full, mover not running, share fills array | Mover, allocation, share settings | `references/cache-pools.md` |
| Share missing, share not visible over SMB, "(unprotected)" warning | Share config, allocation, visibility | `references/shares-permissions.md` |
| SMB auth fails, can't write, permission denied | newperms, SMB user, share security mode | `references/shares-permissions.md` |
| NFS export not working, stale handles | NFS settings, fsid, /etc/exports | `references/shares-permissions.md` |
| /mnt/user vs /mnt/cache confusion, double-counted disk usage | shfs / FUSE union | `references/shares-permissions.md` |
| Plugin won't install, errors during install | .plg URL, /boot/config/plugins, dependencies | `references/plugins-ca.md` |
| Community Applications missing / not loading | CA plugin, app feed, dockerMan templates | `references/plugins-ca.md` |
| Plugin breaks on upgrade (Unraid version bump) | Version compatibility, plg pinning | `references/plugins-ca.md` |
| Boot USB GUID change, license invalid | Trial/Plus/Pro license tied to USB GUID | `references/boot-license.md` |
| Server boots to GUI mode unexpectedly, syslinux | syslinux.cfg, boot mode | `references/boot-license.md` |
| Settings missing after reboot ("nothing persists") | /boot/config write failure, USB read-only | `references/boot-license.md` |
| Need to read syslog / diagnostics zip / dmesg | Log interpretation | `references/diagnostics-logs.md` |
| "Fix Common Problems" plugin warnings | FCP triage | `references/diagnostics-logs.md` |
| Network bond down, eth0 missing, VLAN issue | Network config | `references/network.md` |
| Custom network not reaching DHCP / wrong VLAN | bonding/bridging settings | `references/network.md` |
| Wonder if a known bug applies to user's version | Release notes lookup | `references/release-notes.md` |
| User reports symptom that started after upgrade | Release notes diff | `references/release-notes.md` |

If the symptom doesn't match cleanly, gather more logs first:

```bash
# Last boot's errors
grep -iE 'error|fail|warn|bug|trace|panic' /var/log/syslog | tail -100
dmesg -T --level=err,warn,crit | tail -80

# Persistent syslog (if user enabled syslog mirror to USB — Settings → Syslog Server)
ls -la /boot/logs/ 2>/dev/null

# Full diagnostics
diagnostics
ls -la /boot/logs/*-diagnostics-*.zip 2>/dev/null
```

Persistent syslog mirror is only enabled if the user turned it on. If they didn't and the box just rebooted, the pre-reboot logs are gone — recommend enabling **Settings → Syslog Server → Mirror syslog to flash** for next time.

## Step 2: Apply the Reference Playbook

Each reference file uses the same structure:

- **Quick triage commands** — run first to narrow the cause
- **Symptom → cause → fix** rows
- **Version-specific gotchas** — which Unraid versions had this bug
- **When to escalate** — what to load next

Read the relevant reference in full before recommending fixes. Don't skim — Unraid problems recur for narrow reasons and the wrong fix often makes things worse (e.g., running parity sync against a freshly disabled disk corrupts the emulated data permanently).

## Step 3: Verify the Fix

After applying any change, verify by re-running the diagnostic that proved the original cause. A "fix" without re-verification is a guess.

For changes that need an array stop/start or reboot, set expectations clearly:
- "Stop the array, change setting X, start array, then run command Y to confirm."
- "Reboot is required because /etc/modprobe.d edits load at boot."

## Step 4: Document Where the Fix Lives

Unraid configs go to non-obvious places. When the fix involves any of these, **tell the user the file path** so they can find or reverse it later:

| Type of fix | File on /boot |
|-------------|---------------|
| Kernel boot args (ACS override, intel_iommu, vfio-pci.ids) | `/boot/syslinux/syslinux.cfg` |
| Docker custom network type, host access | `/boot/config/docker.cfg` |
| Share settings, allocation, exports | `/boot/config/shares/<name>.cfg` |
| Plugin install state | `/boot/config/plugins/` |
| Custom go-script (modprobe blacklists, sysctl, cron) | `/boot/config/go` |
| Disk assignments, super.dat | `/boot/config/super.dat` (binary — back up before edits) |
| User shares config | `/boot/config/shares/` |
| Network config | `/boot/config/network.cfg`, `/boot/config/network-rules.cfg` |

## Step 5: Version-Aware Release Notes Lookup

When the user reports a symptom that may be a known bug, fetch the release notes for their version. Pattern:

```
https://docs.unraid.net/unraid-os/release-notes/<version>/
```

Examples:
- `https://docs.unraid.net/unraid-os/release-notes/7.3.0/`
- `https://docs.unraid.net/unraid-os/release-notes/7.2.5/`
- `https://docs.unraid.net/unraid-os/release-notes/7.1.4/`
- `https://docs.unraid.net/unraid-os/release-notes/7.0.1/`
- `https://docs.unraid.net/unraid-os/release-notes/6.12.15/`

Each page has consistent sections: **Upgrade notes**, **Known issues**, **Rolling back**, **Changes vs. previous version**, **Patches**, kernel/package version table. Use `WebFetch` and ask for the **Known issues** and **Changes** sections. If a user reports a symptom that matches a known issue verbatim, prioritize the official workaround.

If the user is on a release candidate (e.g., `7.3.0-rc.1`), explicitly note that RC software has a "rolling back" hard requirement (often: cannot revert across certain RC boundaries without flash restore).

See `references/release-notes.md` for the full version timeline, breaking changes, and which versions to recommend / avoid.

## Cross-Cutting Diagnostics

These commands surface across many subsystems. When in doubt, run them:

```bash
# Unraid + kernel snapshot
cat /etc/unraid-version
uname -r
uptime

# Array
mdcmd status | head -40

# Storage health
zpool status                              # if any ZFS pools
btrfs fi show; btrfs fi df /mnt/cache 2>/dev/null
for d in /dev/sd? /dev/nvme?n?; do echo "=== $d ==="; smartctl -H "$d" 2>/dev/null | tail -5; done

# Mounts
mount | grep -E '/mnt/(user|cache|disk|remotes)'
df -h | grep -E '/mnt|/boot'

# Docker
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
docker network ls
ip -br addr

# VMs
virsh list --all
lsmod | grep -E 'vfio|kvm'

# Processes pinning mounts (when array won't stop)
lsof +D /mnt/user 2>/dev/null | head
lsof +D /mnt/cache 2>/dev/null | head
fuser -mv /mnt/user 2>/dev/null

# Syslog tail
tail -200 /var/log/syslog
dmesg -T --level=err,warn | tail -60

# Plugins
ls /boot/config/plugins/
ls /var/log/plugins/ 2>/dev/null

# Fix Common Problems plugin output (if installed)
ls /tmp/fix.common.problems/ 2>/dev/null
```

## Operating-System Boundaries

This skill is for **Unraid OS itself** and the things Unraid's GUI manages: array, parity, shares, Docker (Unraid-native), VMs (libvirt), plugins, Community Apps, boot USB.

Route to other skills for:
- **Generic Linux desktop** issues on a non-Unraid Linux machine → `linux-troubleshooter` plugin
- **Inside-container app issues** (the app's own logs, not Docker networking) → app-specific debugging
- **Docker fundamentals on non-Unraid hosts** → `devops-agents` `docker-expert`
- **Postgres/MySQL/Mongo running in a container** → `database-agents` plugin
- **Filesystem-level XFS/BTRFS/ZFS theory beyond Unraid use** → `database-expert` or general systems

If the user is on TrueNAS, OpenMediaVault, Proxmox, or vanilla Debian — this skill does **not** apply. Say so and stop.
