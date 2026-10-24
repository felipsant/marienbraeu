# Images

Drop real photos here and the page picks them up automatically, with no code changes.
Until a file exists, the matching hand-drawn illustration is shown instead.

| File | Where it appears |
|---|---|
| `1000052599.jpg` | Full-resolution menu photo, opened from "Über uns" and the menu modal (never inlined: 2.5 MB) |
| `speisekarte-{thumb,960}.jpg`, `speisekarte-foto-web.jpg` | The same photo at 480/960 px (picked by `srcset` in "Über uns") and 1536 px (menu modal) |
| `hero.jpg`, `hero-{640,1280}.jpg`, `hero{,-640,-1280}.{webp,avif}` | Hero background, fades in over the illustration |
| `gallery-kettle*` | Gallery: copper brew kettles (large tile, square) |
| `gallery-garden*` | Gallery: beer garden (wide, about 2.2:1) |
| `gallery-beer*` | Gallery: freshly tapped beer (square) |
| `gallery-prost*` | Gallery: Prost & Gemütlichkeit (about 1.15:1) |
| `gallery-arrival*` | Gallery: arriving in Hart bei Graz (large tile, about 1:1) |
| `gallery-backhendl*` | Gallery: Backhendl (wide, 2:1) |
| `food-schweinsbraten*` | Groups banner: Schweinsbraten with beer (square, 480/960 px, plain `<picture>`) |
| `gallery-mariensaeule*` | Gallery: the historic inn with its chapel gable (wide, 2:1) |

## Photos made by `scripts/optimize-photos.mjs`

`hero`, `gallery-garden`, `gallery-beer`, `gallery-prost`, `gallery-arrival`, `gallery-kettle`, `gallery-backhendl`,
`food-schweinsbraten` and `gallery-mariensaeule` are generated from the phone
originals (never committed) with `node scripts/optimize-photos.mjs <folder with the originals>`:
EXIF rotation, a gentle warm white balance (skipped for indoor food shots, `warm: false`), no metadata, AVIF, WebP and progressive JPEG at
640/1280 px (hero also 1920; `food-schweinsbraten` 480/960). The widest size has no width suffix (`hero.jpg`, `hero.webp`); the markup
points at that JPEG and `src/features/photos.ts` derives the other file names, so adding a
photo means adding an entry to the script and a `data-photo` + `data-photo-widths` pair on the
tile. The hero loads at once; gallery tiles load as they come within 300 px of the viewport.
`public/assets/img/` is what Vite serves at `assets/img/`; there is no second copy.

The "Ausflugsziele" photos (`basilika-mariatrost`, `rupertikirche`, `schloss-lustbuehel`,
`grazer-schlossberg`) fill cards about 350 px wide, so they are kept at 800 px wide, JPEG
quality 72 progressive.
