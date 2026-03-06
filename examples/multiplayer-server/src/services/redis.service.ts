import { createClient, RedisClientType } from 'redis';
import { Match } from '../types/game';

export class RedisService {
  private client: RedisClientType;
  private isConnected = false;

  constructor() {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
    this.client = createClient({ url: redisUrl });
    
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    this.client.on('connect', () => {
      console.log('Connected to Redis');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Disconnected from Redis');
      this.isConnected = false;
    });
  }

  async connect(): Promise<void> {
    if (!this.client.isOpen) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client.isOpen) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async saveMatch(match: Match): Promise<void> {
    const key = this.buildMatchKey(match.id);
    await this.client.hSet(key, {
      data: JSON.stringify(match),
      createdAt: match.createdAt.toISOString(),
      status: match.status
    });
    
    if (match.status === 'completed' || match.status === 'abandoned') {
      await this.client.expire(key, 3600);
    }

    if (match.status === 'pending') {
      await this.client.sAdd('pending_matches', match.id);
    }
  }

  async getMatch(matchId: string): Promise<Match | null> {
    const key = this.buildMatchKey(matchId);
    const data = await this.client.hGet(key, 'data');
    
    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  async updateMatch(match: Match): Promise<void> {
    const key = this.buildMatchKey(match.id);
    await this.client.hSet(key, {
      data: JSON.stringify(match),
      status: match.status,
      lastActivity: match.lastActivity.toISOString()
    });

    if (match.status !== 'pending') {
      await this.client.sRem('pending_matches', match.id);
    }
  }

  async removeMatch(matchId: string): Promise<void> {
    const key = this.buildMatchKey(matchId);
    await this.client.del(key);
    await this.client.sRem('pending_matches', matchId);
  }

  async getPendingMatches(): Promise<string[]> {
    return await this.client.sMembers('pending_matches');
  }

  async findMatchesByStatus(status: string): Promise<string[]> {
    const keys = await this.client.keys('match:*');
    const matches: string[] = [];

    for (const key of keys) {
      const matchStatus = await this.client.hGet(key, 'status');
      if (matchStatus === status) {
        const matchId = key.replace('match:', '');
        matches.push(matchId);
      }
    }

    return matches;
  }

  async incrementMatchCount(): Promise<void> {
    await this.client.incr('total_matches');
  }

  async getTotalMatches(): Promise<number> {
    const count = await this.client.get('total_matches');
    return count ? parseInt(count) : 0;
  }

  async getActiveMatches(): Promise<number> {
    const activeMatches = await this.findMatchesByStatus('active');
    return activeMatches.length;
  }

  async savePlayerSession(playerId: string, socketId: string): Promise<void> {
    await this.client.hSet(`player:${playerId}`, {
      socketId,
      lastSeen: new Date().toISOString()
    });
    await this.client.expire(`player:${playerId}`, 7200);
  }

  async getPlayerSession(playerId: string): Promise<{ socketId: string; lastSeen: string } | null> {
    const session = await this.client.hGetAll(`player:${playerId}`);
    return session.socketId ? session as { socketId: string; lastSeen: string } : null;
  }

  async clearPlayerSession(playerId: string): Promise<void> {
    await this.client.del(`player:${playerId}`);
  }

  private buildMatchKey(matchId: string): string {
    return `match:${matchId}`;
  }

  async ping(): Promise<string> {
    return await this.client.ping();
  }

  get connected(): boolean {
    return this.client.isOpen;
  }
}

export const redisService = new RedisService(); 