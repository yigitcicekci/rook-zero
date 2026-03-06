import { RkEngine } from '../../src';

describe('draw detection', () => {
  it('detects stalemate', () => {
    const rkengine = new RkEngine('7k/5Q2/7K/8/8/8/8/8 b - - 0 1');

    expect(rkengine.isStalemate()).toBe(true);
    expect(rkengine.isDraw()).toBe(true);
    expect(rkengine.outcome().kind).toBe('stalemate');
  });

  it('detects insufficient material', () => {
    const rkengine = new RkEngine('8/8/8/8/8/2k5/8/3K4 w - - 0 1');

    expect(rkengine.isInsufficientMaterial()).toBe(true);
    expect(rkengine.isDraw()).toBe(true);
    expect(rkengine.outcome().kind).toBe('insufficient-material');
  });

  it('detects insufficient material for bishops on the same color complex', () => {
    const rkengine = new RkEngine('8/7k/8/8/8/8/8/B1BK4 w - - 0 1');

    expect(rkengine.isInsufficientMaterial()).toBe(true);
    expect(rkengine.outcome().kind).toBe('insufficient-material');
  });

  it('detects threefold repetition', () => {
    const rkengine = new RkEngine();
    const sequence = ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8'];

    for (const move of sequence) {
      expect(rkengine.move(move)).not.toBeNull();
    }

    expect(rkengine.isThreefoldRepetition()).toBe(true);
    expect(rkengine.isDraw()).toBe(true);
    expect(rkengine.outcome().kind).toBe('threefold-repetition');
  });

  it('detects the fifty-move rule from fen state', () => {
    const rkengine = new RkEngine('8/8/8/8/8/2k5/8/3K4 w - - 100 1');

    expect(rkengine.isFiftyMoveRule()).toBe(true);
    expect(rkengine.outcome().kind).toBe('fifty-move-rule');
  });

  it('detects fivefold repetition', () => {
    const rkengine = new RkEngine();
    const cycle = ['Nf3', 'Nf6', 'Ng1', 'Ng8'];

    for (let i = 0; i < 4; i++) {
      for (const move of cycle) {
        expect(rkengine.move(move)).not.toBeNull();
      }
    }

    expect(rkengine.isFivefoldRepetition()).toBe(true);
    expect(rkengine.outcome().kind).toBe('fivefold-repetition');
  });

  it('detects the seventy-five-move rule from fen state', () => {
    const rkengine = new RkEngine('8/8/8/8/8/2k5/8/3K4 w - - 150 1');

    expect(rkengine.isSeventyFiveMoveRule()).toBe(true);
    expect(rkengine.outcome().kind).toBe('seventy-five-move-rule');
  });
});
