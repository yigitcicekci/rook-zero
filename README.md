# Rook Zero

Rook Zero is chess rules library for legal move generation, strict validation, draw detection, notation handling, and Elo rating calculation.

## Why It Exists

- `RkEngine` public API
- strict move and position validation
- SAN, UCI, FEN, and PGN support
- Elo helpers with configurable K-factor
- undo/redo and make/unmake state flow
- low-level attack and pin helpers for power users
- no backend, socket, redis, or express code in the published package

## Installation

```bash
npm install rook-zero
```

## 30-Second Example

```ts
import { RkEngine } from 'rook-zero';

const rkengine = new RkEngine();

rkengine.move('e4');
rkengine.move('e7e5');
rkengine.move({ from: 'g1', to: 'f3' });

console.log(rkengine.fen());
console.log(rkengine.moves());
console.log(rkengine.history());
```

```ts
import { calculateMatchElo, getFideKFactor } from 'rook-zero';

const whiteKFactor = getFideKFactor({ rating: 1820, gamesPlayed: 64 });
const blackKFactor = getFideKFactor({ rating: 1765, gamesPlayed: 48 });

const ratingUpdate = calculateMatchElo({
  whiteRating: 1820,
  blackRating: 1765,
  result: '1-0',
  whiteKFactor,
  blackKFactor,
  round: true
});

console.log(ratingUpdate.white.newRating);
console.log(ratingUpdate.black.newRating);
```

## Core API

```ts
const rkengine = new RkEngine();

rkengine.fen();
rkengine.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

rkengine.moves();
rkengine.moves({ square: 'e2' });

rkengine.move('Nf3');
rkengine.move('e2e4');
rkengine.move({ from: 'e2', to: 'e4' });

rkengine.undo();
rkengine.redo();

rkengine.turn();
rkengine.pieceAt('e4');
rkengine.isCheck();
rkengine.isCheckmate();
rkengine.isStalemate();
rkengine.isDraw();
rkengine.isFivefoldRepetition();
rkengine.isThreefoldRepetition();
rkengine.isInsufficientMaterial();
rkengine.isSeventyFiveMoveRule();
rkengine.isFiftyMoveRule();
rkengine.outcome();
```

## Strict Validation

```ts
const rkengine = new RkEngine();
const result = rkengine.validateMove({ from: 'e2', to: 'e4' });

if (!result.ok) {
  console.log(result.reason);
}
```

`validateFen(fen)` and `rkengine.loadFen(fen)` expose explicit position validation results instead of silent failure.

## Notation Support

- FEN load and export with `loadFen()` and `fen()`
- SAN input and SAN move lists
- UCI parsing and rendering with `move('e2e4')` and `parseUci()`
- PGN export with `pgn()`
- basic PGN import with `loadPgn()`

## Draw Detection

Rook Zero exposes:

- `isDraw()`
- `isStalemate()`
- `isFivefoldRepetition()`
- `isThreefoldRepetition()`
- `isInsufficientMaterial()`
- `isSeventyFiveMoveRule()`
- `isFiftyMoveRule()`
- `outcome()`

## Elo Rating

- `calculateExpectedScore(rating, opponentRating)`
- `calculateEloChange({ rating, opponentRating, score, kFactor })`
- `calculateMatchElo({ whiteRating, blackRating, result, whiteKFactor, blackKFactor })`
- `getFideKFactor({ rating, gamesPlayed, age, hasReached2400, gamesInRatingPeriod })`
- `roundEloChange(delta)`

```ts
import { calculateEloChange } from 'rook-zero';

const update = calculateEloChange({
  rating: 1800,
  opponentRating: 2000,
  score: 'draw',
  kFactor: 20
});

console.log(update.expectedScore);
console.log(update.delta);
console.log(update.newRating);
```

## Low-Level Helpers

- `isSquareAttacked(square, byColor)`
- `attackersOf(square, byColor)`
- `pieceAt(square)`
- `inCheck()`
- `checkers()`
- `pinnedPieces(color)`
- `legalMovesFrom(square)`
- `kingSquare(color)`
- `perft(depth)`

## Public Exports

- `RkEngine`
- `DEFAULT_FEN`
- `validateFen`
- `parseUci`
- `formatUci`
- `normalizeSan`
- `formatPgn`
- `tokenizePgn`
- `calculateExpectedScore`
- `calculateEloChange`
- `calculateMatchElo`
- `getFideKFactor`
- `roundEloChange`

## Performance Direction

The library uses a mutable make/unmake model with a compact internal board representation, keeping the public API object-friendly while avoiding backend-specific concerns.

## Development

```bash
npm run build
npm test
npm pack
```

## Example App

The multiplayer backend is not part of the published package. The demo server remains under `examples/multiplayer-server/`.
