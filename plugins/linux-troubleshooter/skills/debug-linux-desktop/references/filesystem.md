# Filesystem Troubleshooting (ext4, btrfs, xfs, zfs)

Covers full disk symptoms, inode exhaustion, btrfs allocation quirks, fsck workflows, snapshot rollback.

## Quick Triage

```bash
df -h                                                # block usage
df -i                                                # inode usage
mount | column -t                                    # what's mounted, fs types, options
findmnt --real                                       # systemd-aware view
sudo dmesg | grep -iE 'ext4|btrfs|xfs|zfs|EXT4-fs|I/O error' | tail -30
sudo lsblk -f                                        # filesystem types per device
```

`df` shows blocks; `df -i` shows inodes. A 100% inodes / lots-of-space situation looks like "disk full" but is fixable with file deletes.

## Disk Full Symptoms

### "Disk full" but `df` shows space

Files were deleted while held open by a running process — kernel keeps blocks allocated until the FD closes.

```bash
sudo lsof | grep '(deleted)' | sort -k7 -rn | head -20
```

Fix: restart the offending process. Or, last resort, truncate via `/proc/<pid>/fd/<n>`:

```bash
sudo bash -c '> /proc/<pid>/fd/<n>'                  # zeros the open file
```

(test on non-critical processes; some apps will misbehave)

### Inode exhaustion

```bash
df -i                                                # 100% inodes used somewhere?
sudo find / -xdev -printf '%h\n' 2>/dev/null | sort | uniq -c | sort -rn | head
```

Common offenders: `/tmp`, `/var/cache`, `~/.cache/thumbnails`, mail spool dirs, Node.js `node_modules` graveyards.

Fix: delete or compress thousands of small files. ext4 can't grow inodes after format — last resort is reformat.

## ext4

Most common rootfs. Fast, well-understood, robust.

```bash
sudo tune2fs -l /dev/sdaX                            # superblock info, last fsck date
sudo dumpe2fs -h /dev/sdaX
```

### fsck

Never on a mounted filesystem (root or otherwise). Boot a live USB:

```bash
sudo fsck.ext4 -f -y /dev/sdaX
# -f forces full check, -y answers yes to all repairs
```

If fsck reports "bad magic number in superblock", try alternate superblock:

```bash
sudo dumpe2fs /dev/sdaX | grep -i superblock         # list backup superblock locations
sudo fsck.ext4 -b <backup-block> /dev/sdaX
```

### Read-only root after error

ext4 remounts ro on error by default. Cause: bad sectors, controller issue, kernel bug.

```bash
sudo dmesg | grep -i 'ext4\|i/o error' | tail -30
sudo smartctl -a /dev/sdaX                           # SMART status
sudo smartctl -t long /dev/sdaX                      # 30+ min hardware test
```

Don't simply `mount -o remount,rw` and ignore — the underlying issue will recur.

## btrfs

CoW filesystem with snapshots, RAID, compression. Different failure modes than ext4.

```bash
sudo btrfs filesystem usage /
sudo btrfs filesystem df /
sudo btrfs subvolume list /
sudo btrfs device stats /
```

### ENOSPC despite free space

CoW allocation imbalance. Data and metadata block groups are separate; one runs out before the other.

```bash
sudo btrfs filesystem usage /
# look at "Used" vs "Free (estimated)" and the per-block-group breakdown
```

Fix: balance lightly used block groups.

```bash
sudo btrfs balance start -dusage=50 /                # data
sudo btrfs balance start -musage=50 /                # metadata
```

If even balance fails with ENOSPC, free space first by deleting snapshots.

### Snapshots eating space

```bash
sudo btrfs subvolume list -t /
sudo btrfs subvolume show /<path>
sudo btrfs qgroup show /                             # if quotas enabled (slow)
```

Delete with:

```bash
sudo btrfs subvolume delete /path/to/snapshot
```

Don't `rm -rf` a snapshot — use the btrfs command.

### Checksum errors / corruption

```bash
sudo btrfs scrub start /
watch -n 5 sudo btrfs scrub status /
```

If errors found and you have a RAID profile, btrfs auto-repairs. Single-device: data is gone — recover from snapshot or backup.

`btrfs check --repair` is documented as last resort and can make things worse. Prefer `btrfs restore` for data salvage to another disk.

### Snapshot rollback

```bash
sudo btrfs subvolume list /
sudo btrfs subvolume set-default <id> /
# reboot
```

Snapper / Timeshift wrap this. On Tumbleweed-style setups, `snapper rollback` is the supported path.

### Swap on btrfs

Must be NOCOW (`chattr +C`) on a non-snapshotted subvolume. Easier to use a separate non-btrfs partition for swap if hibernate is involved.

## xfs

Used for `/home` or data drives in some distros. Online resize, journaling, but no shrink.

```bash
sudo xfs_info /
sudo xfs_db -r /dev/sdaX                             # read-only inspect
```

### Repair

```bash
# unmounted only
sudo xfs_repair /dev/sdaX
```

If log is dirty and won't replay (rare):

```bash
sudo xfs_repair -L /dev/sdaX                         # zeros log; lossy
```

`-L` is destructive — only after attempting plain `xfs_repair` and consulting backups.

## zfs (OpenZFS)

Out-of-tree on most distros (DKMS), built-in on Ubuntu when chosen at install.

```bash
zpool status
zpool list
zfs list
zpool events                                         # recent events log
```

### Pool degraded

```bash
zpool status -v
```

Replace failed disk:

```bash
zpool replace <pool> <old-dev> <new-dev>
zpool status                                         # watch resilver
```

Don't pull a healthy disk without `zpool offline` first.

### Encrypted dataset won't unlock

```bash
zfs load-key <dataset>
zfs mount <dataset>
```

For at-boot unlock issues, check `zfs-load-key.service` and the keyfile path/permissions.

### Out of space / snapshot freeze

ZFS snapshots can pin space. List snapshots ordered by reclaimable size:

```bash
zfs list -t snapshot -o name,used,referenced,reclaim -s used
```

Destroy unwanted ones:

```bash
sudo zfs destroy <pool>/<dataset>@<snap>
```

## Generic Disk Health

```bash
sudo smartctl -a /dev/sdaX                           # SATA/USB
sudo smartctl -a /dev/nvme0                          # NVMe
sudo smartctl -t short /dev/sdaX                     # ~5 min
sudo smartctl -t long /dev/sdaX                      # 30+ min
```

NVMe specifics:

```bash
sudo nvme smart-log /dev/nvme0
sudo nvme id-ctrl /dev/nvme0 | grep -iE 'fr|model'   # firmware revision
sudo nvme list
```

If SMART reports `Reallocated_Sector_Ct` rising or `Media_Wearout_Indicator` low, plan replacement. NVMe `Critical Warning` non-zero is bad.

## Mount-Time Failures

Symptom at boot: drops to emergency mode citing `<device>` failed to mount. See `boot-systemd.md` → fstab section.

For runtime mount failures:

```bash
sudo mount -v /mnt/foo                               # verbose
sudo dmesg | tail -20                                # kernel-level reason
journalctl -u <unit-or-mount-name>
```

Common: filesystem detected as `iso9660` instead of intended type (autodetect failed) — pass `-t ext4` (or whatever) explicitly.

## When to Cross-Reference

- Boot drops to emergency due to fstab: `boot-systemd.md`
- Hibernate fails because swap setup wrong: `suspend.md`
- Package manager partial state because `/` was full: `package-manager.md`
