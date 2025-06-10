import { Board, Move, MoveValidationResult, Position } from '../../types';
import { findPiece, underAttack } from '../../utils';

const KNIGHT_MOVES = [
  { row: -2, col: -1 },
  { row: -2, col: 1 },
  { row: -1, col: -2 },
  { row: -1, col: 2 },
  { row: 1, col: -2 },
  { row: 1, col: 2 },
  { row: 2, col: -1 },
  { row: 2, col: 1 }
];

export const isValidMove = (board: Board, move: Move): MoveValidationResult => {
  const { from, to } = move;
  
  // Check if target position is within board boundaries
  if (to.row < 0 || to.row > 7 || to.col < 0 || to.col > 7) {
    return { valid: false, error: 'Invalid movement pattern' };
  }
  
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  const isValidKnightMove = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  
  if (!isValidKnightMove) {
    return { valid: false, error: 'Invalid movement pattern' };
  }
  
  const targetPiece = findPiece(board, to);
  if (targetPiece && targetPiece.color === move.piece.color) {
    return { valid: false, error: 'Invalid movement pattern' };
  }

  return { valid: true };
};

export const anomalyScore = (board: Board, move: Move): number => {
  let score = 0;
  
  const isEdge = move.to.row === 0 || move.to.row === 7 || move.to.col === 0 || move.to.col === 7;
  const isCorner = (move.to.row === 0 || move.to.row === 7) && (move.to.col === 0 || move.to.col === 7);
  
  if (isCorner && !move.isCapture) {
    score += 0.4;
  } else if (isEdge && !move.isCapture && !underAttack(board, move.to)) {
    score += 0.2;
  }

  const fromCenter = Math.abs(move.from.row - 3.5) + Math.abs(move.from.col - 3.5);
  const toCenter = Math.abs(move.to.row - 3.5) + Math.abs(move.to.col - 3.5);
  
  if (toCenter > fromCenter && !move.isCapture && !underAttack(board, move.to)) {
    score += 0.1;
  }
  
  return score;
};

export const moves = (board: Board, position: Position): Position[] => {
  const result: Position[] = [];
  const piece = findPiece(board, position);
  
  if (!piece) return result;

  for (const knightMove of KNIGHT_MOVES) {
    const newRow = position.row + knightMove.row;
    const newCol = position.col + knightMove.col;
    
    if (newRow >= 0 && newRow <= 7 && newCol >= 0 && newCol <= 7) {
      const newPos: Position = { row: newRow, col: newCol };
      const targetPiece = findPiece(board, newPos);
      
      if (!targetPiece || targetPiece.color !== piece.color) {
        result.push(newPos);
      }
    }
  }

  return result;
};