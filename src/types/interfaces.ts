import type {
  ChessResult,
  Color,
  EloResult,
  EloScore,
  GameOutcomeKind,
  MoveValidationFailureReason,
  PieceType,
  PositionValidationFailureReason,
  PromotionPiece,
  Square
} from './primitives';

export interface MoveInput {
  from: Square;
  to: Square;
  promotion?: PromotionPiece;
}

export interface MoveListOptions {
  square?: Square;
  verbose?: boolean;
}

export interface HistoryOptions {
  verbose?: boolean;
}

export interface EloExpectedScoreOptions {
  ratingDifferenceCap?: number | null;
}

export interface EloChangeInput extends EloExpectedScoreOptions {
  rating: number;
  opponentRating: number;
  score: EloScore | EloResult;
  kFactor: number;
  round?: boolean;
}

export interface EloChange {
  rating: number;
  opponentRating: number;
  score: EloScore;
  expectedScore: number;
  kFactor: number;
  delta: number;
  newRating: number;
}

export interface EloMatchInput extends EloExpectedScoreOptions {
  whiteRating: number;
  blackRating: number;
  result: ChessResult;
  whiteKFactor: number;
  blackKFactor: number;
  round?: boolean;
}

export interface EloMatchResult {
  result: ChessResult;
  white: EloChange;
  black: EloChange;
}

export interface FideKFactorInput {
  rating: number;
  gamesPlayed: number;
  age?: number;
  hasReached2400?: boolean;
  gamesInRatingPeriod?: number;
}

export interface GameOutcome {
  kind: GameOutcomeKind;
  winner?: Color;
  draw: boolean;
}

export interface PieceOnSquare {
  square: Square;
  type: PieceType;
  color: Color;
}

export interface LegalMove extends MoveInput {
  san: string;
  uci: string;
  piece: PieceType;
  color: Color;
  captured?: PieceType;
  promotion?: PromotionPiece;
  isCapture: boolean;
  isCheck: boolean;
  isCheckmate: boolean;
  isCastle: boolean;
  isKingsideCastle: boolean;
  isQueensideCastle: boolean;
  isEnPassant: boolean;
  isPromotion: boolean;
}

export type MoveValidationResult =
  | { ok: true; move: LegalMove; san: string; fen: string }
  | { ok: false; reason: MoveValidationFailureReason };

export type PositionValidationResult =
  | { ok: true }
  | { ok: false; reason: PositionValidationFailureReason };
