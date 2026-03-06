import { io, Socket } from 'socket.io-client';

interface Player {
  id: string;
  name: string;
  socket: Socket;
  color?: 'white' | 'black';
}

interface SimulationConfig {
  serverUrl: string;
  moveDelay: number;
  totalMoves: number;
  connectionTimeout?: number;
  moveTimeout?: number;
  enablePerformanceLogging?: boolean;
}

interface PerformanceMetrics {
  connectionTimes: number[];
  moveTimes: number[];
  responseWaitTimes: number[];
  networkDelays: number[];
  totalSimulationTime: number;
  averageConnectionTime: number;
  averageMoveTime: number;
  averageResponseTime: number;
  fastestMove: number;
  slowestMove: number;
  successfulMoves: number;
  failedMoves: number;
}

export class GameSimulation {
  private config: SimulationConfig;
  private players: Player[] = [];
  private matchId?: string;
  private moveCount = 0;
  private startTime?: Date;
  private endTime?: Date;
  private performanceMetrics: PerformanceMetrics = {
    connectionTimes: [],
    moveTimes: [],
    responseWaitTimes: [],
    networkDelays: [],
    totalSimulationTime: 0,
    averageConnectionTime: 0,
    averageMoveTime: 0,
    averageResponseTime: 0,
    fastestMove: Infinity,
    slowestMove: 0,
    successfulMoves: 0,
    failedMoves: 0
  };

  constructor(config: SimulationConfig) {
    this.config = {
      connectionTimeout: 5000,
      moveTimeout: 10000,
      enablePerformanceLogging: true,
      ...config
    };
  }

  async startGame(): Promise<void> {
    console.log('🚀 Starting Rook Zero Game Simulation...');
    console.log('⏱️  Performance Analytics Enabled');
    console.log(`🔧 Configuration:`);
    console.log(`   - Server: ${this.config.serverUrl}`);
    console.log(`   - Move Delay: ${this.config.moveDelay}ms`);
    console.log(`   - Total Moves: ${this.config.totalMoves}`);
    console.log(`   - Connection Timeout: ${this.config.connectionTimeout}ms`);
    console.log(`   - Move Timeout: ${this.config.moveTimeout}ms\n`);

    this.startTime = new Date();
    const simulationStartTime = performance.now();

    try {
      await this.connectPlayers();
      await this.setupMatch();
      await this.addPlayersToMatch();
      await this.playGame();
    } catch (error) {
      console.error('❌ Simulation failed:', error);
    } finally {
      await this.cleanup();
      this.endTime = new Date();
      
      const simulationEndTime = performance.now();
      this.performanceMetrics.totalSimulationTime = simulationEndTime - simulationStartTime;
      
      this.calculateStats();
      this.showResults();
      this.showDetailedAnalytics();
    }
  }

  private async connectPlayers(): Promise<void> {
    console.log('👥 Creating players...');
    
    for (const config of [
      { id: 'player_x', name: 'X' },
      { id: 'player_y', name: 'Y' }
    ]) {
      const connectionStartTime = performance.now();
      
      const socket = io(this.config.serverUrl, {
        forceNew: true,
        transports: ['websocket'],
        timeout: this.config.connectionTimeout
      });

      const player: Player = {
        id: config.id,
        name: config.name,
        socket
      };

      await new Promise<void>((resolve, reject) => {
        socket.on('connect', () => {
          const connectionEndTime = performance.now();
          const connectionTime = connectionEndTime - connectionStartTime;
          
          this.performanceMetrics.connectionTimes.push(connectionTime);
          
          console.log(`✅ ${config.name} connected (${socket.id}) - ${connectionTime.toFixed(2)}ms`);
          
          socket.emit('identify', {
            playerId: config.id,
            playerName: config.name
          });
          
          resolve();
        });

        socket.on('connect_error', (error) => {
          console.error(`❌ Failed to connect ${config.name}:`, error);
          reject(error);
        });

        setTimeout(() => {
          reject(new Error(`Timeout connecting ${config.name} after ${this.config.connectionTimeout}ms`));
        }, this.config.connectionTimeout!);
      });

      this.players.push(player);
    }
  }

  private async setupMatch(): Promise<void> {
    console.log('🎯 Creating match...');
    
    return new Promise((resolve, reject) => {
      this.players[0].socket.emit('create_match', (response: any) => {
        if (response.success) {
          this.matchId = response.matchId;
          console.log(`✅ Match created: ${this.matchId}`);
          resolve();
        } else {
          reject(new Error('Failed to create match: ' + response.error));
        }
      });
    });
  }

