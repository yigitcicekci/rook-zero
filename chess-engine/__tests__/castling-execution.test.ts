import { ChessEngine } from '../engine';
import { Move, PieceType, PieceColor } from '../types';

describe('Castling Execution Tests', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Castling Execution', () => {
    it('should execute kingside castling correctly', () => {
      engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      
      const castlingMove: Move = {
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

      expect(engine.isMoveValid(castlingMove).valid).toBe(true);
      engine.makeMove(castlingMove);
      const board = engine.getBoard();
      const king = board.pieces.find(p => p.type === PieceType.KING && p.color === PieceColor.WHITE);
      expect(king).toBeDefined();
      expect(king!.position).toEqual({ row: 7, col: 6 });
      const rook = board.pieces.find(p => p.type === PieceType.ROOK && p.color === PieceColor.WHITE && p.position.col === 5);
      expect(rook).toBeDefined();
      expect(rook!.position).toEqual({ row: 7, col: 5 });
      const gameState = engine.getGameState();
      expect(gameState.castlingRights).toBe('kq');
    });

    it('should execute queenside castling correctly', () => {
      engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      
      const castlingMove: Move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 2 },
        piece: {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: { row: 7, col: 4 }
        },
        isCapture: false,
        isCastling: true
      };

      expect(engine.isMoveValid(castlingMove).valid).toBe(true);
      engine.makeMove(castlingMove);
      const board = engine.getBoard();
      const king = board.pieces.find(p => p.type === PieceType.KING && p.color === PieceColor.WHITE);
      expect(king).toBeDefined();
      expect(king!.position).toEqual({ row: 7, col: 2 });
      const rook = board.pieces.find(p => p.type === PieceType.ROOK && p.color === PieceColor.WHITE && p.position.col === 3);
      expect(rook).toBeDefined();
      expect(rook!.position).toEqual({ row: 7, col: 3 });
      const gameState = engine.getGameState();
      expect(gameState.castlingRights).toBe('kq');
    });

    it('should update castling rights when king moves', () => {
      engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      
      const kingMove: Move = {
        from: { row: 7, col: 4 },
        to: { row: 7, col: 5 },
        piece: {
          type: PieceType.KING,
          color: PieceColor.WHITE,
          position: { row: 7, col: 4 }
        },
        isCapture: false
      };

      engine.makeMove(kingMove);
      
      const gameState = engine.getGameState();
      expect(gameState.castlingRights).toBe('kq');
    });

    it('should update castling rights when rook moves', () => {
      engine = new ChessEngine('r3k2r/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1');
      
      const rookMove: Move = {
        from: { row: 7, col: 7 },
        to: { row: 7, col: 6 },
        piece: {
          type: PieceType.ROOK,
          color: PieceColor.WHITE,
          position: { row: 7, col: 7 }
        },
        isCapture: false
      };

      engine.makeMove(rookMove);
      
      const gameState = engine.getGameState();
      expect(gameState.castlingRights).toBe('Qkq');
    });
  });
}); 