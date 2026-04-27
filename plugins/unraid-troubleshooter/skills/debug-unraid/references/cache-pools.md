# Cache Pools, Mover, & Allocation

Unraid pools are storage outside the parity-protected array. Common roles: appdata, VM disks, downloads cache. Filesystems: BTRFS (legacy default), ZFS (since 6.12), XFS (single-disk pools). The **mover** moves files between cache and array based on share-level rules. Most "cache full" complaints are misconfigured allocation, not actual disk fullness.

## Quick Triage

```bash
# What pools exist
btrfs fi show 2>/dev/null
zpool status
ls /mnt/                        # cache, cache_nvme, etc.

# Capacity
btrfs fi df /mnt/cache 2>/dev/null
zfs list 2>/dev/null
df -h /mnt/cache* 2>/dev/null

# Mover state
ps -ef | grep mover
tail /var/log/mover.log 2>/dev/null

# Smart of pool members
for d in $(zpool status | awk '/ONLINE|DEGRADED|FAULTED/{print $1}' | grep -E '^[a-z]'); do
  smartctl -H "/dev/$d" 2>/dev/null | grep 'overall'
done
```

## BTRFS Cache Pool

### Errors / read-only / "parent transid verify failed"

BTRFS detected metadata corruption. The pool is now read-only (or remounting RO on next access).

```bash
btrfs dev stats /mnt/cache
dmesg | grep -i btrfs | tail -30
```

Recovery ladder (try in order, each step has higher data-loss risk):

1. **Scrub** (read-only check, repairs from RAID1/10 redundancy if possible):

   ```bash
   btrfs scrub start /mnt/cache
   btrfs scrub status /mnt/cache    # poll; can take hours
   ```

2. **Balance** (rebalances chunks, sometimes fixes metadata):

   ```bash
   btrfs balance start -dusage=50 -musage=50 /mnt/cache
   btrfs balance status /mnt/cache
   ```

   For a fully degraded pool, full balance: `btrfs balance start --full-balance /mnt/cache` — slow.

3. **Remount degraded** (if a member disk is missing/dead):

   ```bash
   # In Unraid, stop array first. Then in CLI:
   mount -o degraded,recovery /dev/sdX1 /mnt/cache
   # Replace failed device:
   btrfs replace start <devid> /dev/sdY /mnt/cache
   ```

4. **`btrfs check` (offline, dangerous):** unmount first, then `btrfs check --repair /dev/sdX1`. **The btrfs documentation explicitly says don't use --repair without a forum/dev recommendation** — confirm with user, and back up first.

5. **Last resort: nuke and restore.** Stop services, copy what's readable to array, recreate the pool. Reinforce backups with the user.

### "No space left" while df shows space

Classic BTRFS metadata-vs-data imbalance. `btrfs fi df` reveals it:

```bash
btrfs fi df /mnt/cache
# Data, single: total=X, used=Y
# Metadata, DUP: total=A, used=B   ← if A == B and small, that's the problem
```

Fix: balance the metadata.

```bash
btrfs balance start -musage=50 /mnt/cache
fstrim -v /mnt/cache             # also worth running on SSD/NVMe pools
```

### Cache pool drive failed in BTRFS RAID1

Stop array, replace physical drive, reassign in pool, start array → BTRFS auto-resilvers. Verify:

```bash
btrfs replace status /mnt/cache
btrfs scrub start /mnt/cache     # scrub after resilver completes
```

## ZFS Pool

### `zpool status` shows DEGRADED / FAULTED / corruption

```bash
zpool status -v <pool>           # -v shows individual file corruption
```

| State | Meaning | Action |
|-------|---------|--------|
| ONLINE, no errors | Healthy | (nothing) |
| ONLINE, errors > 0 in `read/write/cksum` | Single-bit errors detected and repaired (if mirrored/raidz) or just detected | `zpool clear <pool>` after investigating root cause (usually flaky cable, RAM, or PSU sag). |
| DEGRADED | A disk is offline/removed but pool functional | Replace disk: `zpool replace <pool> <old> <new>`. Wait for resilver: `zpool status` shows progress. |
| FAULTED | Multiple disks lost or insufficient redundancy | Stop, do not write. Investigate disk-by-disk. May need import from earlier txg with `zpool import -F` (data loss). |
| Permanent errors in `<metadata>:<0x0>` | Metadata corruption | Restore from backup. Can sometimes recover with `zpool import -X` (extreme data loss). |
| ONLINE but `errors: Permanent errors detected in the following files:` | Data on listed files is gone | Delete those files; `zpool clear`; restore from backup. |

