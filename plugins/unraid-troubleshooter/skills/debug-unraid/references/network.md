# Networking (Bonds, Bridges, VLANs, Wi-Fi)

Unraid's network stack supports bonding, bridging, VLAN tagging, and (since 7.1) wireless. Most non-Docker network issues fall into: wrong cabled/bonded link, VLAN mis-tag, or a bridge fighting Docker's macvlan. Configuration lives in `/boot/config/network.cfg` and is regenerated from the GUI on every change — hand-edits stick only if the GUI doesn't override them.

## Quick Triage

```bash
# Effective config
cat /boot/config/network.cfg

# Live state
ip -br addr
ip -br link
ip route
brctl show 2>/dev/null
cat /proc/net/bonding/bond0 2>/dev/null
ethtool eth0 | grep -E 'Speed|Duplex|Link detected'

# DNS / resolution
cat /etc/resolv.conf
nslookup unraid.net 2>&1 | head

# Recent network errors
dmesg -T | grep -iE 'eth|bond|bridge|igc|i40e|r8169|igb|e1000' | tail -40
grep -iE 'link is down|link is up|carrier|netdev' /var/log/syslog | tail -30
```

## Symptom → Cause → Fix

### eth0 / bond0 down or wrong speed

```bash
ethtool eth0 | grep -E 'Speed|Duplex|Auto-negotiation|Link detected'
ip -s link show eth0   # rx/tx errors and drops
```

| Tell | Cause | Fix |
|------|-------|-----|
| Speed 100 Mbps on a gigabit NIC | Bad cable / wrong port (5e vs 6) / autoneg fail | Replace cable, force speed: `ethtool -s eth0 speed 1000 duplex full autoneg on` |
| Speed 1 Gbps on a 10 Gbps link | SFP+/DAC issue, or transceiver code lock | Check SFP compatibility (some Intel NICs whitelist), `ethtool -m eth0` |
| Link flapping | Cable, switch port, or driver | Try different port and cable; check switch logs |
| `rx_dropped` growing fast | Buffer too small, or interrupt steering | Increase ring buffer: `ethtool -G eth0 rx 4096 tx 4096`, persist via go-script |
| Realtek r8169 errors / drops | Known-flaky default driver | Install `Realtek r8125-dkms` plugin, or replace with Intel NIC if persistent |

### Bond not coming up / wrong members

`/proc/net/bonding/bond0` shows the live bond state.

```bash
cat /proc/net/bonding/bond0
# MII Status: up
# Bonding Mode: ...
# Slave Interface: eth0
#   MII Status: up
```

| Mode | When to use |
|------|------------|
| `mode 0` (round-robin) | Rare; needs L4 hashing on switch |
| `mode 1` (active-backup) | Default; works without switch config — pick this if unsure |
| `mode 4` (LACP/802.3ad) | Switch supports LACP and is configured; best throughput |
| `mode 6` (balance-alb) | ARP-based load balance; doesn't need switch config but limited |

If LACP isn't bonding: switch port-channel must be configured, and both NICs must negotiate LACPDUs. `cat /proc/net/bonding/bond0` will show "MII Status: down" on members not in the LACP partnership. Drop to `mode 1` to confirm cabling, then re-engage with switch admin.

Settings → Network Settings → Interface Rules — Unraid may rename interfaces if MAC mappings change. `/boot/config/network-rules.cfg` pins the mapping.

### VLAN tagging not working

```bash
ip -d link show
# look for: vlan protocol 802.1Q id <vid> ...
```

Unraid VLAN setup: Settings → Network Settings → Enable VLANs → assign VLAN IDs. This creates `eth0.10`, `bond0.10`, etc.

| Issue | Cause | Fix |
|-------|-------|-----|
| Container on VLAN can't reach LAN | Switch port not trunking | Configure switch port as trunk with the VLAN tagged |
| Tagged traffic missing | NIC's tag offload broken | `ethtool -K eth0 rxvlan off txvlan off` to disable HW offload |
| VLAN works but DHCP fails | DHCP server not configured for that VLAN | Use static IP, or fix DHCP scope on router |

For Docker custom networks on VLANs: pick the `eth0.<vid>` (or `bond0.<vid>`) interface as the parent in Settings → Docker.

### Wi-Fi (Unraid 7.1+) not connecting

