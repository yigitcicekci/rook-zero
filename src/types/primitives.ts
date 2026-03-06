export const COLORS = ['w', 'b'] as const;
export const PIECE_TYPES = ['p', 'n', 'b', 'r', 'q', 'k'] as const;
export const PROMOTION_PIECES = ['q', 'r', 'b', 'n'] as const;
export const SQUARES = [
  'a8', 'b8', 'c8', 'd8', 'e8', 'f8', 'g8', 'h8',
  'a7', 'b7', 'c7', 'd7', 'e7', 'f7', 'g7', 'h7',
  'a6', 'b6', 'c6', 'd6', 'e6', 'f6', 'g6', 'h6',
  'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'h5',
  'a4', 'b4', 'c4', 'd4', 'e4', 'f4', 'g4', 'h4',
  'a3', 'b3', 'c3', 'd3', 'e3', 'f3', 'g3', 'h3',
  'a2', 'b2', 'c2', 'd2', 'e2', 'f2', 'g2', 'h2',
  'a1', 'b1', 'c1', 'd1', 'e1', 'f1', 'g1', 'h1'
] as const;

export type Color = typeof COLORS[number];
export type PieceType = typeof PIECE_TYPES[number];
export type PromotionPiece = typeof PROMOTION_PIECES[number];
export type Square = typeof SQUARES[number];

export type EloScore = 0 | 0.5 | 1;
export type EloResult = 'win' | 'draw' | 'loss';
export type ChessResult = '1-0' | '0-1' | '1/2-1/2';

export type MoveValidationFailureReason =
  | 'invalid-format'
  | 'invalid-source-square'
  | 'invalid-target-square'
  | 'no-piece'
  | 'wrong-turn'
  | 'illegal-piece-move'
  | 'path-blocked'
  | 'king-in-check'
  | 'illegal-castling'
  | 'illegal-en-passant'
  | 'illegal-promotion'
  | 'game-over';

export type PositionValidationFailureReason =
  | 'invalid-fen'
  | 'missing-king'
  | 'too-many-kings'
  | 'invalid-side-to-move'
  | 'invalid-castling-rights'
  | 'invalid-en-passant-square'
  | 'too-many-pieces'
  | 'illegal-check-state'
  | 'illegal-pawn-placement';

export type GameOutcomeKind =
  | 'ongoing'
  | 'checkmate'
  | 'stalemate'
  | 'fivefold-repetition'
  | 'threefold-repetition'
  | 'insufficient-material'
  | 'seventy-five-move-rule'
  | 'fifty-move-rule';
