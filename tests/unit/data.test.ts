import { describe, expect, it } from 'vitest';
import { loadGlobals, read } from '../support/legacy-env';

const { I18N, MENU, HOURS, REVIEWS, ALLERGENS, SUPPLIERS } = loadGlobals();
const menuJson = JSON.parse(read('assets/data/menu.json')) as { dishes: any[] };
const CATEGORIES = ['classics', 'jause', 'soups', 'salads', 'dessert', 'brew'];
const TAGS = ['veg', 'regional', 'house', 'beer', 'season'];
const VEAL = /(?<![a-z])(kalb|veal|calf|calves|vitello|borj[uú]|cielęc|vițel)/i;

describe('menu data (data.js)', () => {
  it('every dish has a category, a price, tags and German/English/Italian copy', () => {
    for (const d of MENU) {
      expect(CATEGORIES).toContain(d.cat);
      expect(typeof d.price).toBe('number');
      expect(d.price).toBeGreaterThan(0);
      for (const tag of d.tags) expect(TAGS).toContain(tag);
      for (const l of ['de', 'en', 'it']) {
        expect(d[l].name).toBeTruthy();
        expect(d[l].desc).toBeTruthy();
      }
    }
  });

  // KNOWN DEVIATION from the captain's call notes (22 dishes): the live site has 26.
  it('[deviation] holds 26 dishes where the call notes say 22', () => {
    expect(MENU).toHaveLength(26);
    expect(menuJson.dishes).toHaveLength(26);
  });

  it('is pork only: no veal / calf anywhere in the menu, translations or page', () => {
    const haystacks = [JSON.stringify(MENU), JSON.stringify(I18N), JSON.stringify(menuJson), read('index.html')];
    for (const h of haystacks) expect(h).not.toMatch(VEAL);
    const names = MENU.map((d) => d.de.name);
    expect(names).toContain('Wienerschnitzel vom Schwein');
    expect(names).toContain('Cordon Bleu vom Schwein');
  });

  it('uses Codex allergen letters A–R only', () => {
    for (const d of MENU) {
      const codes = d.allergens ? d.allergens.split(',').map((c: string) => c.trim()) : [];
      for (const c of codes) expect(c).toMatch(/^[A-R]$/);
    }
    for (const d of menuJson.dishes) {
      const codes = d.allergens ? d.allergens.split(',').map((c: string) => c.trim()) : [];
      for (const c of codes) expect(c).toMatch(/^[A-R]$/);
    }
    expect(ALLERGENS.map((a) => a.code)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'M', 'N', 'O', 'P', 'R']);
    for (const a of ALLERGENS) expect(Object.keys(a).sort()).toEqual(['code', 'de', 'en', 'it']);
  });

  it('names both regional suppliers (Schönberger, Kapper)', () => {
    for (const l of ['de', 'en', 'it']) {
      expect(SUPPLIERS[l]).toMatch(/Schönberger/);
      expect(SUPPLIERS[l]).toMatch(/Kapper/);
    }
    const html = read('index.html');
    expect(html).toMatch(/Schönberger/);
    expect(html).toMatch(/Kapper/);
  });
});

describe('opening hours (data.js)', () => {
  const min = (h: number, m = 0) => h * 60 + m;
  it('Monday is the rest day', () => expect(HOURS[1]).toBeNull());
  it('Tuesday to Friday 15:00–24:00', () => {
    for (const d of [2, 3, 4, 5]) expect(HOURS[d]).toEqual({ open: min(15), close: min(24) });
  });
  it('Saturday 11:30–24:00', () => expect(HOURS[6]).toEqual({ open: min(11, 30), close: min(24) }));
  it('Sunday 11:30–20:00', () => expect(HOURS[0]).toEqual({ open: min(11, 30), close: min(20) }));
});

describe('owner-editable menu.json', () => {
  it('lists dishes with id, price, allergens, category and German name', () => {
    for (const d of menuJson.dishes) {
      expect(d.id).toMatch(/^[a-z0-9-]+$/);
      expect(typeof d.price).toBe('number');
      expect(d).toHaveProperty('allergens');
      expect(CATEGORIES).toContain(d.category);
      expect(d.name.de).toBeTruthy();
    }
    expect(new Set(menuJson.dishes.map((d) => d.id)).size).toBe(menuJson.dishes.length);
  });

  // KNOWN DEVIATION: notes ask for `title_de`; the real schema nests it as name.de.
  it('[deviation] has no title_de field (German title is name.de)', () => {
    for (const d of menuJson.dishes) expect(d).not.toHaveProperty('title_de');
  });

  it('mirrors the built-in data.js menu (same order, categories, prices, German names)', () => {
    expect(menuJson.dishes.map((d) => [d.category, d.price, d.name.de])).toEqual(MENU.map((d) => [d.cat, d.price, d.de.name]));
  });

  it('references dish photos with relative paths only', () => {
    for (const d of menuJson.dishes) if (d.photo) expect(d.photo).not.toMatch(/^(\/|[a-z]+:)/);
  });

  it('has the review sample data shape', () => {
    expect(REVIEWS.length).toBeGreaterThan(0);
    for (const r of REVIEWS) for (const k of ['name', 'color', 'de', 'en', 'it']) expect(r[k]).toBeTruthy();
  });
});
