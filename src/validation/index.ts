/**
 * Player physical-data validation rules — the actual bounds DraftReal Web
 * uses on its player forms (`src/routes/onboarding.player.tsx:1017-1018`,
 * `src/routes/player.profile.edit.tsx:1149-1150,1163-1164`):
 *
 *   height: 140–240 cm
 *   weight: 40–180 kg
 *
 * Confirmed against web's real `<input type="number" min={...} max={...}>`
 * attributes as of M4.8 (2026-09-17) — web only enforces these client-side
 * (no server/zod range check exists there today), and DraftReal Mobile's
 * `lib/profile-validation.ts` had NO range at all (`z.number().int().nonnegative()`)
 * before this package existed — a real drift bug this package closes, not a
 * hypothetical one.
 *
 * Pure functions only: no zod dependency here (each app wires these into its
 * own schema library — zod on both web and mobile today, but this package
 * doesn't assume that stays true).
 */

export const PLAYER_HEIGHT_CM_MIN = 140;
export const PLAYER_HEIGHT_CM_MAX = 240;

export const PLAYER_WEIGHT_KG_MIN = 40;
export const PLAYER_WEIGHT_KG_MAX = 180;

export interface RangeValidationResult {
  valid: boolean;
  /** Present only when `valid` is false. */
  reason?: 'not_a_number' | 'not_an_integer' | 'too_low' | 'too_high';
}

function validateIntRange(value: number, min: number, max: number): RangeValidationResult {
  if (typeof value !== 'number' || Number.isNaN(value)) return { valid: false, reason: 'not_a_number' };
  if (!Number.isInteger(value)) return { valid: false, reason: 'not_an_integer' };
  if (value < min) return { valid: false, reason: 'too_low' };
  if (value > max) return { valid: false, reason: 'too_high' };
  return { valid: true };
}

/** `heightCm` in [140, 240], matching web's real onboarding/edit form bounds. */
export function validatePlayerHeightCm(value: number): RangeValidationResult {
  return validateIntRange(value, PLAYER_HEIGHT_CM_MIN, PLAYER_HEIGHT_CM_MAX);
}

/** `weightKg` in [40, 180], matching web's real profile-edit form bounds. */
export function validatePlayerWeightKg(value: number): RangeValidationResult {
  return validateIntRange(value, PLAYER_WEIGHT_KG_MIN, PLAYER_WEIGHT_KG_MAX);
}

/**
 * Calendar-date validation shared with mobile's `lib/profile-validation.ts`
 * (`isCalendarDate`): a strict `YYYY-MM-DD` string that round-trips through
 * `Date` and is not in the future. Pure string/Date logic — no timezone
 * assumptions beyond UTC, matching the mobile implementation this replaces.
 */
export function isValidCalendarDateString(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearStr, monthStr, dayStr] = match;
  if (Number(yearStr) === 0) return false;
  const date = new Date(`${value}T00:00:00Z`);
  const today = new Date();
  const todayUtc = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  return (
    date.getTime() <= todayUtc &&
    date.getUTCFullYear() === Number(yearStr) &&
    date.getUTCMonth() + 1 === Number(monthStr) &&
    date.getUTCDate() === Number(dayStr)
  );
}
