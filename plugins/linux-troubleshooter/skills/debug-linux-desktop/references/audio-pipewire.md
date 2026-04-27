# Audio Troubleshooting (PipeWire, PulseAudio, Bluetooth, ALSA)

Modern Linux distros run PipeWire with the `pipewire-pulse` shim, replacing PulseAudio. Some legacy systems still run PulseAudio directly. ALSA is the kernel layer beneath both.

## Quick Triage

```bash
wpctl status                                         # WirePlumber: full sink/source/stream tree
pactl info | grep "Server Name"                      # confirms PipeWire vs PulseAudio
systemctl --user status pipewire pipewire-pulse wireplumber
journalctl --user -u pipewire -u wireplumber -b --no-pager | tail -40
arecord -l; aplay -l                                 # ALSA-level cards
pw-top                                               # active streams
groups | grep -E 'audio|render'
```

If `pactl info` reports server name `PulseAudio (on PipeWire ...)` you're on PipeWire. If just `PulseAudio` you're on legacy PA.

## No Sound / "Dummy Output" Only

```bash
wpctl status
# Look for any sinks under "Audio". If only "Dummy Output" → no real device picked up
```

Causes + fixes:

- PipeWire user services not enabled:
  ```bash
  systemctl --user enable --now pipewire pipewire-pulse wireplumber
  ```
- Missing ALSA permissions: `groups | grep audio` — if absent on a non-systemd-logind setup, `sudo usermod -aG audio $USER` and re-login.
- Sink muted at hardware level: `alsamixer` → unmute (M to toggle), raise levels.
- Default sink not set: `wpctl set-default <sink-id>` (id from `wpctl status`).
- HDMI/DP audio not appearing: check the GPU's HDMI audio module is loaded — `lsmod | grep snd_hda_intel` (Intel/AMD), or for Nvidia ensure `nvidia-drm.modeset=1`.

## Mic Not Detected

```bash
wpctl status                                         # under Sources
arecord -l                                           # ALSA view
pw-cli ls Node | grep -i input
```

Fixes:
- Default source: `wpctl set-default <source-id>`
- Muted: `alsamixer` → F4 (capture) → unmute Capture / Internal Mic.
- USB mic: ensure `pipewire-alsa` installed; replug mic; check `dmesg | grep -i usb` for enumeration errors.
- Phone-quality Bluetooth mic: see Bluetooth A2DP/HSP section below.

## Sample Rate / Crackling / Stuttering

```bash
pw-metadata -n settings
```

Look at `clock.rate`, `clock.quantum`. Mismatch between app rate and PipeWire rate causes resampling artifacts.

Runtime nudge:

```bash
pw-metadata -n settings 0 clock.rate 48000
pw-metadata -n settings 0 clock.quantum 1024
```

Persistent — `~/.config/pipewire/pipewire.conf.d/99-custom.conf`:

```
context.properties = {
  default.clock.rate          = 48000
  default.clock.allowed-rates = [ 44100 48000 96000 ]
  default.clock.quantum       = 1024
  default.clock.min-quantum   = 32
  default.clock.max-quantum   = 8192
}
```

Restart: `systemctl --user restart pipewire wireplumber`.

For crackling on heavy CPU load: raise `default.clock.min-quantum` to 2048.

## Bluetooth Audio

```bash
bluetoothctl                                         # interactive
journalctl -u bluetooth -f                           # watch live during pairing
rfkill list                                          # is bluetooth soft-blocked?
dmesg | grep -i bluetooth | tail -20                 # firmware errors
```

### Pairing fails

- Soft block: `rfkill unblock bluetooth`.
- Old pairing record: `bluetoothctl remove <MAC>`, then re-pair.
- Service down: `systemctl status bluetooth`, `systemctl enable --now bluetooth`.

### Firmware missing

```
dmesg | grep -i "bluetooth.*firmware"
# "firmware file not found" → install firmware
```

