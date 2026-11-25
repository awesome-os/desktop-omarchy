/**
 * omarchy-hotkeys.mts — Canonical Omarchy Hyprland Hotkey Map & W3C Keyboard Lock Spec
 *
 * Supports native Super/Meta bindings (on Hyprland, Sectium, and Chromium Fullscreen
 * Keyboard Lock) alongside Alt+* fallbacks for windowed browser sessions.
 */

export type OmarchyAction =
  | 'theme-switcher'
  | 'theme-next'
  | 'walker-menu'
  | 'terminal'
  | 'workspace-1'
  | 'workspace-2'
  | 'workspace-3'
  | 'workspace-4'
  | 'hotkeys-help'
  | 'close-or-home';

export interface HotkeyEventLike {
  metaKey: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  code: string;
  key: string;
}

export const KEYBOARD_LOCK_CODES: readonly string[] = [
  'MetaLeft', 'MetaRight', 'AltLeft', 'ControlLeft', 'ShiftLeft',
  'Space', 'Enter', 'KeyT', 'KeyN', 'KeyK', 'KeyW',
  'Digit1', 'Digit2', 'Digit3', 'Digit4',
];

export const OMARCHY_HOTKEY_TABLE: ReadonlyArray<{ action: OmarchyAction; superCombo: string; altFallback: string; description: string }> = [
  { action: 'theme-switcher', superCombo: 'Super+Ctrl+Shift+Space', altFallback: 'Alt+T', description: 'Open Omarchy 25-Theme Switcher' },
  { action: 'theme-next', superCombo: 'Super+Ctrl+Space', altFallback: 'Alt+N', description: 'Cycle to next Omarchy theme' },
  { action: 'walker-menu', superCombo: 'Super+Space / Super+Alt+Space', altFallback: 'Alt+Space / Alt+M', description: 'Open Walker Launcher & Omarchy Menu' },
  { action: 'terminal', superCombo: 'Super+Enter', altFallback: 'Alt+Enter', description: 'Focus / Launch Alacritty Terminal' },
  { action: 'workspace-1', superCombo: 'Super+1', altFallback: 'Alt+1', description: 'Switch to Workspace 1 (Dev)' },
  { action: 'workspace-2', superCombo: 'Super+2', altFallback: 'Alt+2', description: 'Switch to Workspace 2 (Sectium / Emukit)' },
  { action: 'workspace-3', superCombo: 'Super+3', altFallback: 'Alt+3', description: 'Switch to Workspace 3 (OPFS v11 CAS)' },
  { action: 'workspace-4', superCombo: 'Super+4', altFallback: 'Alt+4', description: 'Switch to Workspace 4 (25-Theme Studio)' },
  { action: 'hotkeys-help', superCombo: 'Super+K', altFallback: 'Alt+K', description: 'Show Omarchy Hotkey Cheatsheet' },
  { action: 'close-or-home', superCombo: 'Super+W', altFallback: 'Alt+W', description: 'Close active overlay or return to Workspace 1' },
];

export function matchOmarchyHotkey(e: HotkeyEventLike): OmarchyAction | null {
  const sup = Boolean(e.metaKey);
  const alt = Boolean(e.altKey);
  const ctrl = Boolean(e.ctrlKey);
  const shift = Boolean(e.shiftKey);
  const lower = (e.key || '').toLowerCase();

  if ((sup && ctrl && shift && e.code === 'Space') || (alt && !sup && lower === 't')) {
    return 'theme-switcher';
  }
  if ((sup && ctrl && !shift && e.code === 'Space') || (alt && !sup && lower === 'n')) {
    return 'theme-next';
  }
  if ((sup && e.code === 'Space') || (alt && e.code === 'Space') || (alt && lower === 'm')) {
    return 'walker-menu';
  }
  if ((sup || alt) && e.key === 'Enter') {
    return 'terminal';
  }
  if ((sup || alt) && e.code === 'Digit1') return 'workspace-1';
  if ((sup || alt) && e.code === 'Digit2') return 'workspace-2';
  if ((sup || alt) && e.code === 'Digit3') return 'workspace-3';
  if ((sup || alt) && e.code === 'Digit4') return 'workspace-4';
  if ((sup || alt) && lower === 'k') return 'hotkeys-help';
  if ((sup || alt) && lower === 'w') return 'close-or-home';
  return null;
}
