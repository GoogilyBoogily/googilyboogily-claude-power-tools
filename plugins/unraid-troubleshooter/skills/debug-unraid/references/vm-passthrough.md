# VMs & PCIe Passthrough

Unraid VMs run on KVM/QEMU via libvirt. The complicated part isn't running VMs — it's PCIe passthrough (GPU, USB controller, NVMe), which depends on **IOMMU groups**. If your hardware groups the wrong devices together, no Unraid setting will fix it without ACS override (which trades stability and security for flexibility) or a different motherboard.

## Quick Triage

```bash
# IOMMU enabled?
dmesg | grep -iE 'iommu|dmar' | head

# Group assignments
for g in /sys/kernel/iommu_groups/*; do
  group=$(basename "$g")
  echo "Group $group:"
  for d in "$g"/devices/*; do lspci -nns "${d##*/}"; done
done

# What VFIO has bound
lspci -nnk | grep -A3 'vfio-pci'

# VM state
virsh list --all
ls /etc/libvirt/qemu/*.xml 2>/dev/null
```

## Symptom → Cause → Fix

### VM won't start, libvirt error

```bash
virsh start <vm> 2>&1
journalctl -u libvirtd --since "5 minutes ago" | tail -50
ls -la /etc/libvirt/qemu/<vm>.xml
```

Common causes:

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Cannot get interface MTU on br0" | Bridging disabled on eth0 (Docker macvtap workaround) | Use the macvtap network for VMs too, or re-enable bridging. |
| "qemu-system-x86_64: -device vfio-pci: vfio error" | Device not bound to vfio-pci or in use by host | Bind device to vfio-pci via `vfio-pci.ids=...` in syslinux.cfg. |
| "qcow2: Could not open backing file" | Image moved (e.g., user shifted path from `/mnt/cache` to `/mnt/user`) | Restore path in VM XML. Use `/mnt/user/...` for VM images that may move via mover. |
| "domain already defined" | Stale config | `virsh undefine <vm> --nvram` then redefine via GUI. |
| "Permission denied" on vdisk | wrong owner/perms after `New Permissions` | `chown -R libvirt-qemu:kvm /mnt/user/domains/<vm>`. |

### GPU passthrough black screen, code 43, host loses display

GPU passthrough is the most fragile area in Unraid. The cardinal rules:

1. **The GPU must be in its own IOMMU group**, or you need ACS override.
2. **The host cannot use the GPU at boot** if you want to pass it to a VM cleanly. Unraid uses the first VGA device for BIOS/console output; bind alternative or use server BIOS option "boot to UEFI shell" / a second card.
3. **Bind to vfio-pci before the kernel attaches the proprietary driver.**

Standard workflow:

```bash
# 1. Confirm IOMMU is enabled in BIOS and kernel
dmesg | grep -iE 'IOMMU|dmar' | head

# 2. List GPU IDs
lspci -nn | grep -iE 'vga|3d|audio|usb'
# Note vendor:device pairs, e.g. 10de:2204 (GPU) and 10de:1aef (HDMI audio)

# 3. Bind via vfio-pci in /boot/syslinux/syslinux.cfg
# Add to "append" line:  vfio-pci.ids=10de:2204,10de:1aef

# 4. Reboot, verify
lspci -nnk -d 10de:2204
# Kernel driver in use: vfio-pci      ← good
# Kernel driver in use: nvidia        ← bad, didn't bind
```

GUI alternative: **Tools → System Devices** → check the boxes for the GPU and its audio function → Apply → reboot. Unraid writes the vfio binding for you.

### Code 43 (Nvidia detects "consumer card in VM")

Older driver behavior. Two reliable fixes:
- **Hide KVM signature** in VM XML:

  ```xml
  <features>
    <hyperv>
      <vendor_id state='on' value='whatever'/>
    </hyperv>
    <kvm>
      <hidden state='on'/>
    </kvm>
  </features>
  ```

