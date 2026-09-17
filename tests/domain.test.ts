import { describe, expect, it } from 'vitest';
import {
  EXPERIENCE_LEVELS,
  EXPERIENCE_LEVEL_LABELS,
  PLAYER_POSITIONS,
  POSITION_LABELS,
  STAFF_PRIMARY_ROLES,
  STAFF_ROLE_LABELS,
  TEAM_STAFF_MEMBER_ROLES,
  TEAM_STAFF_MEMBER_ROLE_LABELS,
  isPlayerPosition,
  isStaffPrimaryRole,
  labelFor,
  optionsFromLabels,
} from '../src/domain/index.js';

describe('enum <-> label maps stay in sync', () => {
  it('every player position has exactly one label', () => {
    expect(Object.keys(POSITION_LABELS).sort()).toEqual([...PLAYER_POSITIONS].sort());
  });

  it('every experience level has exactly one label', () => {
    expect(Object.keys(EXPERIENCE_LEVEL_LABELS).sort()).toEqual([...EXPERIENCE_LEVELS].sort());
  });

  it('every staff primary role has exactly one label', () => {
    expect(Object.keys(STAFF_ROLE_LABELS).sort()).toEqual([...STAFF_PRIMARY_ROLES].sort());
  });

  it('team staff member role is a distinct enum from staff primary role', () => {
    // Confirmed real-world distinction (roster role within a team vs a staff
    // profile's own professional role) — not the same values.
    expect(TEAM_STAFF_MEMBER_ROLES).not.toEqual(STAFF_PRIMARY_ROLES);
    expect(Object.keys(TEAM_STAFF_MEMBER_ROLE_LABELS).sort()).toEqual([...TEAM_STAFF_MEMBER_ROLES].sort());
  });
});

describe('type guards', () => {
  it('isPlayerPosition', () => {
    expect(isPlayerPosition('pg')).toBe(true);
    expect(isPlayerPosition('goalkeeper')).toBe(false);
  });

  it('isStaffPrimaryRole', () => {
    expect(isStaffPrimaryRole('kinesiologist')).toBe(true);
    expect(isStaffPrimaryRole('head_coach')).toBe(false);
  });
});

describe('labelFor / optionsFromLabels', () => {
  it('labelFor falls back to the raw value for an unknown key', () => {
    expect(labelFor(POSITION_LABELS, 'pg')).toBe('Base');
    expect(labelFor(POSITION_LABELS, 'unknown_legacy_value')).toBe('unknown_legacy_value');
    expect(labelFor(POSITION_LABELS, null)).toBeNull();
  });

  it('optionsFromLabels preserves key order', () => {
    expect(optionsFromLabels(POSITION_LABELS)).toEqual([
      { value: 'pg', label: 'Base' },
      { value: 'sg', label: 'Escolta' },
      { value: 'sf', label: 'Alero' },
      { value: 'pf', label: 'Ala-pívot' },
      { value: 'c', label: 'Pívot' },
    ]);
  });
});
