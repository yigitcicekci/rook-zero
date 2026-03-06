# Rook Zero

Rook Zero is a reusable TypeScript chess engine package focused on validated move execution, FEN helpers, and typed board state utilities.

## Installation

```bash
npm install rook-zero
```

## Minimal Usage

```ts
import { ChessEngine, findPiece } from 'rook-zero';

const engine = new ChessEngine();
const from = { row: 6, col: 4 };
const piece = findPiece(engine.getBoard(), from);

if (piece) {
  engine.makeMove({
    from,
    to: { row: 4, col: 4 },
    piece,
    isCapture: false
  });
}

console.log(engine.getFEN());
```

## Exported API

- `ChessEngine`
- `DEFAULT_FEN`
- `fen.parse`, `fen.validate`, `fen.generate`
- `parseFEN`, `validateFEN`, `generateFEN`
- `findPiece`, `underAttack`, `hasObstacle`
- `Board`, `Move`, `MoveValidationResult`, `Piece`, `PieceColor`, `PieceType`, `Position`, `GameState`, `FlaggedMove`, `GameOverResult`

## Features

- Full move validation for all standard chess pieces
- Castling, en passant, promotion, check, checkmate, and stalemate handling
- FEN parsing and generation helpers
- Typed board, move, and game state models
- Declaration output for TypeScript consumers

## Development

Build the library:

```bash
npm run build
```

Run the engine test suite:

```bash
npm test
```

Create the publish artifact locally:

```bash
npm pack
```

## Example Server

The published `rook-zero` package does not include the multiplayer backend.

The previous Express, Socket.IO, Redis, and integration-test setup now lives under `examples/multiplayer-server/` as a demo application built on top of the engine.
