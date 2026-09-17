/**
 * The 8-axis "Perfil estadístico" radar shown next to the player hero on
 * both web (`src/lib/stats-radar.ts`) and mobile (`lib/stats-radar.ts`,
 * a manual port). Confirmed functionally equivalent between both real
 * implementations as of M4.8 (2026-09-17): same `FIXED_RANGES` levels, same
 * `toFiveScaleContinuous` interpolation. Web's file additionally defines a
 * percentile-based normalization (`normalizeWithPercentile`,
 * `calculatePercentile`) that is never called from `calculateRadarStats` —
 * confirmed dead code, intentionally not ported here.
 *
 * Pure calculation only — no chart library, no SVG/DOM/RN rendering
 * decisions beyond producing a plain polygon point list either platform's
 * own `Svg` component can draw.
 */

export interface PlayerSeasonStatInput {
  games_played: number | null;
  points: number | null;
  rebounds: number | null;
  assists: number | null;
  steals: number | null;
  three_pt_pct: number | null;
  minutes: number | null;
  valuation_per_game: number | null;
  turnovers: number | null;
}

export interface RadarStat {
  label: string;
  rawValue: number | null;
  displayValue: string;
  radarValue: number | null;
  unit: string;
  lowConfidence?: boolean;
}

export interface RadarStatsResult {
  points: RadarStat;
  rebounds: RadarStat;
  assists: RadarStat;
  steals: RadarStat;
  threePointPercentage: RadarStat;
  minutes: RadarStat;
  valuation: RadarStat;
  turnovers: RadarStat;
  hasEnoughData: boolean;
  comparisonNote?: string;
}

const MIN_GAMES_FOR_STATS = 5;

const FIXED_RANGES = {
  points: { levels: [0, 5, 10, 15, 20] },
  rebounds: { levels: [0, 2, 4, 6, 8] },
  assists: { levels: [0, 1, 2.5, 4, 6] },
  steals: { levels: [0, 0.5, 1, 1.5, 2] },
  threePointPct: { levels: [0, 25, 30, 35, 40] },
  minutes: { levels: [0, 10, 20, 28, 35] },
  valuation: { levels: [0, 8, 15, 20, 25] },
  turnovers: { levels: [0, 1.5, 3, 4, 5] },
} as const;

function toFiveScaleContinuous(value: number, levels: readonly number[]): number {
  const maxLevel = levels.length;
  let lowerIdx = 0;
  for (let i = 0; i < levels.length; i++) {
    if (value >= levels[i]) lowerIdx = i;
    else break;
  }
  if (lowerIdx >= levels.length - 1) return maxLevel;
  const lower = levels[lowerIdx];
  const upper = levels[lowerIdx + 1];
  const segment = (value - lower) / (upper - lower);
  return lowerIdx + 1 + segment;
}

function normalize(rawValue: number | null, statType: keyof typeof FIXED_RANGES): number | null {
  if (rawValue == null) return null;
  return toFiveScaleContinuous(rawValue, FIXED_RANGES[statType].levels);
}

function formatStat(value: number | null): string {
  if (value == null) return '—';
  return value.toFixed(1);
}

function emptyRadarStat(label: string, unit: string): RadarStat {
  return { label, rawValue: null, displayValue: '—', radarValue: null, unit };
}

