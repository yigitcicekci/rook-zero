import { ChessEngine } from '../../engine';
import { PieceColor, PieceType, Move } from '../../types';
import { createTestChessEngine } from '../../__tests__/test-utils';

describe('Rook Movement', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Basic Moves', () => {
    it('should allow horizontal movement', () => {
      engine = createTestChessEngine('8/8/8/8/8/8/8/R7 w - - 0 1');
      const move: Move = {
        from: { row: 7, col: 0 },
        to: { row: 7, col: 5 },
        piece: {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 0 }
        },
        isCapture: false
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });
    
    it('should allow vertical movement', () => {
      engine = createTestChessEngine('8/8/8/8/8/8/8/R7 w - - 0 1');
      const move: Move = {
        from: { row: 7, col: 0 },
        to: { row: 4, col: 0 },
        piece: {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 0 }
        },
        isCapture: false
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });
  });

  describe('Invalid Moves', () => {
    it('should not allow diagonal movement', () => {
      const move: Move = {
        from: { row: 7, col: 0 },
        to: { row: 5, col: 2 },
        piece: {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 0 }
        },
        isCapture: false
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid movement pattern');
    });
  });

  describe('Path Blocking', () => {
    it('should not allow movement through other pieces', () => {
      engine = createTestChessEngine('8/8/8/8/8/8/8/RR6 w - - 0 1');
      const move: Move = {
        from: { row: 7, col: 0 },
        to: { row: 7, col: 7 },
        piece: {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 0 }
        },
        isCapture: false
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path is blocked');
    });
    it('should allow capture of opponent piece', () => {
      engine = createTestChessEngine('8/8/8/8/8/8/8/R6r w - - 0 1');
      const move: Move = {
        from: { row: 7, col: 0 },
        to: { row: 7, col: 7 },
        piece: {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 0 }
        },
        isCapture: true
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });
  });

  describe('Castling Related', () => {
    it('should track if rook has moved for castling purposes', () => {
      engine = createTestChessEngine('r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1');
      const move: Move = {
        from: { row: 7, col: 0 },
        to: { row: 7, col: 3 },
        piece: {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 0 }
        },
        isCapture: false
      };
      engine.makeMove(move);
      expect(engine.getGameState().castlingRights.includes('Q')).toBe(false);
    });
  });
}); 