import { expect, test } from '@playwright/test';
import { LANGS, openSite, revealEverything } from '../support/page';

const WIDTHS = [375, 768, 1440] as const;

/**
 * The Google reviews badge used to sit at the bottom of the menu picture and
 * overlap its caption. It now lives at the top-right of the frame: assert the
 * two boxes never intersect and the badge stays inside the viewport.
 */
for (const lang of LANGS) {
  for (const width of WIDTHS) {
    test(`badge clears caption ${lang} @${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await openSite(page, { lang });
      await revealEverything(page);
      await page.locator('#ueber-uns [data-owner-frame]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);
      const boxes = await page.evaluate(() => {
        const badge = document.querySelector('#ueber-uns .card.absolute');
        const caption = document.querySelector('#ueber-uns [data-owner-frame] > .owner-caption');
        const rect = (
          el: Element | null,
        ): { x: number; y: number; w: number; h: number } | null => {
          if (el === null) return null;
          const r = el.getBoundingClientRect();
          return { x: r.x, y: r.y, w: r.width, h: r.height };
        };
        return { badge: rect(badge), caption: rect(caption), viewport: window.innerWidth };
      });
      expect(boxes.badge).not.toBeNull();
      expect(boxes.caption).not.toBeNull();
      const badge = boxes.badge!;
      const caption = boxes.caption!;
      // Badge is fully inside the viewport: no horizontal scroll at 375 px.
      expect(badge.x).toBeGreaterThanOrEqual(-1);
      expect(badge.x + badge.w).toBeLessThanOrEqual(boxes.viewport + 1);
      // Badge and caption boxes do not intersect.
      const overlapX =
        Math.min(badge.x + badge.w, caption.x + caption.w) - Math.max(badge.x, caption.x);
      const overlapY =
        Math.min(badge.y + badge.h, caption.y + caption.h) - Math.max(badge.y, caption.y);
      expect(overlapX <= 0 || overlapY <= 0).toBe(true);
    });
  }
}