/** Season stat row -> the 8-axis radar (0-5 scale per axis, fixed ranges matching web). */
export function calculateRadarStats(playerStat: PlayerSeasonStatInput | null): RadarStatsResult {
  if (!playerStat) {
    return {
      points: emptyRadarStat('Puntos', 'PTS'),
      rebounds: emptyRadarStat('Rebotes', 'REB'),
      assists: emptyRadarStat('Asistencias', 'AST'),
      steals: emptyRadarStat('Robos', 'ROB'),
      threePointPercentage: emptyRadarStat('% Triples', '3P%'),
      minutes: emptyRadarStat('Minutos', 'MIN'),
      valuation: emptyRadarStat('Valoración', 'VAL'),
      turnovers: emptyRadarStat('Pérdidas', 'PER'),
      hasEnoughData: false,
      comparisonNote: 'Sin datos estadísticos disponibles',
    };
  }

  const gamesPlayed = playerStat.games_played ?? 0;
  const hasEnoughGames = gamesPlayed >= MIN_GAMES_FOR_STATS;

  const rawThreePct =
    playerStat.three_pt_pct != null
      ? playerStat.three_pt_pct <= 1
        ? playerStat.three_pt_pct * 100
        : playerStat.three_pt_pct
      : null;
  const normalizedTurnovers = normalize(playerStat.turnovers, 'turnovers');
  // Fewer turnovers is better, so this axis is inverted — same as web.
  const turnoversRadar = normalizedTurnovers != null ? 6 - normalizedTurnovers : null;

  return {
    points: {
      label: 'Puntos',
      rawValue: playerStat.points,
      displayValue: formatStat(playerStat.points),
      radarValue: normalize(playerStat.points, 'points'),
      unit: 'PTS',
      lowConfidence: !hasEnoughGames,
    },
    rebounds: {
      label: 'Rebotes',
      rawValue: playerStat.rebounds,
      displayValue: formatStat(playerStat.rebounds),
      radarValue: normalize(playerStat.rebounds, 'rebounds'),
      unit: 'REB',
      lowConfidence: !hasEnoughGames,
    },
    assists: {
      label: 'Asistencias',
      rawValue: playerStat.assists,
      displayValue: formatStat(playerStat.assists),
      radarValue: normalize(playerStat.assists, 'assists'),
      unit: 'AST',
      lowConfidence: !hasEnoughGames,
    },
    steals: {
      label: 'Robos',
      rawValue: playerStat.steals,
      displayValue: formatStat(playerStat.steals),
      radarValue: normalize(playerStat.steals, 'steals'),
      unit: 'ROB',
      lowConfidence: !hasEnoughGames,
    },
    threePointPercentage: {
      label: '% Triples',
      rawValue: rawThreePct,
      displayValue: rawThreePct != null ? formatStat(rawThreePct) : '—',
      radarValue: normalize(rawThreePct, 'threePointPct'),
      unit: '3P%',
      lowConfidence: !hasEnoughGames,
    },
    minutes: {
      label: 'Minutos',
      rawValue: playerStat.minutes,
      displayValue: formatStat(playerStat.minutes),
      radarValue: normalize(playerStat.minutes, 'minutes'),
      unit: 'MIN',
      lowConfidence: !hasEnoughGames,
    },
    valuation: {
      label: 'Valoración',
      rawValue: playerStat.valuation_per_game,
      displayValue: formatStat(playerStat.valuation_per_game),
      radarValue: normalize(playerStat.valuation_per_game, 'valuation'),
      unit: 'VAL',
      lowConfidence: !hasEnoughGames,
    },
    turnovers: {
      label: 'Pérdidas',
      rawValue: playerStat.turnovers,
      displayValue: formatStat(playerStat.turnovers),
      radarValue: turnoversRadar,
      unit: 'PER',
      lowConfidence: !hasEnoughGames,
    },
    hasEnoughData: hasEnoughGames,
    comparisonNote: hasEnoughGames
      ? 'Comparación estimada por disponibilidad de datos'
      : 'Datos insuficientes para comparación confiable',
  };
}

export function radarAxes(stats: RadarStatsResult): { label: string; value: number | null; displayValue: string }[] {
  return [
    { label: stats.points.label, value: stats.points.radarValue, displayValue: stats.points.displayValue },
    { label: stats.rebounds.label, value: stats.rebounds.radarValue, displayValue: stats.rebounds.displayValue },
    { label: stats.assists.label, value: stats.assists.radarValue, displayValue: stats.assists.displayValue },
    { label: stats.steals.label, value: stats.steals.radarValue, displayValue: stats.steals.displayValue },
    {
      label: stats.threePointPercentage.label,
      value: stats.threePointPercentage.radarValue,
      displayValue: stats.threePointPercentage.displayValue,
    },
    { label: stats.minutes.label, value: stats.minutes.radarValue, displayValue: stats.minutes.displayValue },
    { label: stats.valuation.label, value: stats.valuation.radarValue, displayValue: stats.valuation.displayValue },
    { label: stats.turnovers.label, value: stats.turnovers.radarValue, displayValue: stats.turnovers.displayValue },
  ];
}

/** SVG polygon "x,y x,y ..." point string for a set of 0-5 axis values, evenly spaced starting from the top. */
export function radarPolygonPoints(values: number[], center: number, radius: number): string {
  return values
    .map((value, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / values.length;
      const scaled = (Math.min(5, Math.max(0, value)) / 5) * radius;
      const x = center + Math.cos(angle) * scaled;
      const y = center + Math.sin(angle) * scaled;
      return `${x},${y}`;
    })
    .join(' ');
}
