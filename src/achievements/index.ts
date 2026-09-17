/**
 * Achievement type labels + color semantics — the pure mappings web keeps in
 * `src/lib/highlight-achievements.ts` (labels) and
 * `src/lib/achievement-display.ts` (colors), duplicated verbatim (and with
 * risk of silent drift, per its own "keep in sync" comment) in mobile's
 * `constants/labels.ts` before this package existed.
 *
 * Colors are a *semantic token* (`'amber' | 'blue' | ...`), not a hex value
 * or a Tailwind class — this package stays presentation-agnostic. Each app
 * owns its own token -> visual mapping: web resolves a token to its
 * `text-{token}-400` Tailwind class (see `src/lib/achievement-display.ts`),
 * mobile resolves it to a hex constant (see `constants/labels.ts`). Neither
 * mapping lives here, so this package never has to know what Tailwind or
 * React Native styling looks like.
 */

export const ACHIEVEMENT_TYPES = [
  'standout_game',
  'video_highlight',
  'new_team',
  'award',
  'milestone',
  'qualification',
  'championship',
  'promotion',
  'signing',
] as const;
/** Player-usable achievement types only. */
export type PlayerAchievementType = (typeof ACHIEVEMENT_TYPES)[number];

/** Reserved for team-authored rows — never offered in a player's own create/edit form. */
export const TEAM_ONLY_ACHIEVEMENT_TYPES = ['team_milestone', 'team_achievement'] as const;
export type TeamOnlyAchievementType = (typeof TEAM_ONLY_ACHIEVEMENT_TYPES)[number];

export type AchievementType = PlayerAchievementType | TeamOnlyAchievementType;

export const ACHIEVEMENT_TYPE_LABELS: Record<PlayerAchievementType, string> = {
  standout_game: 'Partido destacado',
  video_highlight: 'Video destacado',
  new_team: 'Fichaje',
  award: 'Logro personal',
  milestone: 'Hito personal',
  qualification: 'Clasificación',
  championship: 'Campeonato',
  promotion: 'Ascenso',
  signing: 'Fichaje',
};

export const TEAM_ONLY_ACHIEVEMENT_TYPE_LABELS: Record<TeamOnlyAchievementType, string> = {
  team_milestone: 'Hito del equipo',
  team_achievement: 'Logro de equipo',
};

/** Every `achievement_type` label — for feeds (e.g. "Comunidad") that show any owner's achievements. */
export const ALL_ACHIEVEMENT_TYPE_LABELS: Record<AchievementType, string> = {
  ...ACHIEVEMENT_TYPE_LABELS,
  ...TEAM_ONLY_ACHIEVEMENT_TYPE_LABELS,
};

/** `highlight_achievements.owner_type` filter labels, plus the `all` sentinel for "no filter". */
export const ACHIEVEMENT_OWNER_FILTER_LABELS: Record<string, string> = {
  all: 'Todos',
  player_profile: 'Jugadores',
  staff: 'Staff',
  team: 'Equipos',
  representative: 'Representantes',
};

export const ACHIEVEMENT_STATUSES = ['draft', 'pending_review', 'published', 'rejected', 'archived', 'hidden'] as const;
export type AchievementStatus = (typeof ACHIEVEMENT_STATUSES)[number];

/**
 * The semantic color families both apps' real designs already agree on
 * (confirmed against web's `ACHIEVEMENT_TYPE_LABEL_COLOR` Tailwind classes
 * and mobile's now-removed hex map — every value below matched exactly
 * before this refactor, e.g. web's `text-amber-400` === mobile's `#FBBF24`).
 * `brand` is the one non-Tailwind-family token: DraftReal's own orange
 * (web's `text-primary`, mobile's `colors.primary`), not a generic shade.
 */
export const ACHIEVEMENT_COLOR_TOKENS = [
  'amber',
  'brand',
  'blue',
  'emerald',
  'purple',
  'cyan',
  'teal',
  'orange',
  'pink',
  'yellow',
  'indigo',
] as const;
export type AchievementColorToken = (typeof ACHIEVEMENT_COLOR_TOKENS)[number];

export const ACHIEVEMENT_TYPE_COLOR_TOKEN: Record<AchievementType, AchievementColorToken> = {
  championship: 'amber',
  award: 'brand',
  milestone: 'blue',
  standout_game: 'emerald',
  video_highlight: 'purple',
  new_team: 'cyan',
  qualification: 'teal',
  promotion: 'orange',
  signing: 'pink',
  team_milestone: 'yellow',
  team_achievement: 'indigo',
};

/**
 * `ACHIEVEMENT_TYPE_COLOR_TOKEN[type]`, or `undefined` for a type not in the
 * map (an unrecognized/legacy DB value). Each app picks its own fallback
 * visual for that case — this package has no opinion on what "default"
 * looks like.
 */
export function achievementColorToken(type: string): AchievementColorToken | undefined {
  return (ACHIEVEMENT_TYPE_COLOR_TOKEN as Record<string, AchievementColorToken>)[type];
}
