# Contributing to Rook Zero

Thanks for your interest in contributing to Rook Zero. This document explains how to get started.

---

## Getting Started

1. Fork the repository
2. Clone your fork:

```bash
git clone https://github.com/<your-username>/rook-zero.git
cd rook-zero
```

3. Install dependencies:

```bash
npm install
```

4. Build the project:

```bash
npm run build
```

5. Run the tests:

```bash
npm test
```

---

## Project Structure

```
src/
  core/         # RZero and board logic
  notation/     # FEN, SAN, UCI, PGN helpers
  rating/       # Elo calculation utilities
  types/        # TypeScript types and interfaces
  utils/        # Square maps and constants
  index.ts      # Public exports
```

---

## Making Changes

1. Create a branch from `main`:

```bash
git checkout -b your-branch-name
```

2. Make your changes
3. Make sure all tests pass:

```bash
npm test
```

4. Commit your changes with a clear message:

```bash
git commit -m "Add support for ..."
```

5. Push to your fork:

```bash
git push origin your-branch-name
```

6. Open a Pull Request against the `main` branch

---

## Code Guidelines

- Write in TypeScript
- Follow the existing code style
- Keep changes focused — one feature or fix per PR
- Add tests for new functionality
- Do not introduce runtime dependencies unless absolutely necessary
- Do not add backend, networking, or infrastructure code

---

## Tests

All tests are in the `__tests__/` directories alongside the source files. Run them with:

```bash
npm test
```

If you add new public API behavior, add corresponding test cases.

---

## What to Contribute

Good areas to contribute:

- Bug fixes
- Test coverage improvements
- Documentation improvements
- Performance improvements to move generation or validation
- New notation or helper utilities that fit the chess rules domain

---

## What Not to Contribute

Rook Zero is intentionally scoped to chess rules and supporting utilities. The following are out of scope:

- Networking or transport layers
- WebSocket / HTTP server code
- Database or persistence integrations
- Chess AI / evaluation / search engines
- UI components or frontend code

---

## Reporting Issues

If you find a bug or have a suggestion, open an issue at:

https://github.com/yigitcicekci/rook-zero/issues

Include:

- A clear description of the problem or suggestion
- Steps to reproduce (if applicable)
- Expected vs actual behavior
- Relevant FEN or move sequences (if applicable)

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
