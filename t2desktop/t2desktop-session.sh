#!/bin/sh
# T2Desktop — Sovereign Omarchy Wayland/Hyprland Session Launcher for T2Linux
# Uses Awesome-OS b8g-ghost CAS (@ cas-v1) with zero pacman/yay/AUR dependencies.

set -eu

export XDG_CURRENT_DESKTOP=Hyprland
export XDG_SESSION_TYPE=wayland
export XDG_SESSION_DESKTOP=Hyprland
export B8G_GHOST_CACHE_DIR="${B8G_GHOST_CACHE_DIR:-/var/lib/b8g/cas}"
export T2DESKTOP_THEME="${T2DESKTOP_THEME:-lumi-white-dragon}"

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
T2DESKTOP_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/.." && pwd)
THEME_DIR="$T2DESKTOP_ROOT/themes/$T2DESKTOP_THEME"
HYPR_THEME_CONF="$THEME_DIR/hyprland.conf"
WAYBAR_THEME_CSS="$THEME_DIR/waybar.css"

RUNTIME_DIR="${XDG_RUNTIME_DIR:-/tmp/t2desktop-$(id -u)}"
mkdir -p "$RUNTIME_DIR/t2desktop"
SESSION_HYPR_CONF="$RUNTIME_DIR/t2desktop/hyprland.session.conf"

TERMINAL_BIN="${T2DESKTOP_TERMINAL:-ghostty}"
if ! command -v "$TERMINAL_BIN" >/dev/null 2>&1; then
  if command -v alacritty >/dev/null 2>&1; then
    TERMINAL_BIN=alacritty
  elif command -v kitty >/dev/null 2>&1; then
    TERMINAL_BIN=kitty
  else
    TERMINAL_BIN=foot
  fi
fi

cat > "$SESSION_HYPR_CONF" <<EOF
# Auto-generated T2Desktop Wayland/Hyprland session overlay
# Theme: $T2DESKTOP_THEME | CAS Store: $B8G_GHOST_CACHE_DIR

source = $HYPR_THEME_CONF

# Core T2Desktop appliance bindings (Super+Return / Super+B / Super+C)
bind = SUPER, Return, exec, $TERMINAL_BIN
bind = SUPER, B, exec, sectium-browser
bind = SUPER, C, exec, code-oss

# Waybar with Lumi White Dragon stylesheet
exec-once = waybar -s $WAYBAR_THEME_CSS
EOF

if [ "${T2DESKTOP_DRY_RUN:-0}" = "1" ]; then
  printf 'T2Desktop session ready (theme=%s, cas=%s, config=%s)\n' \
    "$T2DESKTOP_THEME" "$B8G_GHOST_CACHE_DIR" "$SESSION_HYPR_CONF"
  exit 0
fi

if command -v Hyprland >/dev/null 2>&1; then
  exec Hyprland -c "$SESSION_HYPR_CONF" "$@"
fi

printf 't2desktop-session: Hyprland binary not found in PATH\n' >&2
exit 127
