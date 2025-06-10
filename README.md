# Chess Engine Test Suite

## 🚀 Özellikler

- **Real-time Multiplayer**: Socket.IO ile gerçek zamanlı çok oyunculu satranç
- **Redis Integration**: Match ve player durumlarının Redis'te saklanması
- **Advanced Chess Engine**: Pin detection, en passant, castling gibi gelişmiş satranç kuralları
- **Comprehensive Test Suite**: 96+ test ile kapsamlı chess logic validation
- **Performance Analytics**: Detaylı performans metrikleri ve timing analysis
- **Game Simulation**: Otomatik oyun simülasyonu ve test araçları
- **Docker Support**: Docker ve Docker Compose desteği

## 📋 Gereksinimler

- Node.js 18+
- Redis 7+
- TypeScript 4.9+
- Jest (testing framework)
- Docker & Docker Compose (opsiyonel)

## 🛠️ Kurulum

### Local Kurulum

1. Dependencies'leri kurun:
```bash
npm install
```

2. Redis'i başlatın:
```bash
redis-server
```

3. Uygulamayı build edin:
```bash
npm run build
```

4. Development mode'da çalıştırın:
```bash
npm run dev
```

### Docker ile Kurulum

```bash
npm run docker:up
npm run docker:down
```

## 🧪 Test Suite

### Test Türleri ve Açıklamaları

#### Test Suites for Simulations
```bash
npm test:all
```

**11 Test Suite'i içerir:**

- **Engine Tests** (`chess-engine/__tests__/engine.test.ts`)
  - ChessEngine constructor validation
  - Game state management
  - FEN notation parsing
  - Basic move validation

- **Piece Movement Tests** 
  - `knight.test.ts`: Knight L-shape movement validation
  - `queen.test.ts`: Queen diagonal/straight movement 
  - `king.test.ts`: King movement + castling logic
  - `rook.test.ts`: Rook straight-line movement
  - `bishop.test.ts`: Bishop diagonal movement  
  - `pawn.test.ts`: Pawn forward/capture/en passant

- **Special Rules Tests** (`special-rules.test.ts`)
  - Castling (kingside/queenside)
  - En passant capture
  - Pawn promotion
  - Check/checkmate detection

