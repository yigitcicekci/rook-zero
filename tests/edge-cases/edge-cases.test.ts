import { RZero } from '../../src';

describe('edge cases and validation', () => {
  it('rejects en passant when the pawn is pinned to the king', () => {
    const rzero = new RZero('k3r3/8/8/3pP3/8/8/8/4K3 w - d6 0 1');

    expect(rzero.validateMove({ from: 'e5', to: 'd6' })).toEqual({ ok: false, reason: 'king-in-check' });
  });

  it('detects double check checkers', () => {
    const rzero = new RZero('4k3/4Q3/8/1B6/8/8/8/4K3 b - - 0 1');

    expect(rzero.inCheck()).toBe(true);
    expect(rzero.checkers().sort()).toEqual(['b5', 'e7']);
  });

  it('restores the exact starting position after make/unmake symmetry', () => {
    const rzero = new RZero();
    const moves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5', 'a6'];

    for (const move of moves) {
      expect(rzero.move(move)).not.toBeNull();
    }

    while (rzero.undo()) {
    }

    expect(rzero.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  });
});
