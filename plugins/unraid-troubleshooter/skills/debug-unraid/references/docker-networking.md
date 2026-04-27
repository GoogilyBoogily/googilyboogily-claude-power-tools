# Docker & Networking on Unraid

Docker on Unraid is opinionated. Containers usually run on a **custom network** (bridge, host, macvlan, or ipvlan) tied to a parent interface (`eth0`, `bond0`, or `br0`). The single most common Unraid Docker bug — across every recent version — is **macvlan call traces** when the parent is a bridge (`br0`). Internalize that one, the rest is normal Docker.

## Quick Triage

```bash
# Network types and parent interface
cat /boot/config/docker.cfg | grep -E 'DOCKER_CUSTOM_NETWORK_TYPE|NETWORK_ON_BOOT'
docker network ls
docker network inspect br0 2>/dev/null | head -40

# Container state
docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Networks}}\t{{.Ports}}'

# Host networking
ip -br addr
ip -br link
brctl show 2>/dev/null

# Recent kernel/docker traces
dmesg -T --level=err,warn | grep -iE 'macvlan|ipvlan|netfilter|kernel BUG' | tail
grep -iE 'macvlan|call trace' /var/log/syslog | tail -30
```

## Symptom → Cause → Fix

### Macvlan call traces (kernel BUG / soft lockup) in syslog

Signature in syslog: `kernel BUG at net/core/...` or `------------[ cut here ]------------` followed by `macvlan_broadcast` in the call stack. Often coincides with array crashes, stuck unmounts, or full host hangs.

**Root cause:** macvlan custom networks are unreliable when the parent is a Linux bridge (`br0`). They work fine on a physical interface (`eth0`) or bond (`bond0`).

**Fixes (pick one, in order of preference):**

1. **Switch to ipvlan (cleanest):**
   - Settings → Docker → toggle **Advanced View** → set **Docker custom network type** to `ipvlan`.
   - Caveat: some routers (Fritzbox) and network management (UniFi/Ubiquiti) misbehave with ipvlan port forwards because all containers share the host MAC. If the user reports broken port forwarding after switching, that's why.

