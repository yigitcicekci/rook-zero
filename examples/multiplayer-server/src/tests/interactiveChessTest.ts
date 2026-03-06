import readline from 'readline';
import { io, Socket } from 'socket.io-client';
import { DEFAULT_FEN, RkEngine, type Color, type Square } from '../lib/rook-zero';

interface Player {
  id: string;
  name: string;
  color: 'white' | 'black';
  socket?: Socket;
}

interface MoveAttempt {
  player: string;
  notation: string;
  success: boolean;
  error?: string;
  processingTime: number;
}

interface GameStats {
  totalMoves: number;
  successfulMoves: number;
  failedMoves: number;
  averageProcessingTime: number;
  fastestMove: MoveAttempt | null;
  slowestMove: MoveAttempt | null;
  errorsByType: Record<string, number>;
}

interface MatchSnapshot {
  id: string;
  status: 'pending' | 'active' | 'completed' | 'abandoned';
  currentTurn: 'white' | 'black';
  fen: string;
  moveHistory: string[];
  result?: {
    winner: 'white' | 'black' | 'draw';
    reason: string;
  };
}

function colorToLabel(color: Color): 'white' | 'black' {
  return color === 'w' ? 'white' : 'black';
}

function labelToColor(color: 'white' | 'black'): Color {
  return color === 'white' ? 'w' : 'b';
}

function squareToPosition(square: Square): { row: number; col: number } {
  return {
    row: 8 - Number(square[1]),
    col: square.charCodeAt(0) - 97
  };
}

export class InteractiveChessTest {
  private readonly rl: readline.Interface;
  private readonly players: Player[] = [
    { id: 'player1', name: 'Player 1', color: 'white' },
    { id: 'player2', name: 'Player 2', color: 'black' }
  ];
  private readonly stats: GameStats = {
    totalMoves: 0,
    successfulMoves: 0,
    failedMoves: 0,
    averageProcessingTime: 0,
    fastestMove: null,
    slowestMove: null,
    errorsByType: {}
  };
  private readonly attempts: MoveAttempt[] = [];
  private engine = new RkEngine(DEFAULT_FEN);
  private currentPlayer = this.players[0];
  private isMultiplayer = false;
  private matchId?: string;
  private serverUrl = 'http://localhost:3000';

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start(): Promise<void> {
    console.log('🎮 ROOK ZERO INTERACTIVE TEST');
    console.log('1. Local engine');
    console.log('2. Multiplayer server');

    const mode = (await this.ask('Select mode (1 or 2): ')).trim();
    this.isMultiplayer = mode === '2';

    if (this.isMultiplayer) {
      await this.startMultiplayerMode();
    } else {
      await this.startLocalMode();
    }
  }

  private async startLocalMode(): Promise<void> {
    this.engine = new RkEngine(DEFAULT_FEN);
    await this.setupPlayerNames();
    this.syncCurrentPlayer();
    this.displayBoard();
    this.showHelp();
    await this.gameLoop();
  }

  private async startMultiplayerMode(): Promise<void> {
    await this.setupMultiplayerClients();
    await this.createAndJoinMatch();
    this.syncCurrentPlayer();
    this.displayBoard();
    this.showHelp();
    await this.gameLoop();
  }

  private async setupPlayerNames(): Promise<void> {
    const white = await this.ask('White player name (default: Player 1): ');
    const black = await this.ask('Black player name (default: Player 2): ');
    if (white.trim()) {
      this.players[0].name = white.trim();
    }
    if (black.trim()) {
      this.players[1].name = black.trim();
    }
  }

  private async setupMultiplayerClients(): Promise<void> {
    for (const player of this.players) {
      const socket = io(this.serverUrl, {
        forceNew: true,
        transports: ['websocket'],
        timeout: 5000
      });

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error(`Timeout connecting ${player.name}`)), 5000);

        socket.once('connect', () => {
          clearTimeout(timeout);
          socket.emit('identify', {
            playerId: player.id,
            playerName: player.name
          });
          resolve();
        });

