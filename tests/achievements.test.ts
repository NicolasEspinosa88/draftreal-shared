import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_TYPE_BADGE_COLORS,
  ACHIEVEMENT_TYPE_DEFAULT_COLOR,
  ACHIEVEMENT_TYPE_LABELS,
  ALL_ACHIEVEMENT_TYPE_LABELS,
  TEAM_ONLY_ACHIEVEMENT_TYPES,
  achievementTypeBadgeColor,
} from '../src/achievements/index.js';

describe('achievement type labels', () => {
  it('every player-usable type has a label', () => {
    expect(Object.keys(ACHIEVEMENT_TYPE_LABELS).sort()).toEqual([...ACHIEVEMENT_TYPES].sort());
  });

  it('ALL_ACHIEVEMENT_TYPE_LABELS includes both player and team-only types', () => {
    for (const type of ACHIEVEMENT_TYPES) expect(ALL_ACHIEVEMENT_TYPE_LABELS[type]).toBeTruthy();
    for (const type of TEAM_ONLY_ACHIEVEMENT_TYPES) expect(ALL_ACHIEVEMENT_TYPE_LABELS[type]).toBeTruthy();
  });
});

describe('achievementTypeBadgeColor', () => {
  it('returns the mapped hex color for a known type', () => {
    expect(achievementTypeBadgeColor('championship')).toBe('#FBBF24');
  });

  it('returns the brand orange for award, not a generic Tailwind shade', () => {
    expect(achievementTypeBadgeColor('award')).toBe('#E24B03');
  });

  it('falls back to the default color for an unknown type', () => {
    expect(achievementTypeBadgeColor('some_future_type')).toBe(ACHIEVEMENT_TYPE_DEFAULT_COLOR);
  });

  it('every declared achievement type has an explicit color entry', () => {
    for (const type of ACHIEVEMENT_TYPES) {
      expect(ACHIEVEMENT_TYPE_BADGE_COLORS[type]).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });
});
