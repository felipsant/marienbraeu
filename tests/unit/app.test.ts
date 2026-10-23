import { afterEach, describe, expect, it } from 'vitest';
import { boot, type Page } from '../support/legacy-env';

const TUE_EVENING = '2026-10-20T14:00:00Z'; // Tue 16:00 Vienna
const TUE_LATE = '2026-10-20T21:30:00Z'; // Tue 23:30 Vienna
const MON_NOON = '2026-10-26T11:00:00Z'; // Mon 12:00 Vienna (rest day)
const WED_MORNING = '2026-10-21T08:00:00Z'; // Wed 10:00 Vienna, before opening
const originalTZ = process.env.TZ;

afterEach(() => {
  if (originalTZ === undefined) delete process.env.TZ;
  else process.env.TZ = originalTZ;
});

const htmlLang = (p: Page) => p.document.documentElement.lang;

describe('language detection', () => {
  it('defaults Austrian / German browsers to de', () => {
    expect(htmlLang(boot({ languages: ['de-AT'] }))).toBe('de');
    expect(htmlLang(boot({ languages: ['de-DE'] }))).toBe('de');
    expect(htmlLang(boot({ languages: ['gsw'] }))).toBe('de');
  });

  it('picks the first supported browser language', () => {
    expect(htmlLang(boot({ languages: ['fr-FR', 'it-IT', 'en'] }))).toBe('it');
    expect(htmlLang(boot({ languages: ['hu'] }))).toBe('hu');
    expect(htmlLang(boot({ languages: ['pl-PL'] }))).toBe('pl');
    expect(htmlLang(boot({ languages: ['mo'] }))).toBe('ro');
  });

  it('lets the saved mb_lang win over the browser language', () => {
    expect(htmlLang(boot({ languages: ['de-AT'], stored: { mb_lang: 'pl' } }))).toBe('pl');
  });

  it('still honours the legacy mb-lang key, but mb_lang beats it', () => {
    expect(htmlLang(boot({ languages: ['de-AT'], stored: { 'mb-lang': 'ro' } }))).toBe('ro');
    expect(htmlLang(boot({ languages: ['de-AT'], stored: { 'mb-lang': 'ro', mb_lang: 'it' } }))).toBe('it');
  });

  it('ignores an unsupported saved language', () => {
    expect(htmlLang(boot({ languages: ['it'], stored: { mb_lang: 'xx' } }))).toBe('it');
  });

  it('falls back to the time zone, then to English', () => {
    process.env.TZ = 'Europe/Rome';
    expect(htmlLang(boot({ languages: ['fr-FR'] }))).toBe('it');
    process.env.TZ = 'America/New_York';
    expect(htmlLang(boot({ languages: ['fr-FR'] }))).toBe('en');
  });
});

describe('language switching', () => {
  it('swaps copy, <html lang>, aria-pressed and persists the choice', () => {
    const p = boot({ languages: ['de-AT'] });
    expect(p.$('[data-i18n="nav.menu"]').textContent).toBe('Speisekarte');
    p.click(p.$$('[data-lang="en"]')[0]);
    expect(htmlLang(p)).toBe('en');
    expect(p.$('[data-i18n="nav.menu"]').textContent).toBe('Menu');
    expect(p.window.localStorage.getItem('mb_lang')).toBe('en');
    expect(p.$$('[data-lang="en"]').every((b) => b.getAttribute('aria-pressed') === 'true')).toBe(true);
    expect(p.$$('[data-lang="de"]').every((b) => b.getAttribute('aria-pressed') === 'false')).toBe(true);
  });

  it('translates attributes (aria-label) too', () => {
    const p = boot();
    p.click(p.$$('[data-lang="it"]')[0]);
    expect(p.$('[data-i18n-attr="aria-label:nav.label"]').getAttribute('aria-label')).not.toBe('Hauptnavigation');
  });

  it('round-trips back to the original German markup', () => {
    const p = boot();
    const before = p.$('[data-i18n="nav.menu"]').textContent;
    p.click(p.$$('[data-lang="ro"]')[0]);
    p.click(p.$$('[data-lang="de"]')[0]);
    expect(p.$('[data-i18n="nav.menu"]').textContent).toBe(before);
  });
});

