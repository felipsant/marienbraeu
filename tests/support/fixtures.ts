import { test as base } from '@playwright/test';

/**
 * The page is fully self-hosted (fonts included, no analytics), so the e2e suite aborts
 * every request that leaves the local test server. A regression that adds a third-party
 * resource then shows up as a failed request in the smoke test instead of passing
 * silently, and the screenshots stay independent of the network.
 * (The Google Maps iframe only loads after a click, which no spec makes.)
 */
export const test = base.extend({
  context: async ({ context }, use) => {
    await context.route(
      (url) => !['127.0.0.1', 'localhost'].includes(url.hostname),
      (route) => route.abort('blockedbyclient'),
    );
    await use(context);
  },
});

export { expect } from '@playwright/test';
