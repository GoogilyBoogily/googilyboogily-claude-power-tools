# Package Manager Troubleshooting (apt, dnf, pacman, AUR)

Three major families: `apt` (Debian/Ubuntu/Mint), `dnf`/`rpm` (Fedora/RHEL/Rocky/openSUSE-zypper-similar), `pacman` (Arch and derivatives).

## Quick Triage

```bash
# Identify
. /etc/os-release && echo "$ID $ID_LIKE"

# State (run the relevant one)
sudo apt list --installed 2>/dev/null | head        # Debian/Ubuntu
sudo dnf list installed 2>/dev/null | head          # Fedora/RHEL
pacman -Q | head                                    # Arch

# Held / locked
sudo apt-mark showhold                              # Debian/Ubuntu
sudo dnf versionlock list                           # Fedora (with versionlock plugin)
grep -E '^IgnorePkg|^IgnoreGroup' /etc/pacman.conf  # Arch
```

## Arch / pacman

Arch is a rolling release — partial upgrades are catastrophic. The cardinal sin:

```bash
sudo pacman -Sy <pkg>          # NEVER — refreshes index without upgrading
```

This stages a pkg from the new index against an old system → ABI mismatch → segfaults all over.

Always full upgrade:

```bash
sudo pacman -Syu
```

### Recovery from partial upgrade

If the system is already broken: boot Arch ISO live, mount root, chroot, complete the upgrade.

```bash
mount /dev/sdaX /mnt
arch-chroot /mnt
pacman -Syu
exit
reboot
```

### Conflicting files error

```
error: failed to commit transaction (conflicting files)
<pkg>: /usr/lib/foo.so exists in filesystem
```

Find owner:

```bash
pacman -Qo /usr/lib/foo.so
```

