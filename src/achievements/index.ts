/**
 * Achievement type labels + badge colors — the exact pure mappings web keeps
 * in `src/lib/highlight-achievements.ts` (labels) and
 * `src/lib/achievement-display.ts` (colors), duplicated verbatim (and with
 * risk of silent drift, per its own "keep in sync" comment) in mobile's
 * `constants/labels.ts` before this package existed.
 *
 * Colors are hex, not Tailwind classes: web's originals are Tailwind color
 * tokens (`text-amber-400`, etc.) resolved here to their real hex value so
 * both a DOM `style` and a React Native `style` can consume the same
 * constant. `award` keeps DraftReal's own brand orange (`#E24B03`, web's
 * `text-primary` / `--dr-naranja`) instead of a generic Tailwind shade.
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

/** Default color for a type not present in the map — web's own `text-white` fallback. */
export const ACHIEVEMENT_TYPE_DEFAULT_COLOR = '#ECE6E6';

export const ACHIEVEMENT_TYPE_BADGE_COLORS: Record<AchievementType, string> = {
  championship: '#FBBF24',
  award: '#E24B03',
  milestone: '#60A5FA',
  standout_game: '#34D399',
  video_highlight: '#C084FC',
  new_team: '#22D3EE',
  qualification: '#2DD4BF',
  promotion: '#FB923C',
  signing: '#F472B6',
  team_milestone: '#FACC15',
  team_achievement: '#818CF8',
};

/** `ACHIEVEMENT_TYPE_BADGE_COLORS[type]`, falling back to `ACHIEVEMENT_TYPE_DEFAULT_COLOR` for any unknown/legacy type. */
export function achievementTypeBadgeColor(type: string): string {
  return (ACHIEVEMENT_TYPE_BADGE_COLORS as Record<string, string>)[type] ?? ACHIEVEMENT_TYPE_DEFAULT_COLOR;
}
