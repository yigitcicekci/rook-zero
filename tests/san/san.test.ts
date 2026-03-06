import { RkEngine } from '../../src';

describe('SAN and UCI', () => {
  it('supports SAN, UCI, object moves, undo, redo, and history', () => {
    const rkengine = new RkEngine();

    expect(rkengine.move('e4')?.san).toBe('e4');
    expect(rkengine.move('e7e5')?.uci).toBe('e7e5');
    expect(rkengine.move({ from: 'g1', to: 'f3' })?.san).toBe('Nf3');
    expect(rkengine.history()).toEqual(['e4', 'e5', 'Nf3']);

    expect(rkengine.undo()?.san).toBe('Nf3');
    expect(rkengine.redo()?.san).toBe('Nf3');
    expect(rkengine.history()).toEqual(['e4', 'e5', 'Nf3']);
  });

  it('generates verbose move data and SAN from filtered move lists', () => {
    const rkengine = new RkEngine();
    rkengine.move('e4');
    rkengine.move('e5');

    const moves = rkengine.moves({ square: 'g1', verbose: true });
    expect(moves).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: 'g1', to: 'f3', san: 'Nf3', uci: 'g1f3' }),
        expect.objectContaining({ from: 'g1', to: 'h3', san: 'Nh3', uci: 'g1h3' })
      ])
    );
  });
});
