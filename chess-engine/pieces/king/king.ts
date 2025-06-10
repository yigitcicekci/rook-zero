import { Board, Move, MoveValidationResult, PieceColor, PieceType, Position } from '../../types';
import { findPiece, underAttack, hasObstacle } from '../../utils';

export const isValidMove = (board: Board, move: Move): MoveValidationResult => {
  const { from, to } = move;
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  const isNormal = rowDiff <= 1 && colDiff <= 1;
  const isCastling = move.isCastling && rowDiff === 0 && colDiff === 2;
  
  if (!isNormal && !isCastling) {
    return {
      valid: false,
      error: 'Invalid movement pattern'
    };
  }

  if (isCastling) {
    const castlingResult = checkCastling(board, move);
    if (!castlingResult.valid) {
      return castlingResult;
    }
    return { valid: true };
  }
  
  const targetPiece = findPiece(board, to);
  if (targetPiece && targetPiece.color === move.piece.color) {
    return {
      valid: false,
      error: 'Invalid movement pattern'
    };
  }
  
  if (inCheck(board, move, move.piece.color)) {
    return {
      valid: false,
      error: 'King would be in check after this move'
    };
  }
  
  return {
    valid: true
  };
};

export const anomalyScore = (board: Board, move: Move): number => {
  let score = 0;
  
  if (move.isCastling) {
    const kingPos = move.from;
    const kingColor = findPiece(board, kingPos)?.color;
    if (kingColor === PieceColor.WHITE && kingPos.row !== 7) {
      score += 0.2;
    } else if (kingColor === PieceColor.BLACK && kingPos.row !== 0) {
      score += 0.2;
    }
  }
  if (underAttack(board, move.to)) {
    score += 0.3;
  }
  return score;
};

export const moves = (board: Board, position: Position): Position[] => {
  const result: Position[] = [];
  const directions = [
    { row: -1, col: -1 }, { row: -1, col: 0 }, { row: -1, col: 1 },
    { row: 0, col: -1 }, { row: 0, col: 1 },
    { row: 1, col: -1 }, { row: 1, col: 0 }, { row: 1, col: 1 }
  ];
  for (const dir of directions) {
    const newRow = position.row + dir.row;
    const newCol = position.col + dir.col;
    if (newRow < 0 || newRow > 7 || newCol < 0 || newCol > 7) continue;
    const newPos: Position = { row: newRow, col: newCol };
    const piece = findPiece(board, newPos);
    if (piece) {
      const moving = findPiece(board, position);
      if (moving && piece.color !== moving.color) {
        result.push(newPos);
      }
      continue;
    }
    result.push(newPos);
  }
  result.push(...castlingMoves(board, position));
  return result;
};

export const checkCastling = (board: Board, move: Move): MoveValidationResult => {
  const { from, to } = move;
  
  if (move.piece.color === PieceColor.WHITE && from.row !== 7) {
    return { valid: false, error: 'Invalid castling position' };
  }
  if (move.piece.color === PieceColor.BLACK && from.row !== 0) {
    return { valid: false, error: 'Invalid castling position' };
  }
  if (from.col !== 4) {
    return { valid: false, error: 'Invalid castling position' };
  }
  
  const rowDiff = Math.abs(to.row - from.row);
  const colDiff = Math.abs(to.col - from.col);
  if (rowDiff !== 0 || colDiff !== 2) {
    return { valid: false, error: 'Invalid castling move' };
  }
  
  const king = findPiece(board, from);
  if (!king || king.type !== PieceType.KING) {
    return { valid: false, error: 'No king found at the starting position' };
  }
  
  const isKingside = to.col > from.col;
  const rookCol = isKingside ? 7 : 0;
  const rookPos: Position = { row: from.row, col: rookCol };
  const rook = findPiece(board, rookPos);
  
  if (!rook || rook.type !== PieceType.ROOK || rook.color !== king.color) {
    return { valid: false, error: 'No rook found for castling' };
  }

  let castlingRights: string | undefined;
  
  console.log(`DEBUG CASTLING: board.fen = "${board.fen}"`);
  console.log(`DEBUG CASTLING: board.fen.includes(' ') = ${board.fen && board.fen.includes(' ')}`);
  
  if (board.fen && board.fen.includes(' ')) {
    const fenParts = board.fen.split(' ');
    console.log(`DEBUG CASTLING: FEN parts length = ${fenParts.length}`);
    if (fenParts.length >= 3) {
      castlingRights = fenParts[2];
      console.log(`DEBUG CASTLING: Got castling rights from board.fen: "${castlingRights}"`);
    }
  }
  
  if (!castlingRights && (board as any).gameState) {
    castlingRights = (board as any).gameState.castlingRights;
    console.log(`DEBUG CASTLING: Got castling rights from board.gameState: "${castlingRights}"`);
  }
  
  if (!castlingRights && (board as any).castlingRights) {
    castlingRights = (board as any).castlingRights;
    console.log(`DEBUG CASTLING: Got castling rights from board.castlingRights: "${castlingRights}"`);
  }
  
  if (!castlingRights) {
    console.log(`DEBUG CASTLING: No castling rights found anywhere, using default 'KQkq'`);
    castlingRights = 'KQkq';
  }
  
  const isWhite = king.color === PieceColor.WHITE;
  const requiredRight = isWhite ? (isKingside ? 'K' : 'Q') : (isKingside ? 'k' : 'q');
  
  console.log(`DEBUG: Castling rights: "${castlingRights}", Required: "${requiredRight}"`);
  
  if (!castlingRights || castlingRights === '-' || !castlingRights.includes(requiredRight)) {
    return { valid: false, error: 'Castling rights not available' };
  }
  
  if (hasObstacle(board, from, rookPos)) {
    return { valid: false, error: 'Path between king and rook is blocked' };
  }
  
  if (underAttack(board, from, move.piece.color)) {
    return { valid: false, error: 'Cannot castle while in check' };
  }
  
  const dir = isKingside ? 1 : -1;
  for (let i = 1; i <= 2; i++) {
    const checkPos: Position = { row: from.row, col: from.col + dir * i };
    if (underAttack(board, checkPos, move.piece.color)) {
      return { valid: false, error: 'Cannot castle through or into check' };
    }
  }
  
  return { valid: true };
};

