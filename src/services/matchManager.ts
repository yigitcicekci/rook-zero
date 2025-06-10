import { v4 as uuidv4 } from 'uuid';
import { Match, Player, GameMove, MatchStats } from '../types/game';
import { redisService } from './redis';
import ChessEngine from '../../chess-engine';

export class MatchManager {
  private engines: Map<string, ChessEngine> = new Map();

  async createNewMatch(): Promise<string> {
    const matchId = uuidv4();
    const now = new Date();

    const match: Match = {
      id: matchId,
      status: 'pending',
      players: {
        white: null,
        black: null
      },
      createdAt: now,
      lastActivity: now,
      currentTurn: 'white',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      moveHistory: []
    };

    await redisService.saveMatch(match);
    await redisService.incrementMatchCount();

    this.engines.set(matchId, new ChessEngine());

    console.log(`Created new match: ${matchId}`);
    return matchId;
  }

  async addPlayerToMatch(matchId: string, playerId: string, playerName: string, socketId: string): Promise<{ success: boolean; match?: Match; player?: Player; error?: string }> {
    const match = await redisService.getMatch(matchId);

    if (!match) {
      return { success: false, error: 'Match not found' };
    }

    if (match.status !== 'pending' && match.status !== 'active') {
      return { success: false, error: 'Match is not available for joining' };
    }

    const existingPlayer = Object.values(match.players).find(p => p?.id === playerId);
    if (existingPlayer) {
      existingPlayer.socketId = socketId;
      existingPlayer.connected = true;
      match.lastActivity = new Date();

      await redisService.updateMatch(match);
      await redisService.savePlayerSession(playerId, socketId);

      return { success: true, match, player: existingPlayer };
    }

    let color: 'white' | 'black';
    if (!match.players.white) {
      color = 'white';
    } else if (!match.players.black) {
      color = 'black';
    } else {
      return { success: false, error: 'Match is full' };
    }

    const player: Player = {
      id: playerId,
      socketId,
      name: playerName,
      color,
      connected: true,
      joinedAt: new Date()
    };

    match.players[color] = player;
    match.lastActivity = new Date();

    if (match.players.white && match.players.black && match.status === 'pending') {
      match.status = 'active';
      match.startedAt = new Date();
    }

    await redisService.updateMatch(match);
    await redisService.savePlayerSession(playerId, socketId);

    return { success: true, match, player };
  }

  async executeMove(matchId: string, playerId: string, move: GameMove): Promise<{ success: boolean; match?: Match; error?: string; invalidMove?: boolean }> {
    const match = await redisService.getMatch(matchId);

    if (!match) {
      return { success: false, error: 'Match not found' };
    }

    if (match.status !== 'active') {
      return { success: false, error: 'Match is not active' };
    }

    const player = Object.values(match.players).find(p => p?.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not in this match' };
    }

    if (player.color !== match.currentTurn) {
      console.log(`DEBUG: Player ${playerId} (${player.color}) tried to move but it's ${match.currentTurn}'s turn`);
      return { success: false, error: 'Not your turn' };
    }

    const engine = this.engines.get(matchId);
    if (!engine) {
      const newEngine = new ChessEngine(match.fen);
      this.engines.set(matchId, newEngine);
      console.log(`DEBUG: Created new engine for match ${matchId} with FEN: ${match.fen}`);
      return this.executeMove(matchId, playerId, move);
    }

    console.log(`DEBUG: Current turn: ${match.currentTurn}, Player: ${player.color}, Engine state: ${engine.getCurrentPlayer()}`);

    const board = engine.getBoard();
    console.log(`DEBUG: Board has ${board.pieces.length} pieces`);
    console.log(`DEBUG: Board FEN field: "${board.fen}"`);
    console.log(`DEBUG: Engine full FEN: "${engine.getFEN()}"`);
    console.log(`DEBUG: Looking for piece at ${move.from.row},${move.from.col}`);
    
    const pieceAtPosition = board.pieces.find(p => 
      p.position.row === move.from.row && p.position.col === move.from.col
    );
    
    if (pieceAtPosition) {
      console.log(`DEBUG: Found piece: ${pieceAtPosition.type} ${pieceAtPosition.color} at ${pieceAtPosition.position.row},${pieceAtPosition.position.col}`);
    } else {
      console.log(`DEBUG: NO PIECE FOUND at ${move.from.row},${move.from.col}`);
      console.log(`DEBUG: Available pieces:`, board.pieces.map(p => `${p.type}${p.color} at ${p.position.row},${p.position.col}`));
    }

    const chessMove = {
      from: move.from,
      to: move.to,
      piece: pieceAtPosition || {} as any,
      isCapture: false,
      isCastling: move.isCastling || move.notation === 'O-O' || move.notation === 'O-O-O'
    };

    const validationResult = engine.isMoveValid(chessMove);
    console.log(`DEBUG: Move validation result:`, validationResult);
    
    if (!validationResult.valid) {
      return { success: false, invalidMove: true, error: validationResult.error };
    }

    const moveSuccess = engine.makeMove(chessMove);
    if (!moveSuccess) {
      return { success: false, invalidMove: true, error: 'Invalid move' };
    }

    match.moveHistory.push(move.notation);
    match.currentTurn = match.currentTurn === 'white' ? 'black' : 'white';
    match.fen = engine.getFEN();
    match.lastActivity = new Date();

    console.log(`DEBUG: Move successful, new FEN: ${match.fen}, next turn: ${match.currentTurn}`);
    
    await redisService.updateMatch(match);

    return { success: true, match };
  }

