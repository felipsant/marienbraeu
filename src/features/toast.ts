import { t } from '../i18n';
import { escapeHtml, required } from '../lib/dom';

const TOAST_VISIBLE_MS = 14000;

let hideTimer: ReturnType<typeof setTimeout> | undefined;

/** `message` is trusted markup built from our own translations; `mailtoUrl` adds a "reopen the draft" link. */
export function showToast(title: string, message: string, mailtoUrl?: string): void {
  const toast = required('[data-toast]');
  required('[data-toast-title]', toast).textContent = title;
  let body = message;
  if (mailtoUrl) {
    body +=
      '<div class="mt-3 pt-2 border-t border-white/20">' +
      `<a href="${mailtoUrl}" class="inline-flex items-center gap-1.5 underline font-bold text-xs" style="color:var(--amber)">` +
      '<svg style="width:14px;height:14px"><use href="#i-mail"/></svg>' +
      `<span>${escapeHtml(t('toast.reopen'))}</span></a></div>`;
  }
  required('[data-toast-text]', toast).innerHTML = body;
  toast.classList.add('is-visible');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, TOAST_VISIBLE_MS);
}

export function initToast(): void {
  const toast = required('[data-toast]');
  required('[data-toast-close]').addEventListener('click', () => {
    toast.classList.remove('is-visible');
  });
}