export const castlingMoves = (board: Board, kingPos: Position): Position[] => {
  const result: Position[] = [];
  const king = findPiece(board, kingPos);
  if (!king || king.type !== PieceType.KING) return result;

  let castlingRights: string | undefined;
  
  console.log(`DEBUG CASTLING MOVES: board.fen = "${board.fen}"`);
  
  if (board.fen && board.fen.includes(' ')) {
    const fenParts = board.fen.split(' ');
    if (fenParts.length >= 3) {
      castlingRights = fenParts[2];
      console.log(`DEBUG CASTLING MOVES: Got rights from board.fen: "${castlingRights}"`);
    }
  }
  
  if (!castlingRights && (board as any).gameState) {
    castlingRights = (board as any).gameState.castlingRights;
    console.log(`DEBUG CASTLING MOVES: Got rights from board.gameState: "${castlingRights}"`);
  }
  
  if (!castlingRights && (board as any).castlingRights) {
    castlingRights = (board as any).castlingRights;
    console.log(`DEBUG CASTLING MOVES: Got rights from board.castlingRights: "${castlingRights}"`);
  }
  
  if (!castlingRights) {
    console.log(`DEBUG CASTLING MOVES: No castling rights found, using default 'KQkq'`);
    castlingRights = 'KQkq';
  }
  
  const isWhite = king.color === PieceColor.WHITE;

  if (isWhite && castlingRights.includes('K') || !isWhite && castlingRights.includes('k')) {
    const kingsideRookPos: Position = { row: kingPos.row, col: 7 };
    const kingsideRook = findPiece(board, kingsideRookPos);
    if (kingsideRook && kingsideRook.type === PieceType.ROOK && !hasObstacle(board, kingPos, kingsideRookPos)) {
      result.push({ row: kingPos.row, col: kingPos.col + 2 });
    }
  }

  if (isWhite && castlingRights.includes('Q') || !isWhite && castlingRights.includes('q')) {
    const queensideRookPos: Position = { row: kingPos.row, col: 0 };
    const queensideRook = findPiece(board, queensideRookPos);
    if (queensideRook && queensideRook.type === PieceType.ROOK && !hasObstacle(board, kingPos, queensideRookPos)) {
      result.push({ row: kingPos.row, col: kingPos.col - 2 });
    }
  }

  return result;
};

export const inCheck = (board: Board, move: Move, colorToCheck?: PieceColor): boolean => {
  const { from, to } = move;
  const simulated = { 
    ...board, 
    pieces: board.pieces.map(p => ({ ...p, position: { ...p.position } }))
  };

  const movingIdx = simulated.pieces.findIndex(
    p => p.position.row === from.row && p.position.col === from.col
  );
  if (movingIdx === -1) return false;

  const capturedIdx = simulated.pieces.findIndex(
    p => p.position.row === to.row && p.position.col === to.col
  );
  if (capturedIdx !== -1) {
    simulated.pieces.splice(capturedIdx, 1);
  }

  if (move.isCastling) {
    const kingRow = from.row;
    const kingCol = from.col;
    const dir = to.col > from.col ? 1 : -1;

    if (underAttack(board, from, colorToCheck)) {
      return true;
    }

    for (let col = kingCol + dir; col !== to.col + dir; col += dir) {
      if (underAttack(board, { row: kingRow, col }, colorToCheck)) {
        return true;
      }
    }

    return false;
  }

  simulated.pieces[movingIdx].position = { ...to };

  const kingPos = simulated.pieces[movingIdx].type === PieceType.KING 
    ? to 
    : simulated.pieces.find(
        p => p.type === PieceType.KING && 
        p.color === simulated.pieces[movingIdx].color
      )?.position;
  
  if (!kingPos) return false;
  return underAttack(simulated, kingPos, colorToCheck);
};

 