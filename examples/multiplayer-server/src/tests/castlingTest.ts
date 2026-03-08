import { RZero } from '../lib/rook-zero';

async function testCastling(): Promise<void> {
  console.log('🔍 Testing castling...\n');

  const rzero = new RZero();
  const setupMoves = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Be7'];

  for (const move of setupMoves) {
    const result = rzero.move(move);
    if (!result) {
      throw new Error(`Failed to play setup move ${move}`);
    }
    console.log(`   ✅ ${result.san}`);
  }

  const validation = rzero.validateMove('O-O');
  if (!validation.ok) {
    throw new Error(`Expected castling to be legal, received ${validation.reason}`);
  }

  const castled = rzero.move('O-O');
  if (!castled || !castled.isCastle || !castled.isKingsideCastle) {
    throw new Error('Expected kingside castling to succeed');
  }

  console.log(`\n   - Castling SAN: ${castled.san}`);
  console.log(`   - Castling UCI: ${castled.uci}`);
  console.log(`   - King square: ${rzero.kingSquare('w')}`);
  console.log(`   - FEN: ${rzero.fen()}`);
  console.log('\n✅ Castling test complete');
}

if (require.main === module) {
  testCastling().catch(error => {
    console.error('❌ Castling test failed:', error);
    process.exit(1);
  });
}

export { testCastling };
