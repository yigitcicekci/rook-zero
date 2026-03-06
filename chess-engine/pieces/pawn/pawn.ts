import { Board, Move, MoveValidationResult, PieceType, Position } from '../../types';
import { findPiece } from '../../utils';
import { PieceColor } from '../../types';

export const isValidMove = (board: Board, move: Move): MoveValidationResult => {
  const { from, to } = move;
  const direction = move.piece.color === PieceColor.WHITE ? -1 : 1;
  const rowDiff = to.row - from.row;
  const colDiff = Math.abs(to.col - from.col);

  if ((move.piece.color === PieceColor.WHITE && rowDiff > 0) ||
      (move.piece.color === PieceColor.BLACK && rowDiff < 0)) {
    return {
      valid: false,
      error: 'Invalid pawn move'
    };
  }

  if (colDiff === 0) {
    if (Math.abs(rowDiff) === 1) {
      const pieceAtTo = findPiece(board, to);
      if (!pieceAtTo) {
        if ((move.piece.color === PieceColor.WHITE && to.row === 0) ||
            (move.piece.color === PieceColor.BLACK && to.row === 7)) {
          move.isPromotion = true;
          if (!move.promotionPiece) {
            move.promotionPiece = PieceType.QUEEN;
          }
        }
        return { valid: true };
      }
    } 

    else if (Math.abs(rowDiff) === 2) {
      const startingRow = move.piece.color === PieceColor.WHITE ? 6 : 1;
      if (from.row === startingRow) {
        const intermediateSquare = {
          row: from.row + direction,
          col: from.col
        };
        if (!findPiece(board, intermediateSquare) && !findPiece(board, to)) {
          return { valid: true };
        }
      }
    }
  }

  else if (colDiff === 1 && Math.abs(rowDiff) === 1) {
    const targetPiece = findPiece(board, to);

    if (targetPiece && targetPiece.color !== move.piece.color) {
      move.isCapture = true;
      return { valid: true };
    }

    if (board.enPassant && board.enPassant !== '-') {
      const [file, rank] = board.enPassant.split('');
      const epCol = file.charCodeAt(0) - 'a'.charCodeAt(0);
      const epRow = 8 - parseInt(rank);
      
      if (to.col === epCol && to.row === epRow) {
        const capturedPawnRow = move.piece.color === PieceColor.WHITE ? 3 : 4;
        const capturedPawn = findPiece(board, { row: capturedPawnRow, col: to.col });
        
        if (capturedPawn && 
            capturedPawn.type === PieceType.PAWN && 
            capturedPawn.color !== move.piece.color) {
          move.isCapture = true;
          move.isEnPassant = true;
          return { valid: true };
        }
      }
    }
  }

  return {
    valid: false,
    error: 'Invalid pawn move'
  };
};

export const anomalyScore = (board: Board, move: Move): number => {
  let score = 0;

  if (move.isEnPassant) {
    score += 0.1;
  }

  const centerFiles = [3, 4]; 
  if (centerFiles.includes(move.from.col) && !centerFiles.includes(move.to.col)) {
    score += 0.1;
  }

  const direction = move.piece.color === 'w' ? -1 : 1;
  let passedPawnCount = 0;
  
  for (let row = move.to.row + direction; row !== (move.piece.color === 'w' ? -1 : 8); row += direction) {
    const piece = findPiece(board, { row, col: move.to.col });
    if (piece && piece.type === PieceType.PAWN && piece.color !== move.piece.color) {
      passedPawnCount++;
    }
  }

  if (passedPawnCount > 1) {
    score += 0.2;
  }

  return score;
};

export const moves = (board: Board, position: Position): Position[] => {
  const result: Position[] = [];
  const piece = findPiece(board, position);
  
  if (!piece) return result;

  const direction = piece.color === PieceColor.WHITE ? -1 : 1;
  const startingRow = piece.color === PieceColor.WHITE ? 6 : 1;
  const oneStepForward = { row: position.row + direction, col: position.col };
  if (oneStepForward.row >= 0 && oneStepForward.row <= 7) {
    if (!findPiece(board, oneStepForward)) {
      result.push(oneStepForward);

      if (position.row === startingRow) {
        const twoStepsForward = { row: position.row + direction * 2, col: position.col };
        if (twoStepsForward.row >= 0 && twoStepsForward.row <= 7 && 
            !findPiece(board, twoStepsForward)) {
          result.push(twoStepsForward);
        }
      }
    }
  }

  const diagonalMoves = [
    { row: position.row + direction, col: position.col - 1 },
    { row: position.row + direction, col: position.col + 1 }
  ];

  for (const diagonalMove of diagonalMoves) {
    if (diagonalMove.row >= 0 && diagonalMove.row <= 7 && 
        diagonalMove.col >= 0 && diagonalMove.col <= 7) {
      const targetPiece = findPiece(board, diagonalMove);
      
      if (targetPiece && targetPiece.color !== piece.color) {
        result.push(diagonalMove);
        continue;
      }

      if (board.enPassant) {
        const [file, rank] = board.enPassant.split('');
        const epCol = file.charCodeAt(0) - 'a'.charCodeAt(0);
        const epRow = 8 - parseInt(rank);
        
        if (diagonalMove.col === epCol && diagonalMove.row === epRow) {
          result.push(diagonalMove);
        }
      }
    }
  }

  return result;
};