import { t } from '../i18n';
import { $, $$, required } from '../lib/dom';
import { focusMenuToggle, isMobileMenuOpen, setMobileMenu } from './header';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select, textarea, [tabindex]:not([tabindex="-1"])';
const FOCUS_DELAY_MS = 60;

let openModalEl: HTMLElement | null = null;
let lastFocus: HTMLElement | null = null;

function focusables(root: HTMLElement): HTMLElement[] {
  return $$(FOCUSABLE, root).filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

export function openModal(name: string): void {
  const modal = $(`[data-modal="${name}"]`);
  if (!modal) return;
  if (isMobileMenuOpen()) setMobileMenu(false);
  lastFocus = document.activeElement as HTMLElement | null;
  openModalEl = modal;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('is-locked');
  setTimeout(() => {
    const first = $('input, select, textarea', modal) ?? focusables(modal)[0];
    first?.focus();
  }, FOCUS_DELAY_MS);
}

export function closeModal(): void {
  if (!openModalEl) return;
  openModalEl.classList.remove('is-open');
  openModalEl.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('is-locked');
  openModalEl = null;
  lastFocus?.focus();
}

function showLegal(which: string): void {
  const key = which === 'privacy' ? 'privacy' : 'impressum';
  required('[data-legal-title]').textContent = t(`legal.${key}.title`);
  required('[data-legal-body]').innerHTML = t(`legal.${key}.body`);
  openModal('legal');
}

function trapFocus(event: KeyboardEvent, modal: HTMLElement): void {
  const items = focusables(modal);
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

export function initModals(): void {
  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    const opener = target.closest<HTMLElement>('[data-open-modal]');
    if (opener) {
      event.preventDefault();
      openModal(opener.dataset.openModal ?? '');
    }
    if (target.closest('[data-close-modal]')) closeModal();
    const legal = target.closest<HTMLElement>('[data-open-legal]');
    if (legal) {
      event.preventDefault();
      showLegal(legal.dataset.openLegal ?? '');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (openModalEl) {
        closeModal();
      } else if (isMobileMenuOpen()) {
        setMobileMenu(false);
        focusMenuToggle();
      }
    }
    if (event.key === 'Tab' && openModalEl) trapFocus(event, openModalEl);
  });
}
