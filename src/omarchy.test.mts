import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OmarchyThemeEngine, toCssVariables, type OmarchyThemeRecord } from './omarchy-theme-engine.mts';
import { matchOmarchyHotkey, KEYBOARD_LOCK_CODES } from './omarchy-hotkeys.mts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themesPath = path.resolve(__dirname, '../themes/index.json');

test('loads all 25 authentic Omarchy themes with zero missing palettes', () => {
  const themes = JSON.parse(fs.readFileSync(themesPath, 'utf8')) as OmarchyThemeRecord[];
  assert.equal(themes.length, 25);
  for (const t of themes) {
    assert.ok(Object.keys(t.colors).length > 0, `theme ${t.id} should have colors`);
  }
  assert.ok(themes.some((t) => t.id === 'lumi-chromatic'));
  assert.ok(themes.some((t) => t.id === 'tokyo-night'));
});

test('OmarchyThemeEngine cascades theme changes to registered host adapters', async () => {
  const themes = JSON.parse(fs.readFileSync(themesPath, 'utf8')) as OmarchyThemeRecord[];
  const engine = new OmarchyThemeEngine(themes, 'tokyo-night');
  const applied: string[] = [];

  engine.registerAdapter({
    name: 'test-adapter',
    applyTheme(theme, tokens) {
      applied.push(`${theme.id}:${tokens.accent}`);
      const css = toCssVariables(tokens);
      assert.ok(css['--accent'].startsWith('#'));
    },
  });

  const lumi = await engine.set('lumi-chromatic');
  assert.equal(lumi.light, true);
  assert.equal(engine.currentId, 'lumi-chromatic');
  assert.equal(applied.length, 1);

  const next = await engine.next();
  assert.notEqual(next.id, 'lumi-chromatic');
  assert.equal(applied.length, 2);
});

test('matchOmarchyHotkey recognizes original Super combos and Alt fallbacks', () => {
  assert.equal(
    matchOmarchyHotkey({ metaKey: true, ctrlKey: true, shiftKey: true, altKey: false, code: 'Space', key: ' ' }),
    'theme-switcher',
  );
  assert.equal(
    matchOmarchyHotkey({ metaKey: true, ctrlKey: true, shiftKey: false, altKey: false, code: 'Space', key: ' ' }),
    'theme-next',
  );
  assert.equal(
    matchOmarchyHotkey({ metaKey: true, ctrlKey: false, shiftKey: false, altKey: false, code: 'Space', key: ' ' }),
    'walker-menu',
  );
  assert.equal(
    matchOmarchyHotkey({ metaKey: false, ctrlKey: false, shiftKey: false, altKey: true, code: 'KeyT', key: 't' }),
    'theme-switcher',
  );
  assert.equal(
    matchOmarchyHotkey({ metaKey: true, ctrlKey: false, shiftKey: false, altKey: false, code: 'Digit3', key: '3' }),
    'workspace-3',
  );
  assert.ok(KEYBOARD_LOCK_CODES.includes('MetaLeft'));
});
