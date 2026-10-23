import { REVIEWS } from '../data/reviews';
import { getLang, onLanguageChange, t } from '../i18n';
import { $, $$, escapeHtml, required } from '../lib/dom';

const AUTOPLAY_MS = 6000;
const SCROLL_SETTLE_MS = 80;

const prefersReducedMotion = (): boolean =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function starRow(): string {
  return `<span class="stars" aria-label="5 / 5">${'<svg><use href="#i-star"/></svg>'.repeat(5)}</span>`;
}

function reviewHtml(index: number): string {
  const review = REVIEWS[index];
  if (!review) return '';
  const initials = review.name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2);
  const lang = getLang();
  const text = lang === 'de' || lang === 'en' || lang === 'it' ? review[lang] : review.de;
  return (
    '<article class="review" role="group" aria-roledescription="slide" aria-label="' +
    escapeHtml(t('reviews.slide', { i: index + 1, n: REVIEWS.length })) +
    '">' +
    starRow() +
    `<blockquote class="mt-3">${escapeHtml(text)}</blockquote>` +
    '<footer class="mt-5 flex items-center gap-3">' +
    `<span class="avatar" style="background:${review.color}" aria-hidden="true">${escapeHtml(initials)}</span>` +
    `<span><strong class="block text-sm">${escapeHtml(review.name)}</strong>` +
    `<span class="text-xs" style="color:var(--muted)">${escapeHtml(t('reviews.source'))}</span></span>` +
    '</footer></article>'
  );
}

export function initCarousel(): void {
  const track = $('[data-carousel-track]');
  if (!track) return;
  const dotsWrap = $('[data-carousel-dots]');
  let autoTimer: ReturnType<typeof setInterval> | null = null;

  const slideWidth = (): number => {
    const first = track.firstElementChild;
    if (!first) return track.clientWidth;
    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap) || 0;
    return first.getBoundingClientRect().width + gap;
  };
  const pageCount = (): number =>
    Math.max(1, Math.ceil((track.scrollWidth - track.clientWidth) / slideWidth()) + 1);
  const currentPage = (): number => Math.round(track.scrollLeft / slideWidth());

  const updateDots = (): void => {
    if (!dotsWrap) return;
    const current = currentPage();
    $$('[data-dot]', dotsWrap).forEach((dot) => {
      dot.setAttribute('aria-current', String(Number(dot.dataset.dot) === current));
    });
  };

  const renderDots = (): void => {
    if (!dotsWrap) return;
    const count = pageCount();
    let html = '';
    for (let i = 0; i < count; i++) {
      html += `<button type="button" aria-label="${escapeHtml(t('reviews.slide', { i: i + 1, n: count }))}" data-dot="${String(i)}"></button>`;
    }
    dotsWrap.innerHTML = html;
    updateDots();
  };

  const renderReviews = (): void => {
    track.innerHTML = REVIEWS.map((_, index) => reviewHtml(index)).join('');
    renderDots();
  };

  const goTo = (page: number): void => {
    const count = pageCount();
    const index = (page + count) % count;
    track.scrollTo({
      left: index * slideWidth(),
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  renderReviews();
  onLanguageChange(renderReviews);
  required('[data-carousel-prev]').addEventListener('click', () => {
    goTo(currentPage() - 1);
  });
  required('[data-carousel-next]').addEventListener('click', () => {
    goTo(currentPage() + 1);
  });
  dotsWrap?.addEventListener('click', (event) => {
    const dot = (event.target as Element).closest<HTMLElement>('[data-dot]');
    if (dot) goTo(Number(dot.dataset.dot));
  });

  let scrollTick: ReturnType<typeof setTimeout> | undefined;
  track.addEventListener(
    'scroll',
    () => {
      clearTimeout(scrollTick);
      scrollTick = setTimeout(updateDots, SCROLL_SETTLE_MS);
    },
    { passive: true },
  );
  track.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goTo(currentPage() + 1);
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goTo(currentPage() - 1);
    }
  });
  window.addEventListener('resize', renderDots);

  const carousel = required('[data-carousel]');
  const startAuto = (): void => {
    if (prefersReducedMotion() || autoTimer) return;
    autoTimer = setInterval(() => {
      goTo(currentPage() + 1);
    }, AUTOPLAY_MS);
  };
  const stopAuto = (): void => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = null;
  };
  carousel.addEventListener('mouseenter', stopAuto);
  carousel.addEventListener('mouseleave', startAuto);
  carousel.addEventListener('focusin', stopAuto);
  carousel.addEventListener('focusout', startAuto);
  carousel.addEventListener('touchstart', stopAuto, { passive: true });
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) startAuto();
      else stopAuto();
    });
  }).observe(carousel);
}
