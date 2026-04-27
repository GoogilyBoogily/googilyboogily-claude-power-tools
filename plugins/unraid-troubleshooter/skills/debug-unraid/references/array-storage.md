# Array & Storage

Unraid's array is **parity-protected JBOD**, not RAID. Each data disk is independent XFS/BTRFS/ZFS, parity disk(s) hold the XOR of every other disk. A "disabled" disk is **not** the same as a failed disk — Unraid disables it after a write error and starts emulating its contents from parity. Treat that distinction as load-bearing in every diagnosis.

## Quick Triage

```bash
# Array state, disk slots, errors
mdcmd status | grep -E 'mdState|sbName|rdevName|rdevStatus|rdevNumErrors|sbNumDisks'

# What's mounted
mount | grep -E '/mnt/(user|cache|disk|remotes)'
df -h /mnt/disk* /mnt/cache 2>/dev/null

# Per-disk SMART summary
for d in /dev/sd? /dev/nvme?n?; do
  echo "=== $d ==="
  smartctl -H "$d" 2>/dev/null | grep -E 'SMART overall|test result'
done

# Parity check status / sync history
cat /var/local/emhttp/var.ini 2>/dev/null | grep -E 'mdResync|sbSynced|sbSyncErrs'
```

## Symptom → Cause → Fix

### Array won't stop — "Retry unmounting disk share(s)"

Almost always a process holds an open file on `/mnt/user`, `/mnt/cache`, or `/mnt/disk*`. Order of attack:

1. **Find the holder:**

   ```bash
   fuser -mv /mnt/user /mnt/cache /mnt/disk*
   lsof +D /mnt/user 2>/dev/null | head -30
   lsof +D /mnt/cache 2>/dev/null | head -30
   ```

2. **Common culprits and fixes:**

   | Holder | Fix |
   |--------|-----|
   | Docker (containers writing to /mnt/user) | `docker stop $(docker ps -q)` then retry stop. If still stuck: `umount /var/lib/docker` (known fix for 6.12.0–6.12.2). |
   | NFS clients on the LAN | On the **client**: `umount -lf /mnt/<unraid-share>`. On the server: `umount -l /mnt/remotes/*` to release stale NFS handles. |
   | VM with disk image on /mnt | `virsh shutdown <vm>` (graceful) or `virsh destroy <vm>` (force). |
   | Krusader / File Manager / shell open in /mnt | Close the GUI tab or `kill` the bash session. |
   | rclone mount, MergerFS, SnapRAID | Stop those services first; their FUSE mounts need explicit unmount. |
   | Plex/Emby scanner mid-scan | Stop the container; the kernel-level CIFS/NFS scan can hold inodes for minutes. |

3. **Last resort (data loss risk if writes are pending):** force unclean shutdown via `powerdown -r`, expect a parity check on next boot.

Known issue: 7.0/7.1 betas had a regression where stopping array did not skip already-unmounted FS. If on a beta/RC, fetch release notes for that version.

### Array won't start

Symptoms: "Start" button greyed out, "Missing disk" warning, wrong slot mapping.

```bash
mdcmd status | grep rdevStatus      # DISK_INVALID or DISK_NEW means slot mismatch
ls -la /dev/disk/by-id/             # check serials are present
```

Causes and fixes:

| Cause | Fix |
|-------|-----|
| Disk physically disconnected | Reseat SATA/SAS cables and power. Check `dmesg` for `ata` errors / link resets. |
| Wrong disk in wrong slot after hardware reshuffle | Stop array, "Unassign" disks, reassign to correct slots, start. **Never** click "Yes I want to do this" past a parity-rebuild prompt without confirming the user understands. |
| Encrypted disk, missing or wrong passphrase | Re-enter passphrase. If lost, data is gone — Unraid's encryption is LUKS, no backdoor. |
| `/boot/config/super.dat` corrupt | Restore from flash backup. Without backup: `mdcmd unset` and reassign carefully. **High risk** — confirm with user. |

### Disabled disk (red ball / red X), contents emulated

Unraid disables a disk after a single write error. The disk itself is **probably fine** — it's a controller, cable, power, or backplane fault 80%+ of the time.

