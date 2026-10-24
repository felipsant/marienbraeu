import { describe, expect, it } from 'vitest';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { read, ROOT } from '../support/files';

const html = read('index.html');
const css = readdirSync(resolve(ROOT, 'src/styles'))
  .filter((file) => file !== 'index.css' && file.endsWith('.css'))
  .map((file) => read(`src/styles/${file}`))
  .join('\n');

describe('index.html', () => {
  // KNOWN DEVIATION from the call notes, which want
  // "width=device-width, initial-scale=1.0, maximum-scale=5.0".
  it('[deviation] viewport meta is the current, different one', () => {
    expect(html).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    );
  });

  it('references local assets with relative URLs only (subpath-safe)', () => {
    const refs = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m) => m[1] ?? '');
    const local = refs.filter((u) => !/^(https?:|mailto:|tel:|data:|#)/.test(u));
    expect(local.length).toBeGreaterThan(5);
    for (const u of local) expect(u, u).not.toMatch(/^\//);
    expect(local).toContain('src/styles/index.css');
    expect(local).toContain('src/main.ts');
  });

  it('loads the cookie-free GoatCounter script, async', () => {
    expect(html).toContain(
      '<script data-goatcounter="https://akatsuky.goatcounter.com/count" async src="https://gc.zgo.at/count.js"></script>',
    );
  });

  it('points every photo tile at an optimised photo that exists in public/assets/img', () => {
    const photos = [...html.matchAll(/data-(?:photo|src)="(assets\/img\/[^"]+\.jpg)"/g)].map(
      (m) => m[1] ?? '',
    );
    expect(photos.sort()).toEqual([
      'assets/img/gallery-arrival.jpg',
      'assets/img/gallery-backhendl.jpg',
      'assets/img/gallery-beer.jpg',
      'assets/img/gallery-garden.jpg',
      'assets/img/gallery-kettle.jpg',
      'assets/img/gallery-mariensaeule.jpg',
      'assets/img/gallery-prost.jpg',
      'assets/img/hero.jpg',
    ]);
    for (const photo of photos) {
      const stem = photo.replace(/\.jpg$/, '');
      for (const file of [
        photo,
        `${stem}.webp`,
        `${stem}.avif`,
        `${stem}-640.jpg`,
        `${stem}-640.webp`,
        `${stem}-640.avif`,
      ])
        expect(existsSync(resolve(ROOT, 'public', file)), file).toBe(true);
    }
  });

  it('points the "Frisch gezapft" gallery tile at gallery-beer.jpg', () => {
    const tile = html.slice(
      html.lastIndexOf('<figure', html.indexOf('data-i18n="gallery.c3"')),
      html.indexOf('data-i18n="gallery.c3"'),
    );
    expect(tile).toContain('data-photo="assets/img/gallery-beer.jpg"');
    expect(tile).toContain('<svg');
  });

  it('keeps each beer card on its SVG illustration', () => {
    const brew = html.slice(html.indexOf('id="brauhaus"'), html.indexOf('id="galerie"'));
    const glasses = brew.match(/<svg class="beer-glass"/g);
    expect(glasses).toHaveLength(3);
    expect(brew).not.toMatch(/assets\/img\/beer-/);
  });

  it('gives each beer card its colour swatch', () => {
    const cards = [...html.matchAll(/<article class="beer-card beer-card--(\w+) reveal">/g)].map(
      (m) => m[1],
    );
    expect(cards).toEqual(['zwickl', 'marzen', 'bock']);
    expect(html.match(/class="beer-swatch"/g)).toHaveLength(3);
  });

  it('shows the Schweinsbraten photo in the group banner, in every size the srcset names', () => {
    const groups = html.slice(html.indexOf('id="gruppen"'));
    const picture = groups.slice(groups.indexOf('<picture'), groups.indexOf('</picture>'));
    expect(picture).toContain('src="assets/img/food-schweinsbraten.jpg"');
    for (const [, file] of picture.matchAll(/(assets\/img\/[^\s"]+) \d+w/g))
      expect(existsSync(resolve(ROOT, 'public', file ?? '')), file).toBe(true);
  });

  it('is built with a relative base so any sub-path works', () => {
    expect(read('vite.config.ts')).toContain("base: './'");
  });

  it('uses https for every external resource', () => {
    for (const m of html.matchAll(/\b(?:src|href)="(http:[^"]+)"/g))
      throw new Error(`insecure: ${m[1]}`);
  });

  it('exposes valid tel:, mailto: and Google Maps links', () => {
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1] ?? '');
    expect(hrefs).toContain('tel:+436642031953');
    expect(hrefs.some((h) => h.startsWith('mailto:marienbraeu@gmx.at'))).toBe(true);
    expect(hrefs).toContain('https://maps.app.goo.gl/rvDNVtdcPYVDybdy7');
    for (const h of hrefs.filter((h) => h.startsWith('tel:'))) expect(h).toMatch(/^tel:\+\d+$/);
  });

  it('keeps the mobile drawer outside <header>, so no backdrop-filter ancestor can trap it', () => {
    const header = html.slice(html.indexOf('<header'), html.indexOf('</header>'));
    expect(header).not.toContain('data-mobile-nav');
    expect(html).toContain('data-mobile-nav');
  });
});

describe('styles.css', () => {
  it('positions the mobile drawer with position: fixed', () => {
    const rule = css.match(/\.mobile-nav\s*\{[^}]*\}/)![0];
    expect(rule).toMatch(/position:\s*fixed/);
    expect(rule).not.toMatch(/backdrop-filter/);
  });

  it('references images by their public path, which Vite rewrites relative to the base', () => {
    const refs = [...css.matchAll(/url\(\s*(['"]?)([^)'"]+\.(?:jpe?g|png|webp|svg))\1\s*\)/g)].map(
      (m) => m[2],
    );
    expect(refs.length).toBeGreaterThan(0);
    for (const target of refs) expect(target).toMatch(/^\/assets\/img\//);
  });

  it('colours each beer card with its own hex', () => {
    for (const [beer, hex] of [
      ['zwickl', '#f0c25a'],
      ['marzen', '#c9771f'],
      ['bock', '#6b2f12'],
    ]) {
      const rule = css.match(new RegExp(`\\.beer-card--${beer}\\s*\\{[^}]*\\}`))![0];
      expect(rule).toContain(`--beer: ${hex};`);
    }
  });
});
