import { ChessEngine } from '../engine';
import { PieceColor, PieceType, Move } from '../types';
import { createTestChessEngine } from './test-utils';

describe('Special Chess Rules', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Castling', () => {
    it('should allow kingside castling in early game', () => {
      engine = createTestChessEngine('r1bqk2r/pppppppp/n7/8/2B5/4P3/PPPP1PPP/RNBQK2R w KQkq - 0 1');
      const move: Move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 6 },
        piece: {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: { row: 7, col: 4 }
        },
        isCapture: false,
        isCastling: true
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });

    it('should prevent castling through check', () => {
      engine = createTestChessEngine('r2qkbnr/ppp1pppp/3p4/5bNP/3n4/8/PPPPPPP1/RNBQKB1R b KQkq - 0 1');
      const move: Move = {
        from: { row: 0, col: 4 },
        to: { row: 0, col: 6 },
        piece: {
          type: PieceType.KING,
          color: PieceColor.BLACK,
          position: { row: 0, col: 4 }
        },
        isCapture: false,
        isCastling: true
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(false);
    });
  });

  describe('En Passant', () => {
    it('should allow en passant capture after double pawn advance', () => {
      engine = createTestChessEngine('rnbqkbnr/1ppppppp/8/8/pPP5/4P3/P2P1PPP/RNBQKBNR b KQkq b3 0 1');
      const move: Move = {
        from: { row: 4, col: 0 },
        to: { row: 5, col: 1 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 4, col: 0 }
        },
        isCapture: true,
        isEnPassant: true
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });

    it('should only allow en passant immediately after double pawn advance', () => {
      engine = createTestChessEngine('rnbqkbnr/1ppppppp/8/8/pPP5/4P3/P2P1PPP/RNBQKBNR b KQkq - 0 1');
      const move: Move = {
        from: { row: 4, col: 0 },
        to: { row: 5, col: 1 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 4, col: 0 }
        },
        isCapture: true,
        isEnPassant: true
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(false);
    });
  });

  describe('Check', () => {
    it('should prevent moving into check', () => {
      engine = createTestChessEngine('r2qkbnr/ppp1pppp/3p4/5bNP/3n4/8/PPPPPPP1/RNBQKB1R b KQkq - 0 1');
      const move: Move = {
        from: { row: 0, col: 4 },
        to: { row: 1, col: 4 },
        piece: {
          type: PieceType.KING,
          color: PieceColor.BLACK,
          position: { row: 0, col: 4 }
        },
        isCapture: false
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(false);
    });

    it('should allow moving out of check', () => {
      engine = createTestChessEngine('Q1bqkb1r/1pp1pppp/2n5/1Bp5/1P2n3/2N1P3/PB1q1PPP/2KR2NR w kq - 0 1');
      const move: Move = {
        from: { row: 7, col: 2 },
        to: { row: 7, col: 1 },
        piece: {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: { row: 7, col: 2 }
        },
        isCapture: false
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });
  });

  describe('Promotion', () => {
    it('should allow pawn promotion to queen', () => {
      engine = createTestChessEngine('8/4P3/8/8/8/8/8/8 w - - 0 1');
      const move: Move = {
        from: { row: 1, col: 4 },
        to: { row: 0, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 1, col: 4 }
        },
        isCapture: false,
        promotionPiece: PieceType.QUEEN
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });
  });
});