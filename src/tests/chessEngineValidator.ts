import { ChessEngine } from '../../chess-engine/engine';
import { PieceType, PieceColor } from '../../chess-engine/types';
import { redisService } from '../services/redis';

interface TestPlayer {
  id: string;
  name: string;
  color: 'white' | 'black';
}

interface TimingMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  moveCount: number;
  averageMoveTime?: number;
}

interface MoveMetric {
  move: string;
  player: string;
  startTime: number;
  endTime: number;
  duration: number;
  validationTime: number;
  executionTime: number;
}

export class ChessEngineValidator {
  private engine: ChessEngine;
  private moveHistory: string[] = [];
  private timingMetrics: TimingMetrics = {
    startTime: 0,
    moveCount: 0
  };
  private moveMetrics: MoveMetric[] = [];

  constructor() {
    this.engine = new ChessEngine();
  }

  async runFullValidation(): Promise<void> {
    console.log('🔍 Starting Chess Engine Logic Validation...');
    console.log('⏱️  Performance Monitoring Enabled\n');
    
    this.timingMetrics.startTime = performance.now();

    await this.checkInitialBoard();
    await this.checkBasicPawnMoves();
    await this.checkPieceMovements();
    await this.checkInvalidMoves();
    await this.checkGameFlow();

    this.timingMetrics.endTime = performance.now();
    this.timingMetrics.duration = this.timingMetrics.endTime - this.timingMetrics.startTime;
    this.timingMetrics.averageMoveTime = this.timingMetrics.moveCount > 0 ? 
      this.timingMetrics.duration / this.timingMetrics.moveCount : 0;

    this.showPerformanceReport();
    console.log('\n✅ Chess Engine Logic Validation Complete!');
  }

  private async checkInitialBoard(): Promise<void> {
    console.log('1️⃣ Testing Initial Board State...');
    
    const board = this.engine.getBoard();
    const gameState = this.engine.getGameState();

    console.log(`   - Board has ${board.pieces.length} pieces`);
    console.log(`   - Current player: ${gameState.activeColor}`);
    console.log(`   - FEN: ${this.engine.getFEN()}`);

    const whitePawns = board.pieces.filter(p => p.type === 'p' && p.color === 'w');
    const blackPawns = board.pieces.filter(p => p.type === 'p' && p.color === 'b');
    
    console.log(`   - White pawns: ${whitePawns.length} (should be 8)`);
    console.log(`   - Black pawns: ${blackPawns.length} (should be 8)`);

    if (board.pieces.length !== 32) {
      console.error(`   ❌ ERROR: Expected 32 pieces, found ${board.pieces.length}`);
    }

    if (gameState.activeColor !== 'w') {
      console.error(`   ❌ ERROR: Expected white to move first, got ${gameState.activeColor}`);
    }

    console.log('   ✅ Initial board state validated\n');
  }

