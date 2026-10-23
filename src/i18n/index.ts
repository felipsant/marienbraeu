import { LANGS, type Lang } from '../types';
import { store } from '../lib/storage';
import { $$ } from '../lib/dom';
import { de } from './messages/de';
import { en } from './messages/en';
import { hu } from './messages/hu';
import { it } from './messages/it';
import { pl } from './messages/pl';
import { ro } from './messages/ro';
import type { MessageKey } from './messages/types';

export type { MessageKey } from './messages/types';

export const LOCALES: Readonly<Record<Lang, string>> = {
  de: 'de-AT',
  en: 'en-GB',
  it: 'it-IT',
  hu: 'hu-HU',
  pl: 'pl-PL',
  ro: 'ro-RO',
};

const LANG_KEY = 'mb_lang';
const LEGACY_LANG_KEY = 'mb-lang';

/** Primary language subtags we serve (gsw = Swiss German, mo = Moldovan Romanian). */
const LANG_ALIASES: Readonly<Record<string, Lang>> = {
  de: 'de',
  gsw: 'de',
  en: 'en',
  it: 'it',
  hu: 'hu',
  pl: 'pl',
  ro: 'ro',
  mo: 'ro',
};

const TIME_ZONE_LANGS: Readonly<Record<string, Lang>> = {
  'Europe/Vienna': 'de',
  'Europe/Berlin': 'de',
  'Europe/Zurich': 'de',
  'Europe/Busingen': 'de',
  'Europe/Vaduz': 'de',
  'Europe/Rome': 'it',
  'Europe/San_Marino': 'it',
  'Europe/Vatican': 'it',
  'Europe/Budapest': 'hu',
  'Europe/Warsaw': 'pl',
  'Europe/Bucharest': 'ro',
  'Europe/Chisinau': 'ro',
};

/**
 * The German copy lives in index.html so the page reads without JavaScript. It is
 * read from the DOM once, then merged over the runtime-only strings in `de`.
 */
const german: Record<string, string> = { ...de };

const dictionaries: Readonly<Record<Exclude<Lang, 'de'>, Readonly<Record<string, string>>>> = {
  en,
  it,
  hu,
  pl,
  ro,
};

let current: Lang = 'de';
const listeners: (() => void)[] = [];

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export function getLang(): Lang {
  return current;
}

/** Registers a callback that runs after every language change. */
export function onLanguageChange(listener: () => void): void {
  listeners.push(listener);
}

export function snapshotGerman(root: ParentNode = document): void {
  $$('[data-i18n]', root).forEach((el) => {
    const key = el.dataset.i18n ?? '';
    german[key] ||= el.textContent.trim();
  });
  $$('[data-i18n-html]', root).forEach((el) => {
    const key = el.dataset.i18nHtml ?? '';
    german[key] ||= el.innerHTML.trim();
  });
  $$('[data-i18n-attr]', root).forEach((el) => {
    for (const pair of (el.dataset.i18nAttr ?? '').split(';')) {
      const [attribute = '', key = ''] = pair.split(':');
      if (!(key in german)) german[key] = el.getAttribute(attribute) ?? '';
    }
  });
}

/** Active-language text for a key, falling back to the German copy, then to the key itself. */
export function translateKey(key: string): string {
  const localized = current === 'de' ? undefined : dictionaries[current][key];
  if (localized !== undefined && localized !== '') return localized;
  const fallback = german[key];
  return fallback !== undefined && fallback !== '' ? fallback : key;
}

/** Typed lookup with `{placeholder}` substitution. */
export function t(key: MessageKey, vars?: Readonly<Record<string, string | number>>): string {
  let text = translateKey(key);
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

/** A language the visitor clicked always wins; otherwise the first supported
 *  browser language, then the time zone, then English. */
export function detectUserLanguage(): Lang {
  const saved = [store.get(LANG_KEY), store.get(LEGACY_LANG_KEY)].find(
    (value): value is string => value !== null && value !== '',
  );
  if (saved !== undefined && isLang(saved)) return saved;
  const preferred = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
  for (const tag of preferred) {
    const primary = tag.toLowerCase().split(/[-_]/)[0] ?? '';
    const match = LANG_ALIASES[primary];
    if (match) return match;
  }
  try {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const match = TIME_ZONE_LANGS[zone];
    if (match) return match;
  } catch {
    /* no Intl time zone support */
  }
  return 'en';
}

export function setLang(next: string): void {
  current = isLang(next) ? next : 'en';
  document.documentElement.lang = current;
  $$('[data-i18n]').forEach((el) => {
    el.textContent = translateKey(el.dataset.i18n ?? '');
  });
  $$('[data-i18n-html]').forEach((el) => {
    el.innerHTML = translateKey(el.dataset.i18nHtml ?? '');
  });
  $$('[data-i18n-attr]').forEach((el) => {
    for (const pair of (el.dataset.i18nAttr ?? '').split(';')) {
      const [attribute = '', key = ''] = pair.split(':');
      el.setAttribute(attribute, translateKey(key));
    }
  });
  $$('[data-lang]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.lang === current));
  });
  listeners.forEach((listener) => {
    listener();
  });
}

export function saveLang(): void {
  store.set(LANG_KEY, current);
}
