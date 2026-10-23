import type { Page } from '@playwright/test';

export const LANGS = ['de', 'en', 'it', 'hu', 'pl', 'ro'] as const;
export type Lang = (typeof LANGS)[number];

/** Wed 2026-10-21 10:00 Vienna: the restaurant is closed, status text is deterministic. */
export const FROZEN_NOW = '2026-10-21T08:00:00Z';

/**
 * Removes the only sources of frame-to-frame variance (running transitions and
 * keyframes, the text caret) so that two captures of the same build are
 * byte-identical. It is applied identically to every build under comparison.
 */
const STABILISE_CSS = `*, *::before, *::after { transition: none !important; animation: none !important; caret-color: transparent !important; scroll-behavior: auto !important; }`;

/** Hides the fixed chrome so section screenshots do not depend on scroll position. */
export const HIDE_FIXED_CHROME_CSS = `[data-header], [data-action-bar] { visibility: hidden !important; }`;

export interface OpenOptions {
  lang?: Lang;
  /** URL path the site is served under, e.g. "/" or "/marienbraeu/". */
  base?: string;
}

/** Opens the page in a given language with a frozen clock and waits until it has settled. */
export async function openSite(page: Page, { lang = 'de', base = '/' }: OpenOptions = {}): Promise<void> {
  await page.clock.setFixedTime(FROZEN_NOW);
  await page.addInitScript((l) => window.localStorage.setItem('mb_lang', l), lang);
  await page.goto(base, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: STABILISE_CSS });
  await page.waitForFunction(() => document.documentElement.lang !== '' && !document.documentElement.classList.contains('no-js'));
  await settleFonts(page);
}

/**
 * Web fonts are fetched per unicode-range subset as glyphs first appear, so
 * `document.fonts.ready` can resolve before a later subset (ő, ț, ł …) arrives.
 * Wait until no face is loading and the loaded count has stopped changing.
 */
export async function settleFonts(page: Page): Promise<void> {
  let previous = -1;
  for (let stable = 0; stable < 3; ) {
    await page.evaluate(() => document.fonts.ready);
    const loaded = await page.evaluate(() => {
      const faces = [...document.fonts];
      return faces.some((f) => f.status === 'loading') ? -2 : faces.filter((f) => f.status === 'loaded').length;
    });
    stable = loaded === previous && loaded !== -2 ? stable + 1 : 0;
    previous = loaded;
    await page.waitForTimeout(250);
  }
}

/** Scrolls top to bottom so every scroll-reveal element and lazy image gets triggered, then returns to the top. */
export async function revealEverything(page: Page): Promise<void> {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = await page.evaluate(() => Math.floor(window.innerHeight * 0.6));
  for (let y = 0; y <= height; y += step) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.evaluate(async () => {
    await Promise.all(Array.from(document.images).map((img) => (img.complete ? null : img.decode().catch(() => undefined))));
  });
  await settleFonts(page);
}
