import { RZero } from '../../src';

describe('SAN and UCI', () => {
  it('supports SAN, UCI, object moves, undo, redo, and history', () => {
    const rzero = new RZero();

    expect(rzero.move('e4')?.san).toBe('e4');
    expect(rzero.move('e7e5')?.uci).toBe('e7e5');
    expect(rzero.move({ from: 'g1', to: 'f3' })?.san).toBe('Nf3');
    expect(rzero.history()).toEqual(['e4', 'e5', 'Nf3']);

    expect(rzero.undo()?.san).toBe('Nf3');
    expect(rzero.redo()?.san).toBe('Nf3');
    expect(rzero.history()).toEqual(['e4', 'e5', 'Nf3']);
  });

  it('generates verbose move data and SAN from filtered move lists', () => {
    const rzero = new RZero();
    rzero.move('e4');
    rzero.move('e5');

    const moves = rzero.moves({ square: 'g1', verbose: true });
    expect(moves).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: 'g1', to: 'f3', san: 'Nf3', uci: 'g1f3' }),
        expect.objectContaining({ from: 'g1', to: 'h3', san: 'Nh3', uci: 'g1h3' })
      ])
    );
  });
});
