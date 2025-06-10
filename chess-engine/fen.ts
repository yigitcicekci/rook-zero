import { Board, GameState, Piece, PieceColor, PieceType } from './types';

// const PIECE_CHAR_TO_TYPE: Record<string, PieceType> = {
//   [ChessConfig.PIECE_CHARS.PAWN]: PieceType.PAWN,
//   [ChessConfig.PIECE_CHARS.KNIGHT]: PieceType.KNIGHT,
//   [ChessConfig.PIECE_CHARS.BISHOP]: PieceType.BISHOP,
//   [ChessConfig.PIECE_CHARS.ROOK]: PieceType.ROOK,
//   [ChessConfig.PIECE_CHARS.QUEEN]: PieceType.QUEEN,
//   [ChessConfig.PIECE_CHARS.KING]: PieceType.KING,
// };

// const TYPE_TO_PIECE_CHAR: Record<PieceType, string> = {
//   [PieceType.PAWN]: ChessConfig.PIECE_CHARS.PAWN,
//   [PieceType.KNIGHT]: ChessConfig.PIECE_CHARS.KNIGHT,
//   [PieceType.BISHOP]: ChessConfig.PIECE_CHARS.BISHOP,
//   [PieceType.ROOK]: ChessConfig.PIECE_CHARS.ROOK,
//   [PieceType.QUEEN]: ChessConfig.PIECE_CHARS.QUEEN,
//   [PieceType.KING]: ChessConfig.PIECE_CHARS.KING,
// };

// const FEN_PATTERNS = {
//   PIECE_CHARS: 'pnbrqkPNBRQK',
//   CASTLING: /^[KQkq-]+$/,
//   EN_PASSANT: /^([a-h][36]|[0-7][25]|-)$/,
//   MOVE_COORDS: /^[0-7]{4}$/,
// } as const;

export function parseFEN(fen: string) {
  const parts = fen.trim().split(' ');
  const board = parseBoard(parts[0], fen);
  const activeColor = parts[1] === 'w' ? PieceColor.WHITE : PieceColor.BLACK;
  const castlingRights = parts[2];
  const enPassant = parts[3];
  const halfMoves = parseInt(parts[4], 10);
  const fullMoves = parseInt(parts[5], 10);
  const moveCoords = parts[6] || undefined;
  const gameState: GameState = {
    activeColor,
    halfMoves,
    fullMoves,
    castlingRights,
    enPassant,
    moveCoords
  };
  return { board, gameState };
}

export function validateFEN(fen: string) {
  const parts = fen.trim().split(' ');
  if (parts.length < 6) return false;
  return true;
}

export function generateFEN(board: Board, gameState: GameState) {
  const boardPart = generateBoard(board.pieces);
  const color = gameState.activeColor === PieceColor.WHITE ? 'w' : 'b';
  const castling = gameState.castlingRights;
  const enPassant = gameState.enPassant;
  const halfMoves = gameState.halfMoves;
  const fullMoves = gameState.fullMoves;
  const moveCoords = gameState.moveCoords ? ` ${gameState.moveCoords}` : '';
  return `${boardPart} ${color} ${castling} ${enPassant} ${halfMoves} ${fullMoves}${moveCoords}`;
}

function parseBoard(boardString: string, fen: string): Board {
  const rows = boardString.split('/');
  const pieces: Piece[] = [];
  for (let row = 0; row < 8; row++) {
    let col = 0;
    for (const char of rows[row]) {
      if (isNaN(Number(char))) {
        const color = char === char.toUpperCase() ? PieceColor.WHITE : PieceColor.BLACK;
        const type = getPieceType(char.toLowerCase());
        pieces.push({ type, color, position: { row, col } });
        col++;
      } else {
        col += Number(char);
      }
    }
  }
  return { pieces, fen };
}

function generateBoard(pieces: Piece[]): string {
  let board = '';
  for (let row = 0; row < 8; row++) {
    let empty = 0;
    for (let col = 0; col < 8; col++) {
      const piece = pieces.find(p => p.position.row === row && p.position.col === col);
      if (piece) {
        if (empty > 0) {
          board += empty;
          empty = 0;
        }
        let symbol = '';
        switch (piece.type) {
          case PieceType.PAWN:
            symbol = 'p';
            break;
          case PieceType.KNIGHT:
            symbol = 'n';
            break;
          case PieceType.BISHOP:
            symbol = 'b';
            break;
          case PieceType.ROOK:
            symbol = 'r';
            break;
          case PieceType.QUEEN:
            symbol = 'q';
            break;
          case PieceType.KING:
            symbol = 'k';
            break;
        }
        board += piece.color === PieceColor.WHITE ? symbol.toUpperCase() : symbol;
      } else {
        empty++;
      }
    }
    if (empty > 0) {
      board += empty;
    }
    if (row < 7) {
      board += '/';
    }
  }
  return board;
}

function getPieceType(char: string): PieceType {
  switch (char) {
    case 'p':
      return PieceType.PAWN;
    case 'n':
      return PieceType.KNIGHT;
    case 'b':
      return PieceType.BISHOP;
    case 'r':
      return PieceType.ROOK;
    case 'q':
      return PieceType.QUEEN;
    case 'k':
      return PieceType.KING;
    default:
      throw new Error('Unknown piece type');
  }
}

// const parsePosition = (position: string): Board => {
//   const rows = position.split('/');
//   const pieces: Piece[] = [];

//   rows.forEach((row, rowIndex) => {
//     let colIndex = 0;
    
//     for (const char of row) {
//       if (isDigit(char)) {
//         colIndex += parseInt(char);
//       } else {
//         const pieceColor = char === char.toUpperCase() ? PieceColor.WHITE : PieceColor.BLACK;
//         const pieceType = PIECE_CHAR_TO_TYPE[char.toLowerCase()];
        
//         pieces.push({
//           type: pieceType,
//           color: pieceColor,
//           position: { row: rowIndex, col: colIndex }
//         });
//         colIndex++;
//       }
//     }
//   });

//   return { pieces, fen: position };
// };

// const compressRow = (row: (string | null)[]): string => {
//   let result = '';
//   let emptyCount = 0;
  
//   for (const cell of row) {
//     if (cell === null) {
//       emptyCount++;
//     } else {
//       if (emptyCount > 0) {
//         result += emptyCount.toString();
//         emptyCount = 0;
//       }
//       result += cell;
//     }
//   }
  
//   if (emptyCount > 0) {
//     result += emptyCount.toString();
//   }
  
//   return result;
// };

// const generatePositionString = (board: Board): string => {
//   const grid: (string | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

//   board.pieces.forEach(piece => {
//     const char = TYPE_TO_PIECE_CHAR[piece.type];
//     grid[piece.position.row][piece.position.col] = 
//       piece.color === PieceColor.WHITE ? char.toUpperCase() : char;
//   });
  
//   return grid.map(row => compressRow(row)).join('/');
// };

// const isDigit = (char: string): boolean => {
//   return !isNaN(parseInt(char));
// };