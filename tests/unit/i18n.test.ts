import { describe, expect, it } from 'vitest';
import { de } from '../../src/i18n/messages/de';
import { en } from '../../src/i18n/messages/en';
import { hu } from '../../src/i18n/messages/hu';
import { it as italian } from '../../src/i18n/messages/it';
import { pl } from '../../src/i18n/messages/pl';
import { ro } from '../../src/i18n/messages/ro';
import { LANGS } from '../../src/types';
import { read } from '../support/files';

const complete: Record<string, Record<string, string>> = { en, it: italian, hu, pl, ro };
const dictionaries: Record<string, Record<string, string>> = { de, ...complete };
const placeholders = (text: string): string[] => (text.match(/\{\w+\}/g) ?? []).sort();

describe('translations', () => {
  it('ships exactly the six locales de, en, it, hu, pl, ro', () => {
    expect([...LANGS]).toEqual(['de', 'en', 'it', 'hu', 'pl', 'ro']);
  });

  // The compiler already enforces this through `Messages`; the runtime check guards the data files themselves.
  it('en, it, hu, pl, ro have identical key sets (key parity)', () => {
    const reference = Object.keys(en).sort();
    for (const dictionary of Object.values(complete)) {
      expect(Object.keys(dictionary).sort()).toEqual(reference);
    }
  });

  it('de only holds runtime-generated keys, all of which also exist in en', () => {
    for (const key of Object.keys(de)) expect(en).toHaveProperty(key);
  });

  it('keeps the same {placeholders} in every locale', () => {
    for (const [key, text] of Object.entries(en)) {
      for (const dictionary of Object.values(dictionaries)) {
        const translated = dictionary[key];
        if (translated !== undefined) expect(placeholders(translated)).toEqual(placeholders(text));
      }
    }
  });

  it('has no empty translations', () => {
    for (const [lang, dictionary] of Object.entries(dictionaries)) {
      for (const [key, text] of Object.entries(dictionary)) {
        expect(text.trim(), `${lang}:${key}`).not.toBe('');
      }
    }
  });

  it('covers every data-i18n key used by index.html', () => {
    const html = read('index.html');
    const used = new Set<string>();
    for (const m of html.matchAll(/data-i18n(?:-html)?="([^"]+)"/g)) used.add(m[1] ?? '');
    for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) {
      for (const pair of (m[1] ?? '').split(';')) used.add(pair.split(':')[1] ?? '');
    }
    expect(used.size).toBeGreaterThan(150);
    for (const key of used) {
      for (const [lang, dictionary] of Object.entries(complete)) {
        expect(dictionary, `${lang}:${key}`).toHaveProperty(key);
      }
    }
  });

  it('offers a language button for each locale', () => {
    const buttons = [...read('index.html').matchAll(/data-lang="(\w+)"/g)].map((m) => m[1]);
    expect([...new Set(buttons)].sort()).toEqual([...LANGS].sort());
  });
});