- Arch / Fedora: `linux-firmware` (already installed normally).
- Debian: `firmware-iwlwifi` (Intel), `firmware-realtek` (Realtek), `firmware-atheros`, often in `non-free-firmware` repo.

### A2DP falls back to HSP/HFP (call-quality audio)

`wpctl status` shows profile `Headset Head Unit` instead of `High Fidelity Playback`.

```bash
wpctl set-profile <device-id> <a2dp-profile-id>      # find IDs in `wpctl status`
```

Persistent: in WirePlumber config (`~/.config/wireplumber/wireplumber.conf.d/`):

```lua
bluez_monitor.properties = {
  ["bluez5.codecs"] = "[ ldac aptx aptx_hd aptx_ll aac sbc_xq sbc ]",
  ["bluez5.enable-msbc"] = true,
  ["bluez5.enable-sbc-xq"] = true,
}
```

Restart WirePlumber after edits.

### Codec packaging

- LDAC, aptX, aptX-HD: provided by `pipewire-codec-aptx` (Arch) or built into PipeWire on Fedora.
- AAC on Debian: requires `libfdk-aac2` from `non-free`.
- LC3 / LE Audio: experimental — disable if causing negotiation failures.

## JACK / Pro Audio

PipeWire ships JACK API compatibility. Run apps via PipeWire's JACK:

```bash
pw-jack <app>                                        # one-off
PIPEWIRE_JACK=1 <app>                                # explicit env
```

Required: `pipewire-jack` package installed.

Pro audio memlock for low latency — `/etc/security/limits.d/99-audio.conf`:

```
@audio - memlock 256
@audio - rtprio  95
@audio - nice    -19
```

User must be in `audio` group (re-login).

## PulseAudio Legacy

For systems still on PulseAudio (no PipeWire):

```bash
pactl info
pactl list sinks short
pacmd dump 2>/dev/null                               # full state
```

Reset PA state if corrupt:

```bash
systemctl --user stop pulseaudio.socket pulseaudio.service
mv ~/.config/pulse ~/.config/pulse.bak
systemctl --user start pulseaudio.socket
```

Migration: most distros now want PipeWire. Replace with:

```bash
sudo apt install pipewire pipewire-pulse wireplumber
systemctl --user --now disable pulseaudio.socket pulseaudio.service
systemctl --user mask pulseaudio
systemctl --user --now enable pipewire pipewire-pulse wireplumber
```

(adjust pkg manager per distro)

## ALSA Direct Debugging

Bottom-of-stack diagnostics — useful if both PA and PW are failing.

```bash
aplay -l                                              # cards + devices
cat /proc/asound/cards
cat /proc/asound/card0/codec*                         # codec details
speaker-test -c 2 -t wav -l 1                         # generate test tone via ALSA
```

Test specific device:

```bash
aplay -D plughw:0,0 /usr/share/sounds/alsa/Front_Center.wav
```

If ALSA test plays but PipeWire doesn't, the issue is at the PW/WirePlumber layer.

## Common Symptom Map

| Symptom | Diagnose | Likely fix |
|---------|---------|-----------|
| App says "no audio devices" | `wpctl status` shows sinks? | If yes: app config; if no: PipeWire user services |
| Volume slider has no effect | `wpctl status` for default sink | `wpctl set-default <id>` |
| Random microphone gain jumps | echo cancel module | `wpctl set-mute <id> ENABLED` on the auto-gain stream, or disable echo-cancel in WP config |
| Bluetooth headset cuts mic on call | A2DP↔HSP profile switch | Force A2DP-only with `bluez5.codecs` config |
| HDMI audio missing after suspend | KMS audio reset | Restart `pipewire wireplumber` user services or replug HDMI |
| Sound only in one app then everyone else silent | Exclusive mode held | `pw-top` to find holder, kill or restart it |

## Cross-Reference

- HDMI audio absent + GPU recently changed: see `nvidia.md` or `mesa.md`.
- Mic permissions in Flatpak/Snap apps: `sandbox-flatpak.md`.
- Bluetooth interface won't come up at all: `network.md` (rfkill / hardware).
