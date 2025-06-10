import { Board, Move, PieceColor, PieceType } from '../../types';
import { isValidMove } from '../knight/knight';

describe('Knight Movement Validation', () => {
  let board: Board;
  
  beforeEach(() => {
    board = {
      pieces: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      enPassant: undefined
    };
  });

  describe('Basic Moves', () => {
    it('should allow L-shaped moves in all directions', () => {
      const startPos = { row: 4, col: 4 };
      const moves = [
        { row: 2, col: 3 },
        { row: 2, col: 5 },
        { row: 3, col: 2 },
        { row: 3, col: 6 },
        { row: 5, col: 2 },
        { row: 5, col: 6 },
        { row: 6, col: 3 },
        { row: 6, col: 5 }
      ];

      moves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });
    });

    it('should not allow non-L-shaped moves', () => {
      const startPos = { row: 4, col: 4 };
      const moves = [
        { row: 4, col: 7 },
        { row: 7, col: 4 },
        { row: 2, col: 2 },
        { row: 3, col: 4 },
      ];

      moves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: startPos },
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

  describe('Path Blocking', () => {
    it('should allow jumping over pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 2, col: 5 };
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: { row: 3, col: 4 }
      });
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: { row: 3, col: 5 }
      });

      const move: Move = {
        piece: { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });
  });

  describe('Captures', () => {
    it('should allow capturing opponent pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 2, col: 5 };
      
      board.pieces.push({
        type: PieceType.KNIGHT,
        color: PieceColor.WHITE,
        position: startPos
      });
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: targetPos
      });

      const move: Move = {
        piece: { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should not allow capturing own pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 2, col: 5 };
      
      board.pieces.push({
        type: PieceType.KNIGHT,
        color: PieceColor.WHITE,
        position: startPos
      });
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: targetPos
      });

      const move: Move = {
        piece: { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid movement pattern');
    });
  });

  describe('Edge Cases', () => {
    it('should allow valid moves from corner positions', () => {
      const startPos = { row: 0, col: 0 };
      const validMoves = [
        { row: 1, col: 2 },
        { row: 2, col: 1 }
      ];

      board.pieces.push({
        type: PieceType.KNIGHT,
        color: PieceColor.WHITE,
        position: startPos
      });

      validMoves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });
    });

    it('should not allow moves outside the board', () => {
      const startPos = { row: 0, col: 0 };
      const invalidMoves = [
        { row: -1, col: 2 },
        { row: 2, col: -1 },
        { row: -2, col: 1 }
      ];

      board.pieces.push({
        type: PieceType.KNIGHT,
        color: PieceColor.WHITE,
        position: startPos
      });

      invalidMoves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: startPos },
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
}); 