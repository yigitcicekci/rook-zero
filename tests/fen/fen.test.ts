import { RkEngine } from '../../src';

describe('FEN', () => {
  it('loads and exports the starting position', () => {
    const rkengine = new RkEngine();
    expect(rkengine.fen()).toBe('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    expect(rkengine.pieceAt('e1')).toEqual({ square: 'e1', type: 'k', color: 'w' });
    expect(rkengine.pieceAt('e4')).toBeNull();
  });

  it('rejects malformed and illegal positions with explicit reasons', () => {
    expect(RkEngine.validateFen('invalid')).toEqual({ ok: false, reason: 'invalid-fen' });
    expect(RkEngine.validateFen('8/8/8/8/8/8/8/8 w - - 0 1')).toEqual({ ok: false, reason: 'missing-king' });
    expect(RkEngine.validateFen('4k3/8/8/8/8/8/8/4K2P w - - 0 1')).toEqual({ ok: false, reason: 'illegal-pawn-placement' });
    expect(RkEngine.validateFen('4k3/8/8/8/8/8/8/R3K2R w k - 0 1')).toEqual({ ok: false, reason: 'invalid-castling-rights' });
    expect(RkEngine.validateFen('4k3/8/8/3pP3/8/8/8/4K3 w - e4 0 1')).toEqual({ ok: false, reason: 'invalid-en-passant-square' });
  });
});
