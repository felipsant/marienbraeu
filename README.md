# Marienbräu — Website Showcase Template

A single-page showcase website for **Marienbräu**, a traditional Austrian Gasthaus & Brauhaus in Hart bei Graz.

- Address: Rupertistraße 80, 8075 Hart bei Graz
- Phone: +43 664 2031953 · Email: marienbraeu@gmx.at
- Rating: 4.8 / 5.0 Google Reviews

## View it

Open `index.html` in a browser. There is no build step. The page needs an internet connection for the Tailwind CSS Play CDN and Google Fonts.

## Structure

```
index.html            page markup; the German copy lives here, so it reads without JS
assets/css/styles.css brand styling (palette, components); Tailwind CDN handles layout
assets/js/data.js     menu items and prices, opening hours, review texts
assets/js/i18n.js     English translations plus runtime-generated German strings
assets/js/app.js      language switch, menu filter, reviews carousel, live open/closed
                      status (Europe/Vienna), reservation modal + validation, map consent
assets/img/           drop-in photos (see assets/img/README.md)
```

## Features

- Sticky header with DE / EN language switch, a click-to-call link and a "Tisch reservieren" button. On phones there is also a bottom action bar (Anrufen · Reservieren · Route).
- Hero, story with the Mariensäule (Marian column) and the owner photo slot (`assets/img/1000052599.jpg`, with an illustrated fallback), and a brewhouse section.
- Speisekarte (menu) with category filter pills, dietary/regional tags and prices in €.
- Gallery tiles that use real photos when they are present and fall back to illustrations.
- Reviews carousel with swipe, arrow buttons, dots and keyboard support. Autoplay is off when the visitor has asked for reduced motion.
- Opening-hours table with today highlighted, plus a live "open / closing soon / opens at …" badge.
- Reservation modal with client-side validation: no past dates, no Mondays (Ruhetag), and times inside opening hours with the last seating 90 minutes before closing. On success it shows a confirmation toast.
- The Google Maps embed loads only after a click (GDPR-friendly). Click-to-call and click-to-email links are included.

## Before going live

- **Reservations:** the form does not send anything yet. Wire it to a mail service or booking API in the `submit` handler in `assets/js/app.js`.
- **Reviews:** the texts in `assets/js/data.js` are illustrative samples written for this template. Replace them with verbatim Google reviews.
- **Menu & prices:** the dishes beyond the core list, and all prices, are realistic placeholders. Confirm them with the owner.
- **Impressum / Datenschutz:** placeholder texts are in `assets/js/i18n.js`. Fill in the legally required details.
- **Fonts / CDN:** for production, consider self-hosting the fonts and compiling Tailwind instead of using the Play CDN.
