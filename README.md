# Awesome-OS — `desktop-omarchy`

> Reusable, standalone **Omarchy Hyprland Desktop**, **25-Theme Cascading Engine**, and **Original Hotkey Runtime** — decoupled from Arch/T2 and natively projectable onto Linux Wayland, **Sectium**, or any browser via **OPFS `v11` CAS**.

---

## Install & Project via `holo-pm`

```powershell
# Project directly from immutable repository:// into local ./bin/ (0-byte hardlinks)
holo-pm install repository://github.com/awesome-os/desktop-omarchy@main

# Project full Omarchy desktop workspace with static musl awesome-os/coreutils
holo-project "project://coreutils/omarchy?from=repository://github.com/awesome-os/desktop-omarchy@main"
```

---

## Reusable Architecture

| Module | Purpose |
| :--- | :--- |
| [`themes/index.json`](themes/index.json) | Canonical normalized catalog of all **25 Omarchy themes** (`lumi-chromatic`, `lumi-white-dragon`, `tokyo-night`, `catppuccin`, `gruvbox`, `nord`, `kanagawa`, `rose-pine`, `hackerman`, etc.). |
| [`src/omarchy-theme-engine.mts`](src/omarchy-theme-engine.mts) | Zero-dependency erasable-TS theme engine + `OmarchyHostAdapter` interface (`HyprlandAdapter`, `SectiumAdapter`, `WebWasiAdapter`). |
| [`src/omarchy-hotkeys.mts`](src/omarchy-hotkeys.mts) | Original Omarchy Hyprland hotkey map (`Super+Ctrl+Shift+Space`, `Super+Space`, `Super+1..4`, `Super+Enter`, `Super+K`) + W3C Keyboard Lock `KEYBOARD_LOCK_CODES` + `Alt+*` browser fallbacks. |
| [`web/index.html`](web/index.html) | Self-contained browser Hyprland + 25-Theme Switcher experience (live at `https://awesome-os.com/demo/omarchy.html`). |
| [`holo-package.json`](holo-package.json) | Pure Holo `v11` metadata package targeting `B8G_ABI_MAGIC_V3` (`0x33564742`). |

---

## Verification

```powershell
.\bin\node.ps1 --test src/omarchy.test.mts
```

---

## Related Core Stack

- [`awesome-os/desktop`](https://github.com/awesome-os/desktop) — Startup Greeter & Sovereign Desktop OS Foundation
- [`awesome-os/sectium-browser`](https://github.com/awesome-os/sectium-browser) · [`awesome-os/awesome-os`](https://github.com/awesome-os/awesome-os) — Sovereign Browser-as-Shell & Core OS Monorepo
- [`awesome-os/coreutils`](https://github.com/awesome-os/coreutils) — MIT static musl Rust GNU coreutils
- [`awesome-os/holo-v11`](https://github.com/awesome-os/holo-v11) — Global Auditable `v11` Registry
