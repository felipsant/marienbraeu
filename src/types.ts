export const LANGS = ['de', 'en', 'it', 'hu', 'pl', 'ro'] as const;
export type Lang = (typeof LANGS)[number];

export const MENU_CATEGORIES = ['classics', 'jause', 'soups', 'salads', 'dessert', 'brew'] as const;
export type MenuCategory = (typeof MENU_CATEGORIES)[number];

export const DISH_TAGS = ['veg', 'regional', 'house', 'beer', 'season'] as const;
export type DishTag = (typeof DISH_TAGS)[number];

/** Opening hours in minutes since midnight; 24:00 is stored as 1440. */
export interface OpeningHours {
  open: number;
  close: number;
}

/** Keyed by JS weekday (0 = Sunday … 6 = Saturday); `null` is the Ruhetag. */
export type WeekHours = Readonly<Record<number, OpeningHours | null>>;

/** Name and description in one language; either can be missing when menu.json lacks a translation. */
export interface DishCopy {
  name?: string | undefined;
  desc?: string | undefined;
}

export interface GoogleReview {
  author: string;
  rating: number;
  de?: string;
  en?: string;
  it?: string;
  hu?: string;
  pl?: string;
  ro?: string;
}

/** A dish as the page renders it. */
export interface Dish {
  id?: string;
  cat: MenuCategory;
  price: number;
  tags: readonly DishTag[];
  star?: boolean;
  allergens?: string | null;
  size?: string | null;
  photo?: string | null;
  googleReview?: GoogleReview | null;
  copy: Partial<Record<Lang, DishCopy>>;
}

export interface Review {
  name: string;
  color: string;
  de: string;
  en: string;
  it: string;
}
