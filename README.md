# ♜ RookZero

**RookZero** is a high-performance chess engine and real-time multiplayer backend written in **TypeScript**.

It provides a fully validated chess rules engine with **real-time gameplay**, **Redis state management**, and an extensive **automated testing suite**.

The project focuses on **correct chess logic, performance, and multiplayer synchronization**.

---

# 🚀 Features

- ♟ **Advanced Chess Engine**
  - Full chess rule validation
  - Pin detection
  - Castling
  - En passant
  - Pawn promotion
  - Check / checkmate detection
  - FEN notation support

- 🌐 **Real-Time Multiplayer**
  - Built with **Socket.IO**
  - Instant move synchronization

- 🧠 **Robust Game Logic**
  - Move validation system
  - Turn management
  - Illegal move prevention

- ⚡ **High Performance**
  - Sub-millisecond move validation
  - Optimized board state tracking

- 📦 **Redis Integration**
  - Match state persistence
  - Player state management

- 🧪 **Comprehensive Test Suite**
  - 96+ automated tests
  - Simulation tools
  - Performance benchmarks

- 🐳 **Docker Support**
  - Docker
  - Docker Compose

---

# 📋 Requirements

- Node.js 18+
- Redis 7+
- TypeScript 4.9+
- Jest
- Docker (optional)

---

# 🛠 Installation

## Local Setup

Install dependencies:

```bash
npm install
```

Start Redis:

```bash
redis-server
```

Build the project:

```bash
npm run build
```

Run in development mode:

```bash
npm run dev
```

---

## Docker Setup

```bash
npm run docker:up
npm run docker:down
```

---

# 🧪 Test Suite

RookZero includes a **comprehensive testing system** that validates chess logic, system behavior, and real-world gameplay scenarios.

---

# Chess Engine Tests

Location:

```
chess-engine/__tests__/
```

### Engine Tests
- Engine initialization
- Game state management
- FEN parsing
- Move validation

### Piece Movement Tests

- Knight movement validation
- Queen diagonal/linear movement
- King movement and castling
- Rook linear movement
- Bishop diagonal movement
- Pawn movement and captures

### Special Rules

- Castling (short & long)
- En passant
- Pawn promotion
- Check & checkmate detection

### Critical Chess Logic

- Pin detection
- King safety validation
- Complex board state scenarios

### Match Scenarios

- Real match simulations
- Multi-move sequences

---

# Integration & Performance Tests

## Run All Simulation Tests

```bash
npm run test:all
```

---

## Basic System Tests

```bash
npx ts-node src/tests/basicTest.ts
```

Tests include:

- Redis connectivity
- Match creation
- Player joining
- Move validation
- System statistics
- Match cleanup

---

## Chess Engine Validator

```bash
npx ts-node src/tests/chessEngineValidator.ts
```

Validates:

- Move execution timing
- Chess rule edge cases
- FEN consistency
- Turn management

---

## Multiplayer Simulation Test

```bash
npm run test:xy-users
```

Simulates real gameplay scenarios:

- Socket connection setup
- Match creation / join flow
- Opening sequences (Italian Game)
- Invalid move handling
- Player disconnect/reconnect
- Load testing

---

## Interactive Chess Test

```bash
npx ts-node src/tests/interactiveChessTest.ts
```

### Modes

**Mode 1**

Local engine (two players on one terminal)

**Mode 2**

Network multiplayer using:
- Redis
- Socket.IO

### Features

- ASCII chess board
- Real-time move input
- Live performance metrics
- Error tracking
- Production simulation

Example commands:

```
e2-e4    -> make a move
stats    -> performance stats
board    -> redraw board
history  -> move history
help     -> show commands
quit     -> exit game
```

---

# 🎮 Usage

## Start Server

Development:

```bash
npm run dev
```

Production:

```bash
npm start
```

Server runs at:

```
http://localhost:3001
```

---

# 📡 API Endpoints

### System Stats

```
GET /api/stats
```

Returns match and player statistics.

### Pending Matches

```
GET /api/matches/pending
```

### Match Details

```
GET /api/matches/:matchId
```

---

# 🔌 Socket.IO Events

## Client → Server

- `identify`
- `create_match`
- `join_match`
- `make_move`
- `resign`

## Server → Client

- `match_created`
- `match_started`
- `move_made`
- `player_joined`
- `game_over`

---

# ⚡ Performance Metrics

## Chess Engine

- Move processing: **0.40ms – 1.50ms**
- Move validation: **~0.17ms**
- Pin detection prevents illegal moves exposing the king
- Memory-efficient **32-piece tracking system**
- Full **FEN compatibility**

---

## System Performance

- Redis connection: ~7ms
- Socket connection: ~6.5ms
- Network latency simulation: ~1000ms

---

# 📊 Test Results

Latest run:

- ✅ **96 / 96 Jest Tests Passed**
- ✅ Integration Tests Passed
- ✅ Chess Logic Fully Validated
- ✅ Performance Targets Met
- ✅ No Linter Errors

---

# 🏗 Project Structure

```
src
 ├── services
 │   ├── redis.ts
 │   └── matchManager.ts
 │
 ├── socket
 │   └── socketHandler.ts
 │
 ├── types
 │   └── game.ts
 │
 ├── tests
 │   ├── basicTest.ts
 │   ├── chessEngineValidator.ts
 │   ├── xyUserTest.ts
 │   └── interactiveChessTest.ts
 │
 └── server.ts

chess-engine
 ├── engine.ts
 ├── pieces
 └── __tests__

docker-compose.yml
Dockerfile
package.json
```

---

# ⚙ Environment Variables

```
NODE_ENV=development
PORT=3000
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=*
```

---

# 🚀 Deployment

```bash
docker-compose up -d
```

---

# 🛠 Troubleshooting

### Port Already In Use

```bash
lsof -ti:3000 | xargs kill -9
```

### Redis Memory Full

```bash
redis-cli FLUSHALL
```

### TypeScript Errors

```bash
npx tsc --noEmit
```

---

✅ **RookZero aims to provide a reliable, high-performance foundation for chess applications and multiplayer chess systems.**


