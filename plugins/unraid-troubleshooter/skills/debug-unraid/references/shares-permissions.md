# Shares & Permissions

Unraid shares come in two flavors that constantly trip people up: **user shares** at `/mnt/user/<share>` (FUSE-aggregated across disks via `shfs`) and **disk shares** at `/mnt/diskN/<folder>` or `/mnt/cache/<folder>` (direct filesystem). Most "I see double the data" or "container can't write" issues are people writing to both views simultaneously, or running `New Permissions` on the wrong tree.

## The shfs / FUSE Model

`shfs` (Stackable Hierarchical File System) is a userspace FUSE process that presents a unioned view of every disk that has a top-level folder matching a share name.

- `/mnt/user/Movies` shows merged contents of `/mnt/disk1/Movies/`, `/mnt/disk2/Movies/`, `/mnt/cache/Movies/`, ...
- Reads pull from whichever disk has the file
- Writes go to whatever disk the share allocation policy picks (high-water, most-free, fill-up)
- The path **same file** has on the underlying disk is identical to the path on `/mnt/user`

Cardinal rule: **never copy or move a file across `/mnt/user` boundaries when both paths resolve to the same physical disk** — `shfs` may shortcut to a rename, or it may copy then truncate, depending on internal heuristics. Always copy disk-to-disk via `/mnt/disk1/...` → `/mnt/disk2/...` if you want strict semantics. For Docker containers, always mount `/mnt/user/<share>` (NOT `/mnt/cache/<share>`) so files migrate cleanly when mover runs.

Exception: **appdata, system, and domains shares should be `Use cache: Prefer` and the container should mount `/mnt/cache/appdata/...` or `/mnt/user/appdata/...`** — there's a long-running debate. The safest default is `/mnt/user/appdata/...` with `Use cache: Prefer`; mover will leave it on cache. Some users mount `/mnt/cache/appdata` directly to avoid shfs latency for small SQLite databases.

## Quick Triage

```bash
# Per-share config
ls /boot/config/shares/
cat /boot/config/shares/<share>.cfg

# Effective mounts and disk membership
mount | grep -E '/mnt/(user|cache|disk)'
shfs --version 2>/dev/null

# Permissions snapshot
ls -la /mnt/user/<share> | head
stat /mnt/user/<share>

# SMB sessions
smbstatus 2>/dev/null | head -40

# NFS exports
cat /etc/exports
showmount -e localhost 2>/dev/null
exportfs -v 2>/dev/null
```

## Symptom → Cause → Fix

### Share missing from SMB / not visible

```bash
testparm -s 2>&1 | grep -A20 "\[<share>\]"
cat /boot/config/shares/<share>.cfg | grep -E 'shareExport|shareSMB'
```

| Cause | Fix |
|-------|-----|
| Share's SMB export disabled | `shareSMB="No"` → set to `Yes` in GUI Shares page or edit cfg, restart Samba (Settings → SMB → Apply) |
| Share name has space or non-ASCII | Rename without spaces; SMB export keeps quirky behavior |
| Browse master conflict on LAN | Set Unraid as the only WSD/SMB1 host or disable old protocols on other devices |
| Share invisible only to one client | Windows credential cache: `cmdkey /list`, delete stale entries |

### "Read-only file system" or "Permission denied" writing to share

The Unraid permissions model: files owned by `nobody:users`, perms `0666` for files / `0777` for dirs (yes, world-writable — this is normal for a NAS, the security boundary is at SMB/NFS auth). Containers run as user `nobody` (UID 99, GID 100).

```bash
# What's the file actually owned by?
ls -la /mnt/user/<share>/<path>
# Effective UID/GID inside container
docker exec <container> id
```

| Cause | Fix |
|-------|-----|
| File created by VM/container as root or another UID | `chown -R nobody:users /mnt/user/<share>/<sub>` |
| `chmod 700` somewhere up the path | `find /mnt/user/<share> -type d -not -perm 0777 -exec chmod 0777 {} +` (NAS shares; do not use on system or appdata) |
| Disk filesystem mounted RO due to errors | `mount | grep ro,` ; check syslog for the disk's filesystem errors; `xfs_repair` / `btrfs check` |
| `New Permissions` tool was run on system/appdata | These need stricter perms; restore `chmod 700` on appdata/<container> if it broke. Better: do not run New Permissions on system/appdata/domains. |

The **`newperms`** helper (Tools → New Permissions) recursively sets `nobody:users`, `0777 dir / 0666 file`. **Do not run it on**:
- `appdata` (containers may need specific UIDs/perms)
- `system` (Docker image, libvirt config)
- `domains` (VM disk images — must be `libvirt-qemu` ownership)
- Any encrypted share's `.crypt` mount metadata

### SMB auth fails after Windows update

Windows 11 24H2 hardened SMB defaults — guest auth disabled, signing required.

