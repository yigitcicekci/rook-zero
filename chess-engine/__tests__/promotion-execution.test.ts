import { ChessEngine } from '../engine';
import { Move, PieceType, PieceColor } from '../types';

describe('Promotion Execution Tests', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Pawn Promotion Execution', () => {
    it('should execute pawn promotion to queen correctly', () => {
      engine = new ChessEngine('8/4P3/8/8/8/8/8/8 w - - 0 1');
      
      const promotionMove: Move = {
        from: { row: 1, col: 4 },
        to: { row: 0, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 1, col: 4 }
        },
        isCapture: false,
        isPromotion: true,
        promotionPiece: PieceType.QUEEN
      };

      expect(engine.isMoveValid(promotionMove).valid).toBe(true);
      engine.makeMove(promotionMove);
      const board = engine.getBoard();
      const promotedPiece = board.pieces.find(p => p.position.row === 0 && p.position.col === 4);
      expect(promotedPiece).toBeDefined();
      expect(promotedPiece!.type).toBe(PieceType.QUEEN);
      expect(promotedPiece!.color).toBe(PieceColor.WHITE);
    });

    it('should execute pawn promotion to rook correctly', () => {
      engine = new ChessEngine('8/4P3/8/8/8/8/8/8 w - - 0 1');
      
      const promotionMove: Move = {
        from: { row: 1, col: 4 },
        to: { row: 0, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 1, col: 4 }
        },
        isCapture: false,
        isPromotion: true,
        promotionPiece: PieceType.ROOK
      };

      expect(engine.isMoveValid(promotionMove).valid).toBe(true);
      engine.makeMove(promotionMove);
      const board = engine.getBoard();
      const promotedPiece = board.pieces.find(p => p.position.row === 0 && p.position.col === 4);
      expect(promotedPiece).toBeDefined();
      expect(promotedPiece!.type).toBe(PieceType.ROOK);
      expect(promotedPiece!.color).toBe(PieceColor.WHITE);
    });

    it('should execute black pawn promotion correctly', () => {
      engine = new ChessEngine('8/8/8/8/8/8/4p3/8 b - - 0 1');
      
      const promotionMove: Move = {
        from: { row: 6, col: 4 },
        to: { row: 7, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 6, col: 4 }
        },
        isCapture: false,
        isPromotion: true,
        promotionPiece: PieceType.QUEEN
      };

      expect(engine.isMoveValid(promotionMove).valid).toBe(true);
      engine.makeMove(promotionMove);

      // Check that pawn was promoted to queen
      const board = engine.getBoard();
      const promotedPiece = board.pieces.find(p => p.position.row === 7 && p.position.col === 4);
      expect(promotedPiece).toBeDefined();
      expect(promotedPiece!.type).toBe(PieceType.QUEEN);
      expect(promotedPiece!.color).toBe(PieceColor.BLACK);
    });

    it('should automatically set promotion to queen when no promotion piece specified', () => {
      engine = new ChessEngine('8/4P3/8/8/8/8/8/8 w - - 0 1');
      
      const promotionMove: Move = {
        from: { row: 1, col: 4 },
        to: { row: 0, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 1, col: 4 }
        },
        isCapture: false
      };

      expect(engine.isMoveValid(promotionMove).valid).toBe(true);
      engine.makeMove(promotionMove);
      const board = engine.getBoard();
      const promotedPiece = board.pieces.find(p => p.position.row === 0 && p.position.col === 4);
      expect(promotedPiece).toBeDefined();
      expect(promotedPiece!.type).toBe(PieceType.QUEEN);
      expect(promotedPiece!.color).toBe(PieceColor.WHITE);
    });
  });
}); 