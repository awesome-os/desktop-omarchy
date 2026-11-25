/**
 * omarchy-theme-engine.mts — Reusable Zero-Dependency Omarchy 25-Theme Engine
 *
 * Consumed identically by:
 *   - Native Linux Hyprland / Waybar / Alacritty (HyprlandAdapter)
 *   - Awesome-OS Desktop / Sectium Display Driver (SectiumAdapter)
 *   - Browser WASM + OPFS v11 Web Host (WebWasiAdapter)
 */

export interface OmarchyThemeRecord {
  id: string;
  label: string;
  light: boolean;
  colors: Record<string, string>;
  backgrounds: string[];
}

export interface OmarchyResolvedTokens {
  id: string;
  label: string;
  light: boolean;
  bg: string;
  bgDark: string;
  surface: string;
  fg: string;
  fgBright: string;
  muted: string;
  accent: string;
  accent2: string;
  green: string;
  yellow: string;
  red: string;
  cyan: string;
  selection: string;
}

export interface OmarchyHostAdapter {
  readonly name: string;
  applyTheme(theme: OmarchyThemeRecord, tokens: OmarchyResolvedTokens): void | Promise<void>;
}

export function resolveThemeTokens(theme: OmarchyThemeRecord): OmarchyResolvedTokens {
  const c = theme.colors || {};
  const bg = c.background || (theme.light ? '#f8fafc' : '#1a1b26');
  const bgDark = c.darker_background || c.dark_background || c.surface || bg;
  const surface = c.lighter_background || c.selection || c.surface || bg;
  const fg = c.foreground || (theme.light ? '#0f172a' : '#a9b1d6');
  const fgBright = c.bright_foreground || c.light_foreground || fg;
  const muted = c.muted || c.dark_foreground || (theme.light ? '#64748b' : '#565f89');
  const accent = c.accent || c.accent_cyan || c.blue || '#7aa2f7';
  const accent2 = c.accent_violet || c.magenta || c.bright_magenta || accent;
  const green = c.green || c.bright_green || '#9ece6a';
  const yellow = c.yellow || c.accent_gold || '#e0af68';
  const red = c.red || c.accent_magenta || '#f7768e';
  const cyan = c.cyan || c.accent_cyan || accent;
  const selection = c.selection || c.border || (theme.light ? '#e2e8f0' : '#292e42');

  return {
    id: theme.id,
    label: theme.label,
    light: theme.light,
    bg,
    bgDark,
    surface,
    fg,
    fgBright,
    muted,
    accent,
    accent2,
    green,
    yellow,
    red,
    cyan,
    selection,
  };
}

export function toCssVariables(tokens: OmarchyResolvedTokens): Record<string, string> {
  return {
    '--bg': tokens.bg,
    '--bg-dark': tokens.bgDark,
    '--bg-surface': tokens.surface,
    '--fg': tokens.fg,
    '--fg-bright': tokens.fgBright,
    '--muted': tokens.muted,
    '--accent': tokens.accent,
    '--accent2': tokens.accent2,
    '--green': tokens.green,
    '--yellow': tokens.yellow,
    '--red': tokens.red,
    '--cyan': tokens.cyan,
    '--selection': tokens.selection,
  };
}

export class OmarchyThemeEngine {
  readonly #themes: OmarchyThemeRecord[];
  readonly #adapters: OmarchyHostAdapter[] = [];
  #currentId: string;

  constructor(themes: OmarchyThemeRecord[], initialThemeId = 'tokyo-night') {
    if (!themes.length) throw new Error('OmarchyThemeEngine requires at least one theme');
    this.#themes = themes.slice();
    this.#currentId = this.#themes.some((t) => t.id === initialThemeId) ? initialThemeId : this.#themes[0].id;
  }

  registerAdapter(adapter: OmarchyHostAdapter): void {
    this.#adapters.push(adapter);
  }

  list(): readonly OmarchyThemeRecord[] {
    return this.#themes;
  }

  get currentId(): string {
    return this.#currentId;
  }

  get(id: string): OmarchyThemeRecord | undefined {
    return this.#themes.find((t) => t.id === id);
  }

  search(query: string): OmarchyThemeRecord[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.#themes.slice();
    return this.#themes.filter((t) => t.id.includes(q) || t.label.toLowerCase().includes(q));
  }

  async set(id: string): Promise<OmarchyResolvedTokens> {
    const theme = this.get(id);
    if (!theme) throw new Error(`Unknown Omarchy theme: "${id}"`);
    this.#currentId = theme.id;
    const tokens = resolveThemeTokens(theme);
    for (const adapter of this.#adapters) {
      await adapter.applyTheme(theme, tokens);
    }
    return tokens;
  }

  async next(): Promise<OmarchyResolvedTokens> {
    const idx = this.#themes.findIndex((t) => t.id === this.#currentId);
    const nextTheme = this.#themes[(idx + 1) % this.#themes.length];
    return this.set(nextTheme.id);
  }

  async prev(): Promise<OmarchyResolvedTokens> {
    const idx = this.#themes.findIndex((t) => t.id === this.#currentId);
    const prevTheme = this.#themes[(idx - 1 + this.#themes.length) % this.#themes.length];
    return this.set(prevTheme.id);
  }
}
