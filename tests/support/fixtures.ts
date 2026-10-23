import { test as base } from '@playwright/test';

/**
 * GoatCounter's script is third-party and its beacon would hit the network from every
 * run, so the e2e suite serves an empty script instead. That keeps "no failed requests"
 * and "zero console errors" meaningful and the screenshots independent of the network.
 * (Even unstubbed, count.js does nothing on 127.0.0.1 and localhost.)
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route('https://gc.zgo.at/**', (route) =>
      route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }),
    );
    await context.route('https://*.goatcounter.com/**', (route) =>
      route.fulfill({ status: 204, body: '' }),
    );
    await use(context);
  },
});

export { expect } from '@playwright/test';
