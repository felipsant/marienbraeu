import { $, $$ } from '../lib/dom';

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
function variant(jpegPath: string, width: number, widest: number, ext: 'webp' | 'jpg'): string {
  const stem = jpegPath.replace(/\.jpe?g$/i, '');
  return `${stem}${width === widest ? '' : `-${String(width)}`}.${ext}`;
}

/**
 * Loads the best size and format of a photo and calls `onLoad` with its URL, or never
 * calls it when the image cannot be loaded. `jpegPath` is the widest JPEG; the sizes
 * listed in `data-photo-widths` sit next to it as WebP and JPEG (see
 * scripts/optimize-photos.mjs). A `<picture>` lets the browser pick WebP and a width
 * for the space the photo fills, falling back to the JPEG where WebP is unsupported.
 * Without `data-photo-widths` the path is used as a single image.
 */
function loadPhoto(
  el: HTMLElement,
  jpegPath: string | undefined,
  onLoad: (src: string) => void,
): void {
  if (!jpegPath) return;
  const widths = (el.dataset.photoWidths ?? '').split(/\s+/).map(Number).filter(Boolean);
  if (!widths.length) {
    probe(jpegPath, onLoad);
    return;
  }
  const widest = Math.max(...widths);
  const srcset = (ext: 'webp' | 'jpg'): string =>
    widths.map((w) => `${variant(jpegPath, w, widest, ext)} ${String(w)}w`).join(', ');
  // The photo is drawn with background-size: cover, so it needs as many pixels as the
  // larger of the box's width and its height scaled by the picture's aspect ratio.
  const ratio = Number(el.dataset.photoRatio) || 0;
  const needed = Math.max(el.clientWidth, el.clientHeight * ratio) || window.innerWidth;
  const picture = document.createElement('picture');
  const webp = document.createElement('source');
  webp.type = 'image/webp';
  webp.srcset = srcset('webp');
  webp.sizes = `${String(Math.round(needed))}px`;
  const img = new Image();
  img.sizes = webp.sizes;
  img.srcset = srcset('jpg');
  picture.append(webp, img);
  img.onload = () => {
    if (img.naturalWidth > 0) onLoad(img.currentSrc || jpegPath);
  };
  img.src = jpegPath;
}

/** Real photos replace the illustrations once they exist; otherwise the illustrations stay. */
export function initPhotos(): void {
  const heroPhoto = $('[data-hero-photo]');
  if (heroPhoto) {
    loadPhoto(heroPhoto, heroPhoto.dataset.src, (src) => {
      heroPhoto.style.backgroundImage = `url("${src}")`;
      heroPhoto.classList.add('is-loaded');
    });
  }

  $$('[data-photo]').forEach((figure) => {
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
