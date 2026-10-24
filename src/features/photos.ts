import { $, $$ } from '../lib/dom';

type Format = 'avif' | 'webp' | 'jpg';

/** Gallery photos start loading this far before they scroll into view. */
const LAZY_MARGIN = '300px 0px';

/**
 * Cap on the pixel density photos are fetched for. Past 1.5x the difference is not
 * visible on a photo behind a caption, while the bytes roughly double, so a retina
 * gallery tile gets the 640 px file instead of the 1280 px one.
 */
const MAX_DENSITY = 1.5;

/** Loads `src` off-screen and calls `onLoad` only if it is a real, non-empty image. */
function probe(src: string | undefined, onLoad: (src: string) => void): void {
  if (!src) return;
  const img = new Image();
  img.onload = () => {
    if (img.naturalWidth > 0) onLoad(src);
  };
  img.src = src;
}

/** `assets/img/hero.jpg` + 1280 -> `assets/img/hero-1280.webp`; the widest size has no suffix. */
function variant(jpegPath: string, width: number, widest: number, ext: Format): string {
  const stem = jpegPath.replace(/\.jpe?g$/i, '');
  return `${stem}${width === widest ? '' : `-${String(width)}`}.${ext}`;
}

/**
 * Loads the best size and format of a photo and calls `onLoad` with its URL, or never
 * calls it when the image cannot be loaded. `jpegPath` is the widest JPEG; the sizes
 * listed in `data-photo-widths` sit next to it as AVIF, WebP and JPEG (see
 * scripts/optimize-photos.mjs). A `<picture>` lets the browser pick AVIF, then WebP,
 * and a width for the space the photo fills, falling back to the JPEG.
 * Without `data-photo-widths` the path is used as a single image.
 */
function loadPhoto(
  el: HTMLElement,
  jpegPath: string | undefined,
  onLoad: (src: string) => void,
  priority: 'high' | 'auto' = 'auto',
): void {
  if (!jpegPath) return;
  const widths = (el.dataset.photoWidths ?? '').split(/\s+/).map(Number).filter(Boolean);
  if (!widths.length) {
    probe(jpegPath, onLoad);
    return;
  }
  const widest = Math.max(...widths);
  const srcset = (ext: Format): string =>
    widths.map((w) => `${variant(jpegPath, w, widest, ext)} ${String(w)}w`).join(', ');
  // The photo is drawn with background-size: cover, so it needs as many pixels as the
  // larger of the box's width and its height scaled by the picture's aspect ratio.
  // The browser multiplies `sizes` by the device pixel ratio, so scaling it down by
  // MAX_DENSITY / ratio caps the density it fetches for.
  const ratio = Number(el.dataset.photoRatio) || 0;
  const needed = Math.max(el.clientWidth, el.clientHeight * ratio) || window.innerWidth;
  const dpr = window.devicePixelRatio || 1;
  const sizes = `${String(Math.round((needed * Math.min(dpr, MAX_DENSITY)) / dpr))}px`;
  const picture = document.createElement('picture');
  for (const ext of ['avif', 'webp'] as const) {
    const source = document.createElement('source');
    source.type = `image/${ext}`;
    source.srcset = srcset(ext);
    source.sizes = sizes;
    picture.append(source);
  }
  const img = new Image();
  img.fetchPriority = priority;
  img.decoding = 'async';
  img.sizes = sizes;
  img.srcset = srcset('jpg');
  picture.append(img);
  img.onload = () => {
    if (img.naturalWidth > 0) onLoad(img.currentSrc || jpegPath);
  };
  img.src = jpegPath;
}

/**
 * Calls `load` for each element once it comes within LAZY_MARGIN of the viewport, or
 * straight away where IntersectionObserver is missing.
 */
function whenNearViewport(elements: HTMLElement[], load: (el: HTMLElement) => void): void {
  if (!('IntersectionObserver' in window)) {
    elements.forEach(load);
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        load(entry.target as HTMLElement);
      }
    },
    { rootMargin: LAZY_MARGIN },
  );
  elements.forEach((el) => {
    observer.observe(el);
  });
}

/** Real photos replace the illustrations once they exist; otherwise the illustrations stay. */
export function initPhotos(): void {
  // The hero is above the fold: fetch it at once and ahead of everything else.
  const heroPhoto = $('[data-hero-photo]');
  if (heroPhoto) {
    loadPhoto(
      heroPhoto,
      heroPhoto.dataset.src,
      (src) => {
        heroPhoto.style.backgroundImage = `url("${src}")`;
        heroPhoto.classList.add('is-loaded');
      },
      'high',
    );
  }

  // Gallery tiles keep their illustration until they near the viewport, then fade in.
  whenNearViewport($$('[data-photo]'), (figure) => {
    loadPhoto(figure, figure.dataset.photo, (src) => {
      const layer = $('.g-photo', figure);
      if (layer) layer.style.backgroundImage = `url("${src}")`;
      figure.classList.add('has-photo');
    });
  });

  const ownerFrame = $('[data-owner-frame]');
  const ownerImg = $<HTMLImageElement>('[data-owner-photo]');
  if (ownerFrame && ownerImg) {
    const markOwner = (): void => {
      if (ownerImg.naturalWidth > 0) ownerFrame.classList.add('has-photo');
    };
    if (ownerImg.complete) markOwner();
    else ownerImg.addEventListener('load', markOwner);
  }
}
