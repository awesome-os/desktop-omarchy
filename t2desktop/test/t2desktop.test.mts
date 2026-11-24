import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  B8G_GHOST_INDEX_URL,
  T2DESKTOP_APPLIANCES,
  resolveT2DesktopCatalog,
} from '../hydrate-desktop.mts';

const THIS_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(THIS_DIR, '..', '..');
const THEME_DIR = path.join(REPO_ROOT, 'themes', 'lumi-white-dragon');
const SESSION_SCRIPT = path.join(REPO_ROOT, 't2desktop', 't2desktop-session.sh');

const REQUIRED_APPLIANCE_IDS = [
  'sectium-browser',
  'electron',
  'code-oss',
  'brave',
  'blender',
  'obs',
  'qt',
  'libsectium_display',
  'b8g-ghost-abi',
] as const;

test('T2DESKTOP_APPLIANCES declares all sovereign desktop appliances', () => {
  const declaredIds = new Set(T2DESKTOP_APPLIANCES.map((item) => item.id));
  for (const requiredId of REQUIRED_APPLIANCE_IDS) {
    assert.ok(declaredIds.has(requiredId), `Missing appliance spec: ${requiredId}`);
  }
});

test('resolveT2DesktopCatalog resolves live cas-v1 entries for all T2Desktop appliances', async () => {
  const catalog = await resolveT2DesktopCatalog(B8G_GHOST_INDEX_URL);

  assert.equal(catalog.schema, 'b8g-ghost-cas-index-v1');
  assert.ok(
    catalog.casBaseUrl.startsWith('https://github.com/awesome-os/b8g-ghost/releases/download/cas-v1'),
    `Unexpected casBaseUrl: ${catalog.casBaseUrl}`,
  );

  for (const requiredId of REQUIRED_APPLIANCE_IDS) {
    const resolved = catalog.appliances[requiredId];
    assert.ok(resolved, `Missing resolved appliance: ${requiredId}`);
    assert.match(resolved.sha256, /^[0-9a-f]{64}$/, `Invalid sha256 for ${requiredId}`);
    assert.ok(resolved.bytes > 0, `Expected positive byte size for ${requiredId}`);
    assert.ok(
      resolved.downloadUrl.startsWith(`${catalog.casBaseUrl}/`),
      `Unexpected downloadUrl for ${requiredId}: ${resolved.downloadUrl}`,
    );
  }
});

test('themes/lumi-white-dragon contains valid Hyprland, Waybar, and color palette definitions', () => {
  const hyprConfPath = path.join(THEME_DIR, 'hyprland.conf');
  const waybarCssPath = path.join(THEME_DIR, 'waybar.css');
  const colorsJsonPath = path.join(THEME_DIR, 'colors.json');
  const colorsTomlPath = path.join(THEME_DIR, 'colors.toml');

  for (const filePath of [hyprConfPath, waybarCssPath, colorsJsonPath, colorsTomlPath]) {
    assert.ok(fs.existsSync(filePath), `Expected theme file to exist: ${filePath}`);
  }

  const hyprConf = fs.readFileSync(hyprConfPath, 'utf8');
  assert.ok(hyprConf.includes('0d111a'), 'hyprland.conf must include #0d111a obsidian background');
  assert.ok(hyprConf.includes('38bdf8'), 'hyprland.conf must include #38bdf8 cyan active border');
  assert.ok(hyprConf.includes('5865f2'), 'hyprland.conf must include #5865f2 violet active border');

  const waybarCss = fs.readFileSync(waybarCssPath, 'utf8');
  assert.ok(waybarCss.includes('#0d111a'), 'waybar.css must include #0d111a obsidian background');
  assert.ok(waybarCss.includes('#38bdf8'), 'waybar.css must include #38bdf8 cyan accent');
  assert.ok(waybarCss.includes('#5865f2'), 'waybar.css must include #5865f2 violet accent');

  const colors = JSON.parse(fs.readFileSync(colorsJsonPath, 'utf8')) as {
    name: string;
    background: string;
    accent: string;
    accent_secondary: string;
    active_border: string[];
  };
  assert.equal(colors.name, 'Lumi White Dragon');
  assert.equal(colors.background, '#0d111a');
  assert.equal(colors.accent, '#38bdf8');
  assert.equal(colors.accent_secondary, '#5865f2');
  assert.deepEqual(colors.active_border, ['#38bdf8', '#5865f2']);
});

test('t2desktop/t2desktop-session.sh wires Hyprland, b8g-ghost CAS, Lumi White Dragon, and Super keybinds', () => {
  assert.ok(fs.existsSync(SESSION_SCRIPT), 't2desktop-session.sh must exist');
  const script = fs.readFileSync(SESSION_SCRIPT, 'utf8');

  assert.ok(script.startsWith('#!/bin/sh'), 't2desktop-session.sh must use POSIX #!/bin/sh');
  assert.ok(script.includes('XDG_CURRENT_DESKTOP=Hyprland'), 'Must export XDG_CURRENT_DESKTOP=Hyprland');
  assert.ok(
    script.includes('B8G_GHOST_CACHE_DIR="${B8G_GHOST_CACHE_DIR:-/var/lib/b8g/cas}"'),
    'Must configure B8G_GHOST_CACHE_DIR=/var/lib/b8g/cas',
  );
  assert.ok(script.includes('lumi-white-dragon'), 'Must load lumi-white-dragon theme');
  assert.ok(script.includes('SUPER, Return'), 'Must wire Super+Return terminal binding');
  assert.ok(script.includes('SUPER, B, exec, sectium-browser'), 'Must wire Super+B -> sectium-browser');
  assert.ok(script.includes('SUPER, C, exec, code-oss'), 'Must wire Super+C -> code-oss');
});

test('LICENSE preserves upstream Omarchy MIT attribution and Awesome-OS notice', () => {
  const license = fs.readFileSync(path.join(REPO_ROOT, 'LICENSE'), 'utf8');
  assert.ok(license.includes('David Heinemeier Hansson'), 'Must preserve upstream Omarchy copyright');
  assert.ok(license.includes('Awesome-OS'), 'Must include Awesome-OS attribution');
  assert.ok(license.includes('Permission is hereby granted, free of charge'), 'Must preserve MIT text');
});