  async endMatchByResign(matchId: string, playerId: string): Promise<{ success: boolean; match?: Match; error?: string }> {
    const match = await redisService.getMatch(matchId);

    if (!match) {
      return { success: false, error: 'Match not found' };
    }

    if (match.status !== 'active') {
      return { success: false, error: 'Match is not active' };
    }

    const player = Object.values(match.players).find(p => p?.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not in this match' };
    }

    match.status = 'completed';
    match.result = {
      winner: player.color === 'white' ? 'black' : 'white',
      reason: 'resignation',
      resignedBy: playerId
    };
    match.endedAt = new Date();
    match.lastActivity = new Date();

    await redisService.updateMatch(match);

    this.engines.delete(matchId);

    return { success: true, match };
  }

  async findMatch(matchId: string): Promise<Match | null> {
    return await redisService.getMatch(matchId);
  }

  async getMatchInfo(matchId: string): Promise<MatchStats | null> {
    const match = await redisService.getMatch(matchId);
    if (!match) {
      return null;
    }

    return {
      id: match.id,
      status: match.status,
      players: match.players,
      createdAt: match.createdAt,
      startedAt: match.startedAt,
      endedAt: match.endedAt,
      lastActivity: match.lastActivity,
      totalMoves: match.moveHistory.length,
      currentTurn: match.currentTurn,
      result: match.result
    };
  }

  async handlePlayerLeave(playerId: string): Promise<void> {
    const allMatches = await redisService.findMatchesByStatus('active');
    
    for (const matchId of allMatches) {
      const match = await redisService.getMatch(matchId);
      if (!match) continue;

      const player = Object.values(match.players).find(p => p?.id === playerId);
      if (player) {
        player.connected = false;
        match.lastActivity = new Date();

        const otherPlayer = Object.values(match.players).find(p => p && p.id !== playerId);
        if (!otherPlayer?.connected) {
          match.status = 'abandoned';
          match.endedAt = new Date();
        }

        await redisService.updateMatch(match);
        await redisService.clearPlayerSession(playerId);
        break;
      }
    }
  }

  async findWaitingMatches(): Promise<string[]> {
    return await redisService.getPendingMatches();
  }

  async getOverallStats(): Promise<{ totalMatches: number; activeMatches: number; pendingMatches: number }> {
    const totalMatches = await redisService.getTotalMatches();
    const activeMatches = await redisService.getActiveMatches();
    const pendingMatchIds = await redisService.getPendingMatches();

    return {
      totalMatches,
      activeMatches,
      pendingMatches: pendingMatchIds.length
    };
  }

  async cleanupOldMatches(): Promise<void> {
    const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    console.log('Cleanup started for matches older than:', cutoffTime);
  }
}

export const matchManager = new MatchManager(); 