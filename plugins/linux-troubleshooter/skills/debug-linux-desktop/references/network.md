# Network Troubleshooting (NetworkManager, Wi-Fi, DNS, VPN)

Most desktop distros use NetworkManager + systemd-resolved. Some use iwd directly. This covers the user-visible "internet won't work" scenarios.

## Quick Triage

```bash
nmcli general status
nmcli device status
nmcli connection show
ip -br addr
ip route
resolvectl status
ping -c 3 1.1.1.1                                    # raw IP — connectivity test
ping -c 3 cloudflare.com                             # DNS test
journalctl -u NetworkManager -b --no-pager | tail -30
```

If `ping 1.1.1.1` works but `ping cloudflare.com` fails → DNS issue. If both fail → routing or interface issue.

## NetworkManager

```bash
nmcli device                                         # state per interface
nmcli connection show <name>                         # config detail
nmcli connection up <name>                           # bring up
nmcli connection down <name>
sudo systemctl restart NetworkManager
```

Enable runtime debug logging without restart:

```bash
sudo nmcli general logging level DEBUG domains ALL
journalctl -u NetworkManager -f                      # tail
# reset:
sudo nmcli general logging level INFO domains DEFAULT
```

Persistent config: `/etc/NetworkManager/NetworkManager.conf` plus `/etc/NetworkManager/conf.d/*.conf` snippets.

## Wi-Fi

```bash
nmcli device wifi list
nmcli device wifi connect "<SSID>" password "<pass>"
iw dev                                               # interfaces from kernel side
iw <iface> link                                      # link state, signal
sudo iw <iface> scan | grep -E "SSID|signal"
rfkill list                                          # radio block state
```

### Wi-Fi not connecting

- Hard block: `rfkill list` shows hard-blocked → physical switch or BIOS.
- Soft block: `rfkill unblock wifi`.
- Wrong regulatory domain (channels missing, weak signal):
  ```bash
  iw reg get
  sudo iw reg set US                                  # or your country code
  ```
  Persist: `/etc/conf.d/wireless-regdom` (Gentoo) or `options cfg80211 ieee80211_regdom=US` in `/etc/modprobe.d/cfg80211.conf`.
- Driver/firmware: `dmesg | grep -iE 'wifi|wlan|iwlwifi|iwlmvm|rtw|brcm|ath'` — look for firmware load failures, install missing firmware pkg.

### iwd vs wpa_supplicant

These conflict — only one should manage the interface.

```bash
systemctl status iwd wpa_supplicant
```

If both present: pick one, mask the other.

To use iwd as NetworkManager backend:

```
# /etc/NetworkManager/conf.d/wifi_backend.conf
[device]
wifi.backend=iwd
```

Then:

```bash
sudo systemctl mask wpa_supplicant
sudo systemctl enable --now iwd
sudo systemctl restart NetworkManager
```

iwd direct (no NetworkManager): `iwctl` interactive shell.

### Wi-Fi 6E / 7 / 320MHz issues

Newer chipsets often need:
- Recent kernel (≥ 6.6 for Wi-Fi 7 baseline; 6.10+ for stable).
- Latest `linux-firmware`.
- Country code that allows 6GHz (US/EU yes, others vary).

If the AP's 6E SSID isn't showing up but 5GHz is, it's almost always the regulatory domain.

## DNS

systemd-resolved is the default DNS resolver on most desktops. Check:

```bash
resolvectl status
resolvectl query example.com                         # full path including DNSSEC
cat /etc/resolv.conf                                 # should symlink to stub
ls -la /etc/resolv.conf
```

`/etc/resolv.conf` should be a symlink to `/run/systemd/resolve/stub-resolv.conf` (points at 127.0.0.53). If a previous tool replaced it with a static file, restore:

```bash
sudo ln -sf /run/systemd/resolve/stub-resolv.conf /etc/resolv.conf
```

### DNS broken on a specific connection

```bash
nmcli connection show <name> | grep -E 'ipv4.dns|ipv6.dns'
```