2. **Disable bridging on eth0 (Unraid's recommended fix from 6.12.4+):**
   - Settings → Network Settings → set "Enable bridging" = **No** for eth0.
   - Unraid creates a `macvtap` network parented to `eth0` directly (not `br0`), avoiding the kernel bug.
   - Side effect: VMs can't use `br0` directly — they must use the new macvtap network or a different bridge.

3. **2-NIC segmentation:**
   - Dedicate one physical NIC to Docker, leave bridging on the other for VMs.

4. **Revert: do not use a custom Docker network at all** — fall back to default bridge with port forwards. Acceptable for small setups.

**Reference threads:** forums.unraid.net topic 137048 ("How to solve macvlan and ipvlan issues with containers on a custom network"). The 6.12.4 release notes cover the macvtap workaround.

### Container has no network / can't reach LAN

```bash
docker inspect <name> | grep -E 'NetworkMode|IPAddress|MacAddress|Gateway'
docker exec <name> sh -c 'ip addr; ip route; cat /etc/resolv.conf; ping -c1 <gateway>'
```

| Cause | Fix |
|-------|-----|
| Container on default `bridge` but app expects host IP | Switch to host networking or custom network with its own IP. |
| Custom network (br0) but Unraid host has no `br0` (bridging disabled) | Either re-enable bridging or update container to use the macvtap/ipvlan network. |
| MAC collision (two containers with same `--mac-address`) | Remove explicit MAC; let Docker generate one. |
| Static IP outside DHCP range or VLAN | Match container subnet to physical LAN; check VLAN tagging in Settings → Network. |
| Container running as user `nobody` can't bind <1024 | Use port >1024 or set `cap_add: NET_BIND_SERVICE`. |

### Container can ping LAN but not the Unraid host (or vice versa)

This is **macvlan host isolation**, by design. macvlan disallows traffic between the host and its own macvlan children on the same parent interface.

Fixes:
- **Host access toggle:** Settings → Docker → Advanced → "Host access to custom networks" = **Enabled** (this creates a shim macvlan endpoint on the host).
- **ipvlan instead** — doesn't have this isolation.
- **Run on `host` network mode** for the specific container that needs host access.

### Port forward broken with ipvlan

Symptoms: external port reaches Unraid but reply returns wrong source MAC; some routers silently drop. Most common with Fritzbox firmware doing strict reverse-path checks.

Fixes:
- Use macvlan with the disable-bridging workaround (per 6.12.4) — restores per-container MACs.
- Or use Docker's default bridge + port publish (`-p 8080:80`) — always works.
- Or pin the container to host network mode for inbound services.

### Container won't start after upgrade

```bash
docker logs --tail 100 <name>
ls /boot/config/plugins/dockerMan/templates-user/ | grep <name>
```

| Cause | Fix |
|-------|-----|
| Image pulled `:latest` and broke | Pin a specific tag in the dockerMan template; redeploy. |
| Volume path changed (e.g. `/mnt/user/appdata` vs `/mnt/cache/appdata`) | Restore expected path in the template. Note: appdata should be on cache for performance; never `/mnt/user/appdata` because shfs adds latency. |
| Permissions on appdata wrong after `New Permissions` tool was run | `chown -R nobody:users /mnt/user/appdata/<container>` — but **don't `chmod 777`**, see `shares-permissions.md`. |
| Custom network IP collision | Remove explicit IP, let DHCP assign. |
| dockerd itself failed | `tail /var/log/syslog | grep dockerd`; consider deleting `docker.img` (loopback) and recreating — **only if no containers depend on it for ephemeral state** (containers keep their config in `/boot/config/plugins/dockerMan/templates-user/`, so re-add is easy). |

### docker.img full / "no space left on device"

Unraid's Docker uses a loopback image at `/mnt/cache/system/docker/docker.img` (or directory mode in newer versions).

```bash
docker system df
df -h /var/lib/docker
```

Fixes:
- `docker system prune -af --volumes` (warns user — destroys stopped containers and unused volumes/images).
- Increase docker.img size: Settings → Docker → set Docker vDisk size larger; **must stop Docker first**.
- Move to **directory mode** (modern Unraid recommends this): Settings → Docker → "Docker Data Root" type = directory. Avoids the loopback altogether.

### Network bond / VLAN issues

```bash
cat /boot/config/network.cfg
ip -br link
cat /proc/net/bonding/bond0 2>/dev/null
```

- Bond mode mismatch with switch → match LACP (mode 4) on both, or fall back to active-backup (mode 1) which works without switch config.
- VLAN tagging: set in Settings → Network Settings → "Enable VLANs" → assign VLAN IDs. Custom Docker networks can then bind to `eth0.<vid>` or a tagged bridge.
- IPv6 weirdness: some users see slow DNS or container egress fail when IPv6 is half-configured. Either fully configure IPv6 or disable it (Settings → Network).

## Version-Specific Gotchas

- **6.12.4**: introduced macvtap workaround when bridging is disabled on eth0.
- **6.12.6, 6.12.11, 6.12.12**: incremental kernel/docker updates that mitigated but did not eliminate macvlan call traces.
- **7.0.0**: Docker upgraded to 27.x. Some custom templates with deprecated flags (e.g., legacy `--link`) need updating.
- **7.2.0/7.3.0**: Docker `29.x`, MAC-address handling changes for custom networks. Check release notes if you see MAC-related warnings.

## When to Escalate

- Generic Docker question not Unraid-specific → `devops-agents` `docker-expert`
- App-inside-container debugging (logs say the app crashed) → app-specific
- VM networking via `br0` failing because bridging disabled → `references/vm-passthrough.md`
- Persistent kernel BUGs that aren't macvlan → `references/diagnostics-logs.md` for syslog interpretation, then check `references/release-notes.md` for known kernel regressions