- **Critical Chess Logic** (`critical-chess-logic.test.ts`)
  - Pin detection (pieces can't move if king would be in check)
  - King safety validation
  - Complex board scenarios

- **Match Scenarios** (`match-scenarios.test.ts`)
  - Real game situation tests
  - Multi-move sequences

#### 2. Performance & Integration Tests

##### Basic Test Suite
```bash
npx ts-node src/tests/basicTest.ts
```

**Testler:**
- ✅ Redis connection (ping/pong)
- ✅ Match creation (UUID generation)  
- ✅ Player joining (white/black assignment)
- ✅ Move validation (e2-e4 pawn move)
- ✅ System statistics (match counts)
- ✅ Cleanup operations (match deletion)


##### Chess Engine Validator
```bash
npx ts-node src/tests/chessEngineValidator.ts
```

**Advanced Performance Analysis:**
- Individual move timing (validation vs execution)
- Chess logic edge case testing
- FEN notation consistency
- Turn management validation


##### X&Y User Comprehensive Test
```bash
npx ts-node src/tests/xyUserTest.ts
```

**Real-world Scenario Testing:**
- Socket connection establishment
- Match creation and joining flow
- Italian Game opening moves (e4, e5, Nf3, Nc6, Bc4, Be7, O-O)
- Edge cases (invalid moves, wrong turns)
- Player disconnect/reconnect scenarios
- Performance under load

##### Interactive Chess Test
```bash
npx ts-node src/tests/interactiveChessTest.ts
```

**Human-in-the-Loop Testing:**
- 🎮 Two players can play against each other
- 🕹️ Real-time move input with ASCII board display
- ⏱️ Live performance metrics (validation/execution timing)
- 📊 Comprehensive error tracking and analysis
- 🎯 Production environment simulation
- 📈 Success rate monitoring

**Commands Available:**
```
🎯 Player 1 (white), your move: e2-e4    # Make a move
🎯 Player 1 (white), your move: stats    # Show performance stats
🎯 Player 1 (white), your move: board    # Redraw board
🎯 Player 1 (white), your move: history  # Show move history
🎯 Player 1 (white), your move: help     # Show commands
🎯 Player 1 (white), your move: quit     # Exit game
```


### Test Execution Order
```bash
npm test:all                              # For simulation tests
npm test                                    # Jest suite (96 tests)
npx ts-node src/tests/basicTest.ts         # Basic functionality
npx ts-node src/tests/chessEngineValidator.ts  # Chess logic validation
npx ts-node src/tests/xyUserTest.ts        # Integration testing
npx ts-node src/tests/interactiveChessTest.ts  # Interactive play testing
```

## 🎮 Kullanım

### Server Başlatma

```bash
# Development
npm run dev

# Production  
npm start
```

Server `http://localhost:3000` adresinde çalışacaktır.

### API Endpoints

- `GET /health` - Sistem sağlık durumu
- `GET /api/stats` - Sistem istatistikleri (matches, players)
- `GET /api/matches/pending` - Bekleyen maçlar
- `GET /api/matches/:matchId` - Maç detayları

### Socket.IO Events

#### Client to Server
- `identify` - Oyuncu kimlik doğrulama
- `create_match` - Yeni maç oluşturma  
- `join_match` - Maça katılma
- `make_move` - Hamle yapma
- `resign` - Oyundan çekilme

#### Server to Client
- `match_created` - Yeni maç oluşturuldu
- `match_started` - Maç başladı
- `move_made` - Hamle yapıldı
- `player_joined` - Oyuncu katıldı
- `game_over` - Oyun bitti

## 📊 Performance Metrics

### Chess Engine Performance
- **Sub-millisecond**: Average move processing time
- **Pin Detection**: Prevents illegal moves exposing king
- **Memory Efficient**: 32 piece tracking system
- **FEN Compliant**: Standard chess notation support

### System Performance
- **Redis Operations**: ~7ms connection time
- **Socket Connections**: ~6.54ms average
- **Move Validation**: ~0.17ms average
- **Network Latency**: ~1000ms simulated realistic delays

### Success Rates
- **Move Success Rate**: 75% (expected failures for invalid moves)
- **Connection Reliability**: 100% in test scenarios
- **Turn Management**: 100% accuracy

## 🏗️ Proje Yapısı

```
├── src/
│   ├── services/
│   │   ├── redis.ts          # Redis service (connection management)
│   │   └── matchManager.ts   # Match lifecycle management  
│   ├── socket/
│   │   └── socketHandler.ts  # Socket.IO event handler
│   ├── types/
│   │   └── game.ts          # TypeScript type definitions
│   ├── tests/
│   │   ├── basicTest.ts     # Basic functionality tests
│   │   ├── chessEngineValidator.ts  # Chess logic validation
│   │   └── xyUserTest.ts    # Integration & user simulation
│   └── server.ts            # Express + Socket.IO server
├── chess-engine/            # Chess engine implementation
│   ├── engine.ts            # Main engine class
│   ├── pieces/             # Piece movement logic
│   └── __tests__/          # Jest test files
├── docker-compose.yml       # Docker compose config
├── Dockerfile              # Docker image config  
└── package.json
```

## 🔧 Environment Variables

```bash
NODE_ENV=development
PORT=3000
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=*
```

## 🚀 Deployment

### Docker Production

```bash
docker-compose -f docker-compose.yml up -d
```
### Common Issues

1. **Port Already in Use**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

2. **Redis Memory Full**
   ```bash
   redis-cli FLUSHALL
   ```

3. **TypeScript Compilation Errors**
   ```bash
   npx tsc --noEmit
   ```

## 📈 Test Results Summary

### Latest Test Run Results:
- ✅ **96/96 Jest Tests Passing**
- ✅ **All Integration Tests Passing**  
- ✅ **Performance Benchmarks Met**
- ✅ **Chess Logic Validation Complete**
- ✅ **No Linter Errors**