- **Use a vBIOS dump** for the specific card. Dump from a Linux host with that card primary, or extract from manufacturer BIOS file. Copy to `/mnt/user/isos/vbios/<card>.rom` and reference in VM XML `<rom file='...'/>`.

Recent Nvidia drivers (470+) no longer enforce code 43 for most consumer cards. Try without vBIOS first.

### "Multifunction" devices in same IOMMU group

Example: GPU (function 0) and its HDMI audio (function 1) are always in the same group — that's normal, both must be passed. But if your USB controller and GPU are in the same group, that's a hardware/BIOS limitation.

Options:
- BIOS: enable IOMMU (sometimes called VT-d on Intel, AMD-Vi on AMD), enable "Above 4G decoding", check for ACS / SR-IOV settings, update BIOS.
- Switch motherboard to one with native ACS support (server boards: SuperMicro, AsRock Rack; some workstation Threadripper, Xeon W).
- Use **PCIe ACS Override** (Unraid: Settings → VM Manager → enable Advanced View → set "PCIe ACS override"). Cycle through `Disable / Downstream / Multifunction / Both`. Each adds entropy to the kernel groupings; pick the one that splits your needed device. **Warning the user is required**: ACS override degrades isolation, increasing risk that a malicious or buggy guest can DMA across devices.

### USB controller passthrough

Pass the **whole controller**, not individual USB ports. Each USB port belongs to a controller; you can't pick one keyboard out without passing the controller. Find which controller a port belongs to:

```bash
lsusb -t                    # tree view
ls -la /sys/bus/usb/devices/usb*/  # match physical ports to controllers
```

Pass the controller PCI device via vfio-pci as with a GPU.

### NVMe passthrough for a VM

NVMe controllers usually IOMMU-isolate cleanly. Pass via vfio-pci; **the disk cannot also be in the array or a pool** while passed through. Stop the array or pool that contains it first.

### VM extremely slow, audio crackles, mouse stutter

- **CPU pinning:** Settings → CPU Pinning → assign isolated cores to the VM, leave at least 1 physical core (2 threads) for Unraid host.
- **Isolate cores from host:** add `isolcpus=2-7` to syslinux.cfg, **separately** also pin in the VM XML.
- **Hugepages** for low-latency: `hugepages=1G` in syslinux.cfg, allocate via `/sys/kernel/mm/hugepages/`. Many gamers skip this and use 2M pages — fine for most cases.
- **MSI for GPU audio** (Windows guest): use MSI Utility on the guest to enable Message Signaled Interrupts for the HDMI audio device — fixes the crackling.

### Host loses keyboard/mouse on VM start

Host's USB controller got passed through. Solutions:
- Pass a **different** USB controller to the VM (use `lsusb -t` + IOMMU groups to find one not used by host keyboard/mouse).
- Use **virtio input** with Spice/VNC for the VM.
- Add a cheap PCIe USB card on its own group, dedicate it to VMs.

## Version-Specific Gotchas

- **7.0.0**: VM names must not contain ZFS-invalid characters (because VM disks may live on ZFS pools). Existing VMs with bad chars throw an "update disabled" error — rename in XML.
- **7.1.0**: Kernel reverted to 6.12.24 to fix the ZFS-loopback hang affecting Docker AND VMs.
- **7.2.0**: QEMU upgraded; some older Windows VMs may need machine type bumped (`pc-q35-7.2` → newer) for stable boot.
- **7.3.0**: libvirt updated; check release notes if old XML fails validation.

## When to Escalate

- Generic KVM/QEMU question (not Unraid GUI-related) → systems-level expert
- Specific guest OS misbehaving (Windows update broke driver) → guest-OS troubleshooting outside scope
- Networking inside VM not reaching LAN → `references/docker-networking.md` (same bridge/macvtap concerns apply)
- Disk image storage choice (BTRFS vs ZFS for vdisks) → `references/cache-pools.md`
