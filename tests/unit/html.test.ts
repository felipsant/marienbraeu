import { describe, expect, it } from 'vitest';
import { read } from '../support/legacy-env';

const html = read('index.html');
const css = read('assets/css/styles.css');

describe('index.html', () => {
  // KNOWN DEVIATION from the call notes, which want
  // "width=device-width, initial-scale=1.0, maximum-scale=5.0".
  it('[deviation] viewport meta is the current, different one', () => {
    expect(html).toContain(
      '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    );
  });

  it('references local assets with relative URLs only (subpath-safe)', () => {
    const refs = [...html.matchAll(/\b(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
    const local = refs.filter((u) => !/^(https?:|mailto:|tel:|data:|#)/.test(u));
    expect(local.length).toBeGreaterThan(5);
    for (const u of local) expect(u, u).not.toMatch(/^\//);
    expect(local).toContain('assets/css/styles.css');
    expect(local).toContain('src/main.js');
  });

  it('loads menu.json relatively', () => {
    expect(read('assets/js/app.js')).toContain("fetch('assets/data/menu.json')");
  });

  it('uses https for every external resource', () => {
    for (const m of html.matchAll(/\b(?:src|href)="(http:[^"]+)"/g))
      throw new Error(`insecure: ${m[1]}`);
  });

  it('exposes valid tel:, mailto: and Google Maps links', () => {
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
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
});