If the file is genuinely orphaned (no owning package or owned by an obsolete pkg you've removed) overwrite is safe:

```bash
sudo pacman -S --overwrite '/usr/lib/foo.so' <pkg>
```

But never blindly overwrite system files.

### Held packages

`/etc/pacman.conf`:

```
IgnorePkg = nvidia nvidia-utils
```

These are skipped by `-Syu`. Remove the line to upgrade.

### AUR helper failures

PKGBUILD upstream URL changes are common:

```bash
yay -S <pkg>          # or paru, etc.
# fails with checksum or 404
```

Manual recovery:

```bash
git clone https://aur.archlinux.org/<pkg>.git
cd <pkg>
# read comments at https://aur.archlinux.org/packages/<pkg>
# update PKGBUILD pkgver / source / sha256sums as needed
makepkg -si
```

### Keyring expiration

If `pacman -Syu` complains about invalid signatures, the keyring may be stale (especially on long-unused installs):

```bash
sudo pacman -S archlinux-keyring
sudo pacman -Syu
```

For very old systems where archlinux-keyring itself can't update, follow the [Arch keyring rebuild procedure](https://wiki.archlinux.org/title/Pacman/Package_signing).

### Corrupted local DB

```bash
sudo rm /var/lib/pacman/db.lck                      # only if no pacman process running!
ls /proc/*/exe 2>/dev/null | xargs ls -la 2>/dev/null | grep pacman
```

## Debian / Ubuntu (apt)

```bash
sudo apt update
sudo apt list --upgradable
sudo apt upgrade
sudo apt full-upgrade                                # was dist-upgrade
sudo apt autoremove --purge                          # remove orphaned deps
```

### Broken dependencies

```bash
sudo apt --fix-broken install
sudo dpkg --configure -a                             # finish interrupted configure step
```

If a single package is the blocker:

```bash
sudo apt install -f
sudo apt install --reinstall <pkg>
sudo dpkg -i --force-overwrite <pkg.deb>             # last resort
```

### Held packages

```bash
sudo apt-mark showhold
sudo apt-mark unhold <pkg>
```

### dpkg locked

```
E: Could not get lock /var/lib/dpkg/lock-frontend
```

A previous apt/dpkg is still running or crashed. Find it:

```bash
sudo lsof /var/lib/dpkg/lock-frontend 2>/dev/null
ps aux | grep -E 'apt|dpkg|unattended-upgrade'
```

Wait for it, or kill the process *only* if confirmed dead. Don't blindly `rm` lock files — a half-finished dpkg state will brick the system.

### PPA going stale or signing expired

```
NO_PUBKEY <key>
```

Re-add the PPA's signing key, or remove the PPA if abandoned:

```bash
sudo add-apt-repository --remove ppa:<owner>/<name>
```

### `apt` vs `apt-get` vs `aptitude`

For scripts, `apt-get` is the stable interface. `apt` is for humans (its UX may shift). `aptitude` has its own dependency resolver — sometimes resolves conflicts apt won't, sometimes proposes wild solutions; read its plan carefully.

## Fedora / RHEL (dnf)

```bash
sudo dnf check-update
sudo dnf upgrade
sudo dnf distro-sync                                 # align local versions to repo
sudo dnf autoremove
sudo dnf history                                     # transaction log
sudo dnf history undo <id>                           # roll back a transaction
```

### Conflicts

```bash
sudo dnf upgrade --best --allowerasing               # let dnf remove conflicts to make room
```

`--best` is stricter, `--allowerasing` permits removals — use carefully.

### Reinstall corrupt package

```bash
sudo dnf --refresh reinstall <pkg>
```

### Protected packages

```bash
ls /etc/dnf/protected.d/
```

These are pinned (typically `kernel`, `dnf` itself, `systemd`). Don't remove without understanding the reason.

### versionlock

```bash
sudo dnf versionlock add <pkg>                       # pin
sudo dnf versionlock list
sudo dnf versionlock delete <pkg>                    # unpin
```

### RPM Fusion / third-party repos

For Nvidia, codecs, etc. Mismatched repo state often causes upgrade failures. Verify all third-party repos are still active for your Fedora version:

```bash
dnf repolist
```

After Fedora major upgrade (e.g., 41→42), third-party repos may need their `releasever` updated.

## openSUSE (zypper)

Similar to dnf in spirit. Quick reference:

```bash
sudo zypper refresh
sudo zypper update
sudo zypper dup                                      # dist-upgrade for Tumbleweed
sudo zypper search <name>
sudo zypper info <pkg>
sudo zypper addlock <pkg>                            # hold
```

## Generic "Recovery From Bad Upgrade"

Snapper-aware distros (openSUSE, Fedora variants, Ubuntu with Timeshift): roll back. See `filesystem.md` for btrfs snapshot rollback.

For others:

1. Identify the bad transaction (`dnf history`, `apt history` via `/var/log/apt/history.log`, `/var/log/pacman.log`).
2. Reinstall the affected packages from a known-good version.
3. If multiple packages affected, downgrade as a group to maintain dependency consistency.

apt downgrade pattern:

```bash
sudo apt install <pkg>=<old-version>
```

dnf downgrade:

```bash
sudo dnf downgrade <pkg>
```

pacman downgrade (via cache or AUR `downgrade` helper):

```bash
sudo pacman -U /var/cache/pacman/pkg/<pkg>-<oldver>.pkg.tar.zst
```

## Disk-Full During Upgrade

`/`, `/var`, or `/boot` ran out mid-transaction. Free space, then complete:

- apt: `sudo apt --fix-broken install`
- dnf: `sudo dnf history` → check status of last; `sudo dnf upgrade` again
- pacman: `sudo pacman -Syu` again (transactions are atomic; a failure usually means nothing was applied)

For `/boot` full see `boot-systemd.md`.

## When to Cross-Reference

- `/boot` full blocking kernel install: `boot-systemd.md`
- Snapshot rollback after bad upgrade (btrfs): `filesystem.md`
- DKMS module rebuild failed during upgrade: `kernel-modules.md`
- Sandboxed app pkgs (Flatpak/Snap): `sandbox-flatpak.md`
