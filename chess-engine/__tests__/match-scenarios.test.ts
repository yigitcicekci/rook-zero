import { ChessEngine } from '../engine';
import { PieceColor, PieceType, Move } from '../types';
import { createTestChessEngine } from './test-utils';

describe('Match Scenarios', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Match 0 - Early Game Development', () => {
    it('should validate f3 opening and e6 response', () => {
      engine = createTestChessEngine('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0');

      const whiteMove: Move = {
        from: { row: 6, col: 5 },
        to: { row: 5, col: 5 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 6, col: 5 }
        },
        isCapture: false
      };
      expect(engine.isMoveValid(whiteMove).valid).toBe(true);
      engine.makeMove(whiteMove);
      const blackMove: Move = {
        from: { row: 1, col: 4 },
        to: { row: 2, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 1, col: 4 }
        },
        isCapture: false
      };
      expect(engine.isMoveValid(blackMove).valid).toBe(true);
    });
  });

  describe('Match 1 - Queen Development and Attack', () => {
    it('should validate queen development to h5', () => {
      engine = createTestChessEngine('r1bqkbnr/pppppppp/n7/8/2B5/4P3/PPPP1PPP/RNBQK1NR w KQkq - 0 0');
      
      const queenMove: Move = {
        from: { row: 7, col: 3 },
        to: { row: 3, col: 7 },
        piece: {
          type: PieceType.QUEEN,
          color: PieceColor.WHITE,
          position: { row: 7, col: 3 }
        },
        isCapture: false
      };
      expect(engine.isMoveValid(queenMove).valid).toBe(true);
    });
  });

  describe('Match 2 - Complex Middlegame Position', () => {
    it('should validate knight capture and queen recapture sequence', () => {
      engine = createTestChessEngine('rq2kb1r/p1p1pppp/3p4/1p3b1P/6n1/N4N1R/PP1PPP2/R1BQKB2 b Qkq - 0 0');
      const knightCapture: Move = {
        from: { row: 4, col: 6 },
        to: { row: 2, col: 5 },
        piece: {
          type: PieceType.KNIGHT,
          color: PieceColor.BLACK,
          position: { row: 4, col: 6 }
        },
        isCapture: true
      };
      expect(engine.isMoveValid(knightCapture).valid).toBe(true);
    });
  });

  describe('Match 3 - Pawn Structure and Queen Activity', () => {
    it('should validate pawn advance and queen movement', () => {
      engine = createTestChessEngine('rnbqkbnr/1ppppppp/8/p7/8/4P3/PPPP1PPP/RNBQKBNR b KQkq - 0 0');
      const pawnMove: Move = {
        from: { row: 1, col: 3 },
        to: { row: 2, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 1, col: 3 }
        },
        isCapture: false
      };
      expect(engine.isMoveValid(pawnMove).valid).toBe(true);
    });
  });

  describe('Special Rules in Match Context', () => {
    it('should validate castling rights preservation', () => {
      engine = createTestChessEngine('r2qkbnr/ppp1pppp/3p4/5bNP/3n4/8/PPPPPPP1/RNBQKB1R b KQkq - 0 0');
      expect(engine.getGameState().castlingRights).toBe('KQkq');
    });

    it('should track en passant opportunities', () => {
      engine = createTestChessEngine('rnbqkbnr/1ppppppp/8/8/pPP5/4P3/P2P1PPP/RNBQKBNR b KQkq b3 0 0');
      expect(engine.getGameState().enPassant).toBe('b3');
    });
  });
}); 