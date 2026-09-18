import { describe, expect, it } from 'vitest';
import {
  CONVERSATION_COUNTERPART_TYPES,
  CONVERSATION_OWNER_TYPES,
  MESSAGE_MAX_LENGTH,
  MESSAGE_SENDER_TYPES,
  canStaffAccessConversation,
  canStaffStartConversations,
  filterConversationsForStaff,
  isConversationCounterpartType,
  isConversationOwnerType,
  isPlayerToStaffConversation,
  validateMessageContent,
} from '../src/messaging/index.js';

describe('validateMessageContent', () => {
  it('rejects an empty string', () => {
    const result = validateMessageContent('');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('empty');
  });

  it('rejects a whitespace-only string', () => {
    const result = validateMessageContent('   \n\t  ');
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('empty');
  });

  it('accepts a single character', () => {
    expect(validateMessageContent('a').valid).toBe(true);
  });

  it('accepts exactly 2000 characters', () => {
    const content = 'a'.repeat(MESSAGE_MAX_LENGTH);
    const result = validateMessageContent(content);
    expect(result.valid).toBe(true);
    expect(result.trimmed).toHaveLength(2000);
  });

  it('rejects 2001 characters', () => {
    const content = 'a'.repeat(MESSAGE_MAX_LENGTH + 1);
    const result = validateMessageContent(content);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('too_long');
  });

  it('trims before validating and before returning', () => {
    const result = validateMessageContent('  hola  ');
    expect(result.valid).toBe(true);
    expect(result.trimmed).toBe('hola');
  });

  it('trims surrounding whitespace off an otherwise-too-long message before measuring', () => {
    const content = `  ${'a'.repeat(MESSAGE_MAX_LENGTH)}  `;
    expect(validateMessageContent(content).valid).toBe(true);
  });

  it('accepts reasonable Unicode content (accents, emoji, non-Latin scripts)', () => {
    expect(validateMessageContent('¿Cómo estás? 👋⚽ こんにちは').valid).toBe(true);
  });

  it('always returns the trimmed content, valid or not', () => {
    expect(validateMessageContent('  x  ').trimmed).toBe('x');
    expect(validateMessageContent('   ').trimmed).toBe('');
  });
});

describe('domain enums', () => {
  it('conversation owner types match the real DB constraint (conversations_owner_type_check)', () => {
    expect(CONVERSATION_OWNER_TYPES).toEqual(['team', 'staff', 'player', 'representative']);
  });

  it('conversation counterpart types match the real DB constraint (no "player")', () => {
    expect(CONVERSATION_COUNTERPART_TYPES).toEqual(['team', 'staff', 'representative']);
  });

  it('message sender types match the real DB constraint (messages_sender_type_check)', () => {
    expect(MESSAGE_SENDER_TYPES).toEqual(['player', 'club', 'team', 'staff', 'representative']);
  });

  it('type guards accept only declared values', () => {
    expect(isConversationOwnerType('staff')).toBe(true);
    expect(isConversationOwnerType('representative')).toBe(true);
    expect(isConversationOwnerType('bogus')).toBe(false);
    expect(isConversationCounterpartType('player')).toBe(false); // never a valid counterpart_type
    expect(isConversationCounterpartType('team')).toBe(true);
  });
});

// -----------------------------------------------------------------------
// Staff message access — every scenario from web's
// scripts/tests/staff-message-access.test.ts, preserved.
// -----------------------------------------------------------------------

const staffId = 'staff-1';

