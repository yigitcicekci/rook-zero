import { isValidMove as bishopMoveCheck, anomalyScore as bishopRiskScore } from './pieces/bishop/bishop';
import { isValidMove as rookMoveCheck, anomalyScore as rookRiskScore } from './pieces/rook/rook';
import { isValidMove as queenMoveCheck, anomalyScore as queenRiskScore } from './pieces/queen/queen';
import { isValidMove as kingMoveCheck, anomalyScore as kingRiskScore } from './pieces/king/king';
import { isValidMove as pawnMoveCheck, anomalyScore as pawnRiskScore } from './pieces/pawn/pawn';
import { isValidMove as knightMoveCheck, anomalyScore as knightRiskScore } from './pieces/knight/knight';

export enum PieceType {
  PAWN = 'p',
  KNIGHT = 'n',
  BISHOP = 'b',
  ROOK = 'r',
  QUEEN = 'q',
  KING = 'k'
}

export enum PieceColor {
  WHITE = 'w',
  BLACK = 'b'
}

export interface Position {
  row: number;
  col: number;
}

export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: Position;
}

export interface Board {
  pieces: Piece[];
  fen: string;
  moveCoords?: string;
  enPassant?: string;
}

export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  isCapture: boolean;
  isCastling?: boolean;
  isEnPassant?: boolean;
  isPromotion?: boolean;
  promotionPiece?: PieceType;
}

export interface MoveValidationResult {
  valid: boolean;
  error?: string;
  riskScore?: number;
}

export interface GameState {
  activeColor: PieceColor;
  halfMoves: number;
  fullMoves: number;
  castlingRights: string;
  enPassant: string;
  moveCoords?: string;
}

export interface PieceMoveChecker {
  validate: (board: Board, move: Move) => MoveValidationResult;
  risk?: (board: Board, move: Move) => number;
}

export const PIECE_VALIDATORS: Record<PieceType, PieceMoveChecker> = {
  [PieceType.PAWN]: {
    validate: pawnMoveCheck,
    risk: pawnRiskScore
  },
  [PieceType.KNIGHT]: {
    validate: knightMoveCheck,
    risk: knightRiskScore
  },
  [PieceType.BISHOP]: {
    validate: bishopMoveCheck,
    risk: bishopRiskScore
  },
  [PieceType.ROOK]: {
    validate: rookMoveCheck,
    risk: rookRiskScore
  },
  [PieceType.QUEEN]: {
    validate: queenMoveCheck,
    risk: queenRiskScore
  },
  [PieceType.KING]: {
    validate: kingMoveCheck,
    risk: kingRiskScore
  }
};