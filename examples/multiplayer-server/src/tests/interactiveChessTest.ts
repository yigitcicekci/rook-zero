import readline from 'readline';
import { ChessEngine, PieceColor, PieceType } from 'rook-zero';
import { io, Socket } from 'socket.io-client';

interface Player {
  name: string;
  color: 'white' | 'black';
  id: string;
  socket?: Socket;
}

interface MoveAttempt {
  player: string;
  notation: string;
  from: { row: number; col: number };
  to: { row: number; col: number };
  timestamp: number;
  success: boolean;
  error?: string;
  processingTime: number;
  validationTime: number;
  executionTime: number;
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

export class InteractiveChessTest {
  private engine?: ChessEngine;
  private rl: readline.Interface;
  private currentPlayer: Player;
  private players: Player[];
  private moveHistory: MoveAttempt[] = [];
  private gameStats: GameStats = {
    totalMoves: 0,
    successfulMoves: 0,
    failedMoves: 0,
    averageProcessingTime: 0,
    fastestMove: null,
    slowestMove: null,
    errorsByType: {}
  };
  private isMultiplayer: boolean = false;
  private matchId?: string;
  private serverUrl: string = 'http://localhost:3000';
  private currentBoard: any = null;
  private currentGameState: any = null;

  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    this.players = [
      { name: 'Player 1', color: 'white', id: 'player1' },
      { name: 'Player 2', color: 'black', id: 'player2' }
    ];

    this.currentPlayer = this.players[0];
  }

  async start(): Promise<void> {
    console.log('🎮 CHESS ENGINE TEST (INTERACTIVE GAMEPLAY)');
    console.log('🔧 Choose game mode:');
    console.log('   1️⃣  Local Engine (1 terminal, 2 players)');
    console.log('   2️⃣  Network Multiplayer (2 clients via Redis/Socket.IO)');
    
    const mode = await this.askQuestion('Select mode (1 or 2): ');
    
    if (mode === '2') {
      this.isMultiplayer = true;
      await this.startMultiplayerMode();
    } else {
      this.isMultiplayer = false;
      await this.startLocalMode();
    }
  }

  private async startLocalMode(): Promise<void> {
    console.log('\n🏠 LOCAL ENGINE MODE');
    this.engine = new ChessEngine();
    await this.setupPlayers();
    this.displayBoard();
    this.showHelp();
    await this.gameLoop();
  }

  private async startMultiplayerMode(): Promise<void> {
    console.log('\n🌐 MULTIPLAYER MODE');
    console.log('🔗 Connecting to server...');
    
    try {
      await this.setupMultiplayerClients();
      await this.createOrJoinMatch();
      console.log('✅ Multiplayer setup complete!');
      this.displayBoard();
      this.showHelp();
      await this.gameLoop();
    } catch (error) {
      console.error('❌ Multiplayer setup failed:', error);
      console.log('🔄 Falling back to local mode...');
      this.isMultiplayer = false;
      await this.startLocalMode();
    }
  }

