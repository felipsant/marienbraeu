import { LOCALES, t } from '../i18n';
import { parseIsoDate } from '../lib/time';
import type { Lang } from '../types';

export const RESERVATION_EMAIL = 'marienbraeu@gmx.at';

/** Largest party that is offered as an exact head count. */
export const MAX_EXACT_GUESTS = 12;

export type SeatChoice = 'stube' | 'garten' | 'egal';

const SEAT_NAMES: Readonly<Record<SeatChoice, { de: string } & Partial<Record<Lang, string>>>> = {
  stube: {
    de: 'Gaststube (drinnen)',
    en: 'Inside dining room (Gaststube)',
    it: 'Sala interna (Gaststube)',
  },
  garten: {
    de: 'Gastgarten (draußen)',
    en: 'Beer garden (Gastgarten)',
    it: 'Giardino all’aperto (Gastgarten)',
  },
  egal: { de: 'Keine Präferenz / egal', en: 'No preference', it: 'Nessuna preferenza' },
};

const NO_NOTES: Readonly<Record<'de' | 'it' | 'other', string>> = {
  de: 'Keine',
  it: 'Nessuna',
  other: 'None',
};

export interface ReservationRequest {
  name: string;
  email: string;
  phone: string;
  /** YYYY-MM-DD */
  date: string;
  /** HH:MM */
  time: string;
  /** Value of the party-size select: "1"…"12", a group size, or "more". */
  guests: string;
  seat: string;
  notes: string;
}

export interface ReservationMail {
  url: string;
  dateLabel: string;
  guestLabel: string;
}

export function describeGuests(raw: string): string {
  const count = Number(raw);
  if (raw === '1') return t('res.guest1');
  if (!isNaN(count) && count <= MAX_EXACT_GUESTS) return t('res.guestN', { n: count });
  if (raw === '20') return t('res.group15');
  if (raw === '40') return t('res.group35');
  if (raw === '80') return t('res.group80');
  return t('res.guestMore');
}

function isSeatChoice(value: string): value is SeatChoice {
  return value === 'stube' || value === 'garten' || value === 'egal';
}

/** Builds the pre-filled mailto: draft; the mail itself is always written in German. */
export function buildReservationMail(request: ReservationRequest, lang: Lang): ReservationMail {
  const name = request.name.trim();
  const dateLabel = parseIsoDate(request.date).toLocaleDateString(LOCALES[lang], {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const guestLabel = describeGuests(request.guests);
  const seat = SEAT_NAMES[isSeatChoice(request.seat) ? request.seat : 'egal'];
  const seatLabel = seat[lang] ?? seat.de;
  const fallbackNotes = lang === 'de' ? NO_NOTES.de : lang === 'it' ? NO_NOTES.it : NO_NOTES.other;
  const notes = request.notes.trim() || fallbackNotes;

  const subject = `Tischreservierung Marienbräu: ${name} – ${dateLabel} um ${request.time} Uhr (${guestLabel})`;
  const body =
    'Hallo Marienbräu-Team,\n\n' +
    'ich möchte gerne einen Tisch bei Ihnen reservieren:\n\n' +
    `• Name: ${name}\n` +
    `• Telefon: ${request.phone.trim()}\n` +
    `• E-Mail: ${request.email.trim()}\n` +
    `• Datum: ${dateLabel}\n` +
    `• Uhrzeit: ${request.time} Uhr\n` +
    `• Personenanzahl: ${guestLabel}\n` +
    `• Sitzplatzwunsch: ${seatLabel}\n` +
    `• Besondere Wünsche / Anmerkungen: ${notes}\n\n` +
    'Bitte um kurze Bestätigung dieser Reservierungsanfrage.\n\n' +
    `Mit freundlichen Grüßen,\n${name}`;

  const url = `mailto:${RESERVATION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return { url, dateLabel, guestLabel };
}
