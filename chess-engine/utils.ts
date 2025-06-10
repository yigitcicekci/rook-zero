import { Board, Position, Piece, PieceType, PieceColor } from './types';

export function findPiece(board: Board, position: Position): Piece | undefined {
  return board.pieces.find(
    piece => piece.position.row === position.row && piece.position.col === position.col
  );
}

export const underAttack = (board: Board, position: Position, colorToCheck?: PieceColor): boolean => {
  const color = colorToCheck ?? PieceColor.WHITE;
  const attackers = board.pieces.filter(p => p.color !== color);
  for (const attacker of attackers) {
    if (canPieceAttackSquare(board, attacker, position)) {
      return true;
    }
  }
  return false;
};

const canPieceAttackSquare = (board: Board, piece: Piece, position: Position): boolean => {
  const rowDiff = Math.abs(position.row - piece.position.row);
  const colDiff = Math.abs(position.col - piece.position.col);

  switch (piece.type) {
    case PieceType.KING:
      return rowDiff <= 1 && colDiff <= 1;
    case PieceType.QUEEN:
      return (piece.position.row === position.row || 
              piece.position.col === position.col ||
              rowDiff === colDiff) &&
             !hasObstacle(board, piece.position, position);
    case PieceType.ROOK:
      return (piece.position.row === position.row || 
              piece.position.col === position.col) &&
             !hasObstacle(board, piece.position, position);
    case PieceType.BISHOP:
      return rowDiff === colDiff &&
             !hasObstacle(board, piece.position, position);
    case PieceType.KNIGHT:
      return (rowDiff === 2 && colDiff === 1) || 
             (rowDiff === 1 && colDiff === 2);
    case PieceType.PAWN:
      if (piece.color === PieceColor.WHITE) {
        return piece.position.row - 1 === position.row && 
               Math.abs(piece.position.col - position.col) === 1;
      } else {
        return piece.position.row + 1 === position.row && 
               Math.abs(piece.position.col - position.col) === 1;
      }
    default:
      return false;
  }
};

export const hasObstacle = (board: Board, from: Position, to: Position): boolean => {
  const rowDiff = to.row - from.row;
  const colDiff = to.col - from.col;
  const rowDirection = rowDiff === 0 ? 0 : rowDiff > 0 ? 1 : -1;
  const colDirection = colDiff === 0 ? 0 : colDiff > 0 ? 1 : -1;
  const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
  for (let i = 1; i < steps; i++) {
    const checkRow = from.row + rowDirection * i;
    const checkCol = from.col + colDirection * i;
    if (findPiece(board, { row: checkRow, col: checkCol })) {
      return true;
    }
  }
  return false;
}; 