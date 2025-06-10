import { Board, Move, MoveValidationResult, Position } from '../../types';
import { findPiece, underAttack, hasObstacle } from '../../utils';

export const isValidMove = (board: Board, move: Move): MoveValidationResult => {
  const { from, to } = move;
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  
  if (rowDiff !== colDiff) {
    return { valid: false, error: 'Invalid movement pattern' };
  }
  
  const targetPiece = findPiece(board, to);
  if (targetPiece && targetPiece.color === move.piece.color) {
    return { valid: false, error: 'Invalid movement pattern' };
  }
  
  if (hasObstacle(board, from, to)) {
    return { valid: false, error: 'Path is blocked' };
  }
  
  return { valid: true };
};

export const anomalyScore = (board: Board, move: Move): number => {
  let score = 0;
  const distance = Math.abs(move.to.row - move.from.row);
  if (distance >= 6) score += 0.1;
  const tactical = move.isCapture || underAttack(board, move.to);
  if (!tactical && distance >= 4) score += 0.2;
  return score;
};

export const moves = (board: Board, position: Position): Position[] => {
  const result: Position[] = [];
  const directions = [
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 1 }
  ];
  for (const dir of directions) {
    for (let i = 1; i <= 7; i++) {
      const newRow = position.row + dir.row * i;
      const newCol = position.col + dir.col * i;
      if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) break;
      const newPos: Position = { row: newRow, col: newCol };
      const piece = findPiece(board, newPos);
      if (piece) {
        const moving = findPiece(board, position);
        if (moving && piece.color !== moving.color) {
          result.push(newPos);
        }
        break;
      }
      result.push(newPos);
    }
  }
  return result;
}; 