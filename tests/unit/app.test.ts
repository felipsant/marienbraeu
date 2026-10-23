// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { boot, type Page } from '../support/boot';
import { read } from '../support/files';

const TUE_EVENING = '2026-10-20T14:00:00Z'; // Tue 16:00 Vienna
const TUE_LATE = '2026-10-20T21:30:00Z'; // Tue 23:30 Vienna
const MON_NOON = '2026-10-26T11:00:00Z'; // Mon 12:00 Vienna (rest day)
const WED_MORNING = '2026-10-21T08:00:00Z'; // Wed 10:00 Vienna, before opening
const originalTimeZone = process.env.TZ;

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  if (originalTimeZone === undefined) delete process.env.TZ;
  else process.env.TZ = originalTimeZone;
});

const htmlLang = (): string => document.documentElement.lang;

describe('language detection', () => {
  it('defaults Austrian / German browsers to de', async () => {
    for (const languages of [['de-AT'], ['de-DE'], ['gsw']]) {
      await boot({ languages });
      expect(htmlLang()).toBe('de');
    }
  });

  it('picks the first supported browser language', async () => {
    const expectations: [string[], string][] = [
      [['fr-FR', 'it-IT', 'en'], 'it'],
      [['hu'], 'hu'],
      [['pl-PL'], 'pl'],
      [['mo'], 'ro'],
    ];
    for (const [languages, expected] of expectations) {
      await boot({ languages });
      expect(htmlLang()).toBe(expected);
    }
  });

  it('lets the saved mb_lang win over the browser language', async () => {
    await boot({ languages: ['de-AT'], stored: { mb_lang: 'pl' } });
    expect(htmlLang()).toBe('pl');
  });

  it('still honours the legacy mb-lang key, but mb_lang beats it', async () => {
    await boot({ languages: ['de-AT'], stored: { 'mb-lang': 'ro' } });
    expect(htmlLang()).toBe('ro');
    await boot({ languages: ['de-AT'], stored: { 'mb-lang': 'ro', mb_lang: 'it' } });
    expect(htmlLang()).toBe('it');
  });

  it('ignores an unsupported saved language', async () => {
    await boot({ languages: ['it'], stored: { mb_lang: 'xx' } });
    expect(htmlLang()).toBe('it');
  });

  it('falls back to the time zone, then to English', async () => {
    process.env.TZ = 'Europe/Rome';
    await boot({ languages: ['fr-FR'] });
    expect(htmlLang()).toBe('it');
    process.env.TZ = 'America/New_York';
    await boot({ languages: ['fr-FR'] });
    expect(htmlLang()).toBe('en');
  });
});

