import { ChessEngine } from '../engine';
import { PieceColor, PieceType, Move } from '../types';
import { createTestChessEngine } from './test-utils';

describe('Critical Chess Logic Issues', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Castling Critical Issues', () => {
    it('should PREVENT castling when king has moved', () => {
      engine = createTestChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      
      const kingMove: Move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 5 },
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: { row: 7, col: 4 } },
        isCapture: false
      };
      engine.makeMove(kingMove);
      
      const kingBackMove: Move = {
        from: { row: 7, col: 5 },
        to: { row: 7, col: 4 },
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: { row: 7, col: 5 } },
        isCapture: false
      };
      engine.makeMove(kingBackMove);
      
      const castlingMove: Move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 6 },
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: { row: 7, col: 4 } },
        isCapture: false,
        isCastling: true
      };
      
      const result = engine.isMoveValid(castlingMove);
      expect(result.valid).toBe(false);
    });

    it('should PREVENT castling when rook has moved', () => {
      engine = createTestChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      
      const rookMove: Move = {
        from: { row: 7, col: 7 },
        to: { row: 7, col: 6 },
        piece: { type: PieceType.ROOK, color: PieceColor.WHITE, position: { row: 7, col: 7 } },
        isCapture: false
      };
      engine.makeMove(rookMove);
      
      const rookBackMove: Move = {
        from: { row: 7, col: 6 },
        to: { row: 7, col: 7 },
        piece: { type: PieceType.ROOK, color: PieceColor.WHITE, position: { row: 7, col: 6 } },
        isCapture: false
      };
      engine.makeMove(rookBackMove);
      
      const castlingMove: Move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 6 },
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: { row: 7, col: 4 } },
        isCapture: false,
        isCastling: true
      };
      
      const result = engine.isMoveValid(castlingMove);
      expect(result.valid).toBe(false);
    });
  });

  describe('En Passant Critical Issues', () => {
    it('should NOT allow en passant on normal pawn moves', () => {
      engine = createTestChessEngine('rnbqkbnr/1ppppppp/8/p7/P7/8/1PPPPPPP/RNBQKBNR w KQkq - 0 1');
      
      const illegalEnPassant: Move = {
        from: { row: 3, col: 0 }, 
        to: { row: 2, col: 1 }, 
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 3, col: 0 } },
        isCapture: true,
        isEnPassant: true
      };
      
      const result = engine.isMoveValid(illegalEnPassant);
      expect(result.valid).toBe(false);
    });

    it('should NOT allow en passant after one turn has passed', () => {
      engine = createTestChessEngine('rnbqkbnr/1ppppppp/8/8/pP6/8/P1PPPPPP/RNBQKBNR b KQkq - 0 1');

      const expiredEnPassant: Move = {
        from: { row: 3, col: 0 }, 
        to: { row: 2, col: 1 },  
        piece: { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 3, col: 0 } },
        isCapture: true,
        isEnPassant: true
      };
      
      const result = engine.isMoveValid(expiredEnPassant);
      expect(result.valid).toBe(false);
    });
  });

  describe('Pawn Movement Critical Issues', () => {
    it('should NOT allow pawn to move backwards', () => {
      engine = createTestChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
      
      const backwardMove: Move = {
        from: { row: 4, col: 4 }, 
        to: { row: 5, col: 4 }, 
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 4, col: 4 } },
        isCapture: false
      };
      
      const result = engine.isMoveValid(backwardMove);
      expect(result.valid).toBe(false);
    });

    it('should NOT allow pawn to move two squares from non-starting position', () => {
      engine = createTestChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1');
      
      const invalidDoubleMove: Move = {
        from: { row: 4, col: 4 },
        to: { row: 2, col: 4 },
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 4, col: 4 } },
        isCapture: false
      };
      
      const result = engine.isMoveValid(invalidDoubleMove);
      expect(result.valid).toBe(false);
    });
  });

  describe('Check and Checkmate Logic', () => {
    it('should NOT allow king to move into check', () => {
      engine = createTestChessEngine('rnbqkb1r/pppppppp/5n2/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
      
      const suicidalKingMove: Move = {
        from: { row: 7, col: 4 }, 
        to: { row: 6, col: 4 }, 
        piece: { type: PieceType.KING, color: PieceColor.WHITE, position: { row: 7, col: 4 } },
        isCapture: false
      };
      
      const result = engine.isMoveValid(suicidalKingMove);
      expect(result.valid).toBe(false);
    });

    it('should NOT allow pinned piece to move (exposing king to check)', () => {
      engine = createTestChessEngine('4r3/8/8/8/8/8/4B3/4K3 w - - 0 1');
      
      const pinnedPieceMove: Move = {
        from: { row: 6, col: 4 }, 
        to: { row: 5, col: 3 }, 
        piece: { type: PieceType.BISHOP, color: PieceColor.WHITE, position: { row: 6, col: 4 } },
        isCapture: false
      };
      
      const result = engine.isMoveValid(pinnedPieceMove);
      expect(result.valid).toBe(false);
    });
  });

  describe('Turn Management', () => {
    it('should NOT allow same player to move twice in a row', () => {
      engine = new ChessEngine();

      const firstMove: Move = {
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 6, col: 4 } },
        isCapture: false
      };
      engine.makeMove(firstMove);
      const secondWhiteMove: Move = {
        from: { row: 6, col: 3 },
        to: { row: 4, col: 3 },
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 6, col: 3 } },
        isCapture: false
      };
      
      const result = engine.isMoveValid(secondWhiteMove);
      expect(result.valid).toBe(false);
    });
  });
}); 