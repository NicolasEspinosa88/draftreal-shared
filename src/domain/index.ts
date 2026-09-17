/**
 * Domain enums shared between DraftReal Web (`src/lib/player.ts`,
 * `src/lib/player-profile-options.ts`, `src/lib/staff-profile.ts`) and
 * DraftReal Mobile (`lib/profile-validation.ts`, `types/profile.ts`).
 *
 * These are the literal column values stored in Supabase — not display
 * labels (see `@draftreal/shared/achievements` for label maps) and not
 * authorization rules (visibility/consent/minors stay server-side, see
 * README "What this package is not").
 *
 * Confirmed identical against both repos' real source as of M4.8 (2026-09-17):
 * no divergence found in values, only duplication.
 */

// ---------------------------------------------------------------------------
// Player
// ---------------------------------------------------------------------------

export const PLAYER_POSITIONS = ['pg', 'sg', 'sf', 'pf', 'c'] as const;
export type PlayerPosition = (typeof PLAYER_POSITIONS)[number];

export const PLAYER_AVAILABILITY_STATUSES = ['available', 'open_to_offers', 'not_available'] as const;
export type PlayerAvailabilityStatus = (typeof PLAYER_AVAILABILITY_STATUSES)[number];

export const EXPERIENCE_LEVELS = ['formative', 'amateur', 'semi_professional', 'professional'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const DOMINANT_HANDS = ['right', 'left', 'ambidextrous'] as const;
export type DominantHand = (typeof DOMINANT_HANDS)[number];

export const PLAYER_GENDERS = ['male', 'female'] as const;
export type PlayerGender = (typeof PLAYER_GENDERS)[number];

// ---------------------------------------------------------------------------
// Staff
// ---------------------------------------------------------------------------

export const STAFF_PRIMARY_ROLES = [
  'coach',
  'assistant_coach',
  'physical_trainer',
  'scout_recruiter',
  'sports_manager',
  'sports_psychologist',
  'kinesiologist',
  'nutritionist',
  'video_analyst',
  'other',
] as const;
export type StaffPrimaryRole = (typeof STAFF_PRIMARY_ROLES)[number];

export const STAFF_GENDER_BRANCHES = ['male', 'female', 'both'] as const;
export type StaffGenderBranch = (typeof STAFF_GENDER_BRANCHES)[number];

export const STAFF_LEVELS = ['youth', 'amateur', 'semi_professional', 'professional', 'high_performance'] as const;
export type StaffLevel = (typeof STAFF_LEVELS)[number];

export const STAFF_EMPLOYMENT_STATUSES = [
  'actively_looking',
  'open_to_offers',
  'currently_working_open',
  'not_available',
] as const;
export type StaffEmploymentStatus = (typeof STAFF_EMPLOYMENT_STATUSES)[number];

export const STAFF_SPECIALTIES = [
  'player_development',
  'team_direction',
  'scouting',
  'physical_prep',
  'sports_management',
  'individual_development',
  'training_planning',
  'game_analysis',
  'formative_divisions',
  'other',
] as const;
export type StaffSpecialty = (typeof STAFF_SPECIALTIES)[number];

// ---------------------------------------------------------------------------
// Team roster role (distinct enum: a person's role *within a specific team*,
// not their own staff-profile primaryRole — confirmed as two separate real
// domains, `team_staff_members.role` vs `staff_profiles.primary_role`, not
// duplicates of each other)
// ---------------------------------------------------------------------------

export const TEAM_STAFF_MEMBER_ROLES = [
  'head_coach',
  'assistant_coach',
  'physical_trainer',
  'scout',
  'sports_manager',
  'team_manager',
  'other',
] as const;
export type TeamStaffMemberRole = (typeof TEAM_STAFF_MEMBER_ROLES)[number];

/** Runtime guard — use at Supabase-row boundaries where the column is typed `string`. */
export function isPlayerPosition(value: string): value is PlayerPosition {
  return (PLAYER_POSITIONS as readonly string[]).includes(value);
}

export function isStaffPrimaryRole(value: string): value is StaffPrimaryRole {
  return (STAFF_PRIMARY_ROLES as readonly string[]).includes(value);
}

// ---------------------------------------------------------------------------
// Spanish display labels — mirrors DraftReal Web's `src/i18n/locales/es/enums.json`
// verbatim. Neither app has real i18n infrastructure sharing a common runtime
// (web uses i18next, mobile has none yet — see mobile README), so this is the
// plain Spanish string, not a translation key. If/when either app adds a
// second locale, these become the `es` values behind proper i18n keys instead
// of being replaced.
// ---------------------------------------------------------------------------

export const POSITION_LABELS: Record<PlayerPosition, string> = {
  pg: 'Base',
  sg: 'Escolta',
  sf: 'Alero',
  pf: 'Ala-pívot',
  c: 'Pívot',
};

export const EXPERIENCE_LEVEL_LABELS: Record<ExperienceLevel, string> = {
  formative: 'Formativo',
  amateur: 'Amateur',
  semi_professional: 'Semiprofesional',
  professional: 'Profesional',
};

export const AVAILABILITY_LABELS: Record<PlayerAvailabilityStatus, string> = {
  available: 'Disponible',
  open_to_offers: 'Abierto a ofertas',
  not_available: 'No disponible',
};

export const DOMINANT_HAND_LABELS: Record<DominantHand, string> = {
  right: 'Derecha',
  left: 'Izquierda',
  ambidextrous: 'Ambidiestro',
};

export const GENDER_LABELS: Record<string, string> = {
  male: 'Masculino',
  female: 'Femenino',
  both: 'Ambas',
};

export const STAFF_ROLE_LABELS: Record<StaffPrimaryRole, string> = {
  coach: 'Entrenador',
  assistant_coach: 'Asistente técnico',
  physical_trainer: 'Preparador/a físico',
  scout_recruiter: 'Scout / reclutador',
  sports_manager: 'Manager deportivo',
  sports_psychologist: 'Psicólogo/a deportivo',
  kinesiologist: 'Kinesiólogo/a',
  nutritionist: 'Nutricionista deportivo',
  video_analyst: 'Analista de video',
  other: 'Otro',
};

export const STAFF_LEVEL_LABELS: Record<StaffLevel, string> = {
  youth: 'Formativo',
  amateur: 'Amateur',
  semi_professional: 'Semiprofesional',
  professional: 'Profesional',
  high_performance: 'Alto rendimiento',
};

export const STAFF_GENDER_BRANCH_LABELS: Record<StaffGenderBranch, string> = {
  male: 'Masculino',
  female: 'Femenino',
  both: 'Ambas',
};

export const STAFF_EMPLOYMENT_STATUS_LABELS: Record<StaffEmploymentStatus, string> = {
  actively_looking: 'Buscando club activamente',
  open_to_offers: 'Abierto/a a escuchar propuestas',
  currently_working_open: 'Actualmente trabajando, pero abierto/a a propuestas',
  not_available: 'No disponible por el momento',
};

export const STAFF_SPECIALTY_LABELS: Record<StaffSpecialty, string> = {
  player_development: 'Formación de jugadores',
  team_direction: 'Dirección de equipo',
  scouting: 'Scouting',
  physical_prep: 'Preparación física',
  sports_management: 'Gestión deportiva',
  individual_development: 'Desarrollo individual',
  training_planning: 'Planificación de entrenamientos',
  game_analysis: 'Análisis de juego',
  formative_divisions: 'Trabajo con divisiones formativas',
  other: 'Otro',
};

export const TEAM_STAFF_MEMBER_ROLE_LABELS: Record<TeamStaffMemberRole, string> = {
  head_coach: 'Entrenador principal',
  assistant_coach: 'Asistente técnico',
  physical_trainer: 'Preparador físico',
  scout: 'Scout',
  sports_manager: 'Manager deportivo',
  team_manager: 'Coordinador / Manager del equipo',
  other: 'Otro',
};

export const TEAM_VERIFICATION_LABELS: Record<string, string> = {
  unverified: 'No verificado',
  pending: 'Validación pendiente',
  verified: 'Equipo verificado',
  rejected: 'Validación rechazada',
};

export const REPRESENTATIVE_VERIFICATION_LABELS: Record<string, string> = {
  pending: 'Verificación pendiente',
  verified: 'Representante verificado',
  needs_changes: 'Necesita cambios',
  rejected: 'Solicitud rechazada',
  suspended: 'Suspendido',
};

export const CONTACT_EMAIL_VISIBILITY_LABELS: Record<string, string> = {
  private: 'Privado (solo vos)',
  authenticated: 'Usuarios de DraftReal',
  public: 'Público',
};

/** Falls back to the raw value if there's no label for it (never throws on an unknown/legacy value). */
export function labelFor(map: Record<string, string>, value: string | null | undefined): string | null {
  if (!value) return null;
  return map[value] ?? value;
}

/** `{ label, value }[]` for a select/dropdown component, in the label map's own key order. */
export function optionsFromLabels(map: Record<string, string>): { value: string; label: string }[] {
  return Object.entries(map).map(([value, label]) => ({ value, label }));
}
