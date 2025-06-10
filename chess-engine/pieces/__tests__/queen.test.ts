import { Board, Move, PieceColor, PieceType } from '../../types';
import { isValidMove } from '../queen/queen';

describe('Queen Movement Validation', () => {
  let board: Board;
  
  beforeEach(() => {
    board = {
      pieces: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      enPassant: undefined
    };
  });

  describe('Basic Moves', () => {
    it('should allow horizontal movement', () => {
      const startPos = { row: 4, col: 4 };
      const moves = [
        { row: 4, col: 0 },
        { row: 4, col: 7 }
      ];

      moves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });
    });

    it('should allow vertical movement', () => {
      const startPos = { row: 4, col: 4 };
      const moves = [
        { row: 0, col: 4 },
        { row: 7, col: 4 }
      ];

      moves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });
    });

    it('should allow diagonal movement', () => {
      const startPos = { row: 4, col: 4 };
      const moves = [
        { row: 2, col: 2 },
        { row: 2, col: 6 },
        { row: 6, col: 2 },
        { row: 6, col: 6 }
      ];

      moves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: startPos },
          from: startPos,
          to: targetPos,
          isCapture: false
        };

        const result = isValidMove(board, move);
        expect(result.valid).toBe(true);
      });
    });

    it('should not allow non-linear movement', () => {
      const startPos = { row: 4, col: 4 };
      const moves = [
        { row: 3, col: 6 },
        { row: 2, col: 3 },
        { row: 6, col: 3 },
      ];

      moves.forEach(targetPos => {
        const move: Move = {
          piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: startPos },
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
    it('should not allow moving through pieces horizontally', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 4, col: 7 };
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: { row: 4, col: 5 }
      });

      const move: Move = {
        piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path is blocked');
    });

    it('should not allow moving through pieces vertically', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 7, col: 4 };
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: { row: 5, col: 4 }
      });

      const move: Move = {
        piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path is blocked');
    });

    it('should not allow moving through pieces diagonally', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 7, col: 7 };
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: { row: 5, col: 5 }
      });

      const move: Move = {
        piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Path is blocked');
    });
  });

  describe('Captures', () => {
    it('should allow capturing opponent pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 4, col: 7 };
      
      board.pieces.push({
        type: PieceType.QUEEN,
        color: PieceColor.WHITE,
        position: startPos
      });
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: targetPos
      });

      const move: Move = {
        piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: startPos },
        from: startPos,
        to: targetPos,
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should not allow capturing own pieces', () => {
      const startPos = { row: 4, col: 4 };
      const targetPos = { row: 4, col: 7 };
      
      board.pieces.push({
        type: PieceType.QUEEN,
        color: PieceColor.WHITE,
        position: startPos
      });
      
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: targetPos
      });

      const move: Move = {
        piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: startPos },
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
