import { Board, Move, PieceColor, PieceType } from '../../types';
import { isValidMove, moves } from '../king/king';

describe('King', () => {
  let board: Board;
  
  beforeEach(() => {
    board = {
      pieces: [],
      fen: '8/8/8/8/8/8/8/8 w - - 0 1',
      enPassant: undefined
    };
  });

  describe('Basic Movement', () => {
    it('should allow moving one square in any direction', () => {
      const startPos = { row: 4, col: 4 };
      board.pieces = [{
        type: PieceType.KING,
        color: PieceColor.WHITE,
        position: startPos
      }];

      const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],           [0, 1],
        [1, -1],  [1, 0],  [1, 1]
      ];

      directions.forEach(([rowDiff, colDiff]) => {
        const targetPos = { 
          row: startPos.row + rowDiff, 
          col: startPos.col + colDiff 
        };

        const move: Move = {
          piece: { type: PieceType.KING, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });
    });

    it('should not allow moving more than one square', () => {
      const startPos = { row: 4, col: 4 };
      board.pieces = [{
        type: PieceType.KING,
        color: PieceColor.WHITE,
        position: startPos
      }];

      const invalidMoves = [
        { row: startPos.row + 2, col: startPos.col },
        { row: startPos.row, col: startPos.col + 2 },
        { row: startPos.row + 2, col: startPos.col + 2 },
      ];

      invalidMoves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.KING, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid movement pattern');
      });
    });
  });

  describe('Capture', () => {
    it('should allow capturing enemy pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 4, col: 5 };
      
      board.pieces = [
        {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: startPos
        },
        {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: targetPos
        }
      ];

      const move: Move = {
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should not allow capturing own pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 4, col: 5 };
      
      board.pieces = [
        {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: startPos
        },
        {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: targetPos
        }
      ];

      const move: Move = {
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid movement pattern');
    });
  });

  describe('Check', () => {
    it('should not allow moving into check', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 4, col: 5 };
      
      board.pieces = [
        {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: startPos
        },
        {
          type: PieceType.ROOK,
          color: PieceColor.BLACK,
          position: { row: 4, col: 7 }
        }
      ];

      const move: Move = {
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('King would be in check after this move');
    });

    it('should allow moving out of check', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 3, col: 4 };
      
      board.pieces = [
        {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: startPos
        },
        {
          type: PieceType.ROOK,
          color: PieceColor.BLACK,
          position: { row: 4, col: 7 }
        }
      ];

      const move: Move = {
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });
  });

  describe('Castling', () => {
    describe('Kingside', () => {
      it('should allow kingside castling when conditions are met', () => {
        const startPos = { row: 7, col: 4 };
        const targetPos = { row: 7, col: 6 };
        
        board.pieces = [
          {
            type: PieceType.KING,
            color: PieceColor.WHITE,
            position: { row: 7, col: 4 }
          },
          {
            type: PieceType.ROOK,
            color: PieceColor.WHITE,
            position: { row: 7, col: 7 }
          }
        ];

        board.fen = '8/8/8/8/8/8/8/4K2R w K - 0 1';

        const move: Move = {
          piece: {
            type: PieceType.KING,
            color: PieceColor.WHITE,
            position: startPos
          },
          from: startPos,
          to: targetPos,
          isCapture: false,
          isCastling: true
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });

      it('should not allow kingside castling when path is blocked', () => {
        const startPos = { row: 7, col: 4 };
        const targetPos = { row: 7, col: 6 };
        
        board.pieces = [
          {
            type: PieceType.KING,
            color: PieceColor.WHITE,
            position: { row: 7, col: 4 }
          },
          {
            type: PieceType.ROOK,
            color: PieceColor.WHITE,
            position: { row: 7, col: 7 }
          },
          {
            type: PieceType.BISHOP,
            color: PieceColor.WHITE,
            position: { row: 7, col: 5 }
          }
        ];

        board.fen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQK2R w KQkq - 0 1';

        const move: Move = {
          piece: {
            type: PieceType.KING,
            color: PieceColor.WHITE,
            position: startPos
          },
          from: startPos,
          to: targetPos,
          isCapture: false,
          isCastling: true
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Path between king and rook is blocked');
      });
    });

    describe('Queenside', () => {
      it('should allow queenside castling when conditions are met', () => {
        const startPos = { row: 7, col: 4 };
        const targetPos = { row: 7, col: 2 };
        
        board.pieces = [
          {
            type: PieceType.KING,
            color: PieceColor.WHITE,
            position: { row: 7, col: 4 }
          },
          {
            type: PieceType.ROOK,
            color: PieceColor.WHITE,
            position: { row: 7, col: 0 }
          }
        ];

        board.fen = '8/8/8/8/8/8/8/R3K3 w Q - 0 1';

        const move: Move = {
          piece: {
            type: PieceType.KING,
            color: PieceColor.WHITE,
            position: startPos
          },
          from: startPos,
          to: targetPos,
          isCapture: false,
          isCastling: true
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });

      it('should not allow queenside castling when path is blocked', () => {
        const startPos = { row: 7, col: 4 };
        const targetPos = { row: 7, col: 2 };
        
        board.pieces = [
          {
            type: PieceType.KING,
            color: PieceColor.WHITE,
            position: startPos
          },
          {
            type: PieceType.ROOK,
            color: PieceColor.WHITE,
            position: { row: 7, col: 0 }
          },
          {
            type: PieceType.KNIGHT,
            color: PieceColor.WHITE,
            position: { row: 7, col: 1 }
          }
        ];

        board.fen = '8/8/8/8/8/8/8/RN2K3 w Q - 0 1';

        const move: Move = {
          piece: { type: PieceType.KING, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false,
          isCastling: true
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Path between king and rook is blocked');
      });
    });

    it('should not allow castling through check', () => {
      const startPos = { row: 7, col: 4 };
      const targetPos = { row: 7, col: 6 };
      
      board.pieces = [
        {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: startPos
        },
        {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 7 }
        },
        {
          type: PieceType.ROOK,
          color: PieceColor.BLACK,
          position: { row: 0, col: 5 }
        }
      ];

      board.fen = 'r6r/8/8/8/8/8/8/4K2R w K - 0 1';

      const move: Move = {
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: false,
        isCastling: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cannot castle through or into check');
    });
  });

  describe('Move Generation', () => {
    it('should generate all valid moves in an empty board', () => {
      const kingPos = { row: 4, col: 4 };
      board.pieces = [{
        type: PieceType.KING,
        color: PieceColor.WHITE,
        position: kingPos
      }];

      const validMoves = moves(board, kingPos);
      expect(validMoves).toHaveLength(8); 

      const expectedMoves = [
        { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
        { row: 4, col: 3 },                      { row: 4, col: 5 },
        { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }
      ];

      expectedMoves.forEach(pos => {
        expect(validMoves).toContainEqual(pos);
      });
    });

    it('should include castling moves when available', () => {
      const kingPos = { row: 7, col: 4 };
      board.pieces = [
        {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: kingPos
        },
        {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 0 }
        },
        {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 7 }
        }
      ];

      board.fen = '8/8/8/8/8/8/8/R3K2R w KQ - 0 1';
      const validMoves = moves(board, kingPos);

      expect(validMoves).toContainEqual({ row: 7, col: 2 }); // Queenside
      expect(validMoves).toContainEqual({ row: 7, col: 6 }); // Kingside
    });

    it('should not include squares occupied by friendly pieces', () => {
      const kingPos = { row: 4, col: 4 };
      board.pieces = [
        {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: kingPos
        },
        {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 3, col: 4 }
        }
      ];

      const validMoves = moves(board, kingPos);
      expect(validMoves).not.toContainEqual({ row: 3, col: 4 });
    });

    it('should include squares occupied by enemy pieces', () => {
      const kingPos = { row: 4, col: 4 };
      board.pieces = [
        {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: kingPos
        },
        {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 3, col: 4 }
        }
      ];

      const validMoves = moves(board, kingPos);
      expect(validMoves).toContainEqual({ row: 3, col: 4 });
    });
  });
});