  private async addPlayersToMatch(): Promise<void> {
    console.log('🔗 Players joining match...');
    
    for (const player of this.players) {
      await new Promise<void>((resolve, reject) => {
        player.socket.emit('join_match', 
          { matchId: this.matchId }, 
          (response: any) => {
            if (response.success) {
              player.color = response.player.color;
              console.log(`✅ ${player.name} joined as ${player.color}`);
              resolve();
            } else {
              reject(new Error(`Failed to join match: ${response.error}`));
            }
          }
        );
      });
    }

    await new Promise<void>((resolve) => {
      this.players[0].socket.on('match_started', () => {
        console.log('🎮 Match started!');
        resolve();
      });
    });
  }

  private async playGame(): Promise<void> {
    console.log('♟️  Starting game simulation with detailed performance tracking...');
    

    const organizedMoves = [
      { player: 'white', move: { from: { row: 6, col: 4 }, to: { row: 4, col: 4 }, notation: 'e4' } },
      { player: 'black', move: { from: { row: 1, col: 4 }, to: { row: 3, col: 4 }, notation: 'e5' } },
      { player: 'white', move: { from: { row: 7, col: 6 }, to: { row: 5, col: 5 }, notation: 'Nf3' } },
      { player: 'black', move: { from: { row: 0, col: 1 }, to: { row: 2, col: 2 }, notation: 'Nc6' } },
      { player: 'white', move: { from: { row: 7, col: 5 }, to: { row: 4, col: 2 }, notation: 'Bc4' } },
      { player: 'black', move: { from: { row: 1, col: 3 }, to: { row: 2, col: 3 }, notation: 'd6' } },
      { player: 'white', move: { from: { row: 6, col: 3 }, to: { row: 5, col: 3 }, notation: 'd3' } },
      { player: 'black', move: { from: { row: 0, col: 2 }, to: { row: 4, col: 6 }, notation: 'Bg4' } }
    ];

    let currentColorExpected = 'white';

    for (let i = 0; i < organizedMoves.length && this.moveCount < this.config.totalMoves; i++) {
      const { player: expectedColor, move } = organizedMoves[i];
      
      const currentPlayer = this.players.find(p => p.color === expectedColor);
      if (!currentPlayer) {
        console.error(`❌ Player with color ${expectedColor} not found`);
        break;
      }

      console.log(`🎯 ${currentPlayer.name} (${currentPlayer.color}) making move: ${move.notation}`);

      const moveStartTime = performance.now();
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          const timeoutTime = performance.now() - moveStartTime;
          console.log(`⏰ Move timeout after ${timeoutTime.toFixed(2)}ms`);
          reject(new Error(`Move timeout after ${this.config.moveTimeout}ms`));
        }, this.config.moveTimeout!);

        const requestStartTime = performance.now();

