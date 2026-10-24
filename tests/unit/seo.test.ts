import { describe, expect, it } from 'vitest';
import { readdirSync } from 'node:fs';
import { read, ROOT } from '../support/files';

// Canonical origin: https, no www, trailing slash on the root.
const ORIGIN = 'https://marienbraeu.at';
const html = read('index.html');
const sitemap = read('public/sitemap.xml');

describe('search engine indexing', () => {
  it('serves the custom domain from public/CNAME (bare domain, so GitHub Pages 301s www → apex)', () => {
    expect(read('public/CNAME').trim()).toBe('marienbraeu.at');
  });

  it('robots.txt allows everything and points at the sitemap', () => {
    expect(read('public/robots.txt')).toBe(
      `User-agent: *\nAllow: /\n\nSitemap: ${ORIGIN}/sitemap.xml\n`,
    );
  });

  it('sitemap lists every page with an absolute canonical URL', () => {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1] ?? '');
    // Every top-level HTML entry is a page; index.html is the site root.
    const pages = readdirSync(ROOT)
      .filter((file) => file.endsWith('.html'))
      .map((file) => (file === 'index.html' ? `${ORIGIN}/` : `${ORIGIN}/${file}`));
    expect(locs.sort()).toEqual(pages.sort());
    expect(sitemap).toContain('xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
  });

  it('index.html declares one canonical URL, matched by og:url and the JSON-LD url', () => {
    expect(html.match(/rel="canonical"/g)).toHaveLength(1);
    expect(html).toContain(`<link rel="canonical" href="${ORIGIN}/">`);
    expect(html).toContain(`<meta property="og:url" content="${ORIGIN}/">`);
    expect(html).toContain(`"url": "${ORIGIN}/"`);
  });

  it('keeps a Search Console verification slot in <head>', () => {
    const head = html.slice(0, html.indexOf('</head>'));
    expect(head).toMatch(/<meta name="google-site-verification" content="[^"]+">/);
  });
});
