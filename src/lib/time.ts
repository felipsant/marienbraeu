const TIME_ZONE = 'Europe/Vienna';

const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

export interface ViennaNow {
  /** JS weekday, 0 = Sunday. */
  day: number;
  /** Minutes since midnight. */
  minutes: number;
  /** Calendar date as YYYY-MM-DD. */
  iso: string;
}

export function viennaNow(): ViennaNow {
  const parts: Record<string, string> = {};
  new Intl.DateTimeFormat('en-US', {
    timeZone: TIME_ZONE,
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(new Date())
    .forEach((p) => {
      parts[p.type] = p.value;
    });
  return {
    day: WEEKDAYS[parts.weekday ?? ''] ?? 0,
    minutes: (parseInt(parts.hour ?? '0', 10) % 24) * 60 + parseInt(parts.minute ?? '0', 10),
    iso: `${parts.year ?? ''}-${parts.month ?? ''}-${parts.day ?? ''}`,
  };
}

/** Minutes since midnight as HH:MM. */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h < 10 ? '0' : ''}${String(h)}:${m < 10 ? '0' : ''}${String(m)}`;
}

/** Parses YYYY-MM-DD as a local-time date. */
export function parseIsoDate(iso: string): Date {
  const [year = 0, month = 1, day = 1] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}