Override DNS for a connection:

```bash
nmcli connection modify <name> ipv4.dns "1.1.1.1 9.9.9.9" ipv4.ignore-auto-dns yes
nmcli connection up <name>
```

### Split DNS / VPN leaks

```bash
resolvectl domain                                    # which interface owns which domains
resolvectl dns                                       # per-interface DNS servers
```

If VPN's domain isn't in its interface's `Domain` list, queries leak to the default resolver. NetworkManager VPN config or the VPN's connect script should set this.

## VPN

WireGuard (most modern):

```bash
sudo wg                                              # state
ip route                                             # is the WG interface getting routes?
ip -s link show wg0
journalctl -u wg-quick@<name> -b
```

Common: AllowedIPs missing `0.0.0.0/0` won't route default traffic; killswitch (`PostUp = iptables ...`) blocks if WG is down.

OpenVPN:

```bash
journalctl -u openvpn-client@<name> -b
sudo openvpn --config /path/to.ovpn                  # foreground for live errors
```

NetworkManager VPN connections — check the connection profile under Settings → Network, or `nmcli connection show <vpn-name>`.

## Ethernet Won't Come Up

```bash
ip link
sudo ethtool <iface>
sudo dmesg | grep -i <iface>
```

- Cable: `ethtool <iface>` "Link detected: yes"?
- Driver: `lsmod | grep -E 'r8169|igc|igb|e1000e|tg3'`
- Realtek 2.5G `r8169` driver is often unstable — vendor-supplied `r8125`/`r8126` DKMS may work better. Inverse also true on newer kernels — try in-tree first.

## DHCP Issues

```bash
nmcli device show <iface> | grep -E 'IP4|DHCP'
journalctl -u NetworkManager -b | grep -i dhcp
sudo nmcli connection up <name>                      # forces re-DHCP
```

If DHCP times out: try a different DHCP client backend in NetworkManager:

```
# /etc/NetworkManager/conf.d/dhcp.conf
[main]
dhcp=internal                                        # or dhclient
```

## IPv6 Specific

If only IPv6 broken:

```bash
sysctl net.ipv6.conf.all.disable_ipv6                # 0 = enabled
ip -6 addr
ip -6 route
```

Some routers/ISPs ship broken IPv6 — disable per-connection if it's blocking:

```bash
nmcli connection modify <name> ipv6.method disabled
```

## Captive Portal Detection

```bash
nmcli general status                                 # state should be "connected (limited)" if captive detected
```

NetworkManager runs `nm-online` which probes `connectivity-check.fedoraproject.org` (or distro equivalent). If your network blocks the probe, NM thinks there's no internet. Configure custom URL in `[connectivity]` section of NM config.

## Common Symptoms Map

| Symptom | Diagnose | Likely fix |
|---------|---------|-----------|
| "Connected but no internet" | `ping 1.1.1.1` works? | DNS — check resolvectl, fix resolv.conf symlink |
| Specific site blocked, others work | DNS or MTU | `ip link set <iface> mtu 1400` to test MTU; `dig` from alternate server |
| Slow Wi-Fi but full bars | Wrong band/channel | `iw dev` shows actual freq; reg domain or AP config |
| VPN drops, can't restore | killswitch active | Check VPN's PostDown / iptables rules, `nmcli connection up <name>` |
| Random disconnects every N min | Power save | `iw <iface> set power_save off`; persist in NM config |

Disable Wi-Fi power save (driver-level idle that drops short connections):

```
# /etc/NetworkManager/conf.d/wifi-powersave.conf
[connection]
wifi.powersave = 2                                   # 2 = disable
```

## Cross-Reference

- Network breaks during/after suspend: `suspend.md` (NM may need restart on resume — check `NetworkManager-wait-online.service`)
- Bluetooth (uses same rfkill stack): `audio-pipewire.md` Bluetooth section
- Firewall blocking specific apps: check `firewalld --list-all` or `iptables -L -nv` / `nft list ruleset` — out of scope here
