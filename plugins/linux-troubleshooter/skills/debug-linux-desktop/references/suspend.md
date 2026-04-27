# Suspend / Resume / Hibernate Troubleshooting

Linux power states are controlled via `/sys/power/`. Failures usually involve GPU resume, kernel modules misbehaving on resume, or wrong sleep state for the hardware.

## Quick Triage

```bash
cat /sys/power/state                                 # available: freeze mem disk
cat /sys/power/mem_sleep                             # active mem variant: [s2idle] deep
cat /proc/cmdline | grep -E 'mem_sleep|resume'
journalctl -b -1 --no-pager | tail -100              # last boot's pre-sleep messages
journalctl -b --no-pager | grep -iE 'suspend|resume|sleep|wake' | head -50
```

## Sleep States Explained

- **`freeze` (s2idle)**: software-only "modern standby". CPU stays in lowest C-state. Required on systems with no S3 firmware tables. Higher idle drain than deep but always available.
- **`mem` (S3, "deep")**: ACPI suspend-to-RAM. Hardware powers down most components. Lower drain, sometimes unsupported (especially recent Intel laptops).
- **`disk` (hibernate, S4)**: state to swap, full power off. Requires sufficient swap and `resume=` cmdline.
- **`standby` (S1)**: rare, shallow.

Force preferred mem variant:

```
# kernel cmdline
mem_sleep_default=deep
```

Verify after reboot: `cat /sys/power/mem_sleep` shows `s2idle [deep]`.

## Won't Suspend / Wakes Immediately

```bash
journalctl -b --no-pager | grep -iE 'pm_suspend|wakeup|S3|s2idle' | tail -30
cat /proc/acpi/wakeup                                # which devices can wake
```

USB device triggering wake: disable specific source.

```bash
# example: disable XHC USB controller wake
echo XHC | sudo tee /proc/acpi/wakeup
```

(toggles enabled/disabled; check before/after)

Persist via udev or a systemd one-shot (`/etc/systemd/system/disable-wakeup.service`).

## Resume Hangs / Black Screen

```bash
journalctl -b -1 --no-pager | tail -100              # what was the last successful pre-sleep msg?
journalctl -b --no-pager | head -50                  # what happened at resume
```

Causes:

- **GPU driver bug**: black screen on wake, sometimes recovers by switching VT (Ctrl+Alt+F2 then back). Nvidia: see `nvidia.md` for `NVreg_PreserveVideoMemoryAllocations` and suspend services. AMD: see `mesa.md` for `amdgpu.sg_display=0`.
- **Buggy NVMe firmware**: check `nvme id-ctrl /dev/nvme0 | grep fr` (firmware revision) — known-bad revisions on certain WD/Samsung drives need vendor firmware update.
- **PSR (Panel Self Refresh) on Intel**: `i915.enable_psr=0` cmdline.
- **ACPI quirks**: `acpi_osi=! "acpi_osi=Windows 2015"` for laptops that misbehave on Linux ACPI strings.
- **CPU microcode**: update `intel-ucode` / `amd-ucode` and regen initramfs.

## Hibernate

Requires:
- Swap partition or swap file at least equal to RAM (compressed images can be smaller, but plan equal).
- `resume=` kernel parameter pointing at the swap location.
- `resume` module in initramfs.

### Swap partition

```bash
swapon --show
blkid /dev/sdaX                                      # get swap UUID
```

Add to kernel cmdline:

```
resume=UUID=<swap-uuid>
```

Regen initramfs.

### Swap file

```bash
sudo filefrag -v /swapfile | head -4
# first physical_offset in extent 0 is the offset
```

Cmdline:

```
resume=UUID=<root-fs-uuid> resume_offset=<offset>
```

The UUID is the filesystem holding the swap file, not the swap itself. The offset is in 4K blocks (filesystem-relative).

Note: on btrfs, hibernate to swap file is supported in modern kernels but the swap file must be created with `chattr +C` (NOCOW) and on a non-snapshotted subvolume — easy to set up wrong, watch for "swapfile is on subvolume" errors.

### Hibernate triggers

```bash
systemctl hibernate                                  # explicit
systemctl hybrid-sleep                               # write to disk and suspend (battery safety)
```

If `Failed to hibernate system: Sleep verb 'hibernate' not supported` — kernel cmdline missing `resume=`, or initramfs missing `resume` module.

## Suspend-then-hibernate

Suspends to RAM, then if battery low or after a timeout, transitions to disk. Configure in `/etc/systemd/sleep.conf`:

```
[Sleep]
HibernateDelaySec=2h
```

Trigger: `systemctl suspend-then-hibernate`.

## GPU-Specific Suspend Issues

| GPU | Issue | Fix |
|-----|-------|-----|
| Nvidia (any) | Black screen on wake | Enable `nvidia-suspend.service`, `nvidia-resume.service`; `NVreg_PreserveVideoMemoryAllocations=1` |
| Nvidia hybrid + Wayland | Multi-second black on wake (RTX laptops, s2idle) | Force `mem_sleep_default=deep` |
| AMD RDNA3/4 | Crash on wake | `amdgpu.sg_display=0`; kernel ≥ 6.14 |
| Intel laptop panel | Corruption after wake | `i915.enable_psr=0` |

See per-GPU references for full diagnostics.

## Wake Sources Audit

```bash
cat /proc/acpi/wakeup                                # current state
journalctl -b | grep -i "wakeup source"
cat /sys/power/wakeup_count
```

Disable specific wake sources to test if one is misbehaving:

```bash
echo <DEVICE> | sudo tee /proc/acpi/wakeup           # toggles
```

Common culprits: `XHC` (USB), `LID0` (laptop lid), `RTC` (real-time clock), `PWRB` (power button).

## Fwupd / Firmware

Modern Intel platforms ship firmware fixes for s2idle and modern standby via fwupd:

```bash
fwupdmgr refresh
fwupdmgr get-updates
fwupdmgr update
```

After firmware update reboot and re-test suspend. Especially important on Dell/Lenovo/HP laptops post-2022.

## Power Diagnostic Tools

```bash
sudo powertop                                        # comprehensive power state
sudo powertop --auto-tune                            # apply suggested tunings (test, may break things)
turbostat                                            # CPU C-states + package idle residency
sudo s2idle_report.py                                # if installed (Intel script)
```

For deep s2idle analysis (Intel): the kernel trace `/sys/kernel/debug/pmc_core/substate_residencies` shows whether the system actually entered the deep idle substates expected.

## Common Symptom Map

| Symptom | Likely cause | First fix |
|---------|-------------|-----------|
| Lid close → screen off but fans run | Suspend skipped, ran lid handler only | Check `/etc/systemd/logind.conf` `HandleLidSwitch=suspend` |
| Wakes 30s after suspending | Wake source firing | `cat /proc/acpi/wakeup`, disable culprit |
| Hibernate succeeds but restore boots fresh | `resume=` missing or initramfs missing module | Add cmdline + regen initramfs |
| `swapon` says swap inactive | not enabled at boot | `systemctl enable systemd-swap` or fstab `defaults` line |
| Battery draws hot during "sleep" | s2idle stuck out of deepest state | Check `pmc_core` debugfs, BIOS update, switch to `deep` |
| Display works on wake but keyboard dead | EC firmware bug | BIOS update, or `i8042.reset` cmdline as workaround |

## Cross-Reference

- GPU specifics: `nvidia.md` / `mesa.md`
- Initramfs / `resume` module / kernel cmdline edits: `boot-systemd.md`
- Battery / power profile / TLP / power-profiles-daemon: not in scope here — separate tooling
