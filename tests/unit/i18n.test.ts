import { describe, expect, it } from 'vitest';
import { loadGlobals, read } from '../support/legacy-env';

const { I18N } = loadGlobals();
const LOCALES = ['de', 'en', 'it', 'hu', 'pl', 'ro'];
const FULL = ['en', 'it', 'hu', 'pl', 'ro'];
const keys = (l: string) => Object.keys(I18N[l]).sort();
const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe('translations (i18n.js)', () => {
  it('ships exactly the six locales de, en, it, hu, pl, ro', () => {
    expect(Object.keys(I18N).sort()).toEqual([...LOCALES].sort());
  });

  it('en, it, hu, pl, ro have identical key sets (key parity)', () => {
    for (const l of FULL) expect(keys(l)).toEqual(keys('en'));
  });

  it('de only holds runtime-generated keys, all of which also exist in en', () => {
    for (const k of keys('de')) expect(I18N.en).toHaveProperty(k);
  });

  it('keeps the same {placeholders} in every locale', () => {
    for (const k of keys('en'))
      for (const l of [...FULL, 'de'])
        if (I18N[l][k] !== undefined)
          expect(placeholders(I18N[l][k])).toEqual(placeholders(I18N.en[k]));
  });

  it('has no empty translations', () => {
    for (const l of LOCALES)
      for (const k of keys(l)) expect(I18N[l][k].trim(), `${l}:${k}`).not.toBe('');
  });

  it('covers every data-i18n key used by index.html', () => {
    const html = read('index.html');
    const used = new Set<string>();
    for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) used.add(m[1]);
    for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g))
      for (const pair of m[1].split(';')) used.add(pair.split(':')[1]);
    expect(used.size).toBeGreaterThan(150);
    for (const k of used) for (const l of FULL) expect(I18N[l], `${l}:${k}`).toHaveProperty(k);
  });

  it('offers a language button for each locale', () => {
    const html = read('index.html');
    const buttons = [...html.matchAll(/data-lang="(\w+)"/g)].map((m) => m[1]);
    expect([...new Set(buttons)].sort()).toEqual([...LOCALES].sort());
  });
});