### Routine maintenance

```bash
zpool scrub <pool>               # monthly cadence, fast on SSD pools
zpool status <pool>              # check progress
zpool clear <pool>               # after fixing underlying cause
```

### Unraid 7.0/7.1 ZFS-specific bugs

- **7.0.0**: NVMe drive dropouts could suspend ZFS pool, forcing power-cycle. Check release notes; mitigations included firmware updates and not using ZFS on certain consumer NVMe with thermal throttling.
- **7.1.0**: Kernel 6.12.25 broke ZFS loopback files (Docker img / VM disk on ZFS dataset). 7.1.0 final shipped 6.12.24 instead. If user is on 7.1.0-rc.2, recommend upgrading to 7.1.0 GA.
- **7.1.2 upgrade from 7.0.1**: Some users hit "wrong or no file system" on ZFS pools. Forum bug thread r3856 — may need pool import via CLI: `zpool import -f <pool>`.

## Mover

The mover runs on schedule (Settings → Scheduler) and moves files between cache pool and array per share rules.

```bash
mover                            # run now (foreground, watch syslog)
tail -f /var/log/syslog | grep -i move
```

Common issues:

| Symptom | Cause | Fix |
|---------|-------|-----|
| Mover never runs | Schedule disabled, or `Use cache` set to `Only` (won't move) | Settings → Scheduler → enable mover. Per-share: `Use cache` = `Yes` (writes to cache, mover empties to array) or `Prefer` (writes to cache, mover keeps it on cache). |
| Cache fills, mover can't keep up | Wrong share allocation or huge inflow | Set share `Minimum free space` so writes spill to array when low. Schedule mover hourly during heavy writes. |
| Mover skips appdata/system shares | By design — those should be `Use cache: Prefer` (stays on cache for performance) | This is correct. Don't move appdata to array. |
| Mover throws "input/output error" | Underlying disk/pool issue | Check syslog for the failing path; address the disk first. |
| Mover holds the array up on stop | Long-running move | Wait, or stop mover (`pkill -f mover`) before stopping array. |

## Share Allocation Policies

Per-share, in Settings → Shares → \<share> → "Allocation method":

| Policy | Behavior | Best for |
|--------|----------|----------|
| **High-water** | Fills disk in halves to balance | Default — keeps disks evenly-ish full |
| **Most-free** | Always writes to disk with most free space | Even wear when disks are similar |
| **Fill-up** | Fills oldest/lowest-numbered first | Concentrating data on fewer spinning disks (others sleep) |

`Minimum free space` per share: critical. If a disk has less than this, share writes go to a different disk (or fail). Set to ~2× max expected file size. Default is 0, which lets shares 100%-fill a disk and corrupt the next write.

`Use cache:`
- **No** — array only.
- **Yes** — writes hit cache, mover sweeps to array.
- **Prefer** — writes hit cache, mover keeps it on cache (used when array has space but cache is preferred).
- **Only** — cache only, never moved. Mover ignores. Used for appdata/system.

## Version-Specific Gotchas

- **6.12+**: ZFS introduced. Defaulted some pools to BTRFS still; users had to opt-in to ZFS.
- **7.0.0**: ZFS encryption support. Native pool import from other ZFS systems improved.
- **7.2.0**: ReiserFS deprecation warning (will be removed in 7.3+).
- **7.3.0**: 4Kn sector-size handling fixed for XFS on LSI HBAs.

## When to Escalate

- Disk hardware failure → `references/array-storage.md`
- ZFS theory beyond Unraid use → general ZFS expertise
- Container `appdata` corruption (not pool corruption) → restore appdata from CA Backup; stop the container first
- Generic BTRFS questions → BTRFS upstream docs (kernel.org)
