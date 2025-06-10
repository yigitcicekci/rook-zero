import { ChessEngine } from '../engine';
import { PieceColor, PieceType, Move } from '../types';
import { createTestChessEngine } from './test-utils';

describe('Chess Engine', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('Game Setup', () => {
    it('should initialize with correct starting position', () => {
      const state = engine.getGameState();
      expect(state.activeColor).toBe(PieceColor.WHITE);
      expect(state.castlingRights).toBe('KQkq');
      expect(state.enPassant).toBe('-');
      expect(state.halfMoves).toBe(0);
      expect(state.fullMoves).toBe(1);
    });

    it('should set custom position', () => {
      engine = createTestChessEngine('r1bqkbnr/pppppppp/n7/8/2B5/4P3/PPPP1PPP/RNBQK1NR w KQkq - 0 1');
      const state = engine.getGameState();
      expect(state.activeColor).toBe(PieceColor.WHITE);
      expect(state.castlingRights).toBe('KQkq');
    });
  });

  describe('Move Validation', () => {
    it('should validate legal opening moves', () => {
      const move: Move = {
        from: { row: 6, col: 4 },
        to: { row: 5, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 6, col: 4 }
        },
        isCapture: false
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });

    it('should reject illegal moves', () => {
      const move: Move = {
        from: { row: 6, col: 0 },
        to: { row: 7, col: 0 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 6, col: 0 }
        },
        isCapture: false
      };
      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(false);
    });
  });

  describe('Move Execution', () => {
    it('should correctly execute a sequence of moves', () => {
      const moves = [
        {
          from: { row: 6, col: 5 },
          to: { row: 5, col: 5 },
          piece: {
            type: PieceType.PAWN,
            color: PieceColor.WHITE,
            position: { row: 6, col: 5 }
          },
          isCapture: false
        },
        {
          from: { row: 1, col: 4 },
          to: { row: 2, col: 4 },
          piece: {
            type: PieceType.PAWN,
            color: PieceColor.BLACK,
            position: { row: 1, col: 4 }
          },
          isCapture: false
        }
      ];

      moves.forEach(move => {
        const result = engine.isMoveValid(move);
        expect(result.valid).toBe(true);
        engine.makeMove(move);
      });

      const state = engine.getGameState();
      expect(state.activeColor).toBe(PieceColor.WHITE);
      expect(state.fullMoves).toBe(2);
    });
  });

  describe('Game State', () => {
    it('should track active color correctly', () => {
      engine = createTestChessEngine('r1bqkbnr/pppppppp/n7/8/2B5/4P3/PPPP1PPP/RNBQK1NR w KQkq - 0 1');
      expect(engine.getGameState().activeColor).toBe(PieceColor.WHITE);
      
      const move: Move = {
        from: { row: 7, col: 5 },
        to: { row: 6, col: 4 },
        piece: {
          type: PieceType.BISHOP,
          color: PieceColor.WHITE,
          position: { row: 7, col: 5 }
        },
        isCapture: false
      };
      engine.makeMove(move);
      expect(engine.getGameState().activeColor).toBe(PieceColor.WHITE);
    });

    it('should track castling rights', () => {
      engine = createTestChessEngine('r2qkbnr/ppp1pppp/3p4/5bNP/3n4/8/PPPPPPP1/RNBQKB1R b KQkq - 0 1');
      const state = engine.getGameState();
      expect(state.castlingRights).toBe('KQkq');
    });

    it('should track en passant target square', () => {
      engine = createTestChessEngine('rnbqkbnr/1ppppppp/8/8/pPP5/4P3/P2P1PPP/RNBQKBNR b KQkq b3 0 1');
      const state = engine.getGameState();
      expect(state.enPassant).toBe('b3');
    });

    it('should track full moves correctly', () => {
      engine = createTestChessEngine('r1bqkbnr/pppppppp/n7/8/2B5/4P3/PPPP1PPP/RNBQK1NR w KQkq - 0 1');
      expect(engine.getGameState().fullMoves).toBe(1);
      
      const move: Move = {
        from: { row: 7, col: 5 },
        to: { row: 6, col: 4 },
        piece: {
          type: PieceType.BISHOP,
          color: PieceColor.WHITE,
          position: { row: 7, col: 5 }
        },
        isCapture: false
      };
      
      engine.makeMove(move);
      expect(engine.getGameState().fullMoves).toBe(1);
      
      const blackMove: Move = {
        from: { row: 0, col: 0 },
        to: { row: 2, col: 0 },
        piece: {
          type: PieceType.ROOK,
          color: PieceColor.BLACK,
          position: { row: 0, col: 0 }
        },
        isCapture: false
      };
      engine.makeMove(blackMove);
      expect(engine.getGameState().fullMoves).toBe(1);
    });
  });
});