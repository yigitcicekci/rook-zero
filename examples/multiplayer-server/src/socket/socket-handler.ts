import { Server as SocketIOServer, Socket } from 'socket.io';
import { matchManager } from '../services/match-manager.service';
import { SocketEvents } from '../types/game';

interface SocketWithPlayer extends Socket {
  playerId?: string;
  playerName?: string;
  currentMatchId?: string;
}

export class SocketHandler {
  private io: SocketIOServer;
  private connectedPlayers: Map<string, string> = new Map(); 

  constructor(io: SocketIOServer) {
    this.io = io;
    this.start();
  }

  private start(): void {
    this.io.on('connection', (socket: SocketWithPlayer) => {
      console.log(`Player connected: ${socket.id}`);

      socket.on('identify', (data: { playerId: string; playerName: string }) => {
        socket.playerId = data.playerId;
        socket.playerName = data.playerName;
        this.connectedPlayers.set(data.playerId, socket.id);
        
        console.log(`Player identified: ${data.playerName} (${data.playerId})`);
      });

      socket.on('create_match', async (callback: (response: any) => void) => {
        try {
          const matchId = await matchManager.createNewMatch();
          callback({ success: true, matchId });
          
          this.io.emit('match_created', { matchId });
        } catch (error) {
          console.error('Error creating match:', error);
          callback({ success: false, error: 'Failed to create match' });
        }
      });

      socket.on(SocketEvents.JOIN_MATCH, async (data: { matchId: string }, callback: (response: any) => void) => {
        if (!socket.playerId || !socket.playerName) {
          callback({ success: false, error: 'Player not identified' });
          return;
        }

        try {
          const result = await matchManager.addPlayerToMatch(
            data.matchId,
            socket.playerId,
            socket.playerName,
            socket.id
          );

          if (result.success && result.match && result.player) {
            socket.currentMatchId = data.matchId;
            socket.join(data.matchId);

            callback({ 
              success: true, 
              match: result.match, 
              player: result.player 
            });

            socket.to(data.matchId).emit(SocketEvents.PLAYER_JOINED, {
              player: result.player,
              match: result.match
            });

            if (result.match.status === 'active') {
              this.io.to(data.matchId).emit(SocketEvents.MATCH_STARTED, {
                match: result.match
              });
            }

            console.log(`Player ${socket.playerName} joined match ${data.matchId} as ${result.player.color}`);
          } else {
            callback({ success: false, error: result.error });
          }
        } catch (error) {
          console.error('Error joining match:', error);
          callback({ success: false, error: 'Failed to join match' });
        }
      });

      socket.on(SocketEvents.MAKE_MOVE, async (data: { matchId: string; move: any }, callback: (response: any) => void) => {
        if (!socket.playerId) {
          callback({ success: false, error: 'Player not identified' });
          return;
        }

        try {
          const gameMove = {
            ...data.move,
            timestamp: new Date(),
            playerId: socket.playerId
          };

          const result = await matchManager.executeMove(data.matchId, socket.playerId, gameMove);

          if (result.success && result.match) {
            callback({ success: true, match: result.match });

            socket.to(data.matchId).emit(SocketEvents.MOVE_MADE, {
              move: gameMove,
              match: result.match
            });

            console.log(`Move made in match ${data.matchId} by ${socket.playerId}`);
          } else if (result.invalidMove) {
            callback({ success: false, invalidMove: true, error: result.error });
            socket.emit(SocketEvents.INVALID_MOVE, { error: result.error });
          } else {
            callback({ success: false, error: result.error });
          }
        } catch (error) {
          console.error('Error making move:', error);
          callback({ success: false, error: 'Failed to make move' });
        }
      });

      socket.on(SocketEvents.RESIGN, async (data: { matchId: string }, callback: (response: any) => void) => {
        if (!socket.playerId) {
          callback({ success: false, error: 'Player not identified' });
          return;
        }

        try {
          const result = await matchManager.endMatchByResign(data.matchId, socket.playerId);

          if (result.success && result.match) {
            callback({ success: true, match: result.match });

            this.io.to(data.matchId).emit(SocketEvents.GAME_OVER, {
              match: result.match,
              reason: 'resignation'
            });

            console.log(`Player ${socket.playerId} resigned from match ${data.matchId}`);
          } else {
            callback({ success: false, error: result.error });
          }
        } catch (error) {
          console.error('Error resigning:', error);
          callback({ success: false, error: 'Failed to resign' });
        }
      });

      socket.on('get_match', async (data: { matchId: string }, callback: (response: any) => void) => {
        try {
          const match = await matchManager.findMatch(data.matchId);
          callback({ success: true, match });
        } catch (error) {
          console.error('Error getting match:', error);
          callback({ success: false, error: 'Failed to get match' });
        }
      });

      socket.on('get_stats', async (callback: (response: any) => void) => {
        try {
          const stats = await matchManager.getOverallStats();
          callback({ success: true, stats });
        } catch (error) {
          console.error('Error getting stats:', error);
          callback({ success: false, error: 'Failed to get stats' });
        }
      });

      socket.on('get_pending_matches', async (callback: (response: any) => void) => {
        try {
          const pendingMatches = await matchManager.findWaitingMatches();
          callback({ success: true, pendingMatches });
        } catch (error) {
          console.error('Error getting pending matches:', error);
          callback({ success: false, error: 'Failed to get pending matches' });
        }
      });

      socket.on('disconnect', async () => {
        console.log(`Player disconnected: ${socket.id}`);

        if (socket.playerId) {
          this.connectedPlayers.delete(socket.playerId);
          await matchManager.handlePlayerLeave(socket.playerId);

          if (socket.currentMatchId) {
            socket.to(socket.currentMatchId).emit(SocketEvents.PLAYER_LEFT, {
              playerId: socket.playerId,
              playerName: socket.playerName
            });
          }
        }
      });

      socket.on('error', (error) => {
        console.error(`Socket error for ${socket.id}:`, error);
        socket.emit(SocketEvents.ERROR, { error: 'Socket error occurred' });
      });
    });
  }

  public getConnectedPlayersCount(): number {
    return this.connectedPlayers.size;
  }

  public checkPlayerOnline(playerId: string): boolean {
    return this.connectedPlayers.has(playerId);
  }

  public findPlayerSocket(playerId: string): Socket | undefined {
    const socketId = this.connectedPlayers.get(playerId);
    if (socketId) {
      return this.io.sockets.sockets.get(socketId);
    }
    return undefined;
  }

  public sendMessageToPlayer(playerId: string, event: string, data: any): boolean {
    const socket = this.findPlayerSocket(playerId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }

  public notifyMatch(matchId: string, event: string, data: any): void {
    this.io.to(matchId).emit(event, data);
  }

  public notifyEveryone(event: string, data: any): void {
    this.io.emit(event, data);
  }
} 