describe('isPlayerToStaffConversation', () => {
  it('true for a staff-owned player conversation', () => {
    expect(
      isPlayerToStaffConversation(
        { owner_type: 'staff', owner_profile_id: staffId, player_profile_id: 'player-1', counterpart_type: null },
        staffId,
      ),
    ).toBe(true);
  });

  it('false when owner_type is not staff', () => {
    expect(
      isPlayerToStaffConversation(
        { owner_type: 'team', owner_profile_id: staffId, player_profile_id: 'player-1', counterpart_type: null },
        staffId,
      ),
    ).toBe(false);
  });

  it('false when owner_profile_id does not match this staff', () => {
    expect(
      isPlayerToStaffConversation(
        { owner_type: 'staff', owner_profile_id: 'other-staff', player_profile_id: 'player-1', counterpart_type: null },
        staffId,
      ),
    ).toBe(false);
  });

  it('false when there is no player (counterpart-shaped conversation)', () => {
    expect(
      isPlayerToStaffConversation(
        { owner_type: 'staff', owner_profile_id: staffId, player_profile_id: null, counterpart_type: 'representative' },
        staffId,
      ),
    ).toBe(false);
  });

  it('false when counterpart_type is set even if player_profile_id is also set', () => {
    expect(
      isPlayerToStaffConversation(
        { owner_type: 'staff', owner_profile_id: staffId, player_profile_id: 'player-1', counterpart_type: 'representative' },
        staffId,
      ),
    ).toBe(false);
  });

  it('false when staffProfileId is missing', () => {
    expect(
      isPlayerToStaffConversation(
        { owner_type: 'staff', owner_profile_id: staffId, player_profile_id: 'player-1', counterpart_type: null },
        null,
      ),
    ).toBe(false);
    expect(
      isPlayerToStaffConversation(
        { owner_type: 'staff', owner_profile_id: staffId, player_profile_id: 'player-1', counterpart_type: null },
        undefined,
      ),
    ).toBe(false);
  });

  it('false for another staff member\'s conversation, even with the identical shape', () => {
    expect(
      isPlayerToStaffConversation(
        { owner_type: 'staff', owner_profile_id: 'other-staff', player_profile_id: 'player-9', counterpart_type: null },
        staffId,
      ),
    ).toBe(false);
  });
});

const playerToStaff = { id: 'c-player', owner_type: 'staff', owner_profile_id: staffId, player_profile_id: 'player-1', counterpart_type: null };
const staffWithRepresentative = { id: 'c-rep', owner_type: 'staff', owner_profile_id: staffId, player_profile_id: null, counterpart_type: 'representative' };
const teamWithPlayer = { id: 'c-team', owner_type: 'team', owner_profile_id: 'team-1', player_profile_id: 'player-1', counterpart_type: null };
const otherStaffConversation = { id: 'c-otro', owner_type: 'staff', owner_profile_id: 'staff-2', player_profile_id: 'player-9', counterpart_type: null };
const allConversations = [playerToStaff, staffWithRepresentative, teamWithPlayer, otherStaffConversation];

describe('canStaffAccessConversation', () => {
  const free = { canUseMessages: false, staffProfileId: staffId };
  const pro = { canUseMessages: true, staffProfileId: staffId };

  it('Free: can access the conversation a player started', () => {
    expect(canStaffAccessConversation(playerToStaff, free)).toBe(true);
  });

  it('Free: cannot access a representative conversation (still Pro-only)', () => {
    expect(canStaffAccessConversation(staffWithRepresentative, free)).toBe(false);
  });

  it('Free: cannot access a team conversation', () => {
    expect(canStaffAccessConversation(teamWithPlayer, free)).toBe(false);
  });

  it('Free: cannot access another staff member\'s conversation', () => {
    expect(canStaffAccessConversation(otherStaffConversation, free)).toBe(false);
  });

  it('Pro / club-permission: accesses everything, including representative conversations', () => {
    expect(canStaffAccessConversation(playerToStaff, pro)).toBe(true);
    expect(canStaffAccessConversation(staffWithRepresentative, pro)).toBe(true);
  });
});

describe('filterConversationsForStaff', () => {
  it('Free: inbox filters down to only player-initiated conversations', () => {
    const visible = filterConversationsForStaff(allConversations, { canUseMessages: false, staffProfileId: staffId });
    expect(visible.map((c) => c.id)).toEqual(['c-player']);
  });

  it('Pro / club-permission: inbox is not filtered at all', () => {
    const visible = filterConversationsForStaff(allConversations, { canUseMessages: true, staffProfileId: staffId });
    expect(visible).toHaveLength(allConversations.length);
  });
});

describe('canStaffStartConversations', () => {
  it('mirrors the canUseMessages flag exactly', () => {
    expect(canStaffStartConversations(true)).toBe(true);
    expect(canStaffStartConversations(false)).toBe(false);
  });
});
