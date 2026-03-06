import { io, Socket } from 'socket.io-client';
import { redisService } from '../services/redis.service';

interface Player {
  id: string;
  name: string;
  socket: Socket;
  color?: 'white' | 'black';
}

export class XYUserTest {
  private players: Player[] = [];
  private matchId?: string;
  private testResults: any[] = [];

  async runComprehensiveTest(): Promise<void> {
    console.log('🚀 Starting Comprehensive X & Y User Test...\n');

    try {
      await this.setupRedisAndPlayers();
      await this.testMatchCreationAndJoining();
      await this.testChessEngineWithRealMoves();
      await this.testEdgeCasesAndErrors();
      await this.testPerformanceAndConcurrency();
      this.generateTestReport();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
    } finally {
      await this.cleanup();
    }
  }

  private async setupRedisAndPlayers(): Promise<void> {
    console.log('1️⃣ Setting up Redis and X & Y Players...\n');

    await redisService.connect();
    const ping = await redisService.ping();
    console.log(`✅ Redis connected: ${ping}`);
    const playerConfigs = [
      { id: 'user_X', name: 'Player X' },
      { id: 'user_Y', name: 'Player Y' }
    ];

    for (const config of playerConfigs) {
      const socket = io('http://localhost:3000', {
        transports: ['websocket'],
        forceNew: true
      });

      const player: Player = {
        id: config.id,
        name: config.name,
        socket
      };

      await new Promise<void>((resolve, reject) => {
        socket.on('connect', () => {
          console.log(`✅ ${config.name} connected (${socket.id})`);
          
          socket.emit('identify', {
            playerId: config.id,
            playerName: config.name
          });
          
          if (socket.id) {
            redisService.savePlayerSession(config.id, socket.id);
          }
          
          resolve();
        });

        socket.on('connect_error', (error) => {
          console.error(`❌ Failed to connect ${config.name}:`, error);
          reject(error);
        });

        setTimeout(() => {
          reject(new Error(`Timeout connecting ${config.name}`));
        }, 5000);
      });

      this.players.push(player);
    }

    console.log('✅ X and Y players setup complete\n');
  }

  private async testMatchCreationAndJoining(): Promise<void> {
    console.log('2️⃣ Testing Match Creation and Joining...\n');
    const createResult = await new Promise<any>((resolve) => {
      this.players[0].socket.emit('create_match', (response: any) => {
        resolve(response);
      });
    });

    if (createResult.success) {
      this.matchId = createResult.matchId;
      console.log(`✅ Player X created match: ${this.matchId}`);
      this.testResults.push({ test: 'match_creation', passed: true, matchId: this.matchId });
    } else {
      console.error(`❌ Match creation failed: ${createResult.error}`);
      this.testResults.push({ test: 'match_creation', passed: false, error: createResult.error });
      throw new Error('Match creation failed');
    }

    const joinResult = await new Promise<any>((resolve) => {
      this.players[1].socket.emit('join_match', { matchId: this.matchId }, (response: any) => {
        resolve(response);
      });
    });

    if (joinResult.success) {
      this.players[1].color = joinResult.player.color;
      console.log(`✅ Player Y joined as ${joinResult.player.color}`);
      this.testResults.push({ test: 'player_joining', passed: true, color: joinResult.player.color });
    } else {
      console.error(`❌ Player Y join failed: ${joinResult.error}`);
      this.testResults.push({ test: 'player_joining', passed: false, error: joinResult.error });
      throw new Error('Player joining failed');
    }

    const xJoinResult = await new Promise<any>((resolve) => {
      this.players[0].socket.emit('join_match', { matchId: this.matchId }, (response: any) => {
        resolve(response);
      });
    });

    if (xJoinResult.success) {
      this.players[0].color = xJoinResult.player.color;
      console.log(`✅ Player X joined as ${xJoinResult.player.color}`);
      await new Promise<void>((resolve) => {
        this.players[0].socket.on('match_started', () => {
          console.log('🎮 Match started between X and Y!');
          resolve();
        });
      });
    }

    console.log('✅ Match creation and joining tests passed\n');
  }

