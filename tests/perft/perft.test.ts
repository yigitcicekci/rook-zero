import { RkEngine } from '../../src';

describe('perft', () => {
  it('matches standard start position node counts', () => {
    const rkengine = new RkEngine();

    expect(rkengine.perft(1)).toBe(20);
    expect(rkengine.perft(2)).toBe(400);
    expect(rkengine.perft(3)).toBe(8902);
  });
});