describe('live opening status', () => {
  const status = (p: Page) => ({ cls: [...p.$('[data-live-status]').classList].filter((c) => c.startsWith('is-')), text: p.$('[data-live-status] [data-live-text]').textContent });

  it('open: shows closing time', () => {
    const s = status(boot({ now: TUE_EVENING }));
    expect(s.cls).toEqual(['is-open']);
    expect(s.text).toBe('Jetzt geöffnet · bis 24:00 Uhr');
  });

  it('closing soon within the last hour', () => {
    expect(status(boot({ now: TUE_LATE })).cls).toEqual(['is-soon']);
  });

  it('closed before opening shows today’s opening time', () => {
    const s = status(boot({ now: WED_MORNING }));
    expect(s.cls).toEqual(['is-closed']);
    expect(s.text).toBe('Geschlossen · öffnet heute um 15:00 Uhr');
  });

  it('on the Monday rest day announces tomorrow’s opening', () => {
    const s = status(boot({ now: MON_NOON }));
    expect(s.cls).toEqual(['is-closed']);
    expect(s.text).toContain('15:00');
  });

  it('highlights today in the hours table (Vienna weekday)', () => {
    const p = boot({ now: TUE_EVENING });
    const today = p.$$('[data-hours-table] tr.is-today');
    expect(today).toHaveLength(1);
    expect(today[0].dataset.day).toBe('2');
  });
});

describe('menu', () => {
  const cards = (p: Page) => p.$$('[data-menu-grid] .dish');

  it('renders all 26 dishes with € prices in the Austrian format', () => {
    const p = boot();
    expect(cards(p)).toHaveLength(26);
    expect(p.$('.dish-price').textContent).toBe('€ 13,50');
  });

  it('adds a count badge to each filter pill and filters on click', () => {
    const p = boot();
    const pills = p.$$('[data-menu-filters] .pill');
    const counts = Object.fromEntries(pills.map((b) => [b.dataset.filter, Number(b.querySelector('.count')!.textContent)]));
    expect(counts).toEqual({ all: 26, classics: 7, jause: 6, soups: 2, salads: 4, dessert: 4, brew: 3 });
    p.click(pills.find((b) => b.dataset.filter === 'soups')!);
    expect(cards(p)).toHaveLength(2);
    expect(pills.filter((b) => b.getAttribute('aria-pressed') === 'true').map((b) => b.dataset.filter)).toEqual(['soups']);
  });

  it('shows copy in the active language and English decimal sizes', () => {
    const p = boot();
    p.click(p.$$('[data-lang="en"]')[0]);
    expect(p.$('.dish-name').textContent).toBe('Half Backhendl');
    expect(p.$('.dish-price').textContent).toBe('€ 13.50');
  });

  it('falls back to German copy for languages without menu translations', () => {
    const p = boot();
    p.click(p.$$('[data-lang="hu"]')[0]);
    expect(p.$('.dish-name').textContent).toBe('Halbes Backhendl');
  });

  it('escapes HTML in dish copy', () => {
    const p = boot();
    expect(p.$('[data-menu-grid]').innerHTML).not.toMatch(/<script/i);
  });
});

describe('reviews carousel', () => {
  it('renders one slide per review (dots need layout, see e2e)', () => {
    const p = boot();
    expect(p.$$('[data-carousel-track] .review')).toHaveLength(7);
  });
});

