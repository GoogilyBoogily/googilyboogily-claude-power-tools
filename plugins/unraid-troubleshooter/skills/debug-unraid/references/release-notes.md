# Release Notes & Version Awareness

Unraid releases ship with a substantive **Known Issues** section and a per-version changelog. When the user reports a symptom that started after an upgrade, **fetch the relevant release notes first** — half of "weird new bug" reports are documented at the top of the notes.

## Canonical URLs

```
Index:    https://docs.unraid.net/category/release-notes/
Per-ver:  https://docs.unraid.net/unraid-os/release-notes/<version>/
```

Examples:
- `https://docs.unraid.net/unraid-os/release-notes/7.3.0/`
- `https://docs.unraid.net/unraid-os/release-notes/7.2.5/`
- `https://docs.unraid.net/unraid-os/release-notes/7.2.0/`
- `https://docs.unraid.net/unraid-os/release-notes/7.1.4/`
- `https://docs.unraid.net/unraid-os/release-notes/7.0.1/`
- `https://docs.unraid.net/unraid-os/release-notes/7.0.0/`
- `https://docs.unraid.net/unraid-os/release-notes/6.12.15/`

## How to Fetch

Use `WebFetch` with a focused prompt. Don't pull the full page — ask for what you need.

```
WebFetch
url:    https://docs.unraid.net/unraid-os/release-notes/<version>/
prompt: List the **Known Issues** section verbatim. Then list any **Breaking Changes** or
        upgrade-blocking warnings. Then summarize the **kernel and Docker version** in this
        release. Ignore feature additions unless they affect upgrades from prior version.
```

For "what changed since version X":

```
prompt: Summarize the "Changes vs. <prior-version>" section. Focus on any line marked
        "Fix", "Important", "Known issue", or anything mentioning ZFS, BTRFS, Docker
        networking, kernel, or VM. Skip cosmetic WebGUI changes.
```

Each release notes page reliably has the same sections:
- Upgrade notes
- Known issues
- Rolling back
- Changes vs. previous version
- Patches (mid-cycle hotfixes)
- Kernel + base distribution dependency table

## Version Timeline (Quick Reference)

| Branch | Highest stable | Kernel family | What it gave us |
|--------|----------------|---------------|-----------------|
| 6.9.x | 6.9.2 | 5.10 | Multiple cache pools |
| 6.10.x | 6.10.3 | 5.15/5.19 | ipvlan default for Docker custom networks (6.10.0) |
| 6.11.x | 6.11.5 | 5.19 | macvlan call trace mitigations begin |
| 6.12.x | 6.12.15 | 6.1 | **ZFS first-class**, macvtap workaround for macvlan (6.12.4) |
| 7.0.x | 7.0.1 | 6.6.68 | Array optional, LUKS-on-ZFS, Docker overlay2 on ZFS, ReiserFS formatting disabled, XEN removed |
| 7.1.x | 7.1.4 | 6.12.24 | **Wireless support**, ZFS pool import from TrueNAS/Proxmox/QNAP, virtual GPU sharing (VirGL/QXL) |
| 7.2.x | 7.2.5 (RC at time of writing — check) | 6.12.54 | Built-in Unraid API, SSO, ZFS RAIDZ expansion, ext4/NTFS/exFAT support, responsive WebGUI |
| 7.3.x | 7.3.0 RC | TBD | Onboarding wizard, TPM licensing, internal boot support |

## High-Impact Known Issues by Version (always re-verify against live notes)

### 6.12.x family

- **6.12.0–6.12.3**: macvlan call traces on `br0` parent; no clean fix yet. Workaround: switch to ipvlan.
- **6.12.0–6.12.2**: Array stop hangs with Docker overlay2 on cache. Workaround: `umount /var/lib/docker` before stopping.
- **6.12.4**: macvtap path introduced when bridging disabled — preferred macvlan fix.
- **6.12.x**: Realtek r8169 driver flakiness on certain kernels.

### 7.0.x

- **7.0.0**: NVMe in ZFS pool could trigger pool suspension on certain controllers → forced shutdown loop. Mitigations in 7.0.1.
- **7.0.0**: ZFS pool feature upgrade is **one-way**. Pools created or feature-upgraded under 7.0+ cannot be mounted by 6.12. Don't click "Upgrade Pool Features" unless committed to 7.0+.
- **7.0.0**: BTRFS pool upgrade fix shipped in 7.0.1 — some 6.12→7.0 upgrades left pools in wrong state.
- **7.0.0**: ReiserFS formatting disabled; existing ReiserFS still works for now but migration recommended.
- **7.0.0**: XEN support removed entirely. KVM/QEMU only.
- **7.0.0**: Memtest86 (BSD) replaced with Memtest86+ (GPL). Boot menu entry changed.
- **7.0.0**: Windows 11 24H2 SMB hardening required Unraid-side adjustments.

### 7.1.x

