import { RkEngine } from '../../src';

describe('PGN', () => {
  it('exports and imports simple PGN sequences', () => {
    const rkengine = new RkEngine();

    rkengine.move('e4');
    rkengine.move('e5');
    rkengine.move('Nf3');
    rkengine.move('Nc6');
    rkengine.move('Bb5');

    expect(rkengine.pgn()).toBe('1. e4 e5 2. Nf3 Nc6 3. Bb5 *');

    const replay = new RkEngine();
    expect(replay.loadPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5 *')).toBe(true);
    expect(replay.fen()).toBe(rkengine.fen());
  });
});