        currentPlayer.socket.emit('make_move', {
          matchId: this.matchId,
          move: move
        }, (response: any) => {
          clearTimeout(timeout);
          
          const responseEndTime = performance.now();
          const totalMoveTime = responseEndTime - moveStartTime;
          const responseWaitTime = responseEndTime - requestStartTime;
          
          this.performanceMetrics.moveTimes.push(totalMoveTime);
          this.performanceMetrics.responseWaitTimes.push(responseWaitTime);
          
          if (totalMoveTime < this.performanceMetrics.fastestMove) {
            this.performanceMetrics.fastestMove = totalMoveTime;
          }
          if (totalMoveTime > this.performanceMetrics.slowestMove) {
            this.performanceMetrics.slowestMove = totalMoveTime;
          }
          
          if (response.success) {
            this.moveCount++;
            this.performanceMetrics.successfulMoves++;
            console.log(`✅ Move ${this.moveCount} completed: ${move.notation} [${totalMoveTime.toFixed(2)}ms total | ${responseWaitTime.toFixed(2)}ms response]`);
            
            currentColorExpected = currentColorExpected === 'white' ? 'black' : 'white';
            resolve();
          } else if (response.invalidMove) {
            this.performanceMetrics.failedMoves++;
            console.log(`⚠️  Invalid move: ${response.error} [${totalMoveTime.toFixed(2)}ms]`);
            console.log(`   🔄 Turn remains with ${currentPlayer.color}, retrying...`);
            
            this.attemptBackupMove(currentPlayer, currentColorExpected).then(() => {
              currentColorExpected = currentColorExpected === 'white' ? 'black' : 'white';
              resolve();
            }).catch(() => {
              resolve();
            });
          } else {
            this.performanceMetrics.failedMoves++;
            reject(new Error(`Move failed: ${response.error}`));
          }
        });
      });

      const networkDelayStart = performance.now();
      const networkDelay = this.config.moveDelay + (Math.random() * 100 - 50);
      this.performanceMetrics.networkDelays.push(networkDelay);
      
      console.log(`   ⏳ Network delay: ${networkDelay.toFixed(2)}ms`);
      await new Promise(resolve => setTimeout(resolve, networkDelay));
      
      const networkDelayEnd = performance.now();
      const actualDelay = networkDelayEnd - networkDelayStart;
      
      if (this.config.enablePerformanceLogging) {
        console.log(`   📊 Actual delay: ${actualDelay.toFixed(2)}ms`);
      }

      if (this.moveCount >= this.config.totalMoves) {
        console.log('🏁 Simulation completed (max moves reached)');
        break;
      }
    }
  }

  private async attemptBackupMove(player: Player, expectedColor: string): Promise<void> {
    console.log(`   🔄 Trying fallback move for ${player.name} (${player.color})`);
    
    const fallbackMoves = {
      white: [
        { from: { row: 6, col: 0 }, to: { row: 4, col: 0 }, notation: 'a4' },
        { from: { row: 6, col: 1 }, to: { row: 4, col: 1 }, notation: 'b4' },
        { from: { row: 6, col: 7 }, to: { row: 4, col: 7 }, notation: 'h4' },
      ],
      black: [
        { from: { row: 1, col: 0 }, to: { row: 3, col: 0 }, notation: 'a5' },
        { from: { row: 1, col: 1 }, to: { row: 3, col: 1 }, notation: 'b5' },
        { from: { row: 1, col: 7 }, to: { row: 3, col: 7 }, notation: 'h5' },
      ]
    };

    const moves = fallbackMoves[expectedColor as 'white' | 'black'] || [];
    
    for (const fallbackMove of moves) {
      try {
        await new Promise<void>((resolve, reject) => {
          player.socket.emit('make_move', {
            matchId: this.matchId,
            move: fallbackMove
          }, (response: any) => {
            if (response.success) {
              this.moveCount++;
              this.performanceMetrics.successfulMoves++;
              console.log(`   ✅ Fallback move ${fallbackMove.notation} successful`);
              resolve();
            } else {
              reject(new Error(`Fallback failed: ${response.error}`));
            }
          });
        });
        break;
      } catch (error) {
        console.log(`   ⚠️  Fallback move ${fallbackMove.notation} also failed, trying next...`);
        continue;
      }
    }
  }

  private calculateStats(): void {
    if (this.performanceMetrics.connectionTimes.length > 0) {
      this.performanceMetrics.averageConnectionTime = 
        this.performanceMetrics.connectionTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.connectionTimes.length;
    }

    if (this.performanceMetrics.moveTimes.length > 0) {
      this.performanceMetrics.averageMoveTime = 
        this.performanceMetrics.moveTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.moveTimes.length;
    }

    if (this.performanceMetrics.responseWaitTimes.length > 0) {
      this.performanceMetrics.averageResponseTime = 
        this.performanceMetrics.responseWaitTimes.reduce((a, b) => a + b, 0) / this.performanceMetrics.responseWaitTimes.length;
    }
  }

  private showDetailedAnalytics(): void {
    console.log('\n🚀 DETAILED PERFORMANCE ANALYTICS');
    console.log('═════════════════════════════════════════════════════════');
    
    console.log(`📊 SIMULATION OVERVIEW:`);
    console.log(`   🎮 Total Simulation Time: ${this.performanceMetrics.totalSimulationTime.toFixed(2)}ms (${(this.performanceMetrics.totalSimulationTime / 1000).toFixed(2)}s)`);
    console.log(`   🎯 Successful Moves: ${this.performanceMetrics.successfulMoves}`);
    console.log(`   ❌ Failed Moves: ${this.performanceMetrics.failedMoves}`);
    console.log(`   📈 Success Rate: ${((this.performanceMetrics.successfulMoves / (this.performanceMetrics.successfulMoves + this.performanceMetrics.failedMoves)) * 100).toFixed(1)}%`);
    
    console.log(`\n🔌 CONNECTION PERFORMANCE:`);
    console.log(`   ⚡ Average Connection Time: ${this.performanceMetrics.averageConnectionTime.toFixed(2)}ms`);
    console.log(`   🏃 Fastest Connection: ${Math.min(...this.performanceMetrics.connectionTimes).toFixed(2)}ms`);
    console.log(`   🐌 Slowest Connection: ${Math.max(...this.performanceMetrics.connectionTimes).toFixed(2)}ms`);
    
    console.log(`\n⚡ MOVE PERFORMANCE:`);
    console.log(`   📊 Average Move Time: ${this.performanceMetrics.averageMoveTime.toFixed(2)}ms`);
    console.log(`   🏃 Fastest Move: ${this.performanceMetrics.fastestMove.toFixed(2)}ms`);
    console.log(`   🐌 Slowest Move: ${this.performanceMetrics.slowestMove.toFixed(2)}ms`);
    console.log(`   🔄 Average Response Wait: ${this.performanceMetrics.averageResponseTime.toFixed(2)}ms`);
    
    if (this.performanceMetrics.networkDelays.length > 0) {
      const avgNetworkDelay = this.performanceMetrics.networkDelays.reduce((a, b) => a + b, 0) / this.performanceMetrics.networkDelays.length;
      console.log(`\n🌐 NETWORK SIMULATION:`);
      console.log(`   📡 Average Network Delay: ${avgNetworkDelay.toFixed(2)}ms`);
      console.log(`   ⬇️  Min Network Delay: ${Math.min(...this.performanceMetrics.networkDelays).toFixed(2)}ms`);
      console.log(`   ⬆️  Max Network Delay: ${Math.max(...this.performanceMetrics.networkDelays).toFixed(2)}ms`);
    }
    
    if (this.performanceMetrics.moveTimes.length > 0) {
      console.log(`\n📈 MOVE-BY-MOVE BREAKDOWN:`);
      this.performanceMetrics.moveTimes.forEach((time, index) => {
        const responseTime = this.performanceMetrics.responseWaitTimes[index] || 0;
        const networkDelay = this.performanceMetrics.networkDelays[index] || 0;
        const status = index < this.performanceMetrics.successfulMoves ? '✅' : '❌';
        console.log(`   ${index + 1}. ${status} Move ${index + 1}: ${time.toFixed(2)}ms [Response: ${responseTime.toFixed(2)}ms | Network: ${networkDelay.toFixed(2)}ms]`);
      });
    }
    
    console.log(`\n💡 PERFORMANCE INSIGHTS:`);
    if (this.performanceMetrics.averageMoveTime > 1000) {
      console.log(`   ⚠️  Average move time is high (${this.performanceMetrics.averageMoveTime.toFixed(2)}ms) - consider optimizing chess engine`);
    } else if (this.performanceMetrics.averageMoveTime < 100) {
      console.log(`   ✨ Excellent move performance (${this.performanceMetrics.averageMoveTime.toFixed(2)}ms) - engine is highly optimized`);
    } else {
      console.log(`   ✅ Good move performance (${this.performanceMetrics.averageMoveTime.toFixed(2)}ms) - within acceptable range`);
    }
    
    if (this.performanceMetrics.averageConnectionTime > 2000) {
      console.log(`   ⚠️  Connection time is high (${this.performanceMetrics.averageConnectionTime.toFixed(2)}ms) - check network latency`);
    } else {
      console.log(`   ✅ Good connection performance (${this.performanceMetrics.averageConnectionTime.toFixed(2)}ms)`);
    }
    
    const efficiency = (this.performanceMetrics.successfulMoves / (this.performanceMetrics.successfulMoves + this.performanceMetrics.failedMoves)) * 100;
    if (efficiency < 90) {
      console.log(`   ⚠️  Move efficiency is low (${efficiency.toFixed(1)}%) - check move validation logic`);
    } else {
      console.log(`   ✅ High move efficiency (${efficiency.toFixed(1)}%)`);
    }
    
    console.log('═════════════════════════════════════════════════════════');
  }

  private async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up...');
    
    for (const player of this.players) {
      if (player.socket.connected) {
        player.socket.disconnect();
      }
    }
  }

  private showResults(): void {
    if (!this.startTime || !this.endTime) return;

    const duration = this.endTime.getTime() - this.startTime.getTime();
    const averageMoveTime = this.moveCount > 0 ? duration / this.moveCount : 0;

    console.log('\n📊 SIMULATION RESULTS:');
    console.log('════════════════════════');
    console.log(`Match ID: ${this.matchId}`);
    console.log(`Total Duration: ${duration}ms (${(duration / 1000).toFixed(2)}s)`);
    console.log(`Total Moves: ${this.moveCount}`);
    console.log(`Average Move Time: ${averageMoveTime.toFixed(2)}ms`);
    console.log(`Players: ${this.players.map(p => `${p.name} (${p.color})`).join(', ')}`);
    console.log('════════════════════════\n');
  }
}

if (require.main === module) {
  const simulation = new GameSimulation({
    serverUrl: 'http://localhost:3000',
    moveDelay: 1000,
    totalMoves: 8
  });

  simulation.startGame().catch(console.error);
} 
