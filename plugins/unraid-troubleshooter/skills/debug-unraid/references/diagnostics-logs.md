# Diagnostics, Syslog, & Log Interpretation

`/var/log/syslog` is RAM-resident. **It is gone after a reboot unless syslog mirroring is enabled.** This is the single most painful gotcha in Unraid troubleshooting — users reboot to "fix" a problem, lose the only evidence of what happened, then ask for help.

## Get Persistent Logs Going (do this BEFORE the next crash)

Settings → Syslog Server has three options worth turning on:

- **Mirror syslog to flash**: writes `/var/log/syslog` continuously to `/boot/logs/syslog`. Survives reboots. Mild flash wear (acceptable on a quality stick). On boot, the previous boot's log is rotated to `/boot/logs/syslog-previous`.
- **Local syslog server**: Unraid hosts a syslog daemon you can point other devices at.
- **Remote syslog server**: send to another box (Graylog, Synology, another Unraid, etc.) — recommended for production.

If the user is troubleshooting recurring crashes, **enabling flash mirror is step zero**.

## The `diagnostics` Bundle

Tools → Diagnostics (or `diagnostics` from CLI) writes `/boot/logs/<servername>-diagnostics-<date>.zip`. Anonymized by default (strips MAC addresses, public IPs, license key, server name unless overridden).

Bundle contents (rough map):

```
qemu/                       # libvirt VM XMLs
shares/                     # share configs
smart/                      # smartctl output per disk
system/                     # block devices, lspci, lsusb, lsmod, mounts
docker/                     # docker info, networks, container summary
network/                    # ifconfig, routes, iptables
logs/
  syslog                    # current syslog
  syslog.1                  # rotated
  diagnostics.txt           # the human-readable summary
plugins/                    # installed plugin list
boot/syslinux.cfg           # kernel args
config/                     # copies of /boot/config (sanitized)
```

When the user pastes a diagnostics zip, the priorities are usually:

