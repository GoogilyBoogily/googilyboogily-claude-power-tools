# unraid-troubleshooter

Symptom-routed Unraid diagnostic skill for Claude Code.

Covers Unraid 6.12 / 7.0 / 7.1 / 7.2 / 7.3 — array, parity, disabled disks, Docker networking (macvlan/ipvlan call traces), VM + GPU passthrough (IOMMU/VFIO/ACS), BTRFS/ZFS cache pools, user shares, SMB/NFS, Community Apps & plugins, boot USB / license, diagnostics bundle, and version-aware release-notes lookup against `docs.unraid.net`.

## Skill

- `debug-unraid` — auto-invoked when the user reports any Unraid symptom. Routes by symptom to a reference playbook, then runs diagnostic commands before suggesting fixes.

## Install

```
/plugin marketplace add GoogilyBoogily/googilyboogily-claude-power-tools
/plugin install unraid-troubleshooter
```

## Trigger examples

- "My Unraid array won't stop"
- "Disk got disabled, red ball, what now"
- "Macvlan call traces in syslog after upgrade"
- "GPU passthrough VM black screen"
- "BTRFS cache errors after reboot"
- "Plugin won't install / Community Apps broken"
- paste of `diagnostics` bundle or syslog excerpt
