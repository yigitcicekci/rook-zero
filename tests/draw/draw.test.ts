import { RZero } from '../../src';

describe('draw detection', () => {
  it('detects stalemate', () => {
    const rzero = new RZero('7k/5Q2/7K/8/8/8/8/8 b - - 0 1');

    expect(rzero.isStalemate()).toBe(true);
    expect(rzero.isDraw()).toBe(true);
    expect(rzero.outcome().kind).toBe('stalemate');
  });

  it('detects insufficient material', () => {
    const rzero = new RZero('8/8/8/8/8/2k5/8/3K4 w - - 0 1');

    expect(rzero.isInsufficientMaterial()).toBe(true);
    expect(rzero.isDraw()).toBe(true);
    expect(rzero.outcome().kind).toBe('insufficient-material');
  });

  it('detects insufficient material for bishops on the same color complex', () => {
    const rzero = new RZero('8/7k/8/8/8/8/8/B1BK4 w - - 0 1');

    expect(rzero.isInsufficientMaterial()).toBe(true);
    expect(rzero.outcome().kind).toBe('insufficient-material');
  });

  it('detects threefold repetition', () => {
    const rzero = new RZero();
    const sequence = ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8'];

    for (const move of sequence) {
      expect(rzero.move(move)).not.toBeNull();
    }

    expect(rzero.isThreefoldRepetition()).toBe(true);
    expect(rzero.isDraw()).toBe(true);
    expect(rzero.outcome().kind).toBe('threefold-repetition');
  });

  it('detects the fifty-move rule from fen state', () => {
    const rzero = new RZero('8/8/8/8/8/2k5/8/3K4 w - - 100 1');

    expect(rzero.isFiftyMoveRule()).toBe(true);
    expect(rzero.outcome().kind).toBe('fifty-move-rule');
  });

  it('detects fivefold repetition', () => {
    const rzero = new RZero();
    const cycle = ['Nf3', 'Nf6', 'Ng1', 'Ng8'];

    for (let i = 0; i < 4; i++) {
      for (const move of cycle) {
        expect(rzero.move(move)).not.toBeNull();
      }
    }

    expect(rzero.isFivefoldRepetition()).toBe(true);
    expect(rzero.outcome().kind).toBe('fivefold-repetition');
  });

  it('detects the seventy-five-move rule from fen state', () => {
    const rzero = new RZero('8/8/8/8/8/2k5/8/3K4 w - - 150 1');

    expect(rzero.isSeventyFiveMoveRule()).toBe(true);
    expect(rzero.outcome().kind).toBe('seventy-five-move-rule');
  });
});
