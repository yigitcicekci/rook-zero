# Rook Zero

Rook Zero is a TypeScript chess rules library for **legal move generation**, **strict validation**, **draw detection**, **notation handling**, and **Elo rating calculation**.

It is built for developers who need a clean chess rules core without backend-specific concerns. The package focuses on correctness, explicit validation, and a practical API for apps, services, tools, and game systems.

---

## Table of Contents

- [Features](#features)
- [Why Rook Zero](#why-rook-zero)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [When to Use Rook Zero](#when-to-use-rook-zero)
- [Core Concepts](#core-concepts)
- [API Overview](#api-overview)
- [Creating an Engine](#creating-an-engine)
- [Working with Moves](#working-with-moves)
- [Move Generation](#move-generation)
- [Validation](#validation)
- [Game State and Outcome](#game-state-and-outcome)
- [History / Undo / Redo](#history--undo--redo)
- [Board Inspection and Low-Level Helpers](#board-inspection-and-low-level-helpers)
- [FEN Support](#fen-support)
- [UCI Support](#uci-support)
- [SAN Support](#san-support)
- [PGN Support](#pgn-support)
- [Elo Rating Utilities](#elo-rating-utilities)
- [Public Exports](#public-exports)
- [TypeScript Support](#typescript-support)
- [Common Usage Recipes](#common-usage-recipes)
- [Performance Direction](#performance-direction)
- [Development](#development)
- [Limitations](#limitations)
- [License](#license)

---

## Features

- `RZero` public API
- legal move generation
- strict move validation
- strict FEN validation
- draw detection helpers
- SAN, UCI, FEN, and PGN support
- Elo helpers with configurable K-factor
- undo / redo support
- make / unmake style state flow
- low-level attack and pin helpers
- TypeScript-friendly public exports
- no backend, socket, redis, express, or transport code in the published package

---

## Why Rook Zero

Rook Zero exists to provide a focused chess rules layer that is easy to embed into your own project.

Use it when you need:

- a chess rules engine for your backend
- move validation for multiplayer or turn-based systems
- notation parsing and formatting
- position loading and validation
- draw / end-state detection
- rating utilities alongside game result handling

Rook Zero is intentionally not a full chess server. It does not try to handle networking, matchmaking, persistence, or infrastructure concerns. It focuses on the chess domain itself.

---

## Installation

```bash
npm install @yigitcicekci/rook-zero
```

---

## Quick Start

### Basic gameplay

```ts
import { RZero } from '@yigitcicekci/rook-zero';

const rzero = new RZero();

rzero.move('e4');
rzero.move('e7e5');
rzero.move({ from: 'g1', to: 'f3' });

console.log(rzero.fen());
console.log(rzero.moves());
console.log(rzero.history());
```

### Elo calculation

```ts
import { calculateMatchElo, getFideKFactor } from '@yigitcicekci/rook-zero';

const whiteKFactor = getFideKFactor({
  rating: 1820,
  gamesPlayed: 64,
});

const blackKFactor = getFideKFactor({
  rating: 1765,
  gamesPlayed: 48,
});

const ratingUpdate = calculateMatchElo({
  whiteRating: 1820,
  blackRating: 1765,
  result: '1-0',
  whiteKFactor,
  blackKFactor,
  round: true,
});

console.log(ratingUpdate.white.newRating);
console.log(ratingUpdate.black.newRating);
```

---

## When to Use Rook Zero

Rook Zero is a good fit for:

- chess backends
- move validation APIs
- analysis / replay tools
- chess study tools
- tournament systems
- Elo / rating workflows
- custom frontends that need a rules core underneath

It is especially useful when you want a library that is centered on:

- strict validation
- clear rules handling
- notation support
- predictable engine state transitions

---

## Core Concepts

Rook Zero revolves around a single main class:

- `RZero`

With `RZero`, you can:

- create a game state
- load a position
- validate and make moves
- inspect the board
- detect check, mate, and draw states
- inspect history
- undo and redo moves

The package also exposes standalone helpers for:

- FEN validation
- UCI parsing / formatting
- SAN normalization
- PGN tokenizing / formatting
- Elo calculations

---

## API Overview

### Main engine methods

```ts
const rzero = new RZero();

rzero.fen();
rzero.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

rzero.moves();
rzero.moves({ square: 'e2' });

rzero.move('Nf3');
rzero.move('e2e4');
rzero.move({ from: 'e2', to: 'e4' });

rzero.validateMove({ from: 'e2', to: 'e4' });

rzero.undo();
rzero.redo();

rzero.turn();
rzero.pieceAt('e4');

rzero.isCheck();
rzero.isCheckmate();
rzero.isStalemate();
rzero.isDraw();
rzero.isFivefoldRepetition();
rzero.isThreefoldRepetition();
rzero.isInsufficientMaterial();
rzero.isSeventyFiveMoveRule();
rzero.isFiftyMoveRule();
rzero.outcome();

rzero.history();
rzero.pgn();
rzero.loadPgn('1. e4 e5 2. Nf3 Nc6');
```

---

## Creating an Engine

Create a new engine instance like this:

```ts
import { RZero } from '@yigitcicekci/rook-zero';

const rzero = new RZero();
```

Once created, `rzero` starts from the default chess initial position.

You can then:

- make moves
- inspect the game state
- export the current position
- load other positions

---

## Working with Moves

`rzero.move()` accepts multiple input styles.

### 1. SAN move input

Useful for chess notation workflows.

```ts
rzero.move('Nf3');
rzero.move('O-O');
rzero.move('Qh5');
```

### 2. UCI move input

Useful for engine-style or protocol-style workflows.

```ts
rzero.move('e2e4');
rzero.move('e7e8q');
```

### 3. Object move input

Useful for frontend boards and APIs.

```ts
rzero.move({ from: 'e2', to: 'e4' });
rzero.move({ from: 'e7', to: 'e8', promotion: 'q' });
```

### Example

```ts
import { RZero } from '@yigitcicekci/rook-zero';

const rzero = new RZero();

rzero.move('e4');
rzero.move('e7e5');
rzero.move({ from: 'g1', to: 'f3' });

console.log(rzero.fen());
```

---

## Move Generation

Use `rzero.moves()` to get legal moves from the current position.

### All legal moves

```ts
const rzero = new RZero();

const moves = rzero.moves();
console.log(moves);
```

### Legal moves for one square

```ts
const rzero = new RZero();

const movesFromE2 = rzero.moves({ square: 'e2' });
console.log(movesFromE2);
```

This is useful for:

- board UIs
- move highlighting
- legal move checks
- bots and automation
- analysis tools

---

## Validation

A key goal of Rook Zero is explicit validation.

Instead of silently failing, the library is designed to expose validation results that are easier to use in real applications.

### Move validation

Use `rzero.validateMove()` before applying a move.

```ts
const rzero = new RZero();

const result = rzero.validateMove({ from: 'e2', to: 'e4' });

if (!result.ok) {
  console.log(result.reason);
}
```

This is useful when you want to:

- reject invalid API requests
- show precise frontend error messages
- validate user input before mutating state
- debug illegal move submissions

### FEN validation

Use `validateFen(fen)` to validate a FEN string without changing engine state.

```ts
import { validateFen } from '@yigitcicekci/rook-zero';

const result = validateFen('invalid fen here');

if (!result.ok) {
  console.log(result.reason);
}
```

### Loading a FEN with validation awareness

```ts
import { RZero } from '@yigitcicekci/rook-zero';

const rzero = new RZero();

const result = rzero.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');

if (!result.ok) {
  console.log(result.reason);
}
```

---

## Game State and Outcome

Rook Zero includes helpers for understanding the current game status.

### Check / mate / stalemate

```ts
const rzero = new RZero();

console.log(rzero.isCheck());
console.log(rzero.isCheckmate());
console.log(rzero.isStalemate());
```

### Draw detection

```ts
const rzero = new RZero();

console.log(rzero.isDraw());
console.log(rzero.isFivefoldRepetition());
console.log(rzero.isThreefoldRepetition());
console.log(rzero.isInsufficientMaterial());
console.log(rzero.isSeventyFiveMoveRule());
console.log(rzero.isFiftyMoveRule());
```

### Unified outcome

```ts
const rzero = new RZero();

console.log(rzero.outcome());
```

These helpers are useful for:

- ending games correctly
- showing final result screens
- backend match resolution
- replay / study tools
- tournament or ladder systems

---

## History / Undo / Redo

Rook Zero exposes move history and state navigation helpers.

### History

```ts
const rzero = new RZero();

rzero.move('e4');
rzero.move('e5');
rzero.move('Nf3');

console.log(rzero.history());
```

### Undo

```ts
rzero.undo();
```

### Redo

```ts
rzero.redo();
```

This makes it easier to build:

- game review tools
- move back / forward controls
- board analysis screens
- stateful chess services

---

## Board Inspection and Low-Level Helpers

Rook Zero includes low-level helpers for advanced use cases.

### Piece inspection

```ts
const rzero = new RZero();

console.log(rzero.pieceAt('e2'));
console.log(rzero.turn());
```

### Attack and pin helpers

- `isSquareAttacked(square, byColor)`
- `attackersOf(square, byColor)`
- `inCheck()`
- `checkers()`
- `pinnedPieces(color)`
- `legalMovesFrom(square)`
- `kingSquare(color)`
- `perft(depth)`

### Example

```ts
const rzero = new RZero();

console.log(rzero.isSquareAttacked('e4', 'b'));
console.log(rzero.attackersOf('e4', 'b'));
console.log(rzero.pinnedPieces('w'));
console.log(rzero.legalMovesFrom('e2'));
console.log(rzero.kingSquare('w'));
```

These helpers are useful for:

- custom board visualization
- attack maps
- pin detection UIs
- debugging move logic
- perft-style correctness checks

---

## FEN Support

Rook Zero supports working with FEN positions.

### Export current FEN

```ts
const rzero = new RZero();

console.log(rzero.fen());
```

### Load a FEN

```ts
const rzero = new RZero();

rzero.loadFen('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
```

### Default FEN

```ts
import { DEFAULT_FEN } from '@yigitcicekci/rook-zero';

console.log(DEFAULT_FEN);
```

Use FEN support when you need to:

- persist games
- restore board state
- sync engine state with a client
- test arbitrary positions
- build import/export flows

---

## UCI Support

Rook Zero supports UCI parsing and formatting.

### Parse UCI

```ts
import { parseUci } from '@yigitcicekci/rook-zero';

const move = parseUci('e2e4');
console.log(move);
```

### Format UCI

```ts
import { formatUci } from '@yigitcicekci/rook-zero';

const uci = formatUci({ from: 'e2', to: 'e4' });
console.log(uci);
```

### Move with UCI input

```ts
import { RZero } from '@yigitcicekci/rook-zero';

const rzero = new RZero();

rzero.move('e2e4');
rzero.move('e7e5');
```

---

## SAN Support

Rook Zero supports SAN move input and SAN helpers.

### Move using SAN

```ts
import { RZero } from '@yigitcicekci/rook-zero';

const rzero = new RZero();

rzero.move('e4');
rzero.move('e5');
rzero.move('Nf3');
```

### Normalize SAN

```ts
import { normalizeSan } from '@yigitcicekci/rook-zero';

const san = normalizeSan('Nf3');
console.log(san);
```

Use SAN when working with:

- human-readable game notation
- study tools
- move lists
- PGN workflows

---

## PGN Support

Rook Zero includes PGN-related helpers.

### Export PGN

```ts
const rzero = new RZero();

rzero.move('e4');
rzero.move('e5');
rzero.move('Nf3');

console.log(rzero.pgn());
```

### Load basic PGN

```ts
const rzero = new RZero();

rzero.loadPgn('1. e4 e5 2. Nf3 Nc6 3. Bb5');
```

### Tokenize PGN

```ts
import { tokenizePgn } from '@yigitcicekci/rook-zero';

const tokens = tokenizePgn('1. e4 e5 2. Nf3 Nc6');
console.log(tokens);
```

### Format PGN

```ts
import { formatPgn } from '@yigitcicekci/rook-zero';

const pgn = formatPgn({
  moves: ['e4', 'e5', 'Nf3', 'Nc6'],
});

console.log(pgn);
```

PGN support is helpful for:

- importing games
- exporting game records
- replay systems
- study / analysis tools

---

## Elo Rating Utilities

Rook Zero includes Elo helpers so you can calculate rating changes alongside game results.

### calculateExpectedScore

```ts
import { calculateExpectedScore } from '@yigitcicekci/rook-zero';

const expected = calculateExpectedScore(1800, 2000);
console.log(expected);
```

### calculateEloChange

```ts
import { calculateEloChange } from '@yigitcicekci/rook-zero';

const update = calculateEloChange({
  rating: 1800,
  opponentRating: 2000,
  score: 'draw',
  kFactor: 20,
});

console.log(update.expectedScore);
console.log(update.delta);
console.log(update.newRating);
```

### calculateMatchElo

```ts
import { calculateMatchElo } from '@yigitcicekci/rook-zero';

const result = calculateMatchElo({
  whiteRating: 1820,
  blackRating: 1765,
  result: '1-0',
  whiteKFactor: 20,
  blackKFactor: 20,
  round: true,
});

console.log(result.white);
console.log(result.black);
```

### getFideKFactor

```ts
import { getFideKFactor } from '@yigitcicekci/rook-zero';

const kFactor = getFideKFactor({
  rating: 1820,
  gamesPlayed: 64,
});

console.log(kFactor);
```

### roundEloChange

```ts
import { roundEloChange } from '@yigitcicekci/rook-zero';

console.log(roundEloChange(7.6));
```

These helpers are useful for:

- tournament systems
- matchmaking ladders
- ranked play systems
- backend rating updates

---

## Public Exports

### Engine

- `RZero`
- `DEFAULT_FEN`

### Validation / notation helpers

- `validateFen`
- `parseUci`
- `formatUci`
- `normalizeSan`
- `formatPgn`
- `tokenizePgn`

### Elo helpers

- `calculateExpectedScore`
- `calculateEloChange`
- `calculateMatchElo`
- `getFideKFactor`
- `roundEloChange`

### Constants

- `COLORS`
- `PIECE_TYPES`
- `PROMOTION_PIECES`
- `SQUARES`

---

## TypeScript Support

Rook Zero is designed for TypeScript projects and exports both runtime utilities and useful types.

### Example type imports

```ts
import type {
  Color,
  Square,
  MoveInput,
  LegalMove,
  GameOutcome,
  PositionValidationResult,
  MoveValidationResult,
  EloMatchResult,
} from '@yigitcicekci/rook-zero';
```

### Useful exported types

- `ChessResult`
- `Color`
- `EloChange`
- `EloChangeInput`
- `EloExpectedScoreOptions`
- `EloMatchInput`
- `EloMatchResult`
- `EloResult`
- `EloScore`
- `FideKFactorInput`
- `GameOutcome`
- `GameOutcomeKind`
- `HistoryOptions`
- `LegalMove`
- `MoveInput`
- `MoveListOptions`
- `MoveValidationFailureReason`
- `MoveValidationResult`
- `PieceOnSquare`
- `PieceType`
- `PositionValidationFailureReason`
- `PositionValidationResult`
- `PromotionPiece`
- `Square`

---

## Common Usage Recipes

### Validate first, then apply

```ts
import { RZero } from '@yigitcicekci/rook-zero';

const rzero = new RZero();

const validation = rzero.validateMove({ from: 'e2', to: 'e4' });

if (!validation.ok) {
  throw new Error(`Illegal move: ${validation.reason}`);
}

rzero.move({ from: 'e2', to: 'e4' });
```

### Load a saved position

```ts
import { RZero } from '@yigitcicekci/rook-zero';

const rzero = new RZero();

const result = rzero.loadFen('r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3');

if (!result.ok) {
  throw new Error(`Invalid FEN: ${result.reason}`);
}

console.log(rzero.fen());
```

### Detect whether the game is over

```ts
import { RZero } from '@yigitcicekci/rook-zero';

const rzero = new RZero();

if (rzero.isCheckmate() || rzero.isDraw() || rzero.isStalemate()) {
  console.log(rzero.outcome());
}
```

### Use in a backend move endpoint

```ts
import { RZero } from '@yigitcicekci/rook-zero';

type ApplyMoveInput = {
  fen: string;
  move: string;
};

export function applyMove(input: ApplyMoveInput) {
  const rzero = new RZero();

  const loadResult = rzero.loadFen(input.fen);
  if (!loadResult.ok) {
    return {
      ok: false,
      error: loadResult.reason,
    };
  }

  const validation = rzero.validateMove(input.move);
  if (!validation.ok) {
    return {
      ok: false,
      error: validation.reason,
    };
  }

  const moveResult = rzero.move(input.move);

  return {
    ok: true,
    move: moveResult,
    fen: rzero.fen(),
    history: rzero.history(),
    outcome: rzero.outcome(),
  };
}
```

### Update Elo after a finished match

```ts
import { calculateMatchElo, getFideKFactor } from '@yigitcicekci/rook-zero';

const whiteRating = 1820;
const blackRating = 1765;

const whiteKFactor = getFideKFactor({
  rating: whiteRating,
  gamesPlayed: 64,
});

const blackKFactor = getFideKFactor({
  rating: blackRating,
  gamesPlayed: 48,
});

const ratingUpdate = calculateMatchElo({
  whiteRating,
  blackRating,
  result: '1-0',
  whiteKFactor,
  blackKFactor,
  round: true,
});

console.log(ratingUpdate.white.newRating);
console.log(ratingUpdate.black.newRating);
```

---

## Performance Direction

Rook Zero uses a mutable make / unmake model with a compact internal board representation.

The goal is to keep the public API ergonomic while still supporting efficient move application, validation, and inspection. The package is focused on the chess domain rather than application-specific infrastructure.

---

## Development

```bash
npm run build
npm test
npm pack
```

---

## Limitations

Rook Zero focuses on chess rules and supporting utilities.

It does not aim to be:

- a networking layer
- a websocket server
- a matchmaking system
- a persistence layer
- a chess evaluation engine
- a search engine / bot AI
- a full backend framework

If your project needs those, Rook Zero is intended to sit underneath them as the chess rules core.

---

## License

MIT
