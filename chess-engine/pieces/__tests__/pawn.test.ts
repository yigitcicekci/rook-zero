import { Board, Move, PieceColor, PieceType, Position } from '../../types';
import { isValidMove, moves } from '../pawn/pawn';

describe('Pawn Movement Validation', () => {
  let board: Board;
  
  beforeEach(() => {
    board = {
      pieces: [],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      enPassant: undefined
    };
  });

  describe('Basic Moves', () => {
    it('should allow white pawn to move one square forward', () => {
      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 6, col: 0 } },
        from: { row: 6, col: 0 },
        to: { row: 5, col: 0 },
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should allow black pawn to move one square forward', () => {
      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 1, col: 0 } },
        from: { row: 1, col: 0 },
        to: { row: 2, col: 0 },
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should allow white pawn to move two squares from starting position', () => {
      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 6, col: 0 } },
        from: { row: 6, col: 0 },
        to: { row: 4, col: 0 },
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should allow black pawn to move two squares from starting position', () => {
      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 1, col: 0 } },
        from: { row: 1, col: 0 },
        to: { row: 3, col: 0 },
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });
  });

  describe('Invalid Moves', () => {
    it('should not allow white pawn to move backward', () => {
      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 5, col: 0 } },
        from: { row: 5, col: 0 },
        to: { row: 6, col: 0 },
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid pawn move');
    });

    it('should not allow black pawn to move backward', () => {
      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 2, col: 0 } },
        from: { row: 2, col: 0 },
        to: { row: 1, col: 0 },
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid pawn move');
    });

    it('should not allow two square move from non-starting position', () => {
      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 5, col: 0 } },
        from: { row: 5, col: 0 },
        to: { row: 3, col: 0 },
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid pawn move');
    });
  });

  describe('Captures', () => {
    it('should allow diagonal capture for white pawn', () => {
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: { row: 5, col: 1 }
      });

      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 6, col: 0 } },
        from: { row: 6, col: 0 },
        to: { row: 5, col: 1 },
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should allow diagonal capture for black pawn', () => {
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: { row: 2, col: 1 }
      });

      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 1, col: 0 } },
        from: { row: 1, col: 0 },
        to: { row: 2, col: 1 },
        isCapture: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should not allow diagonal move without capture', () => {
      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 6, col: 0 } },
        from: { row: 6, col: 0 },
        to: { row: 5, col: 1 },
        isCapture: false
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Invalid pawn move');
    });
  });

  describe('En Passant', () => {
    it('should allow en passant capture for white pawn', () => {
      board.enPassant = 'b6';
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: { row: 3, col: 1 }
      });

      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 3, col: 0 } },
        from: { row: 3, col: 0 },
        to: { row: 2, col: 1 },
        isCapture: true,
        isEnPassant: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });

    it('should allow en passant capture for black pawn', () => {
      board.enPassant = 'b3';
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: { row: 4, col: 1 }
      });

      const move: Move = {
        piece: { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 4, col: 0 } },
        from: { row: 4, col: 0 },
        to: { row: 5, col: 1 },
        isCapture: true,
        isEnPassant: true
      };

      const result = isValidMove(board, move);
      expect(result.valid).toBe(true);
    });
  });

  describe('Move Generation', () => {
    it('should generate all possible moves for white pawn from starting position', () => {
      const position: Position = { row: 6, col: 0 };
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: position
      });
      
      const possibleMoves = moves(board, position);
      
      expect(possibleMoves).toContainEqual({ row: 5, col: 0 });
      expect(possibleMoves).toContainEqual({ row: 4, col: 0 });
      expect(possibleMoves.length).toBe(2);
    });

    it('should generate all possible moves for black pawn from starting position', () => {
      const position: Position = { row: 1, col: 0 };
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: position
      });

      const possibleMoves = moves(board, position);
      
      expect(possibleMoves).toContainEqual({ row: 2, col: 0 });
      expect(possibleMoves).toContainEqual({ row: 3, col: 0 });
      expect(possibleMoves.length).toBe(2);
    });

    it('should include diagonal captures in possible moves', () => {
      const position: Position = { row: 6, col: 1 };
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.WHITE,
        position: position
      });
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: { row: 5, col: 0 }
      });
      board.pieces.push({
        type: PieceType.PAWN,
        color: PieceColor.BLACK,
        position: { row: 5, col: 2 }
      });

      const possibleMoves = moves(board, position);
      
      expect(possibleMoves).toContainEqual({ row: 5, col: 0 });
      expect(possibleMoves).toContainEqual({ row: 5, col: 2 });
      expect(possibleMoves).toContainEqual({ row: 5, col: 1 });
      expect(possibleMoves).toContainEqual({ row: 4, col: 1 });
      expect(possibleMoves.length).toBe(4);
    });
  });
}); 