        socket.once('connect_error', error => {
          clearTimeout(timeout);
          reject(error);
        });
      });

      player.socket = socket;
      this.bindSocketEvents(player);
    }
  }

  private bindSocketEvents(player: Player): void {
    if (!player.socket) {
      return;
    }

    player.socket.on('match_started', (data: { match: MatchSnapshot }) => {
      this.applyMatchSnapshot(data.match);
      console.log(`\n🎮 Match started: ${data.match.id}`);
      this.displayBoard();
    });

    player.socket.on('move_made', (data: { match: MatchSnapshot; move: { notation: string } }) => {
      this.applyMatchSnapshot(data.match);
      console.log(`\n🎯 Opponent move: ${data.move.notation}`);
      this.displayBoard();
    });

    player.socket.on('invalid_move', (data: { error: string }) => {
      console.log(`\n❌ Invalid move: ${data.error}`);
    });

    player.socket.on('game_over', (data: { match: MatchSnapshot; reason?: string }) => {
      this.applyMatchSnapshot(data.match);
      console.log(`\n🏁 Game over: ${data.reason ?? data.match.result?.reason ?? 'finished'}`);
      this.displayBoard();
    });
  }

  private async createAndJoinMatch(): Promise<void> {
    const creator = this.players[0];
    this.matchId = await new Promise<string>((resolve, reject) => {
      creator.socket!.emit('create_match', (response: { success: boolean; matchId?: string; error?: string }) => {
        if (!response.success || !response.matchId) {
          reject(new Error(response.error ?? 'Failed to create match'));
          return;
        }
        resolve(response.matchId);
      });
    });

    for (const player of this.players) {
      const response = await new Promise<{ success: boolean; match?: MatchSnapshot; error?: string }>((resolve) => {
        player.socket!.emit('join_match', { matchId: this.matchId }, (result: { success: boolean; match?: MatchSnapshot; error?: string }) => {
          resolve(result);
        });
      });

      if (!response.success || !response.match) {
        throw new Error(response.error ?? `Failed to join match for ${player.name}`);
      }

      this.applyMatchSnapshot(response.match);
    }
  }

  private async gameLoop(): Promise<void> {
    while (true) {
      const prompt = `${this.currentPlayer.name} (${this.currentPlayer.color}) > `;
      const input = (await this.ask(prompt)).trim();

      if (!input) {
        continue;
      }

      if (input === 'quit' || input === 'exit') {
        await this.endGame();
        return;
      }
      if (input === 'help') {
        this.showHelp();
        continue;
      }
      if (input === 'board') {
        this.displayBoard();
        continue;
      }
      if (input === 'history') {
        this.showHistory();
        continue;
      }
      if (input === 'stats') {
        this.showStats();
        continue;
      }

      if (this.isMultiplayer) {
        await this.processMultiplayerMove(input);
      } else {
        await this.processLocalMove(input);
      }
    }
  }

  private async processLocalMove(input: string): Promise<void> {
    const startedAt = performance.now();
    const normalizedInput = this.normalizeMoveInput(input);
    const validation = this.engine.validateMove(normalizedInput);

    if (!validation.ok) {
      this.recordAttempt({
        player: this.currentPlayer.name,
        notation: input,
        success: false,
        error: validation.reason,
        processingTime: performance.now() - startedAt
      });
      console.log(`❌ ${validation.reason}`);
      return;
    }

    const move = this.engine.move(normalizedInput);
    if (!move) {
      this.recordAttempt({
        player: this.currentPlayer.name,
        notation: input,
        success: false,
        error: 'move-failed',
        processingTime: performance.now() - startedAt
      });
      console.log('❌ move-failed');
      return;
    }

    this.recordAttempt({
      player: this.currentPlayer.name,
      notation: move.san,
      success: true,
      processingTime: performance.now() - startedAt
    });

    console.log(`✅ ${move.san} (${move.uci})`);
    this.syncCurrentPlayer();
    this.displayBoard();
    this.showOutcomeIfNeeded();
  }

  private async processMultiplayerMove(input: string): Promise<void> {
    const startedAt = performance.now();
    const normalizedInput = this.normalizeMoveInput(input);
    const validation = this.engine.validateMove(normalizedInput);

    if (!validation.ok) {
      this.recordAttempt({
        player: this.currentPlayer.name,
        notation: input,
        success: false,
        error: validation.reason,
        processingTime: performance.now() - startedAt
      });
      console.log(`❌ ${validation.reason}`);
      return;
    }

    const activePlayer = this.players.find(player => player.color === colorToLabel(this.engine.turn()));
    const socket = activePlayer?.socket;
    if (!socket || !this.matchId) {
      console.log('❌ missing multiplayer connection');
      return;
    }

    const move = validation.move;
    const payload = {
      matchId: this.matchId,
      move: {
        from: squareToPosition(move.from),
        to: squareToPosition(move.to),
        notation: move.san,
        isCastling: move.isCastle
      }
    };

    const response = await new Promise<{ success: boolean; match?: MatchSnapshot; error?: string }>((resolve) => {
      socket.emit('make_move', payload, (result: { success: boolean; match?: MatchSnapshot; error?: string }) => {
        resolve(result);
      });
    });

    if (!response.success || !response.match) {
      this.recordAttempt({
        player: this.currentPlayer.name,
        notation: input,
        success: false,
        error: response.error ?? 'move-failed',
        processingTime: performance.now() - startedAt
      });
      console.log(`❌ ${response.error ?? 'move-failed'}`);
      return;
    }

    this.applyMatchSnapshot(response.match);
    this.recordAttempt({
      player: this.currentPlayer.name,
      notation: move.san,
      success: true,
      processingTime: performance.now() - startedAt
    });

    console.log(`✅ ${move.san}`);
    this.displayBoard();
    this.showOutcomeIfNeeded();
  }

  private applyMatchSnapshot(match: MatchSnapshot): void {
    this.matchId = match.id;
    this.engine.loadFen(match.fen);
    this.syncCurrentPlayer();
  }

  private syncCurrentPlayer(): void {
    this.currentPlayer = this.players.find(player => labelToColor(player.color) === this.engine.turn()) ?? this.players[0];
  }

  private displayBoard(): void {
    const board = this.parseBoard(this.engine.fen());
    console.log('\n   a b c d e f g h');
    for (let row = 0; row < 8; row++) {
      let line = `${8 - row}  `;
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        line += `${piece ?? '.'} `;
      }
      line += ` ${8 - row}`;
      console.log(line);
    }
    console.log('   a b c d e f g h');
    console.log(`Turn: ${this.currentPlayer.name} (${this.currentPlayer.color})`);
    console.log(`FEN: ${this.engine.fen()}`);
    if (this.engine.isCheck()) {
      console.log('Check: yes');
    }
    console.log('');
  }

  private parseBoard(fen: string): Array<Array<string | null>> {
    const board = Array.from({ length: 8 }, () => Array<string | null>(8).fill(null));
    const placement = fen.split(' ')[0];
    let row = 0;
    let col = 0;

    for (const char of placement) {
      if (char === '/') {
        row += 1;
        col = 0;
        continue;
      }

      if (char >= '1' && char <= '8') {
        col += Number(char);
        continue;
      }

      board[row][col] = this.toSymbol(char);
      col += 1;
    }

    return board;
  }

  private toSymbol(piece: string): string {
    const map: Record<string, string> = {
      p: '♟',
      r: '♜',
      n: '♞',
      b: '♝',
      q: '♛',
      k: '♚',
      P: '♙',
      R: '♖',
      N: '♘',
      B: '♗',
      Q: '♕',
      K: '♔'
    };
    return map[piece] ?? piece;
  }

  private normalizeMoveInput(input: string): string {
    const trimmed = input.trim();
    if (/^[a-h][1-8]-[a-h][1-8][qrbnQRBN]?$/.test(trimmed)) {
      return trimmed.replace('-', '');
    }
    return trimmed;
  }

  private showOutcomeIfNeeded(): void {
    const outcome = this.engine.outcome();
    if (outcome.kind !== 'ongoing') {
      console.log(`🏁 ${outcome.kind}`);
      if (outcome.winner) {
        console.log(`Winner: ${colorToLabel(outcome.winner)}`);
      }
    }
  }

  private showHistory(): void {
    const history = this.engine.history() as string[];
    console.log(history.length === 0 ? 'No moves yet.' : history.join(' '));
  }

  private showStats(): void {
    console.log(`Moves: ${this.stats.totalMoves}`);
    console.log(`Success: ${this.stats.successfulMoves}`);
    console.log(`Failed: ${this.stats.failedMoves}`);
    console.log(`Average: ${this.stats.averageProcessingTime.toFixed(2)}ms`);
    if (this.stats.fastestMove) {
      console.log(`Fastest: ${this.stats.fastestMove.notation} ${this.stats.fastestMove.processingTime.toFixed(2)}ms`);
    }
    if (this.stats.slowestMove) {
      console.log(`Slowest: ${this.stats.slowestMove.notation} ${this.stats.slowestMove.processingTime.toFixed(2)}ms`);
    }
  }

  private recordAttempt(attempt: MoveAttempt): void {
    this.attempts.push(attempt);
    this.stats.totalMoves += 1;
    if (attempt.success) {
      this.stats.successfulMoves += 1;
    } else {
      this.stats.failedMoves += 1;
      if (attempt.error) {
        this.stats.errorsByType[attempt.error] = (this.stats.errorsByType[attempt.error] ?? 0) + 1;
      }
    }

    const total = this.attempts.reduce((sum, item) => sum + item.processingTime, 0);
    this.stats.averageProcessingTime = total / this.attempts.length;

    if (!this.stats.fastestMove || attempt.processingTime < this.stats.fastestMove.processingTime) {
      this.stats.fastestMove = attempt;
    }
    if (!this.stats.slowestMove || attempt.processingTime > this.stats.slowestMove.processingTime) {
      this.stats.slowestMove = attempt;
    }
  }

  private showHelp(): void {
    console.log('Commands:');
    console.log('  move: e4, Nf3, e2e4, O-O, e2-e4');
    console.log('  board');
    console.log('  history');
    console.log('  stats');
    console.log('  help');
    console.log('  quit');
  }

  private async endGame(): Promise<void> {
    this.showStats();
    this.rl.close();
    for (const player of this.players) {
      player.socket?.disconnect();
    }
  }

  private ask(question: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(question, answer => resolve(answer));
    });
  }
}

if (require.main === module) {
  const test = new InteractiveChessTest();
  test.start().catch(error => {
    console.error('❌ Interactive test failed:', error);
    process.exit(1);
  });
}