- **7.1.0-rc.2**: Kernel 6.12.25 broke ZFS-loopback (Docker `.img` or VM disk on a ZFS dataset → hangs). Reverted to 6.12.24 in rc.3 / final.
- **7.1.0–7.1.1**: **Mover "empty disk" feature on shares with split-level had a data-loss bug**. Fixed in 7.1.2. **Strongly recommend** users on 7.1.0/7.1.1 upgrade if they use split-level shares.
- **7.1.0**: Patch Plugin auto-removed (functionality merged in).
- **7.1.0**: Wireless added — Docker on wireless must use ipvlan; VMs on wireless use `virbr0` NAT.
- **7.1.2**: Some 7.0.1→7.1.2 upgrades hit "wrong or no file system" on ZFS pools. Workaround: `zpool import -f <pool>` from CLI.

### 7.2.x

- **7.2.0**: Four plugins **auto-uninstalled**: Theme Engine, Dark Theme, Dynamix Date Time, Flash Remount. Replacements built into the GUI.
- **7.2.0**: ReiserFS warning on Main page — must migrate before 7.3.
- **7.2.0**: `http://localhost` now requires authentication. Custom go-scripts that call local GUI break.
- **7.2.0**: Built-in Unraid API on port 8443. May interact with reverse-proxy setups.
- **7.2.0**: SSO (Unraid Connect) — local accounts continue to work.
- **7.2.0**: ZFS RAIDZ expansion supported on single-vdev pools only.

### 7.3.x

- **7.3.0**: Onboarding wizard (first-boot UX). Existing servers see no change.
- **7.3.0-beta**: 4Kn XFS sector-size regression on LSI HBAs with 512e disks. Disks formatted XFS by 7.3.0-beta.1+ migrate cleanly; older XFS-on-4Kn disks may need reformat.
- **7.3.0**: Internal boot support shipped per RC notes — verify in stable release notes when user is on stable.
- **7.3.0**: ReiserFS likely fully unsupported — confirm in actual release notes.
- **7.3.0**: TPM-based licensing groundwork. Hardware GUID still works for existing keys.

## Upgrade Path Reasoning

- Always read **the target version's notes** plus **every notes between current and target** if user is jumping a few versions. The "Known issues" of intermediate versions sometimes carry forward.
- Beta/RC versions: only on a non-production server unless user really wants to ride the edge. Roll-back from RC to stable can require flash backup restore (not just version downgrade).
- ZFS pool feature upgrades are **never** automatic; users must opt in via Pool → Operations → Upgrade Pool. Tell them not to click that unless committed.

## Cross-Version Decision Aid

When user is on version X and reports symptom Y:

1. Open `https://docs.unraid.net/unraid-os/release-notes/<X>/` → check **Known Issues** for symptom Y verbatim.
2. If found: apply the documented workaround, optionally recommend upgrading to a version that fixed it.
3. If not found in X's notes, search Y's "Changes vs. previous" sections of newer versions — sometimes the fix shipped without a known-issue ack.
4. If in a forum thread about the symptom, prefer fixes posted **after** the user's version's release date.

## When to Recommend an Upgrade

| User on | Stable version they should consider | Why |
|---------|--------------------------------------|-----|
| 6.12.0–6.12.3 | At least 6.12.4 | macvtap workaround for macvlan |
| 6.12.x | 6.12.15 (last 6.12 LTS) | Final 6.12 stability roll-up |
| 6.12.x considering 7.x | 7.0.1+ | 7.0.0 had ZFS NVMe issue |
| 7.1.0 / 7.1.1 with split-level shares | 7.1.2+ urgently | Mover data-loss bug |
| 7.0.x | 7.1.4 | Better ZFS, wireless, virtual GPU |
| 7.1.x | 7.2.x stable | Built-in API, RAIDZ expansion, NTFS/exFAT support |
| 7.2.x | Wait for 7.3 stable unless need TPM/internal-boot | 7.3 RC at time of writing |

## When NOT to Recommend an Upgrade

- User reports a symptom **specific to a recent version** (e.g., on 7.1.0 with mover bug → upgrade to 7.1.2, not to 7.2 unrelated).
- ReiserFS users on 7.2.x: migrate filesystems **first**, then upgrade to 7.3.
- ZFS-pool users who might want to roll back: don't upgrade pool features. Pool features and OS version are decoupled — you can run 7.2's OS with 7.0-era pool features just fine.
- Pre-LTS users on stable 6.12.15: upgrading to 7.x is a big jump. If everything works, "if it ain't broke" applies; security/CVE patches in 7.x do matter though.

## Patches & Mid-Cycle Hotfixes

Some versions ship a **Patches** section with kernel modules / packages that can be applied without a full upgrade. Path: Tools → Update Assistant → Apply Patch. Useful when a regression is known and the user wants to wait on the next stable.

## Sources to Trust

- `docs.unraid.net/unraid-os/release-notes/<version>/` — canonical
- Lime Tech blog (`unraid.net/blog/`) — long-form announcements
- Forum **Stable Releases** subforum bug reports — for known-issue corroboration
- Avoid: random YouTube video tutorials older than the user's version; "fix everything" Reddit posts that don't name a version
