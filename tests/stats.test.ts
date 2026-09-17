import { describe, expect, it } from 'vitest';
import { calculateRadarStats, radarAxes, radarPolygonPoints, type PlayerSeasonStatInput } from '../src/stats/index.js';

const fullStat: PlayerSeasonStatInput = {
  games_played: 12,
  points: 15,
  rebounds: 6,
  assists: 4,
  steals: 1.5,
  three_pt_pct: 0.38,
  minutes: 28,
  valuation_per_game: 18,
  turnovers: 2,
};

describe('calculateRadarStats', () => {
  it('returns an empty/low-confidence result for null input', () => {
    const result = calculateRadarStats(null);
    expect(result.hasEnoughData).toBe(false);
    expect(result.points.radarValue).toBeNull();
    expect(result.comparisonNote).toBe('Sin datos estadísticos disponibles');
  });

  it('flags lowConfidence when under the 5-game threshold', () => {
    const result = calculateRadarStats({ ...fullStat, games_played: 2 });
    expect(result.hasEnoughData).toBe(false);
    expect(result.points.lowConfidence).toBe(true);
  });

  it('does not flag lowConfidence at/above the 5-game threshold', () => {
    const result = calculateRadarStats({ ...fullStat, games_played: 5 });
    expect(result.hasEnoughData).toBe(true);
    expect(result.points.lowConfidence).toBe(false);
  });

  it('converts a fractional three_pt_pct (<=1) to a percentage', () => {
    const result = calculateRadarStats(fullStat);
    expect(result.threePointPercentage.rawValue).toBeCloseTo(38, 5);
  });

  it('keeps an already-percentage three_pt_pct unchanged', () => {
    const result = calculateRadarStats({ ...fullStat, three_pt_pct: 38 });
    expect(result.threePointPercentage.rawValue).toBeCloseTo(38, 5);
  });

  it('inverts the turnovers axis (fewer turnovers -> higher radar value)', () => {
    const fewer = calculateRadarStats({ ...fullStat, turnovers: 1 });
    const more = calculateRadarStats({ ...fullStat, turnovers: 4 });
    expect(fewer.turnovers.radarValue!).toBeGreaterThan(more.turnovers.radarValue!);
  });

  it('caps the normalized scale at 5 for a value at or above the top fixed-range level', () => {
    const result = calculateRadarStats({ ...fullStat, points: 25 });
    expect(result.points.radarValue).toBe(5);
  });

  it('floors the normalized scale at the bottom fixed-range level', () => {
    const result = calculateRadarStats({ ...fullStat, points: 0 });
    expect(result.points.radarValue).toBe(1);
  });
});

describe('radarAxes', () => {
  it('returns the 8 axes in the fixed display order', () => {
    const axes = radarAxes(calculateRadarStats(fullStat));
    expect(axes.map((a) => a.label)).toEqual([
      'Puntos',
      'Rebotes',
      'Asistencias',
      'Robos',
      '% Triples',
      'Minutos',
      'Valoración',
      'Pérdidas',
    ]);
  });
});

describe('radarPolygonPoints', () => {
  it('produces one "x,y" pair per input value', () => {
    const points = radarPolygonPoints([5, 5, 5, 5], 50, 50);
    expect(points.split(' ')).toHaveLength(4);
  });

  it('places the first axis value straight up from center', () => {
    const points = radarPolygonPoints([5, 0, 0, 0], 50, 50);
    const [firstX, firstY] = points.split(' ')[0].split(',').map(Number);
    expect(firstX).toBeCloseTo(50, 5);
    expect(firstY).toBeCloseTo(0, 5);
  });

  it('clamps out-of-range values into [0, 5] instead of overshooting the radius', () => {
    const clampedHigh = radarPolygonPoints([50], 50, 50);
    const atMax = radarPolygonPoints([5], 50, 50);
    expect(clampedHigh).toBe(atMax);
  });
});