describe('reservation form', () => {
  function open(now = TUE_EVENING) {
    const p = boot({ now });
    p.click(p.$$('[data-open-reservation]')[0]);
    return p;
  }
  const setDate = (p: Page, iso: string) => {
    const input = p.$('#r-date') as HTMLInputElement;
    input.value = iso;
    input.dispatchEvent(new p.window.Event('change', { bubbles: true }));
  };
  const timeOptions = (p: Page) => p.$$('#r-time option').map((o) => (o as HTMLOptionElement).value).filter(Boolean);

  it('opens the modal and sets the earliest selectable date to today (Vienna)', () => {
    const p = open();
    expect(p.$('[data-modal="reservation"]').classList.contains('is-open')).toBe(true);
    expect((p.$('#r-date') as HTMLInputElement).min).toBe('2026-10-20');
  });

  it('offers 12 single-guest steps plus the four group options', () => {
    const p = open();
    expect(p.$$('[data-guests] option').map((o) => (o as HTMLOptionElement).value)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '20', '40', '80', 'more']);
  });

  it('Monday: shows the rest-day error', () => {
    const p = open();
    setDate(p, '2026-10-26');
    expect(p.$('#r-date').closest('.field')!.classList.contains('has-error')).toBe(true);
    expect(p.$('#r-date').closest('.field')!.querySelector('.error')!.textContent).toMatch(/Montag|Ruhetag/);
    expect(timeOptions(p)).toEqual([]);
  });

  it('rejects dates in the past', () => {
    const p = open();
    setDate(p, '2026-10-19');
    expect(p.$('#r-date').closest('.field')!.classList.contains('has-error')).toBe(true);
  });

  it('Tue–Fri slots run 15:00–22:30 (last seating 90 min before 24:00)', () => {
    const p = open();
    setDate(p, '2026-10-27');
    const t = timeOptions(p);
    expect(t[0]).toBe('15:00');
    expect(t[t.length - 1]).toBe('22:30');
    expect(t).toHaveLength(16);
  });

  it('Saturday slots run 11:30–22:30', () => {
    const p = open();
    setDate(p, '2026-10-24');
    const t = timeOptions(p);
    expect([t[0], t[t.length - 1]]).toEqual(['11:30', '22:30']);
  });

  it('Sunday slots run 11:30–18:30', () => {
    const p = open();
    setDate(p, '2026-10-25');
    const t = timeOptions(p);
    expect([t[0], t[t.length - 1]]).toEqual(['11:30', '18:30']);
  });

  it('today only offers slots at least 30 minutes ahead', () => {
    const p = open(TUE_EVENING); // 16:00
    setDate(p, '2026-10-20');
    expect(timeOptions(p)[0]).toBe('16:30');
  });

  it('blocks submission and focuses the first invalid field', () => {
    const p = open();
    (p.$('[data-res-form]') as HTMLFormElement).dispatchEvent(new p.window.Event('submit', { bubbles: true, cancelable: true }));
    expect(p.$$('[data-res-form] .field.has-error').length).toBeGreaterThan(0);
    expect(p.document.activeElement?.id).toBe('r-name');
    expect(p.$('[data-toast]').classList.contains('is-visible')).toBe(false);
  });

  it('valid input builds a mailto: to marienbraeu@gmx.at with encoded subject and body', () => {
    const p = open();
    const fill = (sel: string, v: string) => ((p.$(sel) as HTMLInputElement).value = v);
    fill('#r-name', 'Anna Müller');
    fill('#r-email', 'anna@example.com');
    fill('#r-phone', '+43 660 1234567');
    setDate(p, '2026-10-27');
    (p.$('#r-time') as HTMLSelectElement).value = '19:00';
    (p.$('#r-guests') as HTMLSelectElement).value = '4';
    (p.$('#r-notes') as HTMLTextAreaElement).value = 'Kinderstuhl & Torte';
    (p.$('[data-res-form]') as HTMLFormElement).dispatchEvent(new p.window.Event('submit', { bubbles: true, cancelable: true }));

    const link = p.$('[data-toast-text] a[href^="mailto:"]') as HTMLAnchorElement;
    const href = link.getAttribute('href')!;
    expect(href.startsWith('mailto:marienbraeu@gmx.at?subject=')).toBe(true);
    expect(href).not.toMatch(/[ \n&](?=.*subject)/); // everything after ? is percent-encoded
    const url = new URL(href);
    expect(url.protocol).toBe('mailto:');
    expect(url.pathname).toBe('marienbraeu@gmx.at');
    expect(url.searchParams.get('subject')).toBe('Tischreservierung Marienbräu: Anna Müller – Dienstag, 27. Oktober 2026 um 19:00 Uhr (4 Personen)');
    const body = url.searchParams.get('body')!;
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
  it('toggles the mobile drawer and locks scrolling', () => {
    const p = boot();
    p.click(p.$('[data-menu-toggle]'));
    expect(p.$('[data-menu-toggle]').getAttribute('aria-expanded')).toBe('true');
    expect(p.document.body.classList.contains('is-locked')).toBe(true);
    p.click(p.$('[data-menu-toggle]'));
    expect(p.document.body.classList.contains('is-locked')).toBe(false);
  });

  it('opens a legal modal with translated content', () => {
    const p = boot();
    p.click(p.$('[data-open-legal="privacy"]'));
    expect(p.$('[data-modal="legal"]').classList.contains('is-open')).toBe(true);
    expect(p.$('[data-legal-title]').textContent).toBeTruthy();
  });

  it('writes the current year into the footer', () => {
    expect(boot().$('[data-year]').textContent).toBe('2026');
  });
});
