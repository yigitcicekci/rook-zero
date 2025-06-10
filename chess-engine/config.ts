export const ChessConfig = {
  // Board configuration
  BOARD_SIZE: 8,
  DEFAULT_FEN: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  
  // Piece configurations
  PIECE_CHARS: {
    PAWN: 'p',
    KNIGHT: 'n',
    BISHOP: 'b',
    ROOK: 'r',
    QUEEN: 'q',
    KING: 'k'
  },
  
  // FEN validation
  VALID_PIECE_CHARS: 'pnbrqkPNBRQK',
  VALID_CASTLING_CHARS: 'KQkq',
  VALID_COLORS: ['w', 'b'],
  
  // Error messages
  ERRORS: {
    INVALID_PIECE_TYPE: 'Invalid piece type provided',
    INVALID_FEN: 'Invalid FEN string',
    INVALID_POSITION: 'Invalid position on board'
  }
} as const;

export const DEFAULT_TIME_LIMIT = 300;
export const DEFAULT_INCREMENT = 2;
