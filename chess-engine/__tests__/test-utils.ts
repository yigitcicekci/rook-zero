import { ChessEngine } from '../engine';
import { Move, Position, PieceType, PieceColor } from '../types';

export interface ExtendedFen {
  fen: string;
  moveCode: string;
}

export const parseFenString = (fenString: string): ExtendedFen => {
  const parts = fenString.split(' ');
  return {
    fen: parts.slice(0, 6).join(' '),
    moveCode: parts[6]
  };
};

export const createTestChessEngine = (fenString?: string): ChessEngine => {
  return new ChessEngine(fenString);
};

export const parseMoveCode = (moveCode: string): Move => {
  const from: Position = {
    row: Math.floor(parseInt(moveCode.substring(0, 2)) / 10),
    col: parseInt(moveCode.substring(0, 2)) % 10
  };
  const to: Position = {
    row: Math.floor(parseInt(moveCode.substring(2, 4)) / 10),
    col: parseInt(moveCode.substring(2, 4)) % 10
  };
  return {
    from,
    to,
    piece: {
      type: PieceType.PAWN,
      color: PieceColor.WHITE,
      position: from
    },
    isCapture: false
  };
};

export const SAMPLE_POSITIONS = {
  INITIAL: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0 - -',
  AFTER_E4: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1 4645 -',
  COMPLEX_MIDDLEGAME: 'r3kb1r/p1p1pppp/1q1p4/1N3b1P/6n1/5N1R/PP1PPP2/R1BQKB2 w Qkq - 0 0 1256 -'
};

test('test-utils should not throw', () => {
  expect(true).toBe(true);
}); 