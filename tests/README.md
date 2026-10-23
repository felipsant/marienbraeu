# Tests

Two layers, both pinning the **current** behaviour of the site so the TypeScript
migration can be proven not to change anything.

| layer                               | where        | runs on                    | command                   |
| ----------------------------------- | ------------ | -------------------------- | ------------------------- |
| unit (vitest + jsdom)               | `tests/unit` | anywhere                   | `npm run test:unit`       |
| e2e + visual (Playwright, Chromium) | `tests/e2e`  | the **e2e-runner** VM only | `npm run test:e2e:remote` |

Browsers are not installed on the development box. `scripts/e2e-remote.sh` rsyncs the
working tree to `claude@192.168.0.109`, runs `npm ci` and Playwright there, and keeps
the snapshot sets in `~/mb-e2e/snapshots/<name>` on the runner. The runner has under
1 GB of RAM, so the suite uses a single worker and no full-page screenshots.

## Visual before/after proof

1. Check out the reference commit (the test-harness commit `e90ae0b`, the last one before the migration, where
   `index.html` is served from the repository root: run with `SITE_DIR=.`) and record the
   baseline: `SNAPSHOT_NAME=baseline SITE_DIR=. scripts/e2e-remote.sh --update-snapshots`
2. Check out the build under test and compare against it with zero tolerance for sections
   and DOM: `SNAPSHOT_NAME=baseline scripts/e2e-remote.sh`. The script builds `dist/` on the
   runner and serves it.

Captured for each of the six languages at 375 px (phone) and 1440 px (desktop): the
first and a scrolled viewport, every `section[id]`, the footer, and the normalised
`<body>` DOM; plus the open mobile drawer and the open reservation modal. The clock is
frozen (Wed 2026-10-21, 10:00 Vienna), motion is reduced, and transitions/keyframes
are disabled identically for every build.

## Known deviations from the captain's call notes

The tests pin what the live site does today. Where that breaks a rule from the notes the
test is named `[deviation]` (or carries a `KNOWN DEVIATION` comment) and is **not** fixed
here; these are listed in the PR description:

- the menu has **26** dishes, not 22 (`assets/data/menu.json` and `data.js`)
- `menu.json` has no `title_de`; the German title is `name.de`
- viewport meta is `width=device-width, initial-scale=1, viewport-fit=cover` (no `maximum-scale=5.0`)
- the Monday restriction shows an inline field error, not a warning toast
