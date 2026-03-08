import { RZero } from '../../src';

describe('PGN', () => {
  it('exports and imports simple PGN sequences', () => {
    const rzero = new RZero();

    rzero.move('e4');
    rzero.move('e5');
    rzero.move('Nf3');
    rzero.move('Nc6');
    rzero.move('Bb5');

    expect(rzero.pgn()).toBe('1. e4 e5 2. Nf3 Nc6 3. Bb5 *');

    const replay = new RZero();
    expect(replay.loadPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5 *')).toBe(true);
    expect(replay.fen()).toBe(rzero.fen());
  });
});
