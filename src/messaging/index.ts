/**
 * Messaging domain rules shared between DraftReal Web and DraftReal Mobile.
 *
 * Added as part of mobile's M5-B (Messaging & Realtime, data-layer sprint),
 * after M5-A's audit of web's real messaging implementation
 * (`src/lib/messages.ts`, `src/lib/staff-message-access.ts`, and the
 * `conversations`/`messages` migrations). Every value here is copied from a
 * verified source, not guessed:
 *
 * - `ConversationOwnerType` = `conversations_owner_type_check`
 *   (`supabase/migrations/20260906000000_representative_messaging.sql:52-55`)
 * - `ConversationCounterpartType` = `conversations_counterpart_type_check`
 *   (same file, line ~35-38)
 * - `MessageSenderType` = `messages_sender_type_check`
 *   (same file, line 88-90) — `'club'` is a legacy alias for `'team'`,
 *   still a valid stored value, not removed here.
 * - `MESSAGE_MAX_LENGTH` = the limit enforced by
 *   `send_representative_conversation_message` (same migration, `IF
 *   length(v_trimmed) > 2000`) and by `staff_conversation_messages`'s
 *   `CHECK (length(trim(content)) BETWEEN 1 AND 2000)`
 *   (`20260608200000_staff_club_messages.sql`). Web's client-side check in
 *   `src/lib/messages.ts` (`sendMessage`) uses the same 2000, informally.
 *
 * This module only covers "Sistema 1" (the general `conversations`/
 * `messages` tables). "Sistema 2" (`staff_application_conversations`/
 * `staff_conversation_messages`, tied to job applications and team roster
 * staff) is a separate, real product domain — not merged in here just
 * because the shapes look similar (see M5-A finding #7).
 */

// ---------------------------------------------------------------------------
// Message content validation
// ---------------------------------------------------------------------------

export const MESSAGE_MAX_LENGTH = 2000;

export interface MessageValidationResult {
  valid: boolean;
  /** Present only when `valid` is false. */
  reason?: 'empty' | 'too_long';
  /** The trimmed content — always returned, valid or not, so the caller never re-trims. */
  trimmed: string;
}

/**
 * A message is valid if, after trimming, it's non-empty and at most
 * `MESSAGE_MAX_LENGTH` characters — exactly the rule already enforced (in
 * three different places, informally) across DraftReal's real messaging
 * code. Length is measured in UTF-16 code units (`string.length`), matching
 * both web's client check and the SQL `length()` on `text` (Postgres
 * `length()` counts characters, not UTF-16 units, so a message dense in
 * astral-plane emoji could differ by a code unit or two between this check
 * and the DB's — never enough to matter at a 2000-character ceiling, and
 * worth knowing rather than silently assuming exact parity).
 */
export function validateMessageContent(content: string): MessageValidationResult {
  const trimmed = content.trim();
  if (trimmed.length === 0) return { valid: false, reason: 'empty', trimmed };
  if (trimmed.length > MESSAGE_MAX_LENGTH) return { valid: false, reason: 'too_long', trimmed };
  return { valid: true, trimmed };
}

// ---------------------------------------------------------------------------
// Domain enums (conversations / messages — "Sistema 1" only)
// ---------------------------------------------------------------------------

/** Who "owns" a conversation — `conversations.owner_type`. */
export const CONVERSATION_OWNER_TYPES = ['team', 'staff', 'player', 'representative'] as const;
export type ConversationOwnerType = (typeof CONVERSATION_OWNER_TYPES)[number];

/**
 * The typed non-player side of a "counterpart-shaped" conversation
 * (representative<->team/staff) — `conversations.counterpart_type`.
 * Mutually exclusive with `player_profile_id` at the DB level
 * (`conversations_participant_shape_check`).
 */
export const CONVERSATION_COUNTERPART_TYPES = ['team', 'staff', 'representative'] as const;
export type ConversationCounterpartType = (typeof CONVERSATION_COUNTERPART_TYPES)[number];

/** Who actually sent a given message — `messages.sender_type`. */
export const MESSAGE_SENDER_TYPES = ['player', 'club', 'team', 'staff', 'representative'] as const;
export type MessageSenderType = (typeof MESSAGE_SENDER_TYPES)[number];

export function isConversationOwnerType(value: string): value is ConversationOwnerType {
  return (CONVERSATION_OWNER_TYPES as readonly string[]).includes(value);
}

export function isConversationCounterpartType(value: string): value is ConversationCounterpartType {
  return (CONVERSATION_COUNTERPART_TYPES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Staff message access — ported verbatim from web's
// `src/lib/staff-message-access.ts` (confirmed pure: no React, no Supabase,
// no Web APIs). Behavior preserved exactly; web's own copy is NOT removed
// or changed by this package (M5-B scope: additive only).
// ---------------------------------------------------------------------------

/** The minimum shape of a conversation needed to decide staff access to it. */
export interface StaffAccessConversation {
  owner_type?: string | null;
  owner_profile_id?: string | null;
  player_profile_id?: string | null;
  counterpart_type?: string | null;
}

/**
 * Is this a player<->staff conversation, with the staff as owner? It's the
 * only shape a staff member without messaging entitlement can read/reply to.
 */
export function isPlayerToStaffConversation(
  conversation: StaffAccessConversation,
  staffProfileId: string | null | undefined,
): boolean {
  if (!staffProfileId) return false;
  return (
    conversation.owner_type === 'staff' &&
    conversation.owner_profile_id === staffProfileId &&
    !!conversation.player_profile_id &&
    !conversation.counterpart_type
  );
}

/**
 * Can this staff member open/reply to this conversation? With messaging
 * entitlement (own Pro plan or a club-granted permission), full access.
 * Without it, only conversations a player started.
 */
export function canStaffAccessConversation(
  conversation: StaffAccessConversation,
  opts: { canUseMessages: boolean; staffProfileId: string | null | undefined },
): boolean {
  if (opts.canUseMessages) return true;
  return isPlayerToStaffConversation(conversation, opts.staffProfileId);
}

/**
 * Filters a staff member's inbox. With messaging entitlement, the list is
 * unchanged; without it, only conversations a player started — Pro-only
 * conversations never show up.
 */
export function filterConversationsForStaff<T extends StaffAccessConversation>(
  conversations: T[],
  opts: { canUseMessages: boolean; staffProfileId: string | null | undefined },
): T[] {
  if (opts.canUseMessages) return conversations;
  return conversations.filter((c) => isPlayerToStaffConversation(c, opts.staffProfileId));
}

/**
 * Can this staff member start new conversations? Only with messaging
 * entitlement — a staff member without it can reply, never initiate.
 */
export function canStaffStartConversations(canUseMessages: boolean): boolean {
  return canUseMessages;
}
