import { ChessConfig } from '../chess-engine/config';
import { generateFEN, parseFEN, validateFEN } from '../chess-engine/fen';

export { ChessEngine } from '../chess-engine/engine';
export { ChessConfig, DEFAULT_INCREMENT, DEFAULT_TIME_LIMIT } from '../chess-engine/config';
export { generateFEN, parseFEN, validateFEN } from '../chess-engine/fen';
export { findPiece, hasObstacle, underAttack } from '../chess-engine/utils';
export { PieceColor, PieceType } from '../chess-engine/types';
export type {
  Board,
  FlaggedMove,
  GameOverReason,
  GameOverResult,
  GameState,
  Move,
  MoveValidationResult,
  Piece,
  PieceMoveChecker,
  Position
} from '../chess-engine/types';

export const DEFAULT_FEN = ChessConfig.DEFAULT_FEN;

export const fen = {
  parse: parseFEN,
  validate: validateFEN,
  generate: generateFEN
};