```bash
# Read SMART before doing anything
smartctl -a /dev/sdX | grep -iE 'reallocat|pending|uncorrect|crc|temperature'

# Was it an actual disk error or a controller drop?
grep -iE 'sdX|ata' /var/log/syslog | tail -50
```

Decision tree:

| SMART | Action |
|-------|--------|
| All zeros for reallocated/pending/uncorrectable, low CRC | Disk is fine. Likely cable/power/controller. **Pre-clear** the disk (Preclear plugin) to rule it out, then **rebuild onto same disk**: stop array, unassign the disabled disk, start array (now emulated-only), stop, reassign same disk, start array → triggers rebuild. |
| Reallocated > 0 trending up, pending sectors > 0 | Disk is failing. Replace with a same-size-or-larger disk; rebuild onto the new disk. |
| UDMA_CRC_Error_Count high, growing | Cable or backplane. Replace cable, swap port, then rebuild. |
| Marvell SATA controller (`lspci | grep -i marvell`) | Known unreliable on Unraid. Recommend an LSI HBA in IT mode. |

**Never** run a "New Config" to "fix" a disabled disk unless parity is the disabled disk **and** all data disks are fully intact. New Config without parity = unprotected, and rebuilding parity onto a disabled data disk corrupts the emulated content.

### Parity sync errors after reboot

If parity check shows thousands of errors right after an unclean shutdown, it's normal — writes in flight didn't update parity. After a clean shutdown it's not normal.

```bash
# Was last shutdown clean?
grep -iE 'unclean shutdown|powerdown' /var/log/syslog | tail
cat /boot/config/forcesync 2>/dev/null  # presence indicates Unraid will force-sync on boot
```

Causes:
- Unclean shutdown (expected — let parity correct)
- Disk write-cache ate writes (disable disk write cache: `hdparm -W 0 /dev/sdX`, persist via go-script)
- Bad RAM (run memtest86+ from boot menu — Unraid ships it on the USB)
- Cable/controller flapping (check syslog for ATA link resets)
- Mid-rebuild reboot (don't reboot during rebuild; let it finish)

Recommend a parity check **without correction** first to count errors, then re-run **with correction** once root cause is identified.

### Replacing or expanding disks

Documented procedure (paraphrased from `docs.unraid.net/unraid-os/using-unraid-to/manage-storage/array/replacing-disks-in-array/`):

1. Stop array
2. Power down (only if hot-swap not safe — most modern HBAs are fine hot)
3. Replace physical disk with one **same size or larger** for data, **strictly larger or equal to largest data disk** for parity
4. Start array → triggers rebuild
5. Don't touch the array until rebuild completes (`mdcmd status | grep mdResync`)

Never replace a parity disk and a data disk in the same operation. **Parity first, complete, then data.**

### "Trust parity" / make Unraid trust an existing parity disk

Edge case: you moved a known-good parity disk to a new server, or accidentally cleared assignments. The official trick (wiki: "Make unRAID Trust the Parity Drive, Avoid Rebuilding Parity Unnecessarily") uses **Tools → New Config → preserve current assignments → check "Parity is already valid"**. **Confirm with the user explicitly** — if you're wrong about parity validity, the next disk failure loses data.

## Version-Specific Gotchas

- **6.12.x**: macvlan call traces could trigger array stop hangs (see `docker-networking.md`).
- **7.0.0**: NVMe drive failures could cause ZFS pool suspension and forced shutdown.
- **7.1.0**: Kernel regression (v6.12.25) caused Docker/VM hangs on ZFS-backed loopback images. 7.1.0 final reverted to 6.12.24 in rc.3.
- **7.2.0**: ReiserFS-formatted disks now generate warnings; will be unsupported in 7.3+. Migrate to XFS/BTRFS/ZFS.
- **7.3.0**: Sector-size regression for 4Kn devices on LSI HBA was fixed mid-beta — disks formatted XFS by 7.3.0-beta.1 work, older 4Kn XFS disks still need reformat.

## When to Escalate

- Suspected RAM corruption → memtest86+ via boot menu
- Multiple disks dropping at once → controller/PSU/backplane, not the disks
- Cache pool corruption suspected → `references/cache-pools.md`
- Permissions / shares broken after mount → `references/shares-permissions.md`
- Mover not running, fills array → `references/cache-pools.md`