  private async setupMultiplayerClients(): Promise<void> {
    console.log('👥 Setting up multiplayer clients...');
    for (let i = 0; i < this.players.length; i++) {
      const player = this.players[i];
      const socket = io(this.serverUrl, {
        forceNew: true,
        transports: ['websocket'],
        timeout: 5000
      });
      
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error(`Timeout connecting ${player.name}`));
        }, 5000);

        socket.on('connect', () => {
          clearTimeout(timeoutId);
          console.log(`✅ ${player.name} connected (${socket.id})`);
          
          socket.emit('identify', {
            playerId: player.id,
            playerName: player.name
          });
          
          resolve();
        });

        socket.on('connect_error', (error) => {
          clearTimeout(timeoutId);
          reject(error);
        });
      });

      player.socket = socket;
      this.setupSocketListeners(player);
    }
  }

  private setupSocketListeners(player: Player): void {
    if (!player.socket) return;

    player.socket.on('match_started', (data: any) => {
      console.log(`🎮 Match started! ${data.match.id}`);
      this.updateGameState(data.match);
    });

    player.socket.on('player_joined', (data: any) => {
      console.log(`👤 Player joined: ${data.player.name} as ${data.player.color}`);
      if (data.match) {
        this.updateGameState(data.match);
      }
    });

    player.socket.on('move_made', (data: any) => {
      console.log(`🎯 Move made by opponent: ${data.move.notation || 'unknown'}`);
      this.updateGameState(data.match);
      this.displayBoard();
      this.switchPlayer();
    });

    player.socket.on('invalid_move', (data: any) => {
      console.log(`❌ Invalid move: ${data.error}`);
    });

    player.socket.on('game_over', (data: any) => {
      console.log(`🏁 GAME OVER! ${data.match.result || 'Game ended'}`);
      this.endGame();
    });

    player.socket.on('error', (data: any) => {
      console.log(`⚠️ Socket error: ${data.error}`);
    });
  }

  private async createOrJoinMatch(): Promise<void> {
    const player1 = this.players[0];
    
    return new Promise((resolve, reject) => {
      player1.socket!.emit('create_match', (response: any) => {
        if (response.success) {
          this.matchId = response.matchId;
          console.log(`✅ Match created: ${this.matchId}`);
          this.joinPlayersToMatch().then(resolve).catch(reject);
        } else {
          reject(new Error('Failed to create match: ' + response.error));
        }
      });
    });
  }

  private async joinPlayersToMatch(): Promise<void> {
    for (const player of this.players) {
      await new Promise<void>((resolve, reject) => {
        player.socket!.emit('join_match', 
          { matchId: this.matchId }, 
          (response: any) => {
            if (response.success) {
              player.color = response.player.color;
              console.log(`✅ ${player.name} joined as ${player.color}`);
              
              if (response.match) {
                this.updateGameState(response.match);
              }
              resolve();
            } else {
              reject(new Error(`Failed to join match: ${response.error}`));
            }
          }
        );
      });
    }
    
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ Match start timeout, proceeding anyway...');
        if (!this.currentBoard || !this.currentGameState) {
          const defaultFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
          this.currentBoard = this.parseFENToBoard(defaultFEN);
          this.currentGameState = this.parseFENToGameState(defaultFEN);
        }
        resolve();
      }, 3000);

      this.players[0].socket!.on('match_started', (data: any) => {
        clearTimeout(timeout);
        console.log('🎮 Match started event received!');
        if (data.match) {
          this.updateGameState(data.match);
        }
        resolve();
      });
    });
  }

  private updateGameState(match: any): void {
    console.log(`🔄 Updating game state from match data...`);
    
    if (match.currentPosition) {
      console.log(`📋 Current position: ${match.currentPosition}`);
      this.currentBoard = this.parseFENToBoard(match.currentPosition);
      this.currentGameState = this.parseFENToGameState(match.currentPosition);
    } else {
      const defaultFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
      console.log(`📋 Using default starting position: ${defaultFEN}`);
      this.currentBoard = this.parseFENToBoard(defaultFEN);
      this.currentGameState = this.parseFENToGameState(defaultFEN);
    }
    
    console.log(`✅ Board updated with ${this.currentBoard.pieces.length} pieces`);
    console.log(`🎯 Current turn: ${this.currentGameState.activeColor === 'w' ? 'White' : 'Black'}`);
  }

  private parseFENToBoard(fen: string): any {
    console.log(`🔍 Parsing FEN: ${fen}`);
    const parts = fen.split(' ');
    const boardStr = parts[0];
    const pieces: any[] = [];
    
    let row = 0;
    let col = 0;
    
    for (const char of boardStr) {
      if (char === '/') {
        row++;
        col = 0;
      } else if (char >= '1' && char <= '8') {
        col += parseInt(char);
      } else {
        const color = char === char.toUpperCase() ? 'w' : 'b';
        const type = char.toLowerCase();
        pieces.push({
          type,
          color,
          position: { row, col }
        });
        col++;
      }
    }
    
    console.log(`✅ Parsed ${pieces.length} pieces from FEN`);
    return { pieces };
  }

  private parseFENToGameState(fen: string): any {
    const parts = fen.split(' ');
    const gameState = {
      activeColor: parts[1] || 'w',
      castlingRights: parts[2] || 'KQkq',
      enPassant: parts[3] || '-',
      halfMoves: parseInt(parts[4]) || 0,
      fullMoves: parseInt(parts[5]) || 1
    };
    
    console.log(`✅ Parsed game state: ${JSON.stringify(gameState)}`);
    return gameState;
  }

  private async setupPlayers(): Promise<void> {
    console.log('👥 Players Setup');
    console.log('-'.repeat(20));

    this.players[0].name = await this.askQuestion('🤍 White player name (default: Player 1): ') || 'Player 1';
    this.players[1].name = await this.askQuestion('⚫ Black player name (default: Player 2): ') || 'Player 2';

    console.log(`\n✅ Players Ready!:`);
    console.log(`   🤍 ${this.players[0].name} (White)`);
    console.log(`   ⚫ ${this.players[1].name} (Black)`);
    console.log(`\n🎯 ${this.currentPlayer.name} Starting!\n`);
  }

  private displayBoard(): void {
    const board = this.engine?.getBoard() || this.currentBoard;
    const gameState = this.engine?.getGameState() || this.currentGameState;
    
    if (!board || !gameState) {
      console.log('❌ No board data available');
      return;
    }
    
    console.log('\n📋 CURRENT BOARD POSITION');
    console.log('='.repeat(40));
    console.log('   a b c d e f g h');
    for (let row = 0; row < 8; row++) {
      let rowStr = `${8 - row}  `;
      for (let col = 0; col < 8; col++) {
        const piece = board.pieces.find((p: any) => p.position.row === row && p.position.col === col);
        if (piece) {
          const symbol = this.getPieceSymbol(piece.type, piece.color);
          rowStr += symbol + ' ';
        } else {
          rowStr += '. ';
        }
      }
      rowStr += ` ${8 - row}`;
      console.log(rowStr);
    }
    console.log('   a b c d e f g h');
    
    console.log(`\n🎯 Turn: ${gameState.activeColor === 'w' ? 'WHITE' : 'BLACK'}`);
    console.log(`📊 Move: ${gameState.fullMoves} | Half-moves: ${gameState.halfMoves}`);
    console.log(`🏰 Castling: ${gameState.castlingRights}`);
    if (gameState.enPassant !== '-') {
      console.log(`🎯 En Passant: ${gameState.enPassant}`);
    }
    
    const currentPlayerColor = gameState.activeColor;
    const isInCheck = this.engine?.isInCheck(currentPlayerColor) || false;
    const gameStatus = this.engine?.isGameOver() || { gameOver: false };
    
    if (gameStatus.gameOver) {
      console.log(`🏁 GAME STATUS: ${gameStatus.result}`);
    } else if (isInCheck) {
      console.log(`⚠️  CHECK: ${currentPlayerColor === 'w' ? 'White' : 'Black'} is in check!`);
    }
    
    console.log(`\n🔢 FEN: ${this.engine?.getFEN() || ''}\n`);
  }

  private getPieceSymbol(type: string, color: string): string {
    const pieces = {
      'p': color === 'w' ? '♙' : '♟',
      'r': color === 'w' ? '♖' : '♜',
      'n': color === 'w' ? '♘' : '♞',
      'b': color === 'w' ? '♗' : '♝',
      'q': color === 'w' ? '♕' : '♛',
      'k': color === 'w' ? '♔' : '♚'
    };
    return pieces[type as keyof typeof pieces] || '?';
  }

  private showHelp(): void {
    console.log('❓ HELP - Available Commands:');
    console.log('   📝 [move] - Make a move in various formats:');
    console.log('      • Coordinate: e2-e4, g1-f3, a7-a5');
    console.log('      • Simple pawn: e4, e5, d4, a3');
    console.log('      • Simple piece: Nf3, Bc4, Qh5, Rd1');
    console.log('      • Castling: O-O (kingside), O-O-O (queenside)');
    console.log('   📊 stats  - Show performance statistics');
    console.log('   📋 board  - Redraw the board');
    console.log('   📜 history - Show move history');
    console.log('   ❓ help   - Show this help');
    console.log('   🚪 quit   - Exit the game');
    console.log('');
  }

  private async gameLoop(): Promise<void> {
    while (true) {
      const input = await this.askQuestion(
        `🎯 ${this.currentPlayer.name} (${this.currentPlayer.color}), your move: `
      );

      if (!input.trim()) continue;

      const command = input.trim().toLowerCase();

      switch (command) {
        case 'quit':
        case 'exit':
          await this.endGame();
          return;

        case 'stats':
          this.showStats();
          break;

        case 'board':
          this.displayBoard();
          break;

        case 'history':
          this.showMoveHistory();
          break;

        case 'help':
          this.showHelp();
          break;

        default:
          await this.processMove(input.trim());
          break;
      }
    }
  }

  private async processMove(moveInput: string): Promise<void> {
    const startTime = performance.now();
    
    console.log(`\n🎯 Processing move: "${moveInput}"`);
    console.log('⏱️  Performance tracking started...');

    try {
      if (this.isMultiplayer) {
        await this.processMultiplayerMove(moveInput);
      } else {
        await this.processLocalMove(moveInput);
      }
    } catch (error) {
      const totalTime = performance.now() - startTime;
      console.log(`💥 Unexpected error: ${error}`);
      console.log(`⚡ Error processing time: ${totalTime.toFixed(2)}ms`);
      
      this.recordMove({
        player: this.currentPlayer.name,
        notation: moveInput,
        from: { row: -1, col: -1 },
        to: { row: -1, col: -1 },
        timestamp: Date.now(),
        success: false,
        error: `System error: ${error}`,
        processingTime: totalTime,
        validationTime: 0,
        executionTime: 0
      });
    }

    console.log('');
  }

  private async processLocalMove(moveInput: string): Promise<void> {
    const startTime = performance.now();
    
    const move = this.parseMove(moveInput);
    if (!move) {
      console.log('❌ Invalid move format. Use formats like: e2-e4, Nf3, O-O, Qh5');
      return;
    }

    const validationStart = performance.now();
    const validation = this.engine!.isMoveValid(move);
    const validationEnd = performance.now();
    const validationTime = validationEnd - validationStart;

    console.log(`🔍 Validation: ${validation.valid} (${validationTime.toFixed(2)}ms)`);
    if (!validation.valid) {
      console.log(`❌ Error: ${validation.error}`);
    }

    const executionStart = performance.now();
    const success = validation.valid ? this.engine!.makeMove(move) : false;
    const executionEnd = performance.now();
    const executionTime = executionEnd - executionStart;
    const totalTime = performance.now() - startTime;
    
    const moveAttempt: MoveAttempt = {
      player: this.currentPlayer.name,
      notation: moveInput,
      from: move.from,
      to: move.to,
      timestamp: Date.now(),
      success: success,
      error: validation.valid ? undefined : validation.error,
      processingTime: totalTime,
      validationTime: validationTime,
      executionTime: executionTime
    };

    this.recordMove(moveAttempt);

    if (success) {
      console.log(`✅ Move executed successfully!`);
      console.log(`⚡ Total time: ${totalTime.toFixed(2)}ms [V:${validationTime.toFixed(2)}ms | E:${executionTime.toFixed(2)}ms]`);       
      this.switchPlayer();
      this.displayBoard();
      
      const gameStatus = this.engine!.isGameOver();
      if (gameStatus.gameOver) {
        console.log(`\n🏁 GAME OVER! ${gameStatus.result}`);
        console.log(`🎯 Reason: ${gameStatus.reason}\n`);
        await this.endGame();
        return;
      }
      
      const isInCheck = this.engine!.isInCheck();
      if (isInCheck) {
        console.log(`⚠️  CHECK! ${this.currentPlayer.name} (${this.currentPlayer.color}) is in check!`);
      }
      
      const gameState = this.engine!.getGameState();
      console.log(`🎯 Next turn: ${this.currentPlayer.name} (${this.currentPlayer.color})`);
    } else {
      console.log(`❌ Move failed: ${moveAttempt.error}`);
      console.log(`⚡ Processing time: ${totalTime.toFixed(2)}ms`);
    }
  }

  private async processMultiplayerMove(moveInput: string): Promise<void> {
    const startTime = performance.now();
    const move = this.convertMoveForServer(moveInput);
    if (!move) {
      console.log('❌ Invalid move format for multiplayer mode');
      return;
    }

    const currentSocket = this.currentPlayer.socket;
    if (!currentSocket) {
      console.log('❌ No socket connection for current player');
      return;
    }

    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        console.log('⏰ Move timeout');
        resolve();
      }, 10000);

      currentSocket.emit('make_move', {
        matchId: this.matchId,
        move: move
      }, (response: any) => {
        clearTimeout(timeout);
        const totalTime = performance.now() - startTime;
        
        if (response.success) {
          console.log(`✅ Move executed successfully!`);
          console.log(`⚡ Total time: ${totalTime.toFixed(2)}ms`);
          
          this.recordMove({
            player: this.currentPlayer.name,
            notation: moveInput,
            from: move.from || { row: -1, col: -1 },
            to: move.to || { row: -1, col: -1 },
            timestamp: Date.now(),
            success: true,
            error: undefined,
            processingTime: totalTime,
            validationTime: 0,
            executionTime: totalTime
          });
          
          this.updateGameState(response.match);
          this.displayBoard();
          
          if (response.match.status === 'completed') {
            console.log(`\n🏁 GAME OVER! ${response.match.result || 'Game completed'}`);
            this.endGame();
            return;
          }
          
        } else {
          console.log(`❌ Move failed: ${response.error}`);
          console.log(`⚡ Processing time: ${totalTime.toFixed(2)}ms`);
          
          this.recordMove({
            player: this.currentPlayer.name,
            notation: moveInput,
            from: { row: -1, col: -1 },
            to: { row: -1, col: -1 },
            timestamp: Date.now(),
            success: false,
            error: response.error,
            processingTime: totalTime,
            validationTime: 0,
            executionTime: 0
          });
        }
        
        resolve();
      });
    });
  }

  private convertMoveForServer(moveInput: string): any {
    if (moveInput.includes('-')) {
      const [fromStr, toStr] = moveInput.split('-');
      const from = this.parseSquare(fromStr);
      const to = this.parseSquare(toStr);
      
      if (from && to) {
        return {
          from: { row: from.row, col: from.col },
          to: { row: to.row, col: to.col },
          notation: moveInput
        };
      }
    }
    
    if (moveInput === 'O-O' || moveInput === 'O-O-O') {
      return { notation: moveInput, isCastling: true };
    }
    
    return { notation: moveInput };
  }

  private parseMove(input: string): any | null {
    try {
      if (input === 'O-O' || input === '0-0') {
        const kingRow = this.currentPlayer.color === 'white' ? 7 : 0;
        return {
          from: { row: kingRow, col: 4 },
          to: { row: kingRow, col: 6 },
          piece: { 
            type: PieceType.KING, 
            color: this.currentPlayer.color === 'white' ? PieceColor.WHITE : PieceColor.BLACK,
            position: { row: kingRow, col: 4 }
          },
          isCapture: false,
          isCastling: true
        };
      }

      if (input === 'O-O-O' || input === '0-0-0') {
        const kingRow = this.currentPlayer.color === 'white' ? 7 : 0;
        return {
          from: { row: kingRow, col: 4 },
          to: { row: kingRow, col: 2 },
          piece: { 
            type: PieceType.KING, 
            color: this.currentPlayer.color === 'white' ? PieceColor.WHITE : PieceColor.BLACK,
            position: { row: kingRow, col: 4 }
          },
          isCapture: false,
          isCastling: true
        };
      }

      if (input.includes('-')) {
        const [fromStr, toStr] = input.split('-');
        const from = this.parseSquare(fromStr);
        const to = this.parseSquare(toStr);
        
        if (!from || !to) return null;
        const board = this.engine?.getBoard() || { pieces: [] };
        const piece = board.pieces.find(p => 
          p.position.row === from.row && p.position.col === from.col
        );

        if (!piece) {
          console.log(`⚠️  No piece found at ${fromStr}`);
          return null;
        }

        return {
          from,
          to,
          piece,
          isCapture: board.pieces.some(p => 
            p.position.row === to.row && p.position.col === to.col
          )
        };
      }

      return this.parseAlgebraicNotation(input);

    } catch (error) {
      console.log(`❌ Move parsing error: ${error}`);
      return null;
    }
  }

  private parseAlgebraicNotation(input: string): any | null {
    try {
      const board = this.engine?.getBoard() || { pieces: [] };
      const currentColor = this.currentPlayer.color === 'white' ? 'w' : 'b';
      if (/^[a-h][1-8]$/.test(input)) {
        const to = this.parseSquare(input);
        if (!to) return null;
        const pawns = board.pieces.filter(p => 
          p.type === 'p' && p.color === currentColor
        );

        for (const pawn of pawns) {
          const rowDiff = to.row - pawn.position.row;
          const colDiff = Math.abs(to.col - pawn.position.col);

          if (colDiff === 0) {
            if (currentColor === 'w' && (rowDiff === -1 || (pawn.position.row === 6 && rowDiff === -2))) {
              return {
                from: pawn.position,
                to,
                piece: pawn,
                isCapture: false
              };
            }
            if (currentColor === 'b' && (rowDiff === 1 || (pawn.position.row === 1 && rowDiff === 2))) {
              return {
                from: pawn.position,
                to,
                piece: pawn,
                isCapture: false
              };
            }
          }
        }
      }

      if (/^[RNBQK][a-h][1-8]$/.test(input)) {
        const pieceType = input[0].toLowerCase();
        const to = this.parseSquare(input.slice(1));
        if (!to) return null;
        const pieces = board.pieces.filter(p => 
          p.type === pieceType && p.color === currentColor
        );

        for (const piece of pieces) {
          return {
            from: piece.position,
            to,
            piece,
            isCapture: board.pieces.some(p => 
              p.position.row === to.row && p.position.col === to.col && p.color !== currentColor
            )
          };
        }
      }

      console.log('⚠️  Move format not recognized. Supported formats:');
      console.log('    • Coordinate: e2-e4, g1-f3');
      console.log('    • Simple pawn: e4, d5, a3');
      console.log('    • Simple piece: Nf3, Bc4, Qh5');
      console.log('    • Castling: O-O, O-O-O');
      return null;

    } catch (error) {
      console.log(`❌ Algebraic notation parsing error: ${error}`);
      return null;
    }
  }

  private parseSquare(square: string): { row: number; col: number } | null {
    if (square.length !== 2) return null;
    
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(square[1]);
    
    if (col < 0 || col > 7 || row < 0 || row > 7) return null;
    
    return { row, col };
  }

  private recordMove(moveAttempt: MoveAttempt): void {
    this.moveHistory.push(moveAttempt);
    this.updateStats(moveAttempt);
  }

  private updateStats(move: MoveAttempt): void {
    this.gameStats.totalMoves++;
    
    if (move.success) {
      this.gameStats.successfulMoves++;
    } else {
      this.gameStats.failedMoves++;
      if (move.error) {
        this.gameStats.errorsByType[move.error] = 
          (this.gameStats.errorsByType[move.error] || 0) + 1;
      }
    }

    const totalTime = this.moveHistory.reduce((sum, m) => sum + m.processingTime, 0);
    this.gameStats.averageProcessingTime = totalTime / this.gameStats.totalMoves;

    if (!this.gameStats.fastestMove || move.processingTime < this.gameStats.fastestMove.processingTime) {
      this.gameStats.fastestMove = move;
    }
    
    if (!this.gameStats.slowestMove || move.processingTime > this.gameStats.slowestMove.processingTime) {
      this.gameStats.slowestMove = move;
    }
  }

  private switchPlayer(): void {
    this.currentPlayer = this.currentPlayer === this.players[0] ? this.players[1] : this.players[0];
  }

  private showStats(): void {
    console.log('\n📊 PERFORMANCE STATISTICS');
    console.log('='.repeat(40));
    console.log(`🎯 Total Moves: ${this.gameStats.totalMoves}`);
    console.log(`✅ Successful: ${this.gameStats.successfulMoves}`);
    console.log(`❌ Failed: ${this.gameStats.failedMoves}`);
    console.log(`📈 Success Rate: ${((this.gameStats.successfulMoves / this.gameStats.totalMoves) * 100).toFixed(1)}%`);
    console.log(`⚡ Average Processing Time: ${this.gameStats.averageProcessingTime.toFixed(2)}ms`);
    
    if (this.gameStats.fastestMove) {
      console.log(`🏃 Fastest Move: ${this.gameStats.fastestMove.notation} (${this.gameStats.fastestMove.processingTime.toFixed(2)}ms)`);
    }
    
    if (this.gameStats.slowestMove) {
      console.log(`🐌 Slowest Move: ${this.gameStats.slowestMove.notation} (${this.gameStats.slowestMove.processingTime.toFixed(2)}ms)`);
    }

    if (Object.keys(this.gameStats.errorsByType).length > 0) {
      console.log('\n⚠️  ERROR BREAKDOWN:');
      Object.entries(this.gameStats.errorsByType).forEach(([error, count]) => {
        console.log(`   • ${error}: ${count} times`);
      });
    }

    console.log('');
  }

  private showMoveHistory(): void {
    console.log('\n📜 MOVE HISTORY');
    console.log('='.repeat(50));
    
    if (this.moveHistory.length === 0) {
      console.log('No moves yet.');
      return;
    }

    this.moveHistory.forEach((move, index) => {
      const status = move.success ? '✅' : '❌';
      const timeStr = `${move.processingTime.toFixed(2)}ms`;
      console.log(`${index + 1}. ${status} ${move.player}: ${move.notation} (${timeStr})`);
      if (!move.success && move.error) {
        console.log(`   └─ Error: ${move.error}`);
      }
    });
    
    console.log('');
  }

  private async endGame(): Promise<void> {
    console.log('\n🏁 GAME ENDING...');
    console.log('='.repeat(30));
    
    this.showStats();
    this.showMoveHistory();
    
    console.log('📋 FINAL PERFORMANCE REPORT:');
    console.log('='.repeat(40));
    
    if (this.gameStats.totalMoves > 0) {
      const successRate = (this.gameStats.successfulMoves / this.gameStats.totalMoves) * 100;
      console.log(`🎯 Chess Engine Performance: ${successRate.toFixed(1)}% success rate`);
      console.log(`⚡ Average Response Time: ${this.gameStats.averageProcessingTime.toFixed(2)}ms`);
    }
    
    this.rl.close();
  }

  private askQuestion(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(question, (answer) => {
        resolve(answer);
      });
    });
  }
}

if (require.main === module) {
  const test = new InteractiveChessTest();
  test.start().catch(console.error);
} 
