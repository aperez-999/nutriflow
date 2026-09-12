import { describe, expect, it } from 'vitest';
import { parseDayKey, shiftDayKey, toDayKey, toStoredIsoFromDayKey } from './dateUtils';

describe('dateUtils', () => {
  it('builds zero-padded local day keys', () => {
    expect(toDayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });

  it('round-trips a day key through parse', () => {
    expect(toDayKey(parseDayKey('2026-03-09'))).toBe('2026-03-09');
  });

  it('shifts across month and year boundaries', () => {
    expect(shiftDayKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(shiftDayKey('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('stores day keys at local noon so they map back to the same day', () => {
    expect(toDayKey(toStoredIsoFromDayKey('2026-07-04'))).toBe('2026-07-04');
  });
});
