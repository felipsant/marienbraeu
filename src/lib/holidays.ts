/** Anonymous Gregorian algorithm: month (1-12) and day of Easter Sunday. */
function easterSunday(year: number): { month: number; day: number } {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const n = h + l - 7 * m + 114;
  return { month: Math.floor(n / 31), day: (n % 31) + 1 };
}

const pad = (n: number): string => (n < 10 ? `0${String(n)}` : String(n));

const FIXED: readonly (readonly [month: number, day: number])[] = [
  [1, 1], // Neujahr
  [1, 6], // Heilige Drei Könige
  [5, 1], // Staatsfeiertag
  [8, 15], // Mariä Himmelfahrt
  [10, 26], // Nationalfeiertag
  [11, 1], // Allerheiligen
  [12, 8], // Mariä Empfängnis
  [12, 25], // Christtag
  [12, 26], // Stefanitag
];

/** Easter-relative holidays, in days after Easter Sunday. */
const MOVABLE_OFFSETS: readonly number[] = [
  0, // Ostersonntag
  1, // Ostermontag
  39, // Christi Himmelfahrt
  50, // Pfingstmontag
  60, // Fronleichnam
];

/** All Austrian public holidays of a year as YYYY-MM-DD strings. */
export function austrianHolidays(year: number): Set<string> {
  const iso = (month: number, day: number): string => `${String(year)}-${pad(month)}-${pad(day)}`;
  const holidays = new Set(FIXED.map(([month, day]) => iso(month, day)));
  const easter = easterSunday(year);
  for (const offset of MOVABLE_OFFSETS) {
    // Date.UTC normalises overflowing days into the following months.
    const d = new Date(Date.UTC(year, easter.month - 1, easter.day + offset));
    holidays.add(iso(d.getUTCMonth() + 1, d.getUTCDate()));
  }
  return holidays;
}

/** Accepts a YYYY-MM-DD string or a Date (read in local time). */
export function isAustrianHoliday(date: Date | string): boolean {
  let year: number;
  let key: string;
  if (typeof date === 'string') {
    key = date.slice(0, 10);
    year = Number(key.slice(0, 4));
  } else {
    year = date.getFullYear();
    key = `${String(year)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
  if (!Number.isInteger(year)) return false;
  return austrianHolidays(year).has(key);
}
