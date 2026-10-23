/**
 * Boots the page exactly as a browser would — index.html markup plus the three
 * classic scripts — inside jsdom, with a frozen clock. Unit tests drive the
 * page through the DOM, so they pin behaviour rather than implementation.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';

export const ROOT = resolve(import.meta.dirname, '../..');
export const read = (rel: string): string => readFileSync(resolve(ROOT, rel), 'utf8');

export interface BootOptions {
  /** Instant the page believes it is, as an ISO string (default: Wed 2026-10-21 10:00 Vienna). */
  now?: string;
  languages?: string[];
  stored?: Record<string, string>;
}

export interface Page {
  dom: JSDOM;
  window: Window & typeof globalThis;
  document: Document;
  $: (sel: string) => HTMLElement;
  $$: (sel: string) => HTMLElement[];
  click: (el: Element) => void;
}

export function boot(opts: BootOptions = {}): Page {
  const now = opts.now ?? '2026-10-21T08:00:00Z';
  const html = read('index.html');
  const dom = new JSDOM(html, { url: 'http://localhost/', runScripts: 'outside-only', pretendToBeVisual: true });
  const window = dom.window as unknown as Window & typeof globalThis;
  const w = dom.window;

  for (const [k, v] of Object.entries(opts.stored ?? {})) w.localStorage.setItem(k, v);
  Object.defineProperty(w.navigator, 'languages', { value: opts.languages ?? ['de-AT'], configurable: true });
  Object.defineProperty(w.navigator, 'language', { value: (opts.languages ?? ['de-AT'])[0], configurable: true });

  w.eval(`(function(){
    var RealDate = Date, fixed = new RealDate(${JSON.stringify(now)}).getTime();
    window.Date = class extends RealDate {
      constructor(...a) { if (a.length) super(...a); else super(fixed); }
      static now() { return fixed; }
    };
  })();`);
  for (const file of ['assets/js/i18n.js', 'assets/js/data.js', 'assets/js/app.js']) w.eval(read(file));

  const $ = (sel: string): HTMLElement => {
    const el = w.document.querySelector<HTMLElement>(sel);
    if (!el) throw new Error(`no element for ${sel}`);
    return el;
  };
  return {
    dom,
    window,
    document: w.document,
    $,
    $$: (sel) => Array.from(w.document.querySelectorAll<HTMLElement>(sel)),
    click: (el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true })),
  };
}

/** Loads the data/i18n scripts only, returning the globals they define. */
export function loadGlobals(): { I18N: Record<string, Record<string, string>>; MENU: any[]; HOURS: Record<string, { open: number; close: number } | null>; REVIEWS: any[]; ALLERGENS: any[]; SUPPLIERS: Record<string, string> } {
  const dom = new JSDOM('<!doctype html><html></html>', { runScripts: 'outside-only' });
  dom.window.eval(read('assets/js/i18n.js'));
  dom.window.eval(read('assets/js/data.js'));
  const w = dom.window as any;
  return { I18N: w.MB_I18N, MENU: w.MB_MENU, HOURS: w.MB_HOURS, REVIEWS: w.MB_REVIEWS, ALLERGENS: w.MB_ALLERGENS_CODEX, SUPPLIERS: w.MB_SUPPLIERS };
}
