import { expect, test } from '@playwright/test';
import { HIDE_FIXED_CHROME_CSS, LANGS, openSite, revealEverything } from '../support/page';

/**
 * Shots that include the fixed header or a modal backdrop contain `backdrop-filter`
 * blur, whose edge pixels vary by a few hundred pixels between two captures of the
 * very same build. They get a 1% tolerance; section tiles and the DOM are exact.
 */
// Playwright applies the smaller of maxDiffPixels and maxDiffPixelRatio, so the
// config-wide `maxDiffPixels: 0` has to be lifted for the ratio to take effect.
const FIXED_CHROME = { maxDiffPixels: Number.MAX_SAFE_INTEGER, maxDiffPixelRatio: 0.01 };

/**
 * Visual and DOM baseline. Run once against the reference build with
 * `--update-snapshots`, then against any later build: every pixel must match.
 * See tests/README.md.
 */
for (const lang of LANGS) {
  test.describe(lang, () => {
    test(`chrome ${lang}`, async ({ page }) => {
      await openSite(page, { lang });
      await expect(page).toHaveScreenshot(`${lang}/viewport-top.png`, FIXED_CHROME);
      await revealEverything(page);
      await page.evaluate(() => window.scrollTo(0, 1200));
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot(`${lang}/viewport-scrolled.png`, FIXED_CHROME);
    });

    test(`sections ${lang}`, async ({ page }) => {
      await openSite(page, { lang });
      await revealEverything(page);
      await page.addStyleTag({ content: HIDE_FIXED_CHROME_CSS });
      const ids = await page.$$eval('section[id]', (els) => els.map((e) => e.id));
      expect(ids.length).toBeGreaterThanOrEqual(6);
      // Sections are captured in viewport-sized tiles: a whole tall section as one
      // image exhausts the e2e-runner's memory.
      for (const id of ids) {
        const box = await page.evaluate((sectionId) => {
          const r = document.getElementById(sectionId)!.getBoundingClientRect();
          return { top: r.top + window.scrollY, height: r.height };
        }, id);
        const viewport = page.viewportSize()!;
        for (let k = 0; k * viewport.height < box.height; k++) {
          const docY = Math.round(box.top + k * viewport.height);
          await page.evaluate((y) => window.scrollTo(0, y), docY);
          await page.waitForTimeout(60);
          // near the bottom of the page the browser clamps the scroll offset, so locate the tile by what actually scrolled
          const y = docY - (await page.evaluate(() => Math.round(window.scrollY)));
          const height = Math.min(
            viewport.height - y,
            Math.round(box.height - k * viewport.height),
          );
          // soft: keep comparing the remaining tiles after a mismatch
          await expect.soft(page).toHaveScreenshot(`${lang}/section-${id}-${k}.png`, {
            clip: { x: 0, y, width: viewport.width, height },
          });
        }
      }
    });

    test(`dom ${lang}`, async ({ page }) => {
      await openSite(page, { lang });
      await revealEverything(page);
      const html = await page.evaluate(() => {
        const clone = document.body.cloneNode(true) as HTMLElement;
        clone.querySelectorAll('script').forEach((s) => s.remove());
        return clone.outerHTML.replace(/>\s+</g, '>\n<');
      });
      expect(html).toMatchSnapshot(`${lang}/body.html`);
    });
  });
}

test('mobile drawer open', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'drawer only exists below 1220px');
  await openSite(page);
  await page.click('[data-menu-toggle]');
  await page.waitForTimeout(400);
  await expect(page).toHaveScreenshot('de/drawer-open.png', FIXED_CHROME);
});

test('reservation modal open', async ({ page }) => {
  await openSite(page);
  await page.locator('[data-open-reservation]:visible').first().click();
  await page.waitForTimeout(400);
  await expect(page).toHaveScreenshot('de/reservation-modal.png', FIXED_CHROME);
});
