import { RkEngine } from '../lib/rook-zero';

interface MoveMetric {
  input: string;
  duration: number;
}

export class ChessEngineValidator {
  private readonly rkengine = new RkEngine();
  private readonly metrics: MoveMetric[] = [];

  async runFullValidation(): Promise<void> {
    console.log('🔍 Starting rook-zero validation...\n');
    this.checkInitialState();
    this.checkMoveValidation();
    this.checkUndoRedoAndHistory();
    this.checkNotationAndFen();
    this.checkDrawStates();
    this.checkPerft();
    this.showReport();
    console.log('\n✅ rook-zero validation complete');
  }

  private checkInitialState(): void {
    console.log('1️⃣ Initial state');
    console.log(`   - FEN: ${this.rkengine.fen()}`);
    console.log(`   - Turn: ${this.rkengine.turn()}`);
    console.log(`   - Legal moves: ${this.rkengine.moves().length}`);

    if (this.rkengine.moves().length !== 20) {
      throw new Error('Expected 20 legal moves in the starting position');
    }

    if (this.rkengine.turn() !== 'w') {
      throw new Error('Expected white to move first');
    }

    console.log('   ✅ Initial state validated\n');
  }

  private checkMoveValidation(): void {
    console.log('2️⃣ Move validation');
    this.recordMove('e4');
    this.recordMove('e5');
    this.recordMove('Nf3');
    this.recordMove('Nc6');
    this.recordMove('Bc4');

    const invalidBackwardPawn = this.rkengine.validateMove({ from: 'e5', to: 'e6' });
    if (invalidBackwardPawn.ok) {
      throw new Error('Expected invalid pawn move to fail');
    }

    const wrongTurn = this.rkengine.validateMove({ from: 'd2', to: 'd4' });
    if (wrongTurn.ok || wrongTurn.reason !== 'wrong-turn') {
      throw new Error(`Expected wrong-turn, received ${wrongTurn.ok ? 'ok' : wrongTurn.reason}`);
    }

    console.log(`   - Invalid move reason: ${invalidBackwardPawn.reason}`);
    console.log(`   - Wrong turn reason: ${wrongTurn.reason}`);
    console.log('   ✅ Move validation checked\n');
  }

  private checkUndoRedoAndHistory(): void {
    console.log('3️⃣ Undo / redo / history');
    const beforeUndo = this.rkengine.fen();
    const undone = this.rkengine.undo();
    if (!undone || undone.san !== 'Bc4') {
      throw new Error('Expected Bc4 to be undone');
    }

    const redone = this.rkengine.redo();
    if (!redone || redone.san !== 'Bc4') {
      throw new Error('Expected Bc4 to be redone');
    }

    const history = this.rkengine.history() as string[];
    if (history.join(' ') !== 'e4 e5 Nf3 Nc6 Bc4') {
      throw new Error(`Unexpected history: ${history.join(' ')}`);
    }

    if (beforeUndo !== this.rkengine.fen()) {
      throw new Error('Undo/redo should restore the same FEN');
    }

    console.log(`   - History: ${history.join(' ')}`);
    console.log('   ✅ Undo / redo verified\n');
  }

  private checkNotationAndFen(): void {
    console.log('4️⃣ Notation and FEN');
    const fen = this.rkengine.fen();
    const pgn = this.rkengine.pgn();
    const cloned = new RkEngine();
    const loadedFen = cloned.loadFen(fen);

    if (!loadedFen.ok) {
      throw new Error(`Expected FEN to load, received ${loadedFen.reason}`);
    }

    const fromPgn = new RkEngine();
    if (!fromPgn.loadPgn(pgn)) {
      throw new Error('Expected PGN import to succeed');
    }

    if (fromPgn.fen() !== this.rkengine.fen()) {
      throw new Error('PGN roundtrip did not restore the same position');
    }

    const invalidFen = RkEngine.validateFen('8/8/8/8/8/8/8/8 w - - 0 1');
    if (invalidFen.ok || invalidFen.reason !== 'missing-king') {
      throw new Error(`Expected missing-king, received ${invalidFen.ok ? 'ok' : invalidFen.reason}`);
    }

    console.log(`   - PGN: ${pgn}`);
    console.log(`   - FEN roundtrip: ${fen}`);
    console.log(`   - Invalid FEN reason: ${invalidFen.reason}`);
    console.log('   ✅ Notation layer validated\n');
  }

  private checkDrawStates(): void {
    console.log('5️⃣ Draw state detection');
    const repetition = new RkEngine();
    for (const move of ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8']) {
      if (!repetition.move(move)) {
        throw new Error(`Expected repetition move ${move} to succeed`);
      }
    }

    if (!repetition.isThreefoldRepetition()) {
      throw new Error('Expected threefold repetition');
    }

    const insufficient = new RkEngine('8/8/8/8/8/8/8/K1k5 w - - 0 1');
    if (!insufficient.isInsufficientMaterial()) {
      throw new Error('Expected insufficient material');
    }

    console.log(`   - Repetition outcome: ${repetition.outcome().kind}`);
    console.log(`   - Insufficient material: ${insufficient.isInsufficientMaterial()}`);
    console.log('   ✅ Draw states validated\n');
  }

  private checkPerft(): void {
    console.log('6️⃣ Perft');
    const perft = new RkEngine();
    const depth1 = perft.perft(1);
    const depth2 = perft.perft(2);

    if (depth1 !== 20 || depth2 !== 400) {
      throw new Error(`Unexpected perft results: depth1=${depth1}, depth2=${depth2}`);
    }

    console.log(`   - depth 1: ${depth1}`);
    console.log(`   - depth 2: ${depth2}`);
    console.log('   ✅ Perft validated\n');
  }

  private recordMove(input: string): void {
    const start = performance.now();
    const move = this.rkengine.move(input);
    const duration = performance.now() - start;

    if (!move) {
      throw new Error(`Expected move ${input} to succeed`);
    }

    this.metrics.push({ input, duration });
    console.log(`   - ${input}: ${move.san} (${duration.toFixed(2)}ms)`);
  }

  private showReport(): void {
    const total = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
    const average = this.metrics.length === 0 ? 0 : total / this.metrics.length;

    console.log('📊 Summary');
    console.log(`   - Moves measured: ${this.metrics.length}`);
    console.log(`   - Average move time: ${average.toFixed(2)}ms`);
    console.log(`   - Final FEN: ${this.rkengine.fen()}`);
  }
}

if (require.main === module) {
  const validator = new ChessEngineValidator();
  validator.runFullValidation().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}
