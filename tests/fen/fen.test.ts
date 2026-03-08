import { RZero } from '../../src';

describe('FEN', () => {
  it('loads and exports the starting position', () => {
    const rzero = new RZero();
    expect(rzero.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(rzero.pieceAt('e1')).toEqual({ square: 'e1', type: 'k', color: 'w' });
    expect(rzero.pieceAt('e4')).toBeNull();
  });

  it('rejects malformed and illegal positions with explicit reasons', () => {
    expect(RZero.validateFen('invalid')).toEqual({ ok: false, reason: 'invalid-fen' });
    expect(RZero.validateFen('8/8/8/8/8/8/8/8 w - - 0 1')).toEqual({ ok: false, reason: 'missing-king' });
    expect(RZero.validateFen('4k3/8/8/8/8/8/8/4K2P w - - 0 1')).toEqual({ ok: false, reason: 'illegal-pawn-placement' });
    expect(RZero.validateFen('4k3/8/8/8/8/8/8/R3K2R w k - 0 1')).toEqual({ ok: false, reason: 'invalid-castling-rights' });
    expect(RZero.validateFen('4k3/8/8/3pP3/8/8/8/4K3 w - e4 0 1')).toEqual({ ok: false, reason: 'invalid-en-passant-square' });
  });
});
