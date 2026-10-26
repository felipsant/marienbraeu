import { describe, expect, it } from 'vitest';
import { austrianHolidays, isAustrianHoliday } from '../../src/lib/holidays';

describe('Austrian public holidays', () => {
  it('knows the fixed holidays', () => {
    for (const d of [
      '01-01',
      '01-06',
      '05-01',
      '08-15',
      '10-26',
      '11-01',
      '12-08',
      '12-25',
      '12-26',
    ]) {
      expect(isAustrianHoliday(`2026-${d}`)).toBe(true);
    }
  });

  it('recognises Nationalfeiertag 2026-10-26 (a Monday)', () => {
    expect(isAustrianHoliday('2026-10-26')).toBe(true);
    expect(isAustrianHoliday(new Date(2026, 9, 26))).toBe(true);
  });

  it('computes Easter-based holidays', () => {
    expect([...austrianHolidays(2026)]).toEqual(
      expect.arrayContaining([
        '2026-04-05',
        '2026-04-06',
        '2026-05-14',
        '2026-05-25',
        '2026-06-04',
      ]),
    );
    expect(isAustrianHoliday('2026-04-06')).toBe(true); // Ostermontag
    expect(isAustrianHoliday('2026-05-25')).toBe(true); // Pfingstmontag
    expect(isAustrianHoliday('2025-04-21')).toBe(true); // Ostermontag 2025
    expect(isAustrianHoliday('2025-06-09')).toBe(true); // Pfingstmontag 2025
    expect(isAustrianHoliday('2024-04-01')).toBe(true); // Ostermontag 2024
    expect(isAustrianHoliday('2024-05-30')).toBe(true); // Fronleichnam 2024
  });

  it('rejects ordinary days', () => {
    expect(isAustrianHoliday('2026-10-27')).toBe(false);
    expect(isAustrianHoliday('2026-11-02')).toBe(false);
    expect(isAustrianHoliday('')).toBe(false);
  });
});