1. `logs/syslog` — recent errors
2. `system/lspci.txt` + `system/lsmod.txt` — hardware + module sanity
3. `smart/` — disk health
4. `network/` — Docker/network configs (often where macvlan traces start)
5. `plugins.txt` — list of installed plugins (so you know what's been added)
6. `var/local/emhttp/var.ini` — array state

Don't read all the files; grep for what's relevant:

```bash
# After unzipping the diagnostics bundle:
grep -iE 'error|fail|warn|bug|trace|panic' logs/syslog | head -50
grep -iE 'reallocat|pending|crc' smart/*
cat system/var.ini | grep -E 'mdState|sbSynced|sbNumDisks|sbSyncErrs'
cat plugins.txt
```

## Reading `/var/log/syslog`

Unraid's syslog is a single file with rsyslog formatting. Useful patterns:

```bash
# Recent errors (last 200 lines)
grep -iE 'error|fail|warn|bug|trace|panic' /var/log/syslog | tail -50

# Filter by subsystem (Unraid-specific tags)
grep -E 'emhttp:|shfs:|kernel:|mdcmd:|libvirtd:|dockerd:' /var/log/syslog | tail -100

# Macvlan / network kernel BUGs
grep -iE 'macvlan|kernel BUG|soft lockup|RIP:' /var/log/syslog

# Disk/SATA errors
grep -iE 'ata[0-9]|exception emask|hard resetting|sense:|i/o error' /var/log/syslog

# OOM kills
grep -i 'killed process\|out of memory\|oom' /var/log/syslog

# Service starts/stops (boot timeline)
grep -E 'Starting|Stopping|started|exited' /var/log/syslog | head -100

# emhttp array events
grep emhttp /var/log/syslog | grep -iE 'array|disk|parity'

# Docker daemon
grep dockerd /var/log/syslog | tail -50

# Plugin install events
grep -i plugin /var/log/syslog | tail -30
```

## Reading `dmesg`

`dmesg` is the kernel ring buffer — boot-time and ongoing kernel messages. Persists across rsyslog config changes but is finite (rolls over).

```bash
# Timestamped, errors and warnings only
dmesg -T --level=err,warn,crit | tail -80

# Boot sequence
dmesg -T | head -100

# IOMMU groups
dmesg -T | grep -i iommu | head

# PCIe link errors (often hardware flakiness)
dmesg -T | grep -iE 'AER|PCIe|link state'

# Kernel BUG / call trace
dmesg -T | grep -A20 -iE 'kernel BUG|call trace|RIP:'
```

## Common Log Signatures

| Signature | Meaning | First action |
|-----------|---------|--------------|
| `kernel BUG at net/...macvlan...` | Macvlan-on-bridge bug | Switch to ipvlan or disable bridging on eth0 (`docker-networking.md`) |
| `Call Trace: ... __schedule ... iowait` | Process stuck in disk I/O | Bad disk or controller; check SMART (`array-storage.md`) |
| `ata[0-9]: SError: { ... } CRC` | SATA cable/controller | Replace cable, swap port |
| `BTRFS error (device dm-X): parent transid verify failed` | BTRFS metadata corruption | Scrub, then evaluate replace (`cache-pools.md`) |
| `ZFS: ... I/O failures - zpool status` | ZFS detected fault | `zpool status -v` |
| `OOM-Killer killed process` | Out of memory | Check Docker mem limits, leak in a container, or undersized RAM |
| `emhttp: shcmd ... cmd_status=99` | shfs failing — usually disk RO | Check the disk |
| `mdcmd: write_error: ... disk[N]` | Write failed; Unraid disabling disk | Cable/controller (`array-storage.md`) |
| `nginx: ... worker process exited` | WebGUI process crashed | Check disk space on `/boot`, restart nginx |
| `shutdown: ... unmounting disks` followed by long silence | Array stop hung | Process holding mount (`array-storage.md`) |
| `Realtek r8169 ... NIC Link is Down` | Realtek NIC dropping link | Common known issue; consider Intel NIC or Realtek driver plugin |
| `INFO: rcu_sched self-detected stall` | CPU stuck in kernel context | Often macvlan; sometimes broken module; check stack trace |

## "Fix Common Problems" Plugin (FCP)

Squidly271's plugin actively scans for problems and surfaces them in the WebGUI's notification area.

```bash
# Output cache
ls /tmp/fix.common.problems/ 2>/dev/null

# Run check from CLI
/usr/local/emhttp/plugins/fix.common.problems/scripts/check 2>&1 | tail -50
```

FCP catches things like:
- Call traces in syslog
- Plugins flagged as broken on current Unraid version
- Cache pool >90% full
- Docker `.img` close to full
- Disk SMART warnings
- Share with no allocated disks
- Plugins from blacklisted authors (rare)

If a user pastes "Fix Common Problems found these errors", route the specific warning to the right reference file. Typical mappings:

| FCP message | Reference |
|-------------|-----------|
| Call traces found | This file → trace section, then `docker-networking.md` |
| Macvlan / bridging issue | `docker-networking.md` |
| Disabled disk | `array-storage.md` |
| Cache filling | `cache-pools.md` |
| Plugin incompatible | `plugins-ca.md` |
| Share has no allocated disks | `shares-permissions.md` |

## Useful one-liners for the user

```bash
# What was Unraid doing just before the latest reboot? (requires syslog mirror)
grep -B5 'shutdown' /boot/logs/syslog-previous | tail -50

# Top 20 noisiest log lines (deduplicated)
awk -F': ' '{print $NF}' /var/log/syslog | sort | uniq -c | sort -rn | head -20

# Identify a specific block device's recent errors
dmesg -T | grep -i sdX

# Process memory usage right now
ps aux --sort=-%mem | head -15

# Disk I/O at the moment
iostat -xz 2 5    # if iostat is installed via NerdTools
# Or simpler:
iotop -bn 1 | head
```

## When to Reach for the Diagnostics Bundle

Always when:
- The issue isn't obvious from `/var/log/syslog | tail -100`
- Multiple subsystems may be involved
- The user wants to post on the forum (forum mods almost always ask for it)

Don't bother with the bundle when:
- The fix is clear from one log line
- The user already knows the root cause and just wants the fix command

## What to Tell the User if Logs Are Lost

"You rebooted before capturing the log, so the kernel/syslog evidence from the failure is gone. Before the next occurrence, enable Settings → Syslog Server → Mirror syslog to flash. Then if it crashes again, the log will survive the reboot in `/boot/logs/syslog-previous`."

## When to Escalate

- Hardware-specific kernel bug → Unraid forum bug-reports forum, with diagnostics zip
- Suspected RAM corruption → memtest86+ (boot menu)
- Network packet captures needed → `tcpdump -i any -w /boot/logs/capture.pcap` (size capped; don't leave running)
- Performance profiling → `perf top` (NerdTools), `iostat`, `sar`
