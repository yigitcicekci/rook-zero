import { ChessEngine } from '../engine';
import { Move, PieceType, PieceColor } from '../types';

describe('En Passant Tests', () => {
  let engine: ChessEngine;

  beforeEach(() => {
    engine = new ChessEngine();
  });

  describe('En Passant Target Square Creation', () => {
    it('should set en passant target after white pawn double advance', () => {
      const move: Move = {
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 6, col: 4 }
        },
        isCapture: false
      };

      expect(engine.isMoveValid(move).valid).toBe(true);
      engine.makeMove(move);

      const gameState = engine.getGameState();
      expect(gameState.enPassant).toBe('e3');
    });

    it('should set en passant target after black pawn double advance', () => {
      const whiteMove: Move = {
        from: { row: 6, col: 4 },
        to: { row: 5, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 6, col: 4 }
        },
        isCapture: false
      };
      engine.makeMove(whiteMove);
      const blackMove: Move = {
        from: { row: 1, col: 3 },
        to: { row: 3, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 1, col: 3 }
        },
        isCapture: false
      };

      expect(engine.isMoveValid(blackMove).valid).toBe(true);
      engine.makeMove(blackMove);

      const gameState = engine.getGameState();
      expect(gameState.enPassant).toBe('d6');
    });

    it('should clear en passant target after non-pawn move', () => {
      engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      const move: Move = {
        from: { row: 0, col: 1 },
        to: { row: 2, col: 2 },
        piece: {
          type: PieceType.KNIGHT,
          color: PieceColor.BLACK,
          position: { row: 0, col: 1 }
        },
        isCapture: false
      };

      expect(engine.isMoveValid(move).valid).toBe(true);
      engine.makeMove(move);

      const gameState = engine.getGameState();
      expect(gameState.enPassant).toBe('-');
    });

    it('should clear en passant target after single pawn move', () => {
      engine = new ChessEngine('rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1');
      const move: Move = {
        from: { row: 1, col: 3 },
        to: { row: 2, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 1, col: 3 }
        },
        isCapture: false
      };

      expect(engine.isMoveValid(move).valid).toBe(true);
      engine.makeMove(move);

      const gameState = engine.getGameState();
      expect(gameState.enPassant).toBe('-');
    });
  });

  describe('En Passant Capture Validation', () => {
    it('should allow en passant capture for white pawn', () => {
      engine = new ChessEngine('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2');
      
      const move: Move = {
        from: { row: 4, col: 4 },
        to: { row: 3, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 4, col: 4 }
        },
        isCapture: false
      };

      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });

    it('should allow en passant capture for black pawn', () => {
      engine = new ChessEngine('rnbqkbnr/pppppppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 2');
      
      const move: Move = {
        from: { row: 3, col: 4 },
        to: { row: 4, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 3, col: 4 }
        },
        isCapture: false
      };

      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(true);
    });

    it('should reject en passant capture when no en passant target exists', () => {
      engine = new ChessEngine('rnbqkbnr/ppp1pppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');
      
      const move: Move = {
        from: { row: 4, col: 4 },
        to: { row: 3, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 4, col: 4 }
        },
        isCapture: false
      };

      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(false);
    });

    it('should reject en passant capture with wrong target square', () => {
      engine = new ChessEngine('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2');
      
      const move: Move = {
        from: { row: 4, col: 4 },
        to: { row: 3, col: 5 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 4, col: 4 }
        },
        isCapture: false
      };

      const result = engine.isMoveValid(move);
      expect(result.valid).toBe(false);
    });
  });

  describe('En Passant Capture Execution', () => {
    it('should execute en passant capture correctly for white', () => {
      engine = new ChessEngine('rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq d6 0 2');
      
      const move: Move = {
        from: { row: 4, col: 4 },
        to: { row: 3, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 4, col: 4 }
        },
        isCapture: false
      };

      expect(engine.isMoveValid(move).valid).toBe(true);
      engine.makeMove(move);
      const board = engine.getBoard();
      const capturedPawn = board.pieces.find(p => p.position.row === 3 && p.position.col === 3 && p.type === PieceType.PAWN && p.color === PieceColor.BLACK);
      expect(capturedPawn).toBeUndefined();
      const capturingPawn = board.pieces.find(p => p.position.row === 3 && p.position.col === 3 && p.type === PieceType.PAWN && p.color === PieceColor.WHITE);
      expect(capturingPawn).toBeDefined();
    });

    it('should execute en passant capture correctly for black', () => {
      engine = new ChessEngine('rnbqkbnr/pppppppp/8/4p3/3P4/8/PPP1PPPP/RNBQKBNR b KQkq d3 0 2');
      
      const move: Move = {
        from: { row: 3, col: 4 },
        to: { row: 4, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 3, col: 4 }
        },
        isCapture: false
      };

      expect(engine.isMoveValid(move).valid).toBe(true);
      engine.makeMove(move);
      const board = engine.getBoard();
      const capturedPawn = board.pieces.find(p => p.position.row === 4 && p.position.col === 3 && p.type === PieceType.PAWN && p.color === PieceColor.WHITE);
      expect(capturedPawn).toBeUndefined();
      const capturingPawn = board.pieces.find(p => p.position.row === 4 && p.position.col === 3 && p.type === PieceType.PAWN && p.color === PieceColor.BLACK);
      expect(capturingPawn).toBeDefined();
    });
  });

  describe('Complete En Passant Sequence', () => {
    it('should handle complete en passant sequence correctly', () => {
      engine = new ChessEngine();
      const move1: Move = {
        from: { row: 6, col: 4 },
        to: { row: 4, col: 4 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 6, col: 4 }
        },
        isCapture: false
      };
      engine.makeMove(move1);
      expect(engine.getGameState().enPassant).toBe('e3');
      const move2: Move = {
        from: { row: 1, col: 3 },
        to: { row: 3, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.BLACK,
          position: { row: 1, col: 3 }
        },
        isCapture: false
      };
      engine.makeMove(move2);
      expect(engine.getGameState().enPassant).toBe('d6');
      const move3: Move = {
        from: { row: 4, col: 4 },
        to: { row: 3, col: 3 },
        piece: {
          type: PieceType.PAWN,
          color: PieceColor.WHITE,
          position: { row: 4, col: 4 }
        },
        isCapture: false
      };
      engine.makeMove(move3);
      const board = engine.getBoard();
      const whitePawn = board.pieces.find(p => p.position.row === 3 && p.position.col === 3 && p.type === PieceType.PAWN && p.color === PieceColor.WHITE);
      expect(whitePawn).toBeDefined();
      const blackPawn = board.pieces.find(p => p.position.row === 3 && p.position.col === 3 && p.type === PieceType.PAWN && p.color === PieceColor.BLACK);
      expect(blackPawn).toBeUndefined();
      expect(engine.getGameState().enPassant).toBe('-');
    });
  });
}); 