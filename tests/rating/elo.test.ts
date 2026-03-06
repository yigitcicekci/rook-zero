import {
  calculateEloChange,
  calculateExpectedScore,
  calculateMatchElo,
  getFideKFactor,
  roundEloChange
} from '../../src';

describe('Elo', () => {
  it('calculates expected score with the standard 400-point cap by default', () => {
    expect(calculateExpectedScore(1600, 1600)).toBeCloseTo(0.5, 5);
    expect(calculateExpectedScore(2000, 2400)).toBeCloseTo(0.09091, 4);
    expect(calculateExpectedScore(2000, 2800)).toBeCloseTo(0.09091, 4);
  });

  it('calculates single-player rating changes with configurable rounding', () => {
    const raw = calculateEloChange({
      rating: 1800,
      opponentRating: 2000,
      score: 'draw',
      kFactor: 20
    });

    expect(raw.expectedScore).toBeCloseTo(0.24025, 4);
    expect(raw.delta).toBeCloseTo(5.19494, 4);
    expect(raw.newRating).toBeCloseTo(1805.19494, 4);

    const rounded = calculateEloChange({
      rating: 1800,
      opponentRating: 2000,
      score: 'draw',
      kFactor: 20,
      round: true
    });

    expect(rounded.delta).toBe(5);
    expect(rounded.newRating).toBe(1805);
    expect(roundEloChange(-5.5)).toBe(-6);
  });

  it('calculates both sides of a chess result', () => {
    const result = calculateMatchElo({
      whiteRating: 1800,
      blackRating: 2000,
      result: '1/2-1/2',
      whiteKFactor: 20,
      blackKFactor: 20,
      round: true
    });

    expect(result.white.delta).toBe(5);
    expect(result.black.delta).toBe(-5);
    expect(result.white.newRating).toBe(1805);
    expect(result.black.newRating).toBe(1995);
  });

  it('derives FIDE-style K-factors for common player profiles', () => {
    expect(getFideKFactor({ rating: 1800, gamesPlayed: 12 })).toBe(40);
    expect(getFideKFactor({ rating: 2200, gamesPlayed: 80, age: 17 })).toBe(40);
    expect(getFideKFactor({ rating: 2300, gamesPlayed: 80, age: 17 })).toBe(20);
    expect(getFideKFactor({ rating: 2399, gamesPlayed: 120 })).toBe(20);
    expect(getFideKFactor({ rating: 2350, gamesPlayed: 300, hasReached2400: true })).toBe(10);
    expect(getFideKFactor({ rating: 2100, gamesPlayed: 12, gamesInRatingPeriod: 20 })).toBe(35);
  });
});
