import { $ } from '../lib/dom';

const ADDRESS = 'Marienbräu, Rupertistraße 80, 8075 Hart bei Graz';

/** Google Maps is only embedded after an explicit click (GDPR). */
export function initMap(): void {
  $('[data-load-map]')?.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.title = `Google Maps — ${ADDRESS}`;
    iframe.loading = 'lazy';
    iframe.referrerPolicy = 'no-referrer-when-downgrade';
    iframe.allowFullscreen = true;
    iframe.src = `https://www.google.com/maps?q=${encodeURIComponent(ADDRESS)}&output=embed`;
    $('[data-map]')?.appendChild(iframe);
    $('[data-map-placeholder]')?.remove();
  });
}
