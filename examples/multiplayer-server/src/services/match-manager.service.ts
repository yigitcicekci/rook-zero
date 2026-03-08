import { v4 as uuidv4 } from 'uuid';
import { RZero, DEFAULT_FEN, type Square } from '../lib/rook-zero';
import { GameMove, Match, MatchStats, Player } from '../types/game';
import { redisService } from './redis.service';

function positionToSquare(position: GameMove['from']): Square {
  return `${String.fromCharCode(97 + position.col)}${8 - position.row}` as Square;
}

export class MatchManager {
  private engines: Map<string, RZero> = new Map();

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
      fen: DEFAULT_FEN,
      moveHistory: []
    };

    await redisService.saveMatch(match);
    await redisService.incrementMatchCount();
    this.engines.set(matchId, new RZero());

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

    const existingPlayer = Object.values(match.players).find(player => player?.id === playerId);
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

    const player = Object.values(match.players).find(candidate => candidate?.id === playerId);
    if (!player) {
      return { success: false, error: 'Player not in this match' };
    }

    if (player.color !== match.currentTurn) {
      return { success: false, error: 'Not your turn' };
    }

    const engine = this.engines.get(matchId) ?? new RZero(match.fen);
    if (!this.engines.has(matchId)) {
      this.engines.set(matchId, engine);
    }

    const chessMove = {
      from: positionToSquare(move.from),
      to: positionToSquare(move.to)
    };

    const validationResult = engine.validateMove(chessMove);
    if (!validationResult.ok) {
      return { success: false, invalidMove: true, error: validationResult.reason };
    }

    if (!engine.move(chessMove)) {
      return { success: false, invalidMove: true, error: 'invalid-move' };
    }

    match.moveHistory.push(move.notation);
    match.currentTurn = engine.turn() === 'w' ? 'white' : 'black';
    match.fen = engine.fen();
    match.lastActivity = new Date();

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

    const player = Object.values(match.players).find(candidate => candidate?.id === playerId);
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
      if (!match) {
        continue;
      }

      const player = Object.values(match.players).find(candidate => candidate?.id === playerId);
      if (!player) {
        continue;
      }

      player.connected = false;
      match.lastActivity = new Date();

      const otherPlayer = Object.values(match.players).find(candidate => candidate && candidate.id !== playerId);
      if (!otherPlayer?.connected) {
        match.status = 'abandoned';
        match.endedAt = new Date();
      }

      await redisService.updateMatch(match);
      await redisService.clearPlayerSession(playerId);
      break;
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
