import { describe, expect, it } from 'vitest';
import {
  PLAYER_HEIGHT_CM_MAX,
  PLAYER_HEIGHT_CM_MIN,
  PLAYER_WEIGHT_KG_MAX,
  PLAYER_WEIGHT_KG_MIN,
  isValidCalendarDateString,
  validatePlayerHeightCm,
  validatePlayerWeightKg,
} from '../src/validation/index.js';

describe('validatePlayerHeightCm', () => {
  it('accepts the documented bounds (140 and 240)', () => {
    expect(validatePlayerHeightCm(PLAYER_HEIGHT_CM_MIN).valid).toBe(true);
    expect(validatePlayerHeightCm(PLAYER_HEIGHT_CM_MAX).valid).toBe(true);
  });

  it('accepts a typical value inside the range', () => {
    expect(validatePlayerHeightCm(190).valid).toBe(true);
  });

  it('rejects a value below 140', () => {
    const result = validatePlayerHeightCm(139);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('too_low');
  });

  it('rejects a value above 240', () => {
    const result = validatePlayerHeightCm(241);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('too_high');
  });

  it('rejects the drift bug this package fixes: mobile used to accept any non-negative integer', () => {
    expect(validatePlayerHeightCm(3).valid).toBe(false);
    expect(validatePlayerHeightCm(9000).valid).toBe(false);
  });

  it('rejects a non-integer', () => {
    expect(validatePlayerHeightCm(190.5).reason).toBe('not_an_integer');
  });
});

describe('validatePlayerWeightKg', () => {
  it('accepts the documented bounds (40 and 180)', () => {
    expect(validatePlayerWeightKg(PLAYER_WEIGHT_KG_MIN).valid).toBe(true);
    expect(validatePlayerWeightKg(PLAYER_WEIGHT_KG_MAX).valid).toBe(true);
  });

  it('rejects below 40 and above 180', () => {
    expect(validatePlayerWeightKg(39).reason).toBe('too_low');
    expect(validatePlayerWeightKg(181).reason).toBe('too_high');
  });
});

describe('isValidCalendarDateString', () => {
  it('accepts a valid past date', () => {
    expect(isValidCalendarDateString('2000-01-15')).toBe(true);
  });

  it('rejects malformed strings', () => {
    expect(isValidCalendarDateString('2000-1-15')).toBe(false);
    expect(isValidCalendarDateString('not-a-date')).toBe(false);
  });

  it('rejects a date in the future', () => {
    const future = new Date();
    future.setUTCFullYear(future.getUTCFullYear() + 1);
    const isoFuture = future.toISOString().slice(0, 10);
    expect(isValidCalendarDateString(isoFuture)).toBe(false);
  });

  it('rejects an impossible calendar date', () => {
    expect(isValidCalendarDateString('2024-02-30')).toBe(false);
  });
});
