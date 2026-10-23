import { BUILT_IN_MENU } from '../data/menu';
import { isMenuFile, toDish } from '../data/menuFile';
import { getLang, LOCALES, onLanguageChange, t, type MessageKey } from '../i18n';
import { $, $$, escapeHtml } from '../lib/dom';
import type { Dish, DishCopy, DishTag } from '../types';

const MENU_JSON_URL = `${import.meta.env.BASE_URL}assets/data/menu.json`;
const GOOGLE_REVIEWS_URL = 'https://maps.app.goo.gl/rvDNVtdcPYVDybdy7';
const STAGGER_MS = 40;
const MAX_STAGGER_MS = 400;

const TAG_ICONS: Readonly<Record<DishTag, string>> = {
  veg: 'i-leaf',
  regional: 'i-mountain',
  house: 'i-chef',
  beer: 'i-beer',
  season: 'i-sun',
};

const TAG_LABELS: Readonly<Record<DishTag, MessageKey>> = {
  veg: 'tag.veg',
  regional: 'tag.regional',
  house: 'tag.house',
  beer: 'tag.beer',
  season: 'tag.season',
};

let menu: readonly Dish[] = BUILT_IN_MENU;
let activeFilter = 'all';

export function formatPrice(value: number, locale: string): string {
  return `€ ${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** English writes decimals with a point, every other language with a comma. */
function localizedSize(size: string | null | undefined): string {
  if (!size) return '';
  return getLang() === 'en' ? size.replace(/,/g, '.') : size;
}

/**
 * The dish copy for a language, or the German copy when that language has no name
 * for the dish (menu.json carries no hu/pl/ro translations). Falls back to the same
 * German text the built-in menu uses, so "undefined" is never rendered.
 */
function copyFor(dish: Dish): DishCopy {
  const own = dish.copy[getLang()];
  return own?.name ? own : (dish.copy.de ?? { name: '', desc: '' });
}

function reviewHtml(dish: Dish): string {
  const review = dish.googleReview;
  if (!review) return '';
  const text = review[getLang()] ?? review.de;
  return (
    `<a href="${GOOGLE_REVIEWS_URL}" target="_blank" rel="noopener" class="dish-review" title="Google-Bewertung auf Google Maps ansehen">` +
    '<div class="dish-review-top"><span class="dish-review-stars" aria-hidden="true">★★★★★</span><span class="dish-review-badge-text">Google Review</span></div>' +
    `<span class="dish-review-quote">„${escapeHtml(text)}“</span>` +
    `<span class="dish-review-author">— ${escapeHtml(review.author)}</span>` +
    '</a>'
  );
}

function dishHtml(dish: Dish, index: number): string {
  const copy = copyFor(dish);
  const size = localizedSize(dish.size);
  const tags = dish.tags
    .map(
      (tag) =>
        `<span class="tag tag--${tag}"><svg aria-hidden="true"><use href="#${TAG_ICONS[tag]}"/></svg>${escapeHtml(t(TAG_LABELS[tag]))}</span>`,
    )
    .join('');
  const photo = dish.photo
    ? '<div class="dish-photo-frame mb-3">' +
      `<img src="${escapeHtml(dish.photo)}" alt="${escapeHtml(copy.name)}" class="dish-photo" loading="lazy">` +
      '</div>'
    : '';
  return (
    `<article class="dish" style="animation-delay:${String(Math.min(index * STAGGER_MS, MAX_STAGGER_MS))}ms">` +
    (dish.star ? `<span class="dish-star">★ ${escapeHtml(t('menu.recommend'))}</span>` : '') +
    photo +
    `<div class="dish-head"><h3 class="dish-name">${escapeHtml(copy.name)}</h3><span class="dish-dots" aria-hidden="true"></span>` +
    `<span class="dish-price">${formatPrice(dish.price, LOCALES[getLang()])}</span></div>` +
    (size ? `<p class="dish-meta">${escapeHtml(size)}</p>` : '') +
    `<p class="dish-desc">${escapeHtml(copy.desc)}</p>` +
    (dish.allergens
      ? `<p class="text-[11px] mt-1 tracking-wide" style="color:var(--muted);opacity:0.85">${escapeHtml(t('menu.allergens'))}: ${escapeHtml(dish.allergens)}</p>`
      : '') +
    reviewHtml(dish) +
    `<div class="flex flex-wrap gap-1.5 mt-auto pt-2">${tags}</div>` +
    '</article>'
  );
}

function renderMenu(): void {
  const grid = $('[data-menu-grid]');
  if (!grid) return;
  const items = menu.filter((dish) => activeFilter === 'all' || dish.cat === activeFilter);
  grid.innerHTML = items.length
    ? items.map(dishHtml).join('')
    : `<p>${escapeHtml(t('menu.empty'))}</p>`;
}

function initFilters(): void {
  const pills = $$('[data-menu-filters] .pill');
  pills.forEach((pill) => {
    const filter = pill.dataset.filter;
    const count =
      filter === 'all' ? menu.length : menu.filter((dish) => dish.cat === filter).length;
    const badge = document.createElement('span');
    badge.className = 'count';
    badge.textContent = String(count);
    pill.appendChild(badge);
    pill.addEventListener('click', () => {
      activeFilter = filter ?? 'all';
      pills.forEach((p) => {
        p.setAttribute('aria-pressed', String(p === pill));
      });
      renderMenu();
    });
  });
}

/** Replaces the built-in menu with the owner-edited menu.json, when it loads and holds dishes. */
async function loadMenuFile(): Promise<void> {
  try {
    const response = await fetch(MENU_JSON_URL);
    if (!response.ok) return;
    const data: unknown = await response.json();
    if (!isMenuFile(data)) return;
    menu = data.dishes.map(toDish);
    renderMenu();
  } catch {
    /* keep the built-in menu */
  }
}

export function initMenu(): void {
  initFilters();
  renderMenu();
  onLanguageChange(renderMenu);
  void loadMenuFile();
}
