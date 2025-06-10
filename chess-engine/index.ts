export * from './engine';
export * from './types';
export * from './fen';
export * from './utils';

import { ChessEngine } from './engine';
import { Board, Move, MoveValidationResult, Piece, PieceColor, PieceType, Position, GameState } from './types';
import { parseFEN, validateFEN, generateFEN } from './fen';
import { ChessConfig } from './config';

export const fen = {
  parse: parseFEN,
  validate: validateFEN,
  generate: generateFEN
};

class ExtendedChessEngine extends ChessEngine {
  static parseFEN = parseFEN;
  static validateFEN = validateFEN;
  static generateFEN = generateFEN;
  static config = ChessConfig;
  static fen = fen;
}

export default ExtendedChessEngine;

export {
  Board,
  Move,
  MoveValidationResult,
  Piece,
  PieceColor,
  PieceType,
  Position,
  GameState,
  ChessEngine,
  parseFEN,
  validateFEN,
  generateFEN
};

export const chessengine = {
  Engine: ExtendedChessEngine,
  fen: fen,
  types: {
    PieceType,
    PieceColor
  }
};