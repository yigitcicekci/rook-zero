export interface Player {
  id: string;
  socketId: string;
  name: string;
  color: 'white' | 'black';
  connected: boolean;
  joinedAt: Date;
}

export interface MatchResult {
  winner: 'white' | 'black' | 'draw';
  reason: 'checkmate' | 'stalemate' | 'timeout' | 'resignation' | 'disconnect';
  resignedBy?: string;
}

export interface Match {
  id: string;
  status: 'pending' | 'active' | 'completed' | 'abandoned';
  players: Record<'white' | 'black', Player | null>;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  currentTurn: 'white' | 'black';
  fen: string;
  moveHistory: string[];
  lastActivity: Date;
  winner?: 'white' | 'black' | 'draw';
  endReason?: 'checkmate' | 'stalemate' | 'timeout' | 'resignation' | 'disconnect';
  result?: MatchResult;
}

export interface Position {
  row: number;
  col: number;
}

export interface GameMove {
  from: Position;
  to: Position;
  notation: string;
  timestamp: Date;
  playerId: string;
  isCastling?: boolean;
}

export interface MatchStats {
  id: string;
  status: string;
  players: Record<'white' | 'black', Player | null>;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  lastActivity: Date;
  totalMoves: number;
  currentTurn: 'white' | 'black';
  result?: MatchResult;
}

export enum SocketEvents {
  JOIN_MATCH = 'join_match',
  MAKE_MOVE = 'make_move',
  RESIGN = 'resign',
  OFFER_DRAW = 'offer_draw',
  ACCEPT_DRAW = 'accept_draw',
  DECLINE_DRAW = 'decline_draw',
  

  MATCH_JOINED = 'match_joined',
  MATCH_STARTED = 'match_started',
  MOVE_MADE = 'move_made',
  INVALID_MOVE = 'invalid_move',
  GAME_OVER = 'game_over',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  DRAW_OFFERED = 'draw_offered',
  MATCH_ERROR = 'match_error',

  ERROR = 'error',
  DISCONNECT = 'disconnect',
  CONNECT = 'connect'
} 