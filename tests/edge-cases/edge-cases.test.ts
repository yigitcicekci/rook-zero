import { RkEngine } from '../../src';

describe('edge cases and validation', () => {
  it('rejects en passant when the pawn is pinned to the king', () => {
    const rkengine = new RkEngine('k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');

    expect(rkengine.validateMove({ from: 'e5', to: 'd6' })).toEqual({ ok: false, reason: 'king-in-check' });
  });

  it('detects double check checkers', () => {
    const rkengine = new RkEngine('4k3/4Q3/8/1B6/8/8/8/4K3 b - - 0 1');

    expect(rkengine.inCheck()).toBe(true);
    expect(rkengine.checkers().sort()).toEqual(['b5', 'e7']);
  });

  it('restores the exact starting position after make/unmake symmetry', () => {
    const rkengine = new RkEngine();
    const moves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'];

    for (const move of moves) {
      expect(rkengine.move(move)).not.toBeNull();
    }

    while (rkengine.undo()) {
    }

    expect(rkengine.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });
});
