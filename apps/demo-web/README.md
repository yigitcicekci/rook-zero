# Rook Zero Demo App

This is a static, frontend-only demo application showcasing the capabilities of the `@yigitcicekci/rook-zero` chess engine and rules library.

## Features Showcased
- **Interactive Playground**: A playable chessboard synced with `RkEngine` state.
- **Move Validation**: Input SAN or UCI moves and receive strict feedback.
- **State Detection**: Real-time detection of Checkmate, Stalemate, Draws, and Checks.
- **Notation Output**: View real-time FEN and PGN generation.
- **History & Undo/Redo**: Visual move history with full undo/redo capabilities.

## Architecture
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Dependencies**: React, Lucide React, Framer Motion
- **Library Integration**: Uses local repository build of `rook-zero`.

## Commands

From the monorepo root:

\`\`\`bash
# Run development server
npm run demo:dev

# Build for production
npm run demo:build
\`\`\`

## Deployment
This app can be statically deployed to Vercel, Netlify, or GitHub Pages. The build output is entirely static HTML/JS/CSS with no backend requirements.
