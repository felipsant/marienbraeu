import { describe, expect, it } from 'vitest';
import { HOURS } from '../../src/data/hours';
import { BUILT_IN_MENU } from '../../src/data/menu';
import { isMenuFile, toDish, type MenuFile } from '../../src/data/menuFile';
import { REVIEWS } from '../../src/data/reviews';
import { en } from '../../src/i18n/messages/en';
import { DISH_TAGS, MENU_CATEGORIES } from '../../src/types';
import { read } from '../support/files';

const menuJson = JSON.parse(read('public/assets/data/menu.json')) as MenuFile;
const VEAL = /(?<![a-z])(kalb|veal|calf|calves|vitello|borj[uú]|cielęc|vițel)/i;

describe('built-in menu', () => {
  it('gives every dish a category, a price, tags and German/English/Italian copy', () => {
    for (const dish of BUILT_IN_MENU) {
      expect(MENU_CATEGORIES).toContain(dish.cat);
      expect(dish.price).toBeGreaterThan(0);
      for (const tag of dish.tags) expect(DISH_TAGS).toContain(tag);
      for (const lang of ['de', 'en', 'it'] as const) {
        expect(dish.copy[lang]?.name).toBeTruthy();
        expect(dish.copy[lang]?.desc).toBeTruthy();
      }
    }
  });

  // KNOWN DEVIATION from the captain's call notes (22 dishes): the live site has 26.
  it('[deviation] holds 26 dishes where the call notes say 22', () => {
    expect(BUILT_IN_MENU).toHaveLength(26);
    expect(menuJson.dishes).toHaveLength(26);
  });

  it('is pork only: no veal / calf anywhere in the menu, translations or page', () => {
    const haystacks = [
      JSON.stringify(BUILT_IN_MENU),
      JSON.stringify(en),
      read('public/assets/data/menu.json'),
      read('index.html'),
    ];
    for (const haystack of haystacks) expect(haystack).not.toMatch(VEAL);
    const names = BUILT_IN_MENU.map((dish) => dish.copy.de?.name);
    expect(names).toContain('Wienerschnitzel vom Schwein');
    expect(names).toContain('Cordon Bleu vom Schwein');
  });

  it('uses Codex allergen letters A–R only', () => {
    const codes = [
      ...BUILT_IN_MENU.map((dish) => dish.allergens),
      ...menuJson.dishes.map((dish) => dish.allergens),
    ].flatMap((list) => (list ? list.split(',').map((code) => code.trim()) : []));
    expect(codes.length).toBeGreaterThan(20);
    for (const code of codes) expect(code).toMatch(/^[A-R]$/);
  });

  it('names both regional suppliers (Schönberger, Kapper) on the page', () => {
    const html = read('index.html');
    expect(html).toMatch(/Schönberger/);
    expect(html).toMatch(/Kapper/);
    expect(en['menu.suppliers']).toMatch(/Schönberger/);
    expect(en['menu.suppliers']).toMatch(/Kapper/);
  });
});

describe('opening hours', () => {
  const minutes = (h: number, m = 0): number => h * 60 + m;
  it('Monday is the rest day', () => {
    expect(HOURS[1]).toBeNull();
  });
  it('Tuesday to Friday 15:00–24:00', () => {
    for (const day of [2, 3, 4, 5])
      expect(HOURS[day]).toEqual({ open: minutes(15), close: minutes(24) });
  });
  it('Saturday 11:30–24:00', () => {
    expect(HOURS[6]).toEqual({ open: minutes(11, 30), close: minutes(24) });
  });
  it('Sunday 11:30–20:00', () => {
    expect(HOURS[0]).toEqual({ open: minutes(11, 30), close: minutes(20) });
  });
});

describe('owner-editable menu.json', () => {
  it('lists dishes with id, price, allergens, category and German name', () => {
    for (const dish of menuJson.dishes) {
      expect(dish.id).toMatch(/^[a-z0-9-]+$/);
      expect(typeof dish.price).toBe('number');
      expect(dish).toHaveProperty('allergens');
      expect(MENU_CATEGORIES).toContain(dish.category);
      expect(dish.name.de).toBeTruthy();
    }
    expect(new Set(menuJson.dishes.map((dish) => dish.id)).size).toBe(menuJson.dishes.length);
  });

  // KNOWN DEVIATION: the notes ask for `title_de`; the real schema nests it as name.de.
  it('[deviation] has no title_de field (German title is name.de)', () => {
    for (const dish of menuJson.dishes) expect(dish).not.toHaveProperty('title_de');
  });

  it('mirrors the built-in menu (same order, categories, prices, German names)', () => {
    const fromFile = menuJson.dishes
      .map(toDish)
      .map((dish) => [dish.cat, dish.price, dish.copy.de?.name]);
    const builtIn = BUILT_IN_MENU.map((dish) => [dish.cat, dish.price, dish.copy.de?.name]);
    expect(fromFile).toEqual(builtIn);
  });

  it('references dish photos with relative paths only', () => {
    for (const dish of menuJson.dishes) {
      if (dish.photo) expect(dish.photo).not.toMatch(/^(\/|[a-z]+:)/);
    }
  });

  it('is only accepted when it lists at least one dish', () => {
    expect(isMenuFile(menuJson)).toBe(true);
    expect(isMenuFile({ dishes: [] })).toBe(false);
    expect(isMenuFile({})).toBe(false);
    expect(isMenuFile(null)).toBe(false);
  });

  it('normalises to the same shape the page renders, with owner fields mapped', () => {
    const first = menuJson.dishes[0];
    if (!first) throw new Error('menu.json is empty');
    const dish = toDish(first);
    expect(dish).toMatchObject({ id: first.id, cat: first.category, price: first.price });
    expect(dish.copy.en?.name).toBe(first.name.en);
  });
});

describe('reviews', () => {
  it('have the sample data shape', () => {
    expect(REVIEWS.length).toBeGreaterThan(0);
    for (const review of REVIEWS) {
      for (const key of ['name', 'color', 'de', 'en', 'it'] as const)
        expect(review[key]).toBeTruthy();
    }
  });
});
