#!/usr/bin/env node
/**
 * Turns the phone originals into the web photos under public/assets/img/.
 *
 *   node scripts/optimize-photos.mjs <directory holding the original JPEGs>
 *
 * Each photo is rotated by its EXIF orientation, cropped to the shape of the tile it
 * fills, nudged warmer (the skies are flat overcast grey) and written as WebP plus
 * JPEG at a few widths. Output carries no metadata, so the phone's GPS tag is dropped.
 * The widest size of each photo has no width suffix (hero.jpg, hero.webp); the
 * others are hero-640.jpg, hero-1280.webp and so on. src/features/photos.ts derives
 * the file names from the unsuffixed JPEG path in the markup.
 */
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../public/assets/img');

/**
 * `crop` is the part of the upright original to keep: `top` and `left` are fractions
 * of the height and width, `ratio` is width / height. Every source is wider than
 * `ratio` allows at full width, so the crop spans the full width unless `left` and
 * `width` say otherwise.
 */
const PHOTOS = [
  // tavern facade with the garden umbrellas: hero background (full 4:3 frame)
  {
    source: 'PXL_20261023_111436337.jpg',
    name: 'hero',
    widths: [640, 1280, 1920],
    crop: { ratio: 4 / 3 },
  },
  // cobblestone lane with umbrellas and autumn trees: "Der Gastgarten"
  {
    source: 'PXL_20261023_111406117.jpg',
    name: 'gallery-garden',
    widths: [640, 1280],
    crop: { ratio: 2.2, top: 0.14 },
  },
  // beer garden with lanterns, benches and fire bowl: "Prost & Gemütlichkeit"
  {
    source: 'PXL_20261023_111401770.jpg',
    name: 'gallery-prost',
    widths: [640, 1280],
    crop: { ratio: 1.15, top: 0.2 },
  },
  // the road arriving in Hart bei Graz (the sharper of the two near-identical shots)
  {
    source: 'PXL_20261023_111228491.jpg',
    name: 'gallery-arrival',
    widths: [640, 1280],
    crop: { ratio: 1.05, top: 0.14 },
  },
];

/** Gentle white-balance shift: a touch more red, a touch less blue, a little more colour. */
const WARM_GAIN = [1.05, 1.0, 0.92];
const SATURATION = 1.06;

const WEBP = { quality: 72, effort: 5 };
const JPEG = { quality: 75, mozjpeg: true };

function fileName(name, width, widest, ext) {
  return width === widest ? `${name}.${ext}` : `${name}-${String(width)}.${ext}`;
}

async function renderPhoto(dir, photo) {
  const upright = sharp(path.join(dir, photo.source)).rotate();
  const { width: sourceWidth, height: sourceHeight } = await upright
    .clone()
    .toBuffer({ resolveWithObject: true })
    .then((r) => r.info);
  const { ratio, top = 0 } = photo.crop;
  const cropHeight = Math.min(sourceHeight, Math.round(sourceWidth / ratio));
  const cropTop = Math.min(sourceHeight - cropHeight, Math.round(top * sourceHeight));
  const cropped = await upright
    .extract({ left: 0, top: cropTop, width: sourceWidth, height: cropHeight })
    .linear(WARM_GAIN, [0, 0, 0])
    .modulate({ saturation: SATURATION })
    .toBuffer();

  const widest = Math.max(...photo.widths);
  const written = [];
  for (const width of photo.widths) {
    const resized = sharp(cropped).resize({ width, withoutEnlargement: true });
    for (const [ext, encode] of [
      ['webp', (s) => s.webp(WEBP)],
      ['jpg', (s) => s.jpeg(JPEG)],
    ]) {
      // sharp drops all metadata (EXIF, GPS, ICC) unless withMetadata() is called
      const file = path.join(OUT_DIR, fileName(photo.name, width, widest, ext));
      await encode(resized.clone()).toFile(file);
      written.push(file);
    }
  }
  return written;
}

async function main() {
  const dir = process.argv[2];
  if (!dir) {
    console.error('usage: node scripts/optimize-photos.mjs <directory with the original photos>');
    process.exit(2);
  }
  await mkdir(OUT_DIR, { recursive: true });
  let total = 0;
  for (const photo of PHOTOS) {
    for (const file of await renderPhoto(dir, photo)) {
      const { size } = await stat(file);
      total += size;
      console.log(`${String(size).padStart(8)}  ${path.relative(process.cwd(), file)}`);
    }
  }
  console.log(`${String(total).padStart(8)}  total`);
}

await main();