describe('language switching', () => {
  const nav = (p: Page): string => p.$('[data-i18n="nav.menu"]').textContent;

  it('swaps copy, <html lang>, aria-pressed and persists the choice', async () => {
    const p = await boot();
    expect(nav(p)).toBe('Speisekarte');
    p.click(p.$$('[data-lang="en"]')[0] as HTMLElement);
    expect(htmlLang()).toBe('en');
    expect(nav(p)).toBe('Menu');
    expect(window.localStorage.getItem('mb_lang')).toBe('en');
    expect(p.$$('[data-lang="en"]').every((b) => b.getAttribute('aria-pressed') === 'true')).toBe(
      true,
    );
    expect(p.$$('[data-lang="de"]').every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(
      true,
    );
  });

  it('translates attributes (aria-label) too', async () => {
    const p = await boot();
    p.click(p.$$('[data-lang="it"]')[0] as HTMLElement);
    const label = p.$('[data-i18n-attr="aria-label:nav.label"]').getAttribute('aria-label');
    expect(label).not.toBe('Hauptnavigation');
  });

  it('round-trips back to the original German markup', async () => {
    const p = await boot();
    const before = nav(p);
    p.click(p.$$('[data-lang="ro"]')[0] as HTMLElement);
    p.click(p.$$('[data-lang="de"]')[0] as HTMLElement);
    expect(nav(p)).toBe(before);
  });
});

describe('live opening status', () => {
  const status = (p: Page) => ({
    classes: [...p.$('[data-live-status]').classList].filter((c) => c.startsWith('is-')),
    text: p.$('[data-live-status] [data-live-text]').textContent,
  });

  it('open: shows closing time', async () => {
    const s = status(await boot({ now: TUE_EVENING }));
    expect(s.classes).toEqual(['is-open']);
    expect(s.text).toBe('Jetzt geöffnet · bis 24:00 Uhr');
  });

  it('closing soon within the last hour', async () => {
    expect(status(await boot({ now: TUE_LATE })).classes).toEqual(['is-soon']);
  });

  it('closed before opening shows today’s opening time', async () => {
    const s = status(await boot({ now: WED_MORNING }));
    expect(s.classes).toEqual(['is-closed']);
    expect(s.text).toBe('Geschlossen · öffnet heute um 15:00 Uhr');
  });

  it('on the Monday rest day announces tomorrow’s opening', async () => {
    const s = status(await boot({ now: MON_NOON }));
    expect(s.classes).toEqual(['is-closed']);
    expect(s.text).toContain('15:00');
  });

  it('highlights today in the hours table (Vienna weekday)', async () => {
    const p = await boot({ now: TUE_EVENING });
    const today = p.$$('[data-hours-table] tr.is-today');
    expect(today).toHaveLength(1);
    expect(today[0]?.dataset.day).toBe('2');
  });
});

describe('menu', () => {
  const cards = (p: Page): HTMLElement[] => p.$$('[data-menu-grid] .dish');

  it('renders all 26 dishes with € prices in the Austrian format', async () => {
    const p = await boot();
    expect(cards(p)).toHaveLength(26);
    expect(p.$('.dish-price').textContent).toBe('€ 13,50');
  });

  it('adds a count badge to each filter pill and filters on click', async () => {
    const p = await boot();
    const pills = p.$$('[data-menu-filters] .pill');
    const counts = Object.fromEntries(
      pills.map((b) => [b.dataset.filter, Number(b.querySelector('.count')?.textContent)]),
    );
    expect(counts).toEqual({
      all: 26,
      classics: 7,
      jause: 6,
      soups: 2,
      salads: 4,
      dessert: 4,
      brew: 3,
    });
    p.click(pills.find((b) => b.dataset.filter === 'soups') as HTMLElement);
    expect(cards(p)).toHaveLength(2);
    const pressed = pills.filter((b) => b.getAttribute('aria-pressed') === 'true');
    expect(pressed.map((b) => b.dataset.filter)).toEqual(['soups']);
  });

  it('shows copy in the active language and English decimal sizes', async () => {
    const p = await boot();
    p.click(p.$$('[data-lang="en"]')[0] as HTMLElement);
    expect(p.$('.dish-name').textContent).toBe('Half Backhendl');
    expect(p.$('.dish-price').textContent).toBe('€ 13.50');
  });

  it('falls back to German copy for languages without menu translations', async () => {
    const p = await boot();
    p.click(p.$$('[data-lang="hu"]')[0] as HTMLElement);
    expect(p.$('.dish-name').textContent).toBe('Halbes Backhendl');
  });

  it('escapes HTML in dish copy', async () => {
    const p = await boot();
    expect(p.$('[data-menu-grid]').innerHTML).not.toMatch(/<script/i);
  });

  it('replaces the built-in menu with menu.json once it loads', async () => {
    const edited = JSON.parse(read('public/assets/data/menu.json')) as {
      dishes: { price: number }[];
    };
    if (edited.dishes[0]) edited.dishes[0].price = 14.5;
    const p = await boot({ menuJson: JSON.stringify(edited) });
    await vi.waitFor(() => {
      expect(p.$('.dish-price').textContent).toBe('€ 14,50');
    });
  });

  it('keeps the built-in menu when menu.json cannot be loaded', async () => {
    const p = await boot({ menuJson: '{"dishes": []}' });
    await vi.dynamicImportSettled();
    expect(cards(p)).toHaveLength(26);
  });

  // menu.json has no hu/pl/ro translations: those languages fall back to the German copy.
  it.each(['hu', 'pl', 'ro'])(
    'falls back to German dish copy for %s once menu.json has loaded',
    async (lang) => {
      const p = await boot({ menuJson: read('public/assets/data/menu.json') });
      await vi.waitFor(() => {
        expect(p.$$('[data-menu-grid] .dish')).toHaveLength(26);
      });
      p.click(p.$$(`[data-lang="${lang}"]`)[0] as HTMLElement);
      const dishes = p.$$('[data-menu-grid] .dish');
      expect(dishes).toHaveLength(26);
      const file = JSON.parse(read('public/assets/data/menu.json')) as {
        dishes: { name: { de: string }; description: { de: string } }[];
      };
      expect(dishes[0]?.querySelector('.dish-name')?.textContent).toBe(file.dishes[0]?.name.de);
      expect(dishes[0]?.querySelector('.dish-desc')?.textContent).toBe(
        file.dishes[0]?.description.de,
      );
      for (const dish of dishes) {
        expect(dish.textContent).not.toContain('undefined');
        expect(dish.querySelector('.dish-name')?.textContent).not.toBe('');
      }
    },
  );
});

describe('reviews carousel', () => {
  it('renders one slide per review', async () => {
    const p = await boot();
    expect(p.$$('[data-carousel-track] .review')).toHaveLength(7);
  });
});

describe('reservation form', () => {
  async function open(now = TUE_EVENING): Promise<Page> {
    const p = await boot({ now });
    p.click(p.$$('[data-open-reservation]')[0] as HTMLElement);
    return p;
  }
  const input = (p: Page, selector: string): HTMLInputElement => p.$(selector) as HTMLInputElement;
  const setDate = (p: Page, iso: string): void => {
    input(p, '#r-date').value = iso;
    p.change(input(p, '#r-date'));
  };
  const timeOptions = (p: Page): string[] =>
    p
      .$$('#r-time option')
      .map((o) => (o as HTMLOptionElement).value)
      .filter(Boolean);
  const fieldOf = (p: Page, selector: string): HTMLElement =>
    p.$(selector).closest('.field') as HTMLElement;

  it('opens the modal and sets the earliest selectable date to today (Vienna)', async () => {
    const p = await open();
    expect(p.$('[data-modal="reservation"]').classList.contains('is-open')).toBe(true);
    expect(input(p, '#r-date').min).toBe('2026-10-20');
  });

  it('offers 12 single-guest steps plus the four group options', async () => {
    const p = await open();
    const values = p.$$('[data-guests] option').map((o) => (o as HTMLOptionElement).value);
    expect(values).toEqual([
      ...Array.from({ length: 12 }, (_, i) => String(i + 1)),
      '20',
      '40',
      '80',
      'more',
    ]);
  });

  it('Monday: shows the rest-day error', async () => {
    const p = await open();
    setDate(p, '2026-10-26');
    expect(fieldOf(p, '#r-date').classList.contains('has-error')).toBe(true);
    expect(fieldOf(p, '#r-date').querySelector('.error')?.textContent).toMatch(/Montag|Ruhetag/);
    expect(timeOptions(p)).toEqual([]);
  });

  it('rejects dates in the past', async () => {
    const p = await open();
    setDate(p, '2026-10-19');
    expect(fieldOf(p, '#r-date').classList.contains('has-error')).toBe(true);
  });

  it('Tue–Fri slots run 15:00–22:30 (last seating 90 min before 24:00)', async () => {
    const p = await open();
    setDate(p, '2026-10-27');
    const slots = timeOptions(p);
    expect([slots[0], slots[slots.length - 1]]).toEqual(['15:00', '22:30']);
    expect(slots).toHaveLength(16);
  });

  it('Saturday slots run 11:30–22:30', async () => {
    const p = await open();
    setDate(p, '2026-10-24');
    const slots = timeOptions(p);
    expect([slots[0], slots[slots.length - 1]]).toEqual(['11:30', '22:30']);
  });

  it('Sunday slots run 11:30–18:30', async () => {
    const p = await open();
    setDate(p, '2026-10-25');
    const slots = timeOptions(p);
    expect([slots[0], slots[slots.length - 1]]).toEqual(['11:30', '18:30']);
  });

  it('today only offers slots at least 30 minutes ahead', async () => {
    const p = await open(TUE_EVENING); // 16:00
    setDate(p, '2026-10-20');
    expect(timeOptions(p)[0]).toBe('16:30');
  });

  it('blocks submission and focuses the first invalid field', async () => {
    const p = await open();
    p.submit(p.$('[data-res-form]'));
    expect(p.$$('[data-res-form] .field.has-error').length).toBeGreaterThan(0);
    expect(document.activeElement?.id).toBe('r-name');
    expect(p.$('[data-toast]').classList.contains('is-visible')).toBe(false);
  });

  it('valid input builds a mailto: to marienbraeu@gmx.at with encoded subject and body', async () => {
    const p = await open();
    input(p, '#r-name').value = 'Anna Müller';
    input(p, '#r-email').value = 'anna@example.com';
    input(p, '#r-phone').value = '+43 660 1234567';
    setDate(p, '2026-10-27');
    (p.$('#r-time') as HTMLSelectElement).value = '19:00';
    (p.$('#r-guests') as HTMLSelectElement).value = '4';
    (p.$('#r-notes') as HTMLTextAreaElement).value = 'Kinderstuhl & Torte';
    p.submit(p.$('[data-res-form]'));

    const href = p.$('[data-toast-text] a[href^="mailto:"]').getAttribute('href') ?? '';
    expect(href.startsWith('mailto:marienbraeu@gmx.at?subject=')).toBe(true);
    expect(href).not.toMatch(/[ \n]/);
    const url = new URL(href);
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe('marienbraeu@gmx.at');
    expect(url.searchParams.get('subject')).toBe(
      'Tischreservierung Marienbräu: Anna Müller – Dienstag, 27. Oktober 2026 um 19:00 Uhr (4 Personen)',
    );
    const body = url.searchParams.get('body') ?? '';
    expect(body).toContain('• Name: Anna Müller\n');
    expect(body).toContain('• Telefon: +43 660 1234567\n');
    expect(body).toContain('• E-Mail: anna@example.com\n');
    expect(body).toContain('• Datum: Dienstag, 27. Oktober 2026\n');
    expect(body).toContain('• Uhrzeit: 19:00 Uhr\n');
    expect(body).toContain('• Personenanzahl: 4 Personen\n');
    expect(body).toContain('• Sitzplatzwunsch: Gaststube (drinnen)\n');
    expect(body).toContain('• Besondere Wünsche / Anmerkungen: Kinderstuhl & Torte\n');
    expect(body.endsWith('Mit freundlichen Grüßen,\nAnna Müller')).toBe(true);
    expect(p.$('[data-toast]').classList.contains('is-visible')).toBe(true);
    expect(p.$('[data-modal="reservation"]').classList.contains('is-open')).toBe(false);
  });
});

describe('page chrome', () => {
  it('toggles the mobile drawer and locks scrolling', async () => {
    const p = await boot();
    p.click(p.$('[data-menu-toggle]'));
    expect(p.$('[data-menu-toggle]').getAttribute('aria-expanded')).toBe('true');
    expect(document.body.classList.contains('is-locked')).toBe(true);
    p.click(p.$('[data-menu-toggle]'));
    expect(document.body.classList.contains('is-locked')).toBe(false);
  });

  it('opens a legal modal with translated content', async () => {
    const p = await boot();
    p.click(p.$('[data-open-legal="privacy"]'));
    expect(p.$('[data-modal="legal"]').classList.contains('is-open')).toBe(true);
    expect(p.$('[data-legal-title]').textContent).toBeTruthy();
  });

  it('writes the current year into the footer', async () => {
    const p = await boot();
    expect(p.$('[data-year]').textContent).toBe('2026');
  });
});