| Symptom | Fix |
|---------|-----|
| "You can't access this shared folder because your organization's security policies block unauthenticated guest access" | Either set the Unraid share to **Secure/Private** with credentials, or re-enable guest access via Windows Group Policy: `gpedit.msc` → Computer Configuration → Administrative Templates → Network → Lanman Workstation → "Enable insecure guest logons" = Enabled. Prefer adding credentials (cleaner). |
| SMB1 deprecation warning | Unraid 7.x defaults disable SMB1; legacy clients (XP, old NAS) need a different protocol. Don't re-enable SMB1. |
| Slow SMB transfers / disconnects | Settings → SMB → Tunables — try `aio read size = 1` and `aio write size = 1` off, increase `socket options = TCP_NODELAY IPTOS_LOWDELAY SO_RCVBUF=131072 SO_SNDBUF=131072`. Test with `dd` or `iperf3` first to rule out NIC. |

### NFS export not working / stale handles

```bash
exportfs -v
cat /var/lib/nfs/etab
ss -tnp | grep :2049
```

| Cause | Fix |
|-------|-----|
| Share's NFS export disabled | Settings → NFS → Enable; per-share Export = Yes; security = Public or specify allowed IPs in "Rule" field |
| Stale handle on client (`Stale file handle` errors) | Server-side: re-export with new fsid (`/etc/exports`); restart `rpc.mountd`. Client-side: `umount -fl` + remount. |
| `nfsd: too many open connections` | Increase nfsd threads: Settings → NFS → Tunable; or upgrade to 7.0+ (better defaults) |
| Permissions wrong via NFS but right via SMB | NFS uses UIDs; ensure client UID/GID matches Unraid (`nobody`/`users` = 99/100) or use `all_squash,anonuid=99,anongid=100` |

### Share "(unprotected)" warning

GUI shows the share has files on a disk that is **not parity-protected** — i.e., a disk that's currently disabled, or a cache pool only.

Fix:
- If the data is on a disabled/emulated array disk: rebuild the disk first (see `array-storage.md`).
- If on a cache pool by intent (appdata, etc.): suppress the warning per share (Settings → Shares → \<share> → Notifications). The data is still protected by your cache pool's RAID1/RAIDZ, just not by array parity.

### "Double-counted" disk usage / `du` shows more than `df`

Almost always: someone copied or wrote to both `/mnt/cache/<share>` and `/mnt/user/<share>` separately, ending up with two physical copies of files (one on cache, one on a data disk). Mover normally moves cache → array, but if the file existed on both before mover ran, you have duplicates.

```bash
# Find duplicates
diff <(find /mnt/cache/<share> -type f -printf '%P\n' | sort) \
     <(find /mnt/disk*/<share> -type f -printf '%P\n' 2>/dev/null | sort) | head
```

Resolve by deleting the older copy (usually the array copy if you wanted it on cache, or vice-versa). **Never** `rm` from `/mnt/user` if you suspect duplication — go to the disk-share mounts directly.

### Share allocation full despite cache having space

| Cause | Fix |
|-------|-----|
| Share's "Included disks" list excludes the cache | Settings → Shares → "Included/excluded disks" — leave both blank for "all" |
| Share's `Use cache` = `No` | Set to `Yes` or `Prefer` |
| Minimum free space too high | Lower or remove |
| Allocation policy `Fill-Up` and lowest disk full | Switch to High-water or Most-free; move some data off |

### appdata corruption / container database broken

The **right** restore path: stop the container, restore appdata from CA Backup (if installed), restart container. Don't run `chmod -R` or `chown -R` on appdata as a fix — it breaks containers that need specific UIDs (Plex runs as 99:100 by default but Linuxserver.io containers respect `PUID`/`PGID` env vars). Match ownership to the container's expected UIDs.

## Version-Specific Gotchas

- **6.12+**: `Exclusive Share` mode added — bypasses shfs entirely for shares that live on a single disk/pool. Faster, but if the file ever lands elsewhere, it's not visible via `/mnt/user`. Use only when you're sure (e.g., appdata pinned to one cache pool).
- **7.0.0**: SMB hardened for Win11 24H2 compatibility; default min protocol bumped.
- **7.1.0**: Wireless support; SMB over wireless works but throughput is naturally limited.
- **7.1.0–7.1.1**: Mover "empty disk" feature on shares with split-level had a data-loss bug. Fixed in 7.1.2. If user is on 7.1.0/7.1.1 and uses split-level shares, **strongly** recommend upgrading.
- **7.2.0**: Case-insensitive SMB share names supported; invalid characters in share names now rejected up-front. Responsive WebGUI redesigned the Shares page.
- **7.2.0**: `http://localhost` now requires authentication — breaks any custom `go-script` `wget`/`curl` against the local GUI without credentials.

## When to Escalate

- Encrypted share unlock fails → check LUKS passphrase; `cryptsetup status` on the underlying device
- File integrity issue (file checksum changes silently) → suspect RAM, run memtest86+; check ZFS scrub for cksum errors
- Performance bad on SMB → start with `iperf3` to isolate network from filesystem
- Container can't write to volume → `references/docker-networking.md` for Docker-specific
- Mover misbehaving → `references/cache-pools.md`
