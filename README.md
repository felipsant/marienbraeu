# Marienbräu — Website Showcase Template

A single-page showcase website for **Marienbräu**, a traditional Austrian Gasthaus & Brauhaus in Hart bei Graz.

- Address: Rupertistraße 80, 8075 Hart bei Graz
- Phone: +43 664 2031953 · Email: marienbraeu@gmx.at
- Rating: 4.8 / 5.0 Google Reviews

## Develop, build, test

Requires Node 22+.

```sh
npm ci            # install
npm run dev       # dev server with hot reload
npm run build     # type-check, then bundle to dist/
npm run preview   # serve dist/ locally
```

| Command                           | What it does                                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `npm run typecheck`               | `tsc --noEmit` in strict mode                                                                                               |
| `npm run lint`                    | ESLint (typescript-eslint, strict type-checked rules)                                                                       |
| `npm run format` / `format:check` | Prettier                                                                                                                    |
| `npm run test:unit`               | Vitest: data shape, i18n parity, language detection, opening hours, reservation mail builder, the DOM behaviour of the page |
| `npm run test:e2e:remote`         | Playwright (screenshots, DOM, smoke) on the e2e-runner VM; see `tests/README.md`                                            |

`dist/` is a plain static bundle with relative URLs: it works at a domain root and under a
sub-path such as `https://<user>.github.io/marienbraeu/`. Pushing to `main` deploys it via
`.github/workflows/pages.yml` (Settings → Pages → Source must be "GitHub Actions").

The page still needs an internet connection for Google Fonts.

## Structure

```
index.html                 page markup; the German copy lives here, so it reads without JS
src/main.ts                entry point: wires the features together
src/types.ts               shared types (languages, dishes, opening hours)
src/data/                  built-in menu, opening hours, reviews, and the menu.json schema
src/i18n/messages/         one typed message table per language; English defines the keys,
                           the compiler rejects a language that misses or adds one
src/i18n/index.ts          language detection, switching and lookups
src/features/              status, header, photos, menu, carousel, modal, reservation, toast, map
src/lib/                   DOM, storage and Vienna-time helpers
src/styles/                brand CSS by concern (tokens, base, buttons, header, hero, ...);
                           layout utilities come from Tailwind, compiled at build time
public/assets/data/        menu.json: the file the owner edits (docs/MENU_UPDATE_GUIDE.md)
public/assets/img/         photos (see public/assets/img/README.md)
tests/                     unit (Vitest) and e2e (Playwright) tests
```

## Features

- Sticky header with DE / EN / IT language switch (German is the default), a click-to-call link and a "Tisch reservieren" button. On phones there is also a bottom action bar (Anrufen · Reservieren · Route).
- Hero, the house history (c. 1850 homestead and women's retreat, the 20 m brick-built Tiefbrunnen, the 1670s Mariensäule, the copper kettles) with heritage badges, the owner photo slot (`public/assets/img/1000052599.jpg`, with an illustrated fallback), and a brewhouse section.
- Speisekarte (menu) with category filter pills, dietary/regional tags and prices in €.
- Gallery tiles that use real photos when they are present and fall back to illustrations.
- Reviews carousel with swipe, arrow buttons, dots and keyboard support. Autoplay is off when the visitor has asked for reduced motion.
- Opening-hours table with today highlighted, plus a live "open / closing soon / opens at …" badge.
- Reservation modal with client-side validation: no past dates, no Mondays (Ruhetag), and times inside opening hours with the last seating 90 minutes before closing. On success it shows a confirmation toast.
- The Google Maps embed loads only after a click (GDPR-friendly). Click-to-call and click-to-email links are included.

## Owner handoff

The site is private and unpublished. `docs/OWNER_HANDOFF.md` holds the outreach email to the owner (German and English) and the procedure for a private GitHub repository. `scripts/setup-private-github.sh` sets that repository up, refuses anything that is not private, and is a dry run unless given `--yes`.

## Before going live

- **Reservations:** the form does not send anything yet. Wire it to a mail service or booking API in the `submit` handler in `src/features/reservation.ts`.
- **Reviews:** the texts in `src/data/reviews.ts` are illustrative samples written for this template. Replace them with verbatim Google reviews.
- **Menu & prices:** the dishes beyond the core list, and all prices, are realistic placeholders. Confirm them with the owner.
- **Impressum / Datenschutz:** placeholder texts are in `src/i18n/messages/`. Fill in the legally required details.
- **Fonts:** for production, consider self-hosting the fonts instead of loading them from Google Fonts.