  private async testChessEngineWithRealMoves(): Promise<void> {
    console.log('3️⃣ Testing Chess Engine with Real Moves...\n');


    const testMoves = [
      { player: 'white', notation: 'e4', from: { row: 6, col: 4 }, to: { row: 4, col: 4 } },
      { player: 'black', notation: 'e5', from: { row: 1, col: 4 }, to: { row: 3, col: 4 } },
      { player: 'white', notation: 'Nf3', from: { row: 7, col: 6 }, to: { row: 5, col: 5 } },
      { player: 'black', notation: 'Nc6', from: { row: 0, col: 1 }, to: { row: 2, col: 2 } },
      { player: 'white', notation: 'Bc4', from: { row: 7, col: 5 }, to: { row: 4, col: 2 } },
      { player: 'black', notation: 'Be7', from: { row: 0, col: 5 }, to: { row: 1, col: 4 } },
      { player: 'white', notation: 'O-O', from: { row: 7, col: 4 }, to: { row: 7, col: 6 }, isCastling: true },
      { player: 'black', notation: 'Nf6', from: { row: 0, col: 6 }, to: { row: 2, col: 5 } },
    ];

    let moveCount = 0;
    for (const move of testMoves) {
      const currentPlayer = this.players.find(p => p.color === move.player);
      if (!currentPlayer) {
        console.error(`❌ Player with color ${move.player} not found`);
        break;
      }

      console.log(`🎯 ${currentPlayer.name} (${move.player}) attempting: ${move.notation}`);

      const moveResult = await new Promise<any>((resolve) => {
        currentPlayer.socket.emit('make_move', {
          matchId: this.matchId,
          move: {
            from: move.from,
            to: move.to,
            notation: move.notation,
            isCastling: move.isCastling || false
          }
        }, (response: any) => {
          resolve(response);
        });
      });

      if (moveResult.success) {
        moveCount++;
        console.log(`✅ Move ${moveCount}: ${move.notation} successful`);
        this.testResults.push({ 
          test: `move_${moveCount}`, 
          passed: true, 
          move: move.notation, 
          player: move.player 
        });

        console.log(`   FEN: ${moveResult.match.fen.substring(0, 50)}...`);
      } else {
        console.error(`❌ Move ${move.notation} failed: ${moveResult.error}`);
        this.testResults.push({ 
          test: `move_${moveCount + 1}`, 
          passed: false, 
          move: move.notation, 
          error: moveResult.error,
          invalidMove: moveResult.invalidMove 
        });

        if (moveResult.invalidMove) {
          console.log(`🔍 INVESTIGATING INVALID MOVE: ${move.notation}`);
          console.log(`   Error: ${moveResult.error}`);
          const matchState = await new Promise<any>((resolve) => {
            currentPlayer.socket.emit('get_match', { matchId: this.matchId }, (response: any) => {
              resolve(response);
            });
          });
          
          if (matchState.success) {
            console.log(`   Match turn: ${matchState.match.currentTurn}`);
            console.log(`   Move history: ${matchState.match.moveHistory.join(', ')}`);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ Tested ${moveCount} moves successfully\n`);
  }

  private async testEdgeCasesAndErrors(): Promise<void> {
    console.log('4️⃣ Testing Edge Cases and Error Scenarios...\n');
    const invalidMoveResult = await new Promise<any>((resolve) => {
      this.players[0].socket.emit('make_move', {
        matchId: this.matchId,
        move: {
          from: { row: 3, col: 3 }, 
          to: { row: 4, col: 3 },
          notation: 'invalid'
        }
      }, (response: any) => {
        resolve(response);
      });
    });

    console.log(`🔍 Invalid move test: ${invalidMoveResult.success ? 'FAIL (should reject)' : 'PASS (correctly rejected)'}`);
    console.log(`   Error: ${invalidMoveResult.error}`);

    const wrongTurnResult = await new Promise<any>((resolve) => {
      const wrongPlayer = this.players[0].color === 'white' ? this.players[1] : this.players[0];
      wrongPlayer.socket.emit('make_move', {
        matchId: this.matchId,
        move: {
          from: { row: 6, col: 0 },
          to: { row: 5, col: 0 },
          notation: 'a3'
        }
      }, (response: any) => {
        resolve(response);
      });
    });

    console.log(`🔍 Wrong turn test: ${wrongTurnResult.success ? 'FAIL (should reject)' : 'PASS (correctly rejected)'}`);
    console.log(`   Error: ${wrongTurnResult.error}`);
    console.log('🔍 Testing player disconnect/reconnect...');
    const originalSocketY = this.players[1].socket;
    originalSocketY.disconnect();

    await new Promise(resolve => setTimeout(resolve, 1000));
    const newSocket = io('http://localhost:3000', {
      transports: ['websocket'],
      forceNew: true
    });

    await new Promise<void>((resolve) => {
      newSocket.on('connect', () => {
        newSocket.emit('identify', {
          playerId: 'user_Y',
          playerName: 'Player Y'
        });
        
        newSocket.emit('join_match', { matchId: this.matchId }, (response: any) => {
          if (response.success) {
            console.log('✅ Player Y reconnected successfully');
            this.players[1].socket = newSocket;
            resolve();
          }
        });
      });
    });

    console.log('✅ Edge cases and error scenarios tested\n');
  }

  private async testPerformanceAndConcurrency(): Promise<void> {
    console.log('5️⃣ Testing Performance and Concurrency...\n');
    const startTime = Date.now();
    const rapidMoves = [
      { player: this.players[0], move: { from: { row: 6, col: 0 }, to: { row: 5, col: 0 }, notation: 'a3' } },
      { player: this.players[1], move: { from: { row: 1, col: 0 }, to: { row: 2, col: 0 }, notation: 'a6' } },
      { player: this.players[0], move: { from: { row: 6, col: 1 }, to: { row: 5, col: 1 }, notation: 'b3' } },
      { player: this.players[1], move: { from: { row: 1, col: 1 }, to: { row: 2, col: 1 }, notation: 'b6' } },
    ];

    console.log('🔍 Testing rapid moves...');
    for (const {player, move} of rapidMoves) {
      const result = await new Promise<any>((resolve) => {
        player.socket.emit('make_move', {
          matchId: this.matchId,
          move
        }, resolve);
      });

      console.log(`   ${move.notation}: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    }

    const endTime = Date.now();
    console.log(`✅ Performance test completed in ${endTime - startTime}ms\n`);
  }

  private generateTestReport(): void {
    console.log('6️⃣ Generating Test Report...\n');
    console.log('=' .repeat(50));
    console.log('🎯 CHESS ENGINE TEST REPORT');
    console.log('=' .repeat(50));

    const passedTests = this.testResults.filter(t => t.passed).length;
    const totalTests = this.testResults.length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`📊 Overall Results: ${passedTests}/${totalTests} tests passed (${successRate}%)`);
    console.log('\n📋 Detailed Results:');

    for (const result of this.testResults) {
      const status = result.passed ? '✅' : '❌';
      console.log(`   ${status} ${result.test}: ${result.passed ? 'PASSED' : 'FAILED'}`);
      if (!result.passed && result.error) {
        console.log(`      Error: ${result.error}`);
      }
    }

    console.log('\n🎯 Chess Engine Analysis:');
    const moveTests = this.testResults.filter(t => t.test.startsWith('move_'));
    const successfulMoves = moveTests.filter(t => t.passed).length;
    console.log(`   Move Success Rate: ${successfulMoves}/${moveTests.length} (${((successfulMoves/moveTests.length)*100).toFixed(1)}%)`);
    const failedMoves = moveTests.filter(t => !t.passed);
    if (failedMoves.length > 0) {
      console.log('\n⚠️  POTENTIAL CHESS ENGINE ISSUES:');
      for (const failedMove of failedMoves) {
        console.log(`   - ${failedMove.move}: ${failedMove.error}`);
        if (failedMove.invalidMove) {
          console.log(`     * This may indicate a chess logic bug`);
        }
      }
    }

    console.log('=' .repeat(50));
    console.log('\n');
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up test environment...');
    
    for (const player of this.players) {
      if (player.socket.connected) {
        player.socket.disconnect();
      }
    }

    if (redisService.connected) {
      await redisService.disconnect();
    }

    console.log('✅ Cleanup complete');
  }
}

if (require.main === module) {
  (async () => {
    const test = new XYUserTest();
    await test.runComprehensiveTest();
    process.exit(0);
  })();
} 
