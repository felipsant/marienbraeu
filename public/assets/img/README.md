# Images

Drop real photos here and the page picks them up automatically, with no code changes.
Until a file exists, the matching hand-drawn illustration is shown instead.

| File | Where it appears |
|---|---|
| `1000052599.jpg` | Owner / host portrait in "Über uns" (portrait, 4:5, ≥ 800×1000) |
| `hero.jpg`, `hero-{640,1280}.jpg`, `hero{,-640,-1280}.webp` | Hero background, fades in over the illustration |
| `gallery-kettle*` | Gallery: copper brew kettles (large tile, square) |
| `gallery-garden*` | Gallery: beer garden (wide, about 2.2:1) |
| `gallery-beer.jpg` | Gallery: freshly tapped beer (square) |
| `gallery-prost*` | Gallery: Prost & Gemütlichkeit (about 1.15:1) |
| `gallery-arrival*` | Gallery: arriving in Hart bei Graz (large tile, about 1:1) |
| `gallery-backhendl.jpg` | Gallery: Backhendl (wide, 2:1) |
| `gallery-mariensaeule*` | Gallery: the historic inn with its chapel gable (wide, 2:1) |

## Photos made by `scripts/optimize-photos.mjs`

`hero`, `gallery-garden`, `gallery-prost`, `gallery-arrival`, `gallery-kettle` and `gallery-mariensaeule` are generated from the phone
originals (never committed) with `node scripts/optimize-photos.mjs <folder with the originals>`:
EXIF rotation, a gentle warm white balance, no metadata, WebP and JPEG at 640/1280 px
(hero also 1920). The widest size has no width suffix (`hero.jpg`, `hero.webp`); the markup
points at that JPEG and `src/features/photos.ts` derives the other file names, so adding a
photo means adding an entry to the script and a `data-photo` + `data-photo-widths` pair on the
tile. `public/assets/img/` is what Vite serves at `assets/img/`; there is no second copy.
