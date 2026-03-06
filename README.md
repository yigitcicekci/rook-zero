# ♜ RookZero

![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Node](https://img.shields.io/badge/Node.js-18+-green)
![Redis](https://img.shields.io/badge/Redis-7-red)
![Tests](https://img.shields.io/badge/tests-96%20passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

**RookZero** is a high-performance **TypeScript chess engine and real-time multiplayer backend**.

It provides a fully validated chess rules engine with **real-time gameplay**, **Redis state management**, and an extensive **automated testing suite**.

The project focuses on **correct chess logic, performance, and multiplayer synchronization**.

---

# 🚀 Features

### ♟ Chess Engine
- Full chess rule validation
- Pin detection
- Castling
- En passant
- Pawn promotion
- Check / checkmate detection
- FEN notation support

### 🌐 Multiplayer Support
- Real-time gameplay with **Socket.IO**
- Instant move synchronization
- Player connection handling

### ⚡ Performance
- Sub-millisecond move validation
- Efficient board state tracking
- Optimized move validation pipeline

### 📦 Infrastructure
- Redis for match state storage
- Docker support
- TypeScript architecture

### 🧪 Testing
- **96+ automated tests**
- Chess rule validation tests
- Integration tests
- Multiplayer simulation tests
- Performance benchmarks

---

# 📋 Requirements

- Node.js **18+**
- Redis **7+**
- TypeScript **4.9+**
- Jest

Optional:

- Docker
- Docker Compose

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

Build project:

```bash
npm run build
```

Run development server:

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

# 🧪 Testing

Run the full test suite:

```bash
npm test
```

Run simulation tests:

```bash
npm run test:all
```

---

## Additional Test Tools

### Basic System Test

```bash
npx ts-node src/tests/basicTest.ts
```

Tests:

- Redis connectivity
- Match creation
- Player joining
- Move validation

---

### Chess Engine Validator

```bash
npx ts-node src/tests/chessEngineValidator.ts
```

Validates:

- move execution timing
- rule edge cases
- FEN consistency
- turn management

---

### Multiplayer Simulation

```bash
npm run test:xy-users
```

Simulates:

- socket connections
- match creation / join flow
- real chess openings
- invalid move scenarios

---

### Interactive Chess Test

```bash
npx ts-node src/tests/interactiveChessTest.ts
```

Features:

- ASCII chess board
- real-time move input
- performance metrics
- multiplayer simulation

Commands:

```
e2-e4
stats
board
history
help
quit
```

---

# 🎮 Running the Server

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

### Client → Server

- identify
- create_match
- join_match
- make_move
- resign

### Server → Client

- match_created
- match_started
- move_made
- player_joined
- game_over

---

# ⚡ Performance

### Chess Engine

- Move processing: **0.40ms – 1.50ms**
- Move validation: **~0.17ms**
- Full FEN support
- Pin detection system

### System Metrics

- Redis connection: ~7ms
- Socket connection: ~6ms

---

# 📊 Test Results

Latest run:

- ✅ **96 / 96 tests passed**
- ✅ integration tests passed
- ✅ chess rule validation complete
- ✅ no linter errors

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

```
docker-compose up -d
```

---

# 📜 License

MIT License

---

**RookZero** aims to provide a reliable, high-performance foundation for building chess platforms and multiplayer chess systems.