  private async checkBasicPawnMoves(): Promise<void> {
    console.log('2️⃣ Testing Basic Pawn Moves...');

    console.log('   - Testing pawn move from 6,4 to 4,4');
    
    const moveStartTime = performance.now();
    const validationStartTime = performance.now();
    
    const pawnMove = {
      from: { row: 6, col: 4 },
      to: { row: 4, col: 4 },
      piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 6, col: 4 } },
      isCapture: false
    };

    const validation = this.engine.isMoveValid(pawnMove);
    const validationEndTime = performance.now();
    const validationTime = validationEndTime - validationStartTime;
    
    console.log(`   - e2-e4 validation: ${validation.valid} (${validationTime.toFixed(2)}ms)`);

    const executionStartTime = performance.now();
    if (validation.valid) {
      this.engine.makeMove(pawnMove);
      this.moveHistory.push('e4');
      this.timingMetrics.moveCount++;
    }
    const executionEndTime = performance.now();
    const executionTime = executionEndTime - executionStartTime;
    const totalMoveTime = executionEndTime - moveStartTime;

    this.moveMetrics.push({
      move: 'e4',
      player: 'white',
      startTime: moveStartTime,
      endTime: executionEndTime,
      duration: totalMoveTime,
      validationTime,
      executionTime
    });

    console.log(`   - Move execution: ${executionTime.toFixed(2)}ms, Total: ${totalMoveTime.toFixed(2)}ms`);
    console.log('   ✅ Basic pawn moves validated');
  }

  private async checkPieceMovements(): Promise<void> {
    console.log('3️⃣ Testing Piece Movements...');

    await this.recordTimedMove('Nc6', 'black', {
      from: { row: 0, col: 1 },
      to: { row: 2, col: 2 },
      piece: { type: PieceType.KNIGHT, color: PieceColor.BLACK, position: { row: 0, col: 1 } },
      isCapture: false
    });

    await this.recordTimedMove('Bc4', 'white', {
      from: { row: 7, col: 5 },
      to: { row: 4, col: 2 },
      piece: { type: PieceType.BISHOP, color: PieceColor.WHITE, position: { row: 7, col: 5 } },
      isCapture: false
    });

    console.log('   ✅ Piece movements tested\n');
  }

  private async recordTimedMove(notation: string, player: string, move: any): Promise<void> {
    const moveStartTime = performance.now();
    const validationStartTime = performance.now();
    
    const validation = this.engine.isMoveValid(move);
    const validationEndTime = performance.now();
    const validationTime = validationEndTime - validationStartTime;
    
    console.log(`   - ${notation} validation: ${validation.valid} (${validationTime.toFixed(2)}ms)`);

    const executionStartTime = performance.now();
    if (validation.valid) {
      this.engine.makeMove(move);
      this.moveHistory.push(notation);
      this.timingMetrics.moveCount++;
    }
    const executionEndTime = performance.now();
    const executionTime = executionEndTime - executionStartTime;
    const totalMoveTime = executionEndTime - moveStartTime;

    this.moveMetrics.push({
      move: notation,
      player,
      startTime: moveStartTime,
      endTime: executionEndTime,
      duration: totalMoveTime,
      validationTime,
      executionTime
    });

    console.log(`   - Move execution: ${executionTime.toFixed(2)}ms, Total: ${totalMoveTime.toFixed(2)}ms`);
  }

  private showPerformanceReport(): void {
    console.log('\n📊 PERFORMANCE ANALYTICS REPORT');
    console.log('═══════════════════════════════════════');
    console.log(`🚀 Total Test Duration: ${this.timingMetrics.duration?.toFixed(2)}ms (${(this.timingMetrics.duration! / 1000).toFixed(2)}s)`);
    console.log(`🎯 Total Moves Executed: ${this.timingMetrics.moveCount}`);
    console.log(`⚡ Average Move Time: ${this.timingMetrics.averageMoveTime?.toFixed(2)}ms`);
    
    if (this.moveMetrics.length > 0) {
      const fastestMove = this.moveMetrics.reduce((fastest, current) => 
        current.duration < fastest.duration ? current : fastest
      );
      const slowestMove = this.moveMetrics.reduce((slowest, current) => 
        current.duration > slowest.duration ? current : slowest
      );
      
      console.log(`🏃 Fastest Move: ${fastestMove.move} (${fastestMove.player}) - ${fastestMove.duration.toFixed(2)}ms`);
      console.log(`🐌 Slowest Move: ${slowestMove.move} (${slowestMove.player}) - ${slowestMove.duration.toFixed(2)}ms`);
      
      const avgValidation = this.moveMetrics.reduce((sum, metric) => sum + metric.validationTime, 0) / this.moveMetrics.length;
      const avgExecution = this.moveMetrics.reduce((sum, metric) => sum + metric.executionTime, 0) / this.moveMetrics.length;
      
      console.log(`🔍 Average Validation Time: ${avgValidation.toFixed(2)}ms`);
      console.log(`⚙️  Average Execution Time: ${avgExecution.toFixed(2)}ms`);
      
      console.log('\n📈 DETAILED MOVE BREAKDOWN:');
      this.moveMetrics.forEach((metric, index) => {
        console.log(`   ${index + 1}. ${metric.move} (${metric.player}): ${metric.duration.toFixed(2)}ms [V:${metric.validationTime.toFixed(2)}ms | E:${metric.executionTime.toFixed(2)}ms]`);
      });
    }
    console.log('═══════════════════════════════════════');
  }

  private async checkInvalidMoves(): Promise<void> {
    console.log('4️⃣ Testing Invalid Move Detection...');

    const gameState = this.engine.getGameState();
    console.log(`   - Current turn before invalid tests: ${gameState.activeColor}`);
    
    if (gameState.activeColor === 'b') {
      const dummyBlackMove = {
        from: { row: 1, col: 0 },
        to: { row: 3, col: 0 },
        piece: { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 1, col: 0 } },
        isCapture: false
      };
      const dummyResult = this.engine.isMoveValid(dummyBlackMove);
      if (dummyResult.valid) {
        this.engine.makeMove(dummyBlackMove);
        console.log(`   - Made dummy black move to switch turn`);
      }
    }

    const invalidPawnMove = {
      from: { row: 4, col: 4 },
      to: { row: 5, col: 4 },
      piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 4, col: 4 } },
      isCapture: false
    };

    const invalidValidation = this.engine.isMoveValid(invalidPawnMove);
    console.log(`   - Invalid pawn move: ${invalidValidation.valid} (should be false)`);

    if (invalidValidation.valid) {
      console.error(`   ❌ ERROR: Backward pawn move should be invalid!`);
    }

    const currentTurn = this.engine.getCurrentPlayer();
    console.log(`   - Current turn when testing opponent move: ${currentTurn}`);
    
    const opponentPieceMove = {
      from: { row: 1, col: 1 },
      to: { row: 2, col: 1 },
      piece: { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 1, col: 1 } },
      isCapture: false
    };

    const opponentValidation = this.engine.isMoveValid(opponentPieceMove);
    console.log(`   - Opponent piece move: ${opponentValidation.valid} (should be false)`);

    if (opponentValidation.valid) {
      console.error(`   ❌ ERROR: Moving opponent's piece should be invalid!`);
    }

    console.log('   ✅ Invalid move detection tested\n');
  }

  private async checkGameFlow(): Promise<void> {
    console.log('5️⃣ Testing Game Flow...');

    const currentFEN = this.engine.getFEN();
    const gameState = this.engine.getGameState();
    
    console.log(`   - Current FEN: ${currentFEN}`);
    console.log(`   - Current turn: ${gameState.activeColor}`);
    console.log(`   - Move history: ${this.moveHistory.join(', ')}`);
    console.log(`   - Full moves: ${gameState.fullMoves}`);
    console.log(`   - Half moves: ${gameState.halfMoves}`);

    console.log('\n   🔍 CRITICAL TEST: Testing Qh5 move that failed in simulation...');
    
    const board = this.engine.getBoard();
    console.log(`   - Board pieces count: ${board.pieces.length}`);
    
    console.log('   - Pieces on Queen\'s potential path:');
    for (let row = 3; row <= 7; row++) {
      for (let col = 3; col <= 7; col++) {
        const piece = board.pieces.find(p => p.position.row === row && p.position.col === col);
        if (piece) {
          console.log(`     * ${piece.type}${piece.color} at row:${row}, col:${col}`);
        }
      }
    }

    const qh5Move = {
      from: { row: 7, col: 3 },
      to: { row: 3, col: 7 },
      piece: { type: PieceType.QUEEN, color: PieceColor.WHITE, position: { row: 7, col: 3 } },
      isCapture: false
    };

    const qh5Validation = this.engine.isMoveValid(qh5Move);
    console.log(`   - Qd1-h5 validation: ${qh5Validation.valid}`);
    console.log(`   - Error (if any): ${qh5Validation.error || 'None'}`);

    const pathBlocked = this.isQueenPathBlocked(board.pieces, { row: 7, col: 3 }, { row: 3, col: 7 });
    console.log(`   - Manual path check: ${pathBlocked ? 'BLOCKED' : 'CLEAR'}`);

    if (qh5Validation.valid !== !pathBlocked) {
      console.error(`   ❌ CHESS ENGINE BUG DETECTED! Path check mismatch!`);
    }

    console.log('   ✅ Game flow tested\n');
  }

  private isQueenPathBlocked(pieces: any[], from: {row: number, col: number}, to: {row: number, col: number}): boolean {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    const rowStep = rowDiff === 0 ? 0 : rowDiff / steps;
    const colStep = colDiff === 0 ? 0 : colDiff / steps;

    console.log(`     Debug: Queen path from ${from.row},${from.col} to ${to.row},${to.col}`);
    console.log(`     Debug: Steps=${steps}, rowStep=${rowStep}, colStep=${colStep}`);

    for (let i = 1; i < steps; i++) {
      const checkRow = from.row + Math.round(rowStep * i);
      const checkCol = from.col + Math.round(colStep * i);
      
      const blockingPiece = pieces.find(p => 
        p.position.row === checkRow && p.position.col === checkCol
      );
      
      if (blockingPiece) {
        console.log(`     Debug: BLOCKING PIECE found at ${checkRow},${checkCol}: ${blockingPiece.type}${blockingPiece.color}`);
        return true;
      }
    }
    
    return false;
  }

  async runUserTests(): Promise<void> {
    console.log('\n👥 Testing with X and Y Users...\n');
    console.log('⏱️  Starting Socket Performance Test...');

    const xyTestStartTime = performance.now();
    const connectionMetrics: any[] = [];

    const xyEngine = new ChessEngine();

    const playerX: TestPlayer = { id: 'user_X', name: 'Player X', color: 'white' };
    const playerY: TestPlayer = { id: 'user_Y', name: 'Player Y', color: 'black' };

    const redisStartTime = performance.now();
    await redisService.connect();
    await redisService.savePlayerSession(playerX.id, 'socket_x');
    await redisService.savePlayerSession(playerY.id, 'socket_y');
    const redisEndTime = performance.now();
    const redisTime = redisEndTime - redisStartTime;

    console.log(`✅ Redis Operations: ${redisTime.toFixed(2)}ms`);
    console.log(`✅ Created Redis sessions for ${playerX.name} and ${playerY.name}`);

    console.log('\n🎮 Simulating game with performance tracking...');
    
    const moves = [
      { player: playerX, move: 'e4', from: {row: 6, col: 4}, to: {row: 4, col: 4}, piece: { type: PieceType.PAWN, color: PieceColor.WHITE, position: { row: 6, col: 4 } } },
      { player: playerY, move: 'e5', from: {row: 1, col: 4}, to: {row: 3, col: 4}, piece: { type: PieceType.PAWN, color: PieceColor.BLACK, position: { row: 1, col: 4 } } },
      { player: playerX, move: 'Nf3', from: {row: 7, col: 6}, to: {row: 5, col: 5}, piece: { type: PieceType.KNIGHT, color: PieceColor.WHITE, position: { row: 7, col: 6 } } },
      { player: playerY, move: 'Nc6', from: {row: 0, col: 1}, to: {row: 2, col: 2}, piece: { type: PieceType.KNIGHT, color: PieceColor.BLACK, position: { row: 0, col: 1 } } },
    ];

    const gameMetrics: any[] = [];

    for (const {player, move, from, to, piece} of moves) {
      const moveStartTime = performance.now();
      
      const chessMove = { from, to, piece, isCapture: false };
      
      const validationStartTime = performance.now();
      const validation = xyEngine.isMoveValid(chessMove);
      const validationEndTime = performance.now();
      
      const executionStartTime = performance.now();
      if (validation.valid) {
        xyEngine.makeMove(chessMove);
      }
      const executionEndTime = performance.now();
      
      const totalMoveTime = executionEndTime - moveStartTime;
      const validationTime = validationEndTime - validationStartTime;
      const executionTime = executionEndTime - executionStartTime;
      
      gameMetrics.push({
        player: player.name,
        color: player.color,
        move,
        valid: validation.valid,
        totalTime: totalMoveTime,
        validationTime,
        executionTime,
        error: validation.error
      });
      
      console.log(`${player.name} (${player.color}) plays ${move}: ${validation.valid} [${totalMoveTime.toFixed(2)}ms]`);
      
      if (!validation.valid) {
        console.error(`❌ ERROR: ${player.name}'s move ${move} should be valid! Error: ${validation.error}`);
      }
      
      const networkDelay = Math.random() * 100 + 50;
      await new Promise(resolve => setTimeout(resolve, networkDelay));
    }

    const xyTestEndTime = performance.now();
    const totalTestTime = xyTestEndTime - xyTestStartTime;

    await redisService.disconnect();

    console.log('\n📊 X&Y USERS PERFORMANCE REPORT');
    console.log('═══════════════════════════════════════');
    console.log(`🎮 Total Game Simulation Time: ${totalTestTime.toFixed(2)}ms (${(totalTestTime / 1000).toFixed(2)}s)`);
    console.log(`🔌 Redis Connection Time: ${redisTime.toFixed(2)}ms`);
    console.log(`🎯 Moves Simulated: ${gameMetrics.length}`);
    
    const avgMoveTime = gameMetrics.reduce((sum, metric) => sum + metric.totalTime, 0) / gameMetrics.length;
    const avgValidationTime = gameMetrics.reduce((sum, metric) => sum + metric.validationTime, 0) / gameMetrics.length;
    const avgExecutionTime = gameMetrics.reduce((sum, metric) => sum + metric.executionTime, 0) / gameMetrics.length;
    
    console.log(`⚡ Average Move Processing: ${avgMoveTime.toFixed(2)}ms`);
    console.log(`🔍 Average Validation Time: ${avgValidationTime.toFixed(2)}ms`);
    console.log(`⚙️  Average Execution Time: ${avgExecutionTime.toFixed(2)}ms`);
    
    console.log('\n📈 MOVE-BY-MOVE BREAKDOWN:');
    gameMetrics.forEach((metric, index) => {
      const status = metric.valid ? '✅' : '❌';
      console.log(`   ${index + 1}. ${status} ${metric.player} (${metric.color}) - ${metric.move}: ${metric.totalTime.toFixed(2)}ms [V:${metric.validationTime.toFixed(2)}ms | E:${metric.executionTime.toFixed(2)}ms]`);
    });
    
    console.log('═══════════════════════════════════════');
    console.log('\n✅ X and Y user test completed');
  }
}

if (require.main === module) {
  (async () => {
    const validator = new ChessEngineValidator();
    await validator.runFullValidation();
    await validator.runUserTests();
    process.exit(0);
  })();
} 