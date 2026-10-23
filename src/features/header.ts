import { $, $$, required } from '../lib/dom';

const DESKTOP_NAV_MIN_WIDTH = 1280;
const SCROLLED_AFTER_PX = 24;
const ACTION_BAR_AFTER_HERO_FRACTION = 0.6;

const header = (): HTMLElement => required('[data-header]');
const toggle = (): HTMLElement => required('[data-menu-toggle]');

export function isMobileMenuOpen(): boolean {
  return header().classList.contains('is-open');
}

export function setMobileMenu(open: boolean): void {
  header().classList.toggle('is-open', open);
  $('#mobile-nav')?.classList.toggle('is-open', open);
  toggle().setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('is-locked', open);
}

export function focusMenuToggle(): void {
  toggle().focus();
}

function initScrollState(): void {
  const actionBar = $('[data-action-bar]');
  const hero = $('.hero');
  const onScroll = (): void => {
    header().classList.toggle('is-scrolled', window.scrollY > SCROLLED_AFTER_PX);
    if (actionBar && hero) {
      actionBar.classList.toggle(
        'is-visible',
        window.scrollY > hero.offsetHeight * ACTION_BAR_AFTER_HERO_FRACTION,
      );
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initMobileMenu(): void {
  toggle().addEventListener('click', () => {
    setMobileMenu(!isMobileMenuOpen());
  });
  $$('[data-mobile-nav] a, [data-mobile-nav] button').forEach((el) => {
    el.addEventListener('click', () => {
      setMobileMenu(false);
    });
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= DESKTOP_NAV_MIN_WIDTH) setMobileMenu(false);
  });
}

/** Highlights the nav link of the section in view, and fades `.reveal` blocks in on first sight. */
function initScrollObservers(): void {
  const links = $$<HTMLAnchorElement>('.nav-link');
  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  links.forEach((link) => {
    const section = $(link.getAttribute('href') ?? '');
    if (section) spy.observe(section);
  });

  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
  );
  $$('.reveal').forEach((el) => {
    revealer.observe(el);
  });
}

export function initHeader(): void {
  initScrollState();
  initMobileMenu();
  initScrollObservers();
}
