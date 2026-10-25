import { HOURS } from '../data/hours';
import { t, onLanguageChange, type MessageKey } from '../i18n';
import { $, $$ } from '../lib/dom';
import { isAustrianHoliday } from '../lib/holidays';
import { formatMinutes, viennaNow, type ViennaNow } from '../lib/time';
import type { WeekHours } from '../types';

export type OpenState = 'open' | 'soon' | 'closed';

export interface LiveStatus {
  state: OpenState;
  text: string;
}

const DAY_KEYS: readonly MessageKey[] = [
  'day.0',
  'day.1',
  'day.2',
  'day.3',
  'day.4',
  'day.5',
  'day.6',
];

const CLOSING_SOON_MINUTES = 60;
const REFRESH_INTERVAL_MS = 60 * 1000;

export function computeStatus(now: ViennaNow, hours: WeekHours = HOURS): LiveStatus {
  const today = hours[now.day];
  if (!today && isAustrianHoliday(now.iso)) {
    // Ruhetag falling on a public holiday: open, but hours are not published yet.
    return { state: 'open', text: t('status.holiday') };
  }
  if (today && now.minutes >= today.open && now.minutes < today.close) {
    const soon = today.close - now.minutes <= CLOSING_SOON_MINUTES;
    return {
      state: soon ? 'soon' : 'open',
      text: t(soon ? 'status.soon' : 'status.open', { close: formatMinutes(today.close) }),
    };
  }
  if (today && now.minutes < today.open) {
    return { state: 'closed', text: t('status.today', { open: formatMinutes(today.open) }) };
  }
  for (let i = 1; i <= 7; i++) {
    const day = (now.day + i) % 7;
    const next = hours[day];
    if (next) {
      return {
        state: 'closed',
        text: t(i === 1 ? 'status.tomorrow' : 'status.later', {
          open: formatMinutes(next.open),
          day: t(DAY_KEYS[day] ?? 'day.0'),
        }),
      };
    }
  }
  return { state: 'closed', text: '' };
}

function renderStatus(): void {
  const now = viennaNow();
  const status = computeStatus(now);
  $$('[data-live-status]').forEach((el) => {
    el.classList.remove('is-open', 'is-soon', 'is-closed');
    el.classList.add(`is-${status.state}`);
    const text = $('[data-live-text]', el);
    if (text) text.textContent = status.text;
  });
  const headline = $('[data-live-headline]');
  if (headline) {
    headline.textContent = t(
      status.state === 'closed' ? 'headline.closed' : `headline.${status.state}`,
    );
  }

  $$('[data-hours-table] tr').forEach((row) => {
    const isToday = Number(row.dataset.day) === now.day;
    row.classList.toggle('is-today', isToday);
    const heading = $('th', row);
    if (isToday) heading?.setAttribute('data-today', t('hours.today'));
    else heading?.removeAttribute('data-today');
  });

  const todayHours = HOURS[now.day];
  const holidayOpen = !todayHours && isAustrianHoliday(now.iso);
  $$('[data-today-hours]').forEach((el) => {
    if (holidayOpen) {
      el.textContent = t('today.holiday');
      return;
    }
    el.textContent = todayHours
      ? t('today.hours', {
          open: formatMinutes(todayHours.open),
          close: formatMinutes(todayHours.close),
        })
      : t('today.closed');
  });
}

export function initStatus(): void {
  renderStatus();
  setInterval(renderStatus, REFRESH_INTERVAL_MS);
  onLanguageChange(renderStatus);
}
