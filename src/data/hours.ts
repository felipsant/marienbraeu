import type { WeekHours } from '../types';

const minutes = (h: number, m = 0): number => h * 60 + m;

/** Opening hours by JS weekday (0 = Sunday … 6 = Saturday). `null` is the Ruhetag. */
export const HOURS: WeekHours = {
  0: { open: minutes(11, 30), close: minutes(20) },
  1: null,
  2: { open: minutes(15), close: minutes(24) },
  3: { open: minutes(15), close: minutes(24) },
  4: { open: minutes(15), close: minutes(24) },
  5: { open: minutes(15), close: minutes(24) },
  6: { open: minutes(11, 30), close: minutes(24) },
};
