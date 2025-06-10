import { Board, Move, PieceColor, PieceType } from '../../types';
import { isValidMove } from '../bishop/bishop';

describe('Bishop Movement Validation', () => {
  let board: Board;
  
  beforeEach(() => {
    board = {
      pieces: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      enPassant: undefined
    };
  });

  describe('Basic Moves', () => {
    it('should allow diagonal movement in all directions', () => {
      const startPos = { row: 4, col: 4 };
      const moves = [
        { row: 2, col: 2 },
        { row: 2, col: 6 },
        { row: 6, col: 2 },
        { row: 6, col: 6 }
      ];

      moves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.BISHOP, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });
    });

    it('should not allow non-diagonal movement', () => {
      const startPos = { row: 4, col: 4 };
      const moves = [
        { row: 4, col: 7 },
        { row: 7, col: 4 },
        { row: 3, col: 6 },
      ];

      moves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.BISHOP, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(false);
        expect(result.error).toBe('Invalid movement pattern');
      });
    });

    it('should allow moves of varying distances', () => {
      const startPos = { row: 4, col: 4 };
      const moves = [
        { row: 3, col: 3 },
        { row: 0, col: 0 },
        { row: 7, col: 7 }
      ];

      moves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.BISHOP, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });
    });
  });

  describe('Path Blocking', () => {
    it('should not allow moving through pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 7, col: 7 };
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: { row: 5, col: 5 }
      });

      const move: Move = {
        piece: { type: PieceType.BISHOP, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path is blocked');
    });

    it('should allow moving up to a piece for capture', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 2, col: 6 };
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: targetPos
      });

      const move: Move = {
        piece: { type: PieceType.BISHOP, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });
  });

  describe('Captures', () => {
    it('should allow capturing opponent pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 2, col: 2 };
      
      board.pieces.push({
        type: PieceType.BISHOP,
        color: PieceColor.WHITE,
        position: startPos
      });
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: targetPos
      });

      const move: Move = {
        piece: { type: PieceType.BISHOP, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should not allow capturing own pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 2, col: 2 };
      
      board.pieces.push({
        type: PieceType.BISHOP,
        color: PieceColor.WHITE,
        position: startPos
      });
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: targetPos
      });

      const move: Move = {
        piece: { type: PieceType.BISHOP, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid movement pattern');
    });
  });
}); 