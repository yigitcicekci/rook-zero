import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import { redisService } from './services/redis';
import { SocketHandler } from './socket/socketHandler';

const app = express();
const server = createServer(app);
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "*",
  methods: ["GET", "POST"],
  credentials: true
};

const io = new SocketIOServer(server, {
  cors: corsOptions,
  transports: ['websocket', 'polling']
});

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const redisStatus = await redisService.ping();
    const stats = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      redis: redisStatus === 'PONG' ? 'connected' : 'disconnected',
      uptime: process.uptime()
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Redis connection failed'
    });
  }
});
 
app.get('/api/stats', async (req, res) => {
  try {
    const totalMatches = await redisService.getTotalMatches();
    const activeMatches = await redisService.getActiveMatches();
    const pendingMatches = await redisService.getPendingMatches();
    
    res.json({
      totalMatches,
      activeMatches,
      pendingMatches: pendingMatches.length,
      connectedPlayers: socketHandler.getConnectedPlayersCount()
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

app.get('/api/matches/pending', async (req, res) => {
  try {
    const pendingMatches = await redisService.getPendingMatches();
    res.json({ pendingMatches });
  } catch (error) {
    console.error('Error getting pending matches:', error);
    res.status(500).json({ error: 'Failed to get pending matches' });
  }
});

app.get('/api/matches/:matchId', async (req, res) => {
  try {
    const match = await redisService.getMatch(req.params.matchId);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json({ match });
  } catch (error) {
    console.error('Error getting match:', error);
    res.status(500).json({ error: 'Failed to get match' });
  }
});


const socketHandler = new SocketHandler(io);
const shutdown = async () => {
  console.log('Gracefully shutting down...');
  
  try {
    await redisService.disconnect();
    console.log('Redis disconnected');
    
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await redisService.connect();
    console.log('Redis connected successfully');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
      console.log(`Socket.IO server ready for connections`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start(); 