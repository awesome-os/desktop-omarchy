# T2Desktop — Sovereign Omarchy Edition for T2Linux + `b8g-ghost` CAS

**T2Desktop** is the sovereign **Awesome-OS** fork of [Omarchy](https://github.com/omacom/omarchy) (MIT Hyprland/Wayland desktop by David Heinemeier Hansson), ported from Arch Linux (`pacman` / `yay` / AUR) onto **T2Linux** and the **`b8g-ghost @ cas-v1`** content-addressed appliance store.

- **Zero `pacman` / `yay` / AUR bloat:** Desktop appliances hydrate directly by SHA-256 from [`awesome-os/b8g-ghost` (`cas-v1`)](https://github.com/awesome-os/b8g-ghost/releases/tag/cas-v1).
- **Signature Theme — Lumi White Dragon:** Obsidian background (`#0d111a`) with Electric Cyan (`#38bdf8`) and Sovereign Violet (`#5865f2`) active window borders in [`themes/lumi-white-dragon/`](themes/lumi-white-dragon/).
- **Instant Sovereign Appliances:** `sectium-browser`, `libsectium_display`, `code-oss`, `brave`, `blender`, `obs`, `qt`, `electron`, and `b8g-ghost-abi` resolved via [`t2desktop/hydrate-desktop.mts`](t2desktop/hydrate-desktop.mts).
- **Clean Wayland/Hyprland Session:** [`t2desktop/t2desktop-session.sh`](t2desktop/t2desktop-session.sh) sets `XDG_CURRENT_DESKTOP=Hyprland`, `B8G_GHOST_CACHE_DIR=/var/lib/b8g/cas`, loads **Lumi White Dragon**, and wires:
  - `Super + Return` — Sovereign terminal (`ghostty` / `alacritty` / `kitty`)
  - `Super + B` — `sectium-browser`
  - `Super + C` — `code-oss`

---

## Quick Start

```sh
# 1. Resolve the live b8g-ghost cas-v1 desktop appliance catalog (Node 24+, erasable TS)
node t2desktop/hydrate-desktop.mts

# 2. Verify live CAS resolution, Lumi White Dragon theme, and session script
node --test t2desktop/test/t2desktop.test.mts
sh -n t2desktop/t2desktop-session.sh

# 3. Launch the T2Desktop Hyprland/Wayland session on T2Linux
./t2desktop/t2desktop-session.sh
```

---

## Repository Layout

| Path | Description |
| :--- | :--- |
| [`t2desktop/hydrate-desktop.mts`](t2desktop/hydrate-desktop.mts) | Erasable TypeScript CAS hydrator resolving T2Desktop appliances from `b8g-ghost @ cas-v1`. |
| [`t2desktop/t2desktop-session.sh`](t2desktop/t2desktop-session.sh) | POSIX Wayland/Hyprland session launcher for T2Linux (`B8G_GHOST_CACHE_DIR=/var/lib/b8g/cas`). |
| [`t2desktop/test/t2desktop.test.mts`](t2desktop/test/t2desktop.test.mts) | Live `cas-v1` index, theme, and session launcher verification suite. |
| [`themes/lumi-white-dragon/`](themes/lumi-white-dragon/) | Signature **Lumi White Dragon** theme (`hyprland.conf`, `waybar.css`, `colors.json`, `colors.toml`). |
| [`config/`](config/), [`default/`](default/), [`themes/`](themes/) | Upstream Omarchy Hyprland, Waybar, Walker, terminal configs, and theme collection. |
| [`manual/`](manual/) | Upstream [Omarchy Manual](manual/01-welcome-to-omarchy.md) (preserved for reference). |

---

## Attribution & License

T2Desktop is derived from **[omacom/omarchy](https://github.com/omacom/omarchy)** by David Heinemeier Hansson and contributors, released under the **[MIT License](LICENSE)**. All upstream Omarchy Hyprland/Waybar/Walker configurations, themes, and documentation are preserved under MIT terms alongside the Awesome-OS T2Linux + `b8g-ghost` CAS port.

## Quick Install & Run (Windows / Linux / macOS)

```sh
# Download latest release assets (all platforms)
gh release download -R awesome-os/t2desktop-omarchy --dir ./t2desktop-omarchy-release

# Or clone source directly (all platforms)
git clone https://github.com/awesome-os/t2desktop-omarchy.git && cd t2desktop-omarchy
```
