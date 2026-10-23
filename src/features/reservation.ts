import { HOURS } from '../data/hours';
import { getLang, onLanguageChange, t, type MessageKey } from '../i18n';
import { $, $$, escapeHtml } from '../lib/dom';
import { formatMinutes, parseIsoDate, viennaNow } from '../lib/time';
import { closeModal, openModal } from './modal';
import { buildReservationMail, MAX_EXACT_GUESTS } from './reservationMail';
import { showToast } from './toast';

type Field = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
type Problem = MessageKey | null;

const LAST_SEATING_BEFORE_CLOSE = 90; // minutes
const SLOT_STEP = 30; // minutes
const MIN_LEAD_TIME = 30; // minutes, for same-day bookings
const DEFAULT_GUESTS = '2';
const DEFAULT_GROUP_SIZE = '80';

function dateProblem(iso: string): Problem {
  if (!iso) return 'err.date';
  if (iso < viennaNow().iso) return 'err.past';
  if (!HOURS[parseIsoDate(iso).getDay()]) return 'err.monday';
  return null;
}

/** Validated in this order; the first invalid field gets focus. */
const VALIDATED_FIELDS = ['name', 'email', 'phone', 'date', 'time', 'guests'] as const;
type ValidatedField = (typeof VALIDATED_FIELDS)[number];

const validators: Readonly<Record<ValidatedField, (value: string) => Problem>> = {
  name: (v) => (v.trim().length >= 2 ? null : 'err.name'),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? null : 'err.email'),
  phone: (v) =>
    /^\+?[0-9\s/()-]{6,20}$/.test(v.trim()) && v.replace(/\D/g, '').length >= 6
      ? null
      : 'err.phone',
  date: dateProblem,
  time: (v) => (v ? null : 'err.time'),
  guests: (v) => (v ? null : 'err.guests'),
};

function setError(input: Field, key: Problem): void {
  const field = input.closest('.field');
  if (!field) return;
  field.classList.toggle('has-error', key !== null);
  input.setAttribute('aria-invalid', String(key !== null));
  const message = $('.error', field);
  if (key && message) {
    message.textContent = t(key);
    if (!message.id) message.id = `${input.id}-error`;
    input.setAttribute('aria-describedby', message.id);
  }
}

function isValidatedField(name: string): name is ValidatedField {
  return (VALIDATED_FIELDS as readonly string[]).includes(name);
}

function validateField(input: Field): boolean {
  if (!isValidatedField(input.name)) return true;
  const problem = validators[input.name](input.value);
  setError(input, problem);
  return !problem;
}

function guestOptionsHtml(): string {
  let html = '';
  for (let n = 1; n <= MAX_EXACT_GUESTS; n++) {
    html += `<option value="${String(n)}">${escapeHtml(n === 1 ? t('res.guest1') : t('res.guestN', { n }))}</option>`;
  }
  html += `<option value="20">${escapeHtml(t('res.group15'))}</option>`;
  html += `<option value="40">${escapeHtml(t('res.group35'))}</option>`;
  html += `<option value="80">${escapeHtml(t('res.group80'))}</option>`;
  html += `<option value="more">${escapeHtml(t('res.guestMore'))}</option>`;
  return html;
}

export function initReservation(): void {
  const form = $<HTMLFormElement>('[data-res-form]');
  const dateInput = $<HTMLInputElement>('#r-date');
  const timeSelect = $<HTMLSelectElement>('#r-time');
  const guestSelect = $<HTMLSelectElement>('[data-guests]');
  if (!form || !dateInput || !timeSelect || !guestSelect) return;

  const renderGuests = (): void => {
    const selected = guestSelect.value || DEFAULT_GUESTS;
    guestSelect.innerHTML = guestOptionsHtml();
    guestSelect.value = selected;
  };

  const renderTimes = (): void => {
    const iso = dateInput.value;
    const previous = timeSelect.value;
    const hours = iso && !dateProblem(iso) ? HOURS[parseIsoDate(iso).getDay()] : null;
    if (!hours) {
      timeSelect.innerHTML = `<option value="">${escapeHtml(t('res.timePick'))}</option>`;
      return;
    }
    const now = viennaNow();
    const earliest = iso === now.iso ? now.minutes + MIN_LEAD_TIME : 0;
    let html = `<option value="">${escapeHtml(t('res.timeChoose'))}</option>`;
    for (let m = hours.open; m <= hours.close - LAST_SEATING_BEFORE_CLOSE; m += SLOT_STEP) {
      if (m >= earliest) html += `<option value="${formatMinutes(m)}">${formatMinutes(m)}</option>`;
    }
    timeSelect.innerHTML = html;
    if (previous && $(`option[value="${previous}"]`, timeSelect)) timeSelect.value = previous;
  };

  const prepare = (): void => {
    dateInput.min = viennaNow().iso;
    renderTimes();
  };

  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    const groupButton = target.closest<HTMLElement>('[data-open-reservation-group]');
    if (groupButton) {
      event.preventDefault();
      prepare();
      guestSelect.value = DEFAULT_GROUP_SIZE;
      if (groupButton.dataset.openReservationGroup) {
        guestSelect.value = groupButton.dataset.openReservationGroup;
      }
      openModal('reservation');
      return;
    }
    if (target.closest('[data-open-reservation]')) {
      event.preventDefault();
      prepare();
      openModal('reservation');
    }
  });

  renderGuests();
  guestSelect.value = DEFAULT_GUESTS;
  onLanguageChange(() => {
    renderGuests();
    renderTimes();
    $$('.field.has-error', form).forEach((field) => {
      const input = $<Field>('input, select, textarea', field);
      if (input) validateField(input);
    });
  });

  dateInput.addEventListener('change', () => {
    renderTimes();
    validateField(dateInput);
  });
  $$<HTMLInputElement | HTMLSelectElement>('input, select', form).forEach((input) => {
    input.addEventListener('blur', () => {
      if (input.value) validateField(input);
    });
    input.addEventListener('input', () => {
      if (input.closest('.field')?.classList.contains('has-error')) validateField(input);
    });
  });
  guestSelect.addEventListener('change', () => {
    validateField(guestSelect);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const fields = VALIDATED_FIELDS.map((name) => form.elements.namedItem(name) as Field);
    const invalid = fields.filter((field) => !validateField(field));
    if (invalid[0]) {
      invalid[0].focus();
      return;
    }

    const data = new FormData(form);
    const value = (name: string): string => {
      const entry = data.get(name);
      return typeof entry === 'string' ? entry : '';
    };
    const lang = getLang();
    const time = value('time').trim();
    const mail = buildReservationMail(
      {
        name: value('name'),
        email: value('email'),
        phone: value('phone'),
        date: value('date'),
        time,
        guests: value('guests'),
        seat: value('seat') || 'egal',
        notes: value('notes'),
      },
      lang,
    );

    // Opens the visitor's own mail client; nothing is sent to a server.
    window.location.href = mail.url;

    showToast(
      t('toast.title'),
      `${t('toast.text')}<br><span class="text-xs opacity-90">${t('toast.detail', { date: mail.dateLabel, time, guests: mail.guestLabel })}</span>`,
      mail.url,
    );

    form.reset();
    guestSelect.value = DEFAULT_GUESTS;
    renderTimes();
    $$('.field', form).forEach((field) => {
      field.classList.remove('has-error');
    });
    closeModal();
  });
}
