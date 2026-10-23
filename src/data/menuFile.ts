import {
  LANGS,
  type Dish,
  type DishCopy,
  type DishTag,
  type GoogleReview,
  type Lang,
  type MenuCategory,
} from '../types';

/**
 * Schema of public/assets/data/menu.json, the file the owner edits
 * (see docs/MENU_UPDATE_GUIDE.md). Translations are optional per language.
 */
export interface MenuFileDish {
  id: string;
  category: MenuCategory;
  price: number;
  portion?: string | null;
  allergens?: string | null;
  tags?: DishTag[];
  star?: boolean;
  photo?: string | null;
  google_review?: GoogleReview | null;
  name: Partial<Record<Lang, string>>;
  description: Partial<Record<Lang, string>>;
}

export interface MenuFile {
  version: string;
  last_updated: string;
  currency: string;
  google_maps_review_url: string;
  dishes: MenuFileDish[];
}

/** A usable menu file has at least one dish; anything else keeps the built-in menu. */
export function isMenuFile(value: unknown): value is MenuFile {
  if (typeof value !== 'object' || value === null || !('dishes' in value)) return false;
  return Array.isArray(value.dishes) && value.dishes.length > 0;
}

export function toDish(raw: MenuFileDish): Dish {
  const copy: Partial<Record<Lang, DishCopy>> = {};
  for (const lang of LANGS) {
    const name = raw.name[lang];
    copy[lang] = name ? { name, desc: raw.description[lang] } : {};
  }
  return {
    id: raw.id,
    cat: raw.category,
    price: raw.price,
    tags: raw.tags ?? [],
    star: raw.star ?? false,
    allergens: raw.allergens ?? null,
    size: raw.portion ?? null,
    photo: raw.photo ?? null,
    googleReview: raw.google_review ?? null,
    copy,
  };
}
