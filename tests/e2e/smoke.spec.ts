import { type Page } from '@playwright/test';
import { expect, test } from '../support/fixtures';
import { openSite } from '../support/page';

// The page must work at the domain root and under the GitHub Pages sub-path.
const BASES = ['/', '/marienbraeu/'];

for (const base of BASES) {
  test.describe(`served at ${base}`, () => {
    test('loads with zero console errors, uncaught exceptions or failed requests', async ({
      page,
    }) => {
      const problems: string[] = [];
      page.on('console', (m) => m.type() === 'error' && problems.push(`console: ${m.text()}`));
      page.on('pageerror', (e) => problems.push(`exception: ${e.message}`));
      page.on(
        'response',
        (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()}: ${r.url()}`),
      );
      page.on('requestfailed', (r) => problems.push(`failed: ${r.url()}`));
      const response = await page.goto(base, { waitUntil: 'networkidle' });
      expect(response?.status()).toBe(200);
      await openSite(page, { base });
      expect(problems).toEqual([]);
    });

    test('every image resolves (no 404, none broken)', async ({ page }) => {
      await openSite(page, { base });
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForLoadState('networkidle');
      const broken = await page.$$eval('img', (imgs) =>
        imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src),
      );
      expect(broken).toEqual([]);
    });

    test('menu.json and every local asset resolve under this base', async ({
      page,
      request,
      baseURL,
    }) => {
      await openSite(page, { base });
      const urls = await page.$$eval('link[href], script[src], img[src]', (els) =>
        els
          .map((e) => (e as HTMLLinkElement).href || (e as HTMLImageElement).src)
          .filter((u) => u.startsWith(location.origin)),
      );
      expect(urls.length).toBeGreaterThan(3);
      for (const url of urls) expect((await request.get(url)).status(), url).toBe(200);
      const menu = await request.get(new URL('assets/data/menu.json', baseURL! + base).toString());
      expect(menu.status()).toBe(200);
      const { dishes } = (await menu.json()) as { dishes: unknown };
      expect(Array.isArray(dishes)).toBe(true);
      for (const url of urls) expect(new URL(url).pathname.startsWith(base), url).toBe(true);
    });
  });
}

test('tel:, mailto: and Google Maps links are well formed', async ({ page }) => {
  await openSite(page);
  const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')!));
  const tel = hrefs.filter((h) => h.startsWith('tel:'));
  expect(tel.length).toBeGreaterThan(0);
  for (const h of tel) expect(h).toBe('tel:+436642031953');
  const mail = hrefs.filter((h) => h.startsWith('mailto:'));
  expect(mail.length).toBeGreaterThan(0);
  for (const h of mail) expect(h).toMatch(/^mailto:marienbraeu@gmx\.at(\?|$)/);
  const maps = hrefs.filter((h) => /maps\.(app\.goo\.gl|google\.com)/.test(h));
  expect(maps.length).toBeGreaterThan(0);
  for (const h of maps) expect(() => new URL(h)).not.toThrow();
  // The same-origin "original menu card" link used to open in a new tab without rel="noopener".
  const withoutRel = await page.$$eval('a[target="_blank"]:not([rel~="noopener"])', (as) =>
    as.map((a) => a.getAttribute('href')),
  );
  expect(withoutRel).toEqual([]);
});

// KNOWN DEVIATION from the captain's call notes (they want initial-scale=1.0, maximum-scale=5.0).
test('[deviation] viewport meta is the current one', async ({ page }) => {
  await openSite(page);
  expect(await page.getAttribute('meta[name=viewport]', 'content')).toBe(
    'width=device-width, initial-scale=1, viewport-fit=cover',
  );
});

test('mobile drawer stays fixed to the viewport while the page is scrolled', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'mobile', 'drawer only exists below 1220px');
  await openSite(page);
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.click('[data-menu-toggle]');
  await page.waitForTimeout(400);
  const drawer = await page.evaluate(() => {
    const el = document.querySelector<HTMLElement>('[data-mobile-nav]')!;
    const ancestors: string[] = [];
    for (let n = el.parentElement; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backdropFilter !== 'none' || cs.transform !== 'none' || cs.filter !== 'none')
        ancestors.push(n.tagName);
    }
    const header = document.querySelector<HTMLElement>('[data-header]')!;
    return {
      position: getComputedStyle(el).position,
      top: el.getBoundingClientRect().top,
      headerBottom: header.getBoundingClientRect().bottom,
      trapAncestors: ancestors,
      bottom: el.getBoundingClientRect().bottom,
      vh: innerHeight,
    };
  });
  expect(drawer.position).toBe('fixed');
  expect(drawer.trapAncestors).toEqual([]);
  expect(Math.round(drawer.top)).toBe(Math.round(drawer.headerBottom));
  expect(Math.round(drawer.bottom)).toBe(drawer.vh);
});

test('switching language changes text without reloading the page', async ({ page }) => {
  await openSite(page);
  await page.evaluate(() => ((window as unknown as Record<string, unknown>).__marker = 1));
  const before = await page.locator('[data-i18n="nav.menu"]').first().textContent();
  await switchLanguage(page, 'en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  expect(await page.locator('[data-i18n="nav.menu"]').first().textContent()).not.toBe(before);
  expect(await page.evaluate(() => (window as unknown as Record<string, unknown>).__marker)).toBe(
    1,
  );
  await expect(page.locator('.dish-name').first()).toHaveText('Half Backhendl');
});

test('menu: 26 dishes, filter pills narrow the list', async ({ page }) => {
  await openSite(page);
  await expect(page.locator('[data-menu-grid] .dish')).toHaveCount(26);
  await page.locator('[data-filter="brew"]').click();
  await expect(page.locator('[data-menu-grid] .dish')).toHaveCount(3);
});

/** The language buttons live in the header on desktop and in the drawer on phones. */
async function switchLanguage(page: Page, lang: string) {
  const header = page.locator(`[data-header] [data-lang="${lang}"]`);
  if (!(await header.isVisible())) await page.click('[data-menu-toggle]');
  await page.locator(`[data-lang="${lang}"]:visible`).first().click();
}

async function pickDate(page: Page, iso: string) {
  await page.locator('[data-open-reservation]:visible').first().click();
  await page.fill('#r-date', iso);
  await page.locator('#r-date').dispatchEvent('change');
}

test('reservation: Monday shows the rest-day message', async ({ page }) => {
  await openSite(page);
  await pickDate(page, '2026-11-02');
  const field = page.locator('.field', { has: page.locator('#r-date') });
  await expect(field).toHaveClass(/has-error/);
  await expect(field.locator('.error')).toContainText(/Ruhetag|Montag/);
});

test('reservation: valid input produces the mailto: draft', async ({ page }) => {
  await openSite(page);
  await pickDate(page, '2026-10-27');
  await page.fill('#r-name', 'Anna Müller');
  await page.fill('#r-email', 'anna@example.com');
  await page.fill('#r-phone', '+43 660 1234567');
  await page.selectOption('#r-time', '19:00');
  await page.selectOption('#r-guests', '4');
  await page.locator('[data-res-form] button[type=submit]').click();
  const href = await page.locator('[data-toast-text] a[href^="mailto:"]').getAttribute('href');
  const url = new URL(href!);
  expect(url.pathname).toBe('marienbraeu@gmx.at');
  expect(url.searchParams.get('subject')).toBe(
    'Tischreservierung Marienbräu: Anna Müller – Dienstag, 27. Oktober 2026 um 19:00 Uhr (4 Personen)',
  );
  expect(url.searchParams.get('body')).toContain('• Personenanzahl: 4 Personen');
  expect(href).not.toMatch(/subject=[^&]*[ ]/);
});
