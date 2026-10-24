/**
 * Boots the page as a browser would — the real index.html markup plus the real
 * entry module — inside jsdom, with a frozen clock. Tests drive the page through
 * the DOM, so they pin behaviour rather than implementation.
 */
import { vi } from 'vitest';
import { read } from './files';

export interface BootOptions {
  /** Instant the page believes it is, as an ISO string (default: Wed 2026-10-21 10:00 Vienna). */
  now?: string;
  languages?: string[];
  stored?: Record<string, string>;
  /** Body served for assets/data/menu.json; the request fails when omitted. */
  menuJson?: string;
}

export interface Page {
  $: (selector: string) => HTMLElement;
  $$: (selector: string) => HTMLElement[];
  click: (el: Element) => void;
  submit: (form: Element) => void;
  change: (el: Element) => void;
  /** Tells every IntersectionObserver watching `el` that it has come into view. */
  intersect: (el: Element) => void;
}

export async function boot(options: BootOptions = {}): Promise<Page> {
  const languages = options.languages ?? ['de-AT'];
  vi.resetModules();
  vi.useFakeTimers({ now: new Date(options.now ?? '2026-10-21T08:00:00Z'), toFake: ['Date'] });

  window.localStorage.clear();
  for (const [key, value] of Object.entries(options.stored ?? {})) {
    window.localStorage.setItem(key, value);
  }
  Object.defineProperty(window.navigator, 'languages', { value: languages, configurable: true });
  Object.defineProperty(window.navigator, 'language', { value: languages[0], configurable: true });

  const parsed = new DOMParser().parseFromString(read('index.html'), 'text/html');
  document.documentElement.lang = 'de';
  document.body.className = '';
  document.body.innerHTML = parsed.body.innerHTML;

  // jsdom has no layout engine; stub the observers and scrolling the page relies on.
  const observers: { callback: IntersectionObserverCallback; targets: Set<Element> }[] = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      private targets = new Set<Element>();
      constructor(callback: IntersectionObserverCallback) {
        observers.push({ callback, targets: this.targets });
      }
      observe = vi.fn((el: Element) => this.targets.add(el));
      unobserve = vi.fn((el: Element) => this.targets.delete(el));
      disconnect = vi.fn(() => {
        this.targets.clear();
      });
    },
  );
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  Element.prototype.scrollTo = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      options.menuJson === undefined
        ? Promise.reject(new Error('offline'))
        : Promise.resolve(new Response(options.menuJson)),
    ),
  );

  await import('../../src/main');
  await vi.dynamicImportSettled();

  const $ = (selector: string): HTMLElement => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) throw new Error(`no element for ${selector}`);
    return el;
  };
  return {
    $,
    $$: (selector) => Array.from(document.querySelectorAll<HTMLElement>(selector)),
    click: (el) => el.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })),
    submit: (form) => form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
    change: (el) => el.dispatchEvent(new Event('change', { bubbles: true })),
    intersect: (el) => {
      for (const { callback } of observers.filter((o) => o.targets.has(el))) {
        const entry = { target: el, isIntersecting: true } as IntersectionObserverEntry;
        callback([entry], {} as IntersectionObserver);
      }
    },
  };
}
