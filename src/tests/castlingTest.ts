import ChessEngine from '../../chess-engine';

async function testCastling() {
  console.log('🔍 Testing Castling Specifically...\n');
  const engine = new ChessEngine();
  console.log('1️⃣ Initial board:');
  const board = engine.getBoard();
  console.log(`   Board FEN field: "${board.fen}"`);
  console.log(`   Engine full FEN: "${engine.getFEN()}"`);
  const moves = [
    { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, notation: 'e4' },
    { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, notation: 'e5' },
    { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, notation: 'Nf3' },
    { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, notation: 'Nc6' },
    { from: { row: 7, col: 5 }, to: { row: 4, col: 2 }, notation: 'Bc4' },
    { from: { row: 0, col: 5 }, to: { row: 1, col: 4 }, notation: 'Be7' },
  ];

  console.log('\n2️⃣ Playing setup moves...');
  for (const move of moves) {
    const board = engine.getBoard();
    const piece = board.pieces.find(p => 
      p.position.row === move.from.row && p.position.col === move.from.col
    );
    
    const chessMove = {
      from: move.from,
      to: move.to,
      piece: piece || {} as any,
      isCapture: false,
      isCastling: false
    };

    const result = engine.isMoveValid(chessMove);
    if (result.valid) {
      engine.makeMove(chessMove);
      console.log(`   ✅ ${move.notation} played`);
    } else {
      console.log(`   ❌ ${move.notation} failed: ${result.error}`);
    }
  }

  console.log('\n3️⃣ Testing castling move:');
  const finalBoard = engine.getBoard();
  console.log(`   Board FEN field: "${finalBoard.fen}"`);
  console.log(`   Engine full FEN: "${engine.getFEN()}"`);
  
  const king = finalBoard.pieces.find(p => 
    p.position.row === 7 && p.position.col === 4 && p.type === 'k'
  );
  
  if (king) {
    console.log(`   King found at: ${king.position.row},${king.position.col}`);
    
    const castlingMove = {
      from: { row: 7, col: 4 },
      to: { row: 7, col: 6 },
      piece: king,
      isCapture: false,
      isCastling: true 
    };

    console.log('   Testing castling with isCastling=true...');
    console.log('   ✅ About to call engine.isMoveValid() for castling...');
    const castlingResult = engine.isMoveValid(castlingMove);
    console.log(`   ✅ engine.isMoveValid() returned: ${JSON.stringify(castlingResult)}`);
    console.log(`   Castling validation: ${castlingResult.valid}`);
    
    if (castlingResult.valid) {
      const success = engine.makeMove(castlingMove);
      console.log(`   Castling execution: ${success}`);
    }
  } else {
    console.log('   ❌ King not found!');
  }

  console.log('\n✅ Castling test complete');
}

if (require.main === module) {
  testCastling().catch(console.error);
}

export { testCastling }; 