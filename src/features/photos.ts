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

/** Real photos replace the illustrations once they exist; otherwise the illustrations stay. */
export function initPhotos(): void {
  const heroPhoto = $('[data-hero-photo]');
  if (heroPhoto?.dataset.src) {
    probe(heroPhoto.dataset.src, (src) => {
      heroPhoto.style.backgroundImage = `url("${src}")`;
      heroPhoto.classList.add('is-loaded');
    });
  }

  $$('[data-photo]').forEach((figure) => {
    probe(figure.dataset.photo, (src) => {
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
