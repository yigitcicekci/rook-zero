import type {
  ChessResult,
  EloChange,
  EloChangeInput,
  EloExpectedScoreOptions,
  EloMatchInput,
  EloMatchResult,
  EloResult,
  EloScore,
  FideKFactorInput
} from '../types';

function assertFiniteNumber(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new TypeError(`${name} must be a finite number`);
  }
}

function calculateExpectedScoreUnchecked(
  rating: number,
  opponentRating: number,
  options: EloExpectedScoreOptions = {}
): number {
  const difference = clampRatingDifference(opponentRating - rating, options.ratingDifferenceCap ?? 400);
  return 1 / (1 + 10 ** (difference / 400));
}

function clampRatingDifference(difference: number, cap: number | null | undefined): number {
  if (cap == null) {
    return difference;
  }
  return Math.max(-cap, Math.min(cap, difference));
}

function normalizeScore(score: EloScore | EloResult): EloScore {
  if (score === 0 || score === 0.5 || score === 1) {
    return score;
  }

  if (score === 'win') {
    return 1;
  }
  if (score === 'draw') {
    return 0.5;
  }
  return 0;
}

function resultToScores(result: ChessResult): { white: EloScore; black: EloScore } {
  if (result === '1-0') {
    return { white: 1, black: 0 };
  }
  if (result === '0-1') {
    return { white: 0, black: 1 };
  }
  return { white: 0.5, black: 0.5 };
}

export function roundEloChange(value: number): number {
  assertFiniteNumber('value', value);
  return value < 0 ? -Math.round(Math.abs(value)) : Math.round(value);
}

export function calculateExpectedScore(
  rating: number,
  opponentRating: number,
  options: EloExpectedScoreOptions = {}
): number {
  assertFiniteNumber('rating', rating);
  assertFiniteNumber('opponentRating', opponentRating);
  return calculateExpectedScoreUnchecked(rating, opponentRating, options);
}

export function calculateEloChange(input: EloChangeInput): EloChange {
  assertFiniteNumber('rating', input.rating);
  assertFiniteNumber('opponentRating', input.opponentRating);
  assertFiniteNumber('kFactor', input.kFactor);

  const score = normalizeScore(input.score);
  const expectedScore = calculateExpectedScoreUnchecked(input.rating, input.opponentRating, input);
  const rawDelta = input.kFactor * (score - expectedScore);
  const delta = input.round ? roundEloChange(rawDelta) : rawDelta;

  return {
    rating: input.rating,
    opponentRating: input.opponentRating,
    score,
    expectedScore,
    kFactor: input.kFactor,
    delta,
    newRating: input.rating + delta
  };
}

export function calculateMatchElo(input: EloMatchInput): EloMatchResult {
  const scores = resultToScores(input.result);

  return {
    result: input.result,
    white: calculateEloChange({
      rating: input.whiteRating,
      opponentRating: input.blackRating,
      score: scores.white,
      kFactor: input.whiteKFactor,
      ratingDifferenceCap: input.ratingDifferenceCap,
      round: input.round
    }),
    black: calculateEloChange({
      rating: input.blackRating,
      opponentRating: input.whiteRating,
      score: scores.black,
      kFactor: input.blackKFactor,
      ratingDifferenceCap: input.ratingDifferenceCap,
      round: input.round
    })
  };
}

export function getFideKFactor(input: FideKFactorInput): number {
  assertFiniteNumber('rating', input.rating);
  assertFiniteNumber('gamesPlayed', input.gamesPlayed);

  if (input.age != null) {
    assertFiniteNumber('age', input.age);
  }
  if (input.gamesInRatingPeriod != null) {
    assertFiniteNumber('gamesInRatingPeriod', input.gamesInRatingPeriod);
  }

  const reached2400 = input.hasReached2400 ?? input.rating >= 2400;
  const isJuniorUnder2300 = input.age != null && input.age <= 18 && input.rating < 2300;

  let kFactor = 20;
  if (input.gamesPlayed < 30 || isJuniorUnder2300) {
    kFactor = 40;
  } else if (reached2400) {
    kFactor = 10;
  } else if (input.rating < 2400) {
    kFactor = 20;
  } else {
    kFactor = 10;
  }

  const gamesInRatingPeriod = input.gamesInRatingPeriod ?? 1;
  if (gamesInRatingPeriod > 0 && kFactor * gamesInRatingPeriod > 700) {
    return Math.max(1, Math.floor(700 / gamesInRatingPeriod));
  }

  return kFactor;
}
