import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENT_COLOR_TOKENS,
  ACHIEVEMENT_TYPES,
  ACHIEVEMENT_TYPE_COLOR_TOKEN,
  ACHIEVEMENT_TYPE_LABELS,
  ALL_ACHIEVEMENT_TYPE_LABELS,
  TEAM_ONLY_ACHIEVEMENT_TYPES,
  achievementColorToken,
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

describe('achievementColorToken', () => {
  it('returns the mapped semantic token for a known type', () => {
    expect(achievementColorToken('championship')).toBe('amber');
  });

  it('returns the brand token for award, not a generic color family', () => {
    expect(achievementColorToken('award')).toBe('brand');
  });

  it('returns undefined for an unknown type, leaving the fallback to each app', () => {
    expect(achievementColorToken('some_future_type')).toBeUndefined();
  });

  it('every declared achievement type has an explicit, valid token', () => {
    for (const type of ACHIEVEMENT_TYPES) {
      expect(ACHIEVEMENT_COLOR_TOKENS).toContain(ACHIEVEMENT_TYPE_COLOR_TOKEN[type]);
    }
  });

  it('is presentation-agnostic: no hex or Tailwind class ever leaks out of this module', () => {
    for (const token of Object.values(ACHIEVEMENT_TYPE_COLOR_TOKEN)) {
      expect(token).not.toMatch(/^#/);
      expect(token).not.toMatch(/^text-/);
    }
  });
});
