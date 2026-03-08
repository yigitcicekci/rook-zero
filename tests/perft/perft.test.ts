import { RZero } from '../../src';

describe('perft', () => {
  it('matches standard start position node counts', () => {
    const rzero = new RZero();

    expect(rzero.perft(1)).toBe(20);
    expect(rzero.perft(2)).toBe(400);
    expect(rzero.perft(3)).toBe(8902);
  });
});