7.1 added wireless support but with constraints:
- One wireless interface only (`wlan0`)
- No bridging on wireless — Docker custom networks must use **ipvlan**
- VMs using wireless must use libvirt's `virbr0` (NAT)

```bash
ip -br link | grep wlan
iwconfig wlan0 2>&1 | head
nmcli dev wifi 2>/dev/null
journalctl -u wpa_supplicant --since "10 minutes ago" 2>/dev/null
```

Common gotchas:
- 5 GHz channels region-locked: regdomain wrong → `iw reg get`, `iw reg set US`
- Hidden SSID: must be configured in Settings → Network with explicit SSID
- WPA3-only AP: older kernels miss SAE; check Unraid kernel version
- Driver: many on-board cards work; some Realtek wifi drivers are flaky

### DNS broken / slow

```bash
cat /etc/resolv.conf
# Should have nameservers; if blank, DHCP didn't set them or static config wrong

# Test
dig unraid.net @8.8.8.8 +short
# vs
dig unraid.net +short

# IPv6 only / dual stack confusion
host unraid.net
```

| Tell | Cause | Fix |
|------|-------|-----|
| `resolv.conf` empty | DHCP didn't return DNS, or static IP without DNS set | Settings → Network → set DNS servers (8.8.8.8, 1.1.1.1) |
| 5-second pauses on DNS lookup | IPv6 AAAA queried first, no IPv6 reply | Disable IPv6, or properly configure it; or `options single-request-reopen` in resolv.conf |
| DNS works for some hosts, not others | Custom router DNS interfering | Bypass router's DNS or fix router |

### Container egress works but inbound (port forward) broken

See `docker-networking.md` for the macvlan/ipvlan section. Almost always one of:
- Custom network type wrong for your router (Fritzbox + ipvlan)
- Bridging disabled but container still on `br0`
- Port forward on router pointed at wrong host IP
- Unraid's iptables rules dropping (rare but check `iptables -L -n -v`)

### Network seems sluggish / SMB transfer slow

```bash
# Pure network speed (eliminate disk)
iperf3 -s             # on Unraid
iperf3 -c <unraid-ip> # on client; expect ~940 Mbps on 1G, ~9.4 Gbps on 10G

# Disk speed
hdparm -t /dev/sdX
fio --name=test --filename=/mnt/cache/fio.tmp --size=1G --bs=1M --rw=write --direct=1
```

If iperf3 is slow, it's network. If iperf3 is fast but SMB is slow, it's filesystem/SMB tuning (see `shares-permissions.md`).

### Two NICs both up, one taking traffic, one idle

Either bond them (preferred) or set distinct routes/segregation:
- LAN traffic on eth0, Docker custom network on eth1 → "2-NIC segmentation" mitigates macvlan call traces
- Settings → Docker → Network → bind custom networks to eth1's IP

## Persistent Network Tweaks via go-script

Some changes don't survive boot via the GUI. Add to `/boot/config/go`:

```bash
# Bigger network buffers for 10G+
sysctl -w net.core.rmem_max=33554432
sysctl -w net.core.wmem_max=33554432
sysctl -w net.ipv4.tcp_rmem="4096 87380 33554432"
sysctl -w net.ipv4.tcp_wmem="4096 65536 33554432"

# Disable IPv6 entirely (if it's causing issues)
echo 1 > /proc/sys/net/ipv6/conf/all/disable_ipv6
echo 1 > /proc/sys/net/ipv6/conf/default/disable_ipv6

# Stable interface naming via udev (rare; usually use Unraid's network-rules.cfg)
```

## Version-Specific Gotchas

- **6.12.4+**: macvtap auto-creation when bridging disabled — important for Docker, see `docker-networking.md`.
- **7.0.0**: nginx upgraded; some custom reverse-proxy hand-edits in `/etc/nginx/` may need re-applying.
- **7.1.0**: Wireless added; first time `wlan0` shows up in Network Settings.
- **7.2.0**: Built-in Unraid API on port 8443/HTTPS; if you reverse-proxy Unraid, account for this.
- **7.2.0+**: SSO (single sign-on) support via Unraid Connect; may interact with reverse proxies.

## When to Escalate

- Container-specific networking → `docker-networking.md`
- VM networking (especially with bridging disabled) → `vm-passthrough.md`
- Reverse proxy / SWAG / Nginx Proxy Manager → those containers' own docs
- Wi-Fi driver issues → kernel-side; check release notes and forum for the specific chipset
