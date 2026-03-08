import { formatPgn, tokenizePgn } from '../notation/pgn';
import { normalizeSan, sanPieceLetter } from '../notation/san';
import { formatUci, parseUci } from '../notation/uci';
import { fileChar, fileOf, forEachBoardSquare, indexToSquare, isValidSquare, rankOf, sameFile, sameRank, squareColor, squareToIndex } from '../utils/squares';
import type {
  Color,
  GameOutcome,
  GameOutcomeKind,
  HistoryOptions,
  LegalMove,
  MoveInput,
  MoveListOptions,
  MoveValidationFailureReason,
  MoveValidationResult,
  PieceOnSquare,
  PieceType,
  PositionValidationFailureReason,
  PositionValidationResult,
  PromotionPiece,
  Square
} from '../types';

type InternalPiece = 'P' | 'N' | 'B' | 'R' | 'Q' | 'K' | 'p' | 'n' | 'b' | 'r' | 'q' | 'k';

interface ParsedState {
  board: Array<InternalPiece | null>;
  turn: Color;
  castling: number;
  epSquare: number | null;
  halfmoveClock: number;
  fullmoveNumber: number;
}

interface InternalMove {
  from: number;
  to: number;
  piece: PieceType;
  color: Color;
  captured?: PieceType;
  promotion?: PromotionPiece;
  isCapture: boolean;
  isCastle: boolean;
  isKingsideCastle: boolean;
  isQueensideCastle: boolean;
  isEnPassant: boolean;
  isPromotion: boolean;
}

interface UndoState {
  move: InternalMove;
  movedPiece: InternalPiece;
  capturedPiece: InternalPiece | null;
  captureSquare: number | null;
  rookFrom: number | null;
  rookTo: number | null;
  previousCastling: number;
  previousEpSquare: number | null;
  previousHalfmoveClock: number;
  previousFullmoveNumber: number;
  previousTurn: Color;
  previousKings: Record<Color, number>;
  legalMove?: LegalMove;
}

const STANDARD_START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const CASTLE_WHITE_K = 1;
const CASTLE_WHITE_Q = 2;
const CASTLE_BLACK_K = 4;
const CASTLE_BLACK_Q = 8;
const KNIGHT_OFFSETS = [-33, -31, -18, -14, 14, 18, 31, 33];
const BISHOP_OFFSETS = [-17, -15, 15, 17];
const ROOK_OFFSETS = [-16, -1, 1, 16];
const QUEEN_OFFSETS = [...BISHOP_OFFSETS, ...ROOK_OFFSETS];
const KING_OFFSETS = QUEEN_OFFSETS;

function createEmptyBoard(): Array<InternalPiece | null> {
  return Array<InternalPiece | null>(128).fill(null);
}

function isBoardIndex(index: number): boolean {
  return (index & 0x88) === 0;
}

function opposite(color: Color): Color {
  return color === 'w' ? 'b' : 'w';
}

function pieceColor(piece: InternalPiece): Color {
  return piece === piece.toUpperCase() ? 'w' : 'b';
}

function pieceType(piece: InternalPiece): PieceType {
  return piece.toLowerCase() as PieceType;
}

function toInternalPiece(color: Color, type: PieceType): InternalPiece {
  const raw = color === 'w' ? type.toUpperCase() : type;
  return raw as InternalPiece;
}

function castlingToString(castling: number): string {
  let result = '';
  if (castling & CASTLE_WHITE_K) {
    result += 'K';
  }
  if (castling & CASTLE_WHITE_Q) {
    result += 'Q';
  }
  if (castling & CASTLE_BLACK_K) {
    result += 'k';
  }
  if (castling & CASTLE_BLACK_Q) {
    result += 'q';
  }
  return result || '-';
}

function castlingFromString(value: string): number {
  let result = 0;
  if (value.includes('K')) {
    result |= CASTLE_WHITE_K;
  }
  if (value.includes('Q')) {
    result |= CASTLE_WHITE_Q;
  }
  if (value.includes('k')) {
    result |= CASTLE_BLACK_K;
  }
  if (value.includes('q')) {
    result |= CASTLE_BLACK_Q;
  }
  return result;
}

function cloneKings(kings: Record<Color, number>): Record<Color, number> {
  return { w: kings.w, b: kings.b };
}

function createDefaultOutcome(kind: GameOutcomeKind, winner?: Color): GameOutcome {
  return { kind, winner, draw: winner == null && kind !== 'ongoing' };
}

function isValidPromotionPiece(value: PromotionPiece | undefined): boolean {
  return value == null || ['q', 'r', 'b', 'n'].includes(value);
}

export class RZero {
  private board = createEmptyBoard();
  private turnColor: Color = 'w';
  private castling = CASTLE_WHITE_K | CASTLE_WHITE_Q | CASTLE_BLACK_K | CASTLE_BLACK_Q;
  private epSquare: number | null = null;
  private halfmoveClock = 0;
  private fullmoveNumber = 1;
  private kings: Record<Color, number> = { w: squareToIndex('e1'), b: squareToIndex('e8') };
  private historyStack: UndoState[] = [];
  private redoStack: UndoState[] = [];
  private repetitionCounts = new Map<string, number>();
  private initialFen = STANDARD_START_FEN;

  public static readonly DEFAULT_FEN = STANDARD_START_FEN;

  constructor(fen: string = STANDARD_START_FEN) {
    const result = this.loadFen(fen);
    if (!result.ok) {
      this.loadFen(STANDARD_START_FEN);
    }
  }

  public static validateFen(fen: string): PositionValidationResult {
    const parsed = RZero.parseFen(fen);
    if (!parsed.ok) {
      return parsed;
    }
    return RZero.fromState(parsed.state).validateCurrentPosition();
  }

  public fen(): string {
    return this.generateFen();
  }

  public loadFen(fen: string): PositionValidationResult {
    const parsed = RZero.parseFen(fen);
    if (!parsed.ok) {
      return parsed;
    }

    const validator = RZero.fromState(parsed.state);
    const validation = validator.validateCurrentPosition();
    if (!validation.ok) {
      return validation;
    }

    this.applyState(parsed.state, true);
    this.initialFen = this.generateFen();
    this.clearHistory();
    this.repetitionCounts.set(this.repetitionKey(), 1);
    return { ok: true };
  }

  public validatePosition(fen: string = this.fen()): PositionValidationResult {
    return RZero.validateFen(fen);
  }

  public reset(): void {
    this.loadFen(STANDARD_START_FEN);
  }

  public turn(): Color {
    return this.turnColor;
  }

  public pieceAt(square: Square): PieceOnSquare | null {
    const index = squareToIndex(square);
    const piece = this.board[index];
    if (!piece) {
      return null;
    }
    return {
      square,
      type: pieceType(piece),
      color: pieceColor(piece)
    };
  }

  public moves(options: MoveListOptions = {}): string[] | LegalMove[] {
    const allMoves = this.generateLegalMoves();
    const legalMoves = options.square
      ? allMoves.filter(move => move.from === squareToIndex(options.square!))
      : allMoves;
    if (options.verbose) {
      return legalMoves.map(move => this.toLegalMove(move, allMoves));
    }
    return legalMoves.map(move => this.sanForMove(move, allMoves));
  }

  public legalMovesFrom(square: Square): LegalMove[] {
    const allMoves = this.generateLegalMoves();
    const from = squareToIndex(square);
    return allMoves
      .filter(move => move.from === from)
      .map(move => this.toLegalMove(move, allMoves));
  }

  public history(options: HistoryOptions = {}): string[] | LegalMove[] {
    if (options.verbose) {
      return this.historyStack.map(entry => entry.legalMove!).slice();
    }
    return this.historyStack.map(entry => entry.legalMove!.san);
  }

  public move(input: string | MoveInput): LegalMove | null {
    const resolved = this.resolveMove(input);
    if (!resolved.ok) {
      return null;
    }
    return this.commitMove(resolved.move, resolved.legalMove);
  }

  public validateMove(input: string | MoveInput): MoveValidationResult {
    const resolved = this.resolveMove(input);
    if (!resolved.ok) {
      return { ok: false, reason: resolved.reason };
    }
    return { ok: true, move: resolved.legalMove, san: resolved.legalMove.san, fen: this.previewFen(resolved.move) };
  }

  public undo(): LegalMove | null {
    const entry = this.historyStack.pop();
    if (!entry) {
      return null;
    }

    this.unapplyMove(entry, true);
    this.redoStack.push(entry);
    return entry.legalMove ?? null;
  }

  public redo(): LegalMove | null {
    const entry = this.redoStack.pop();
    if (!entry) {
      return null;
    }

    const legalMove = this.commitMove(entry.move);
    return legalMove;
  }

  public isCheck(): boolean {
    return this.inCheck();
  }

  public inCheck(): boolean {
    return this.isKingAttacked(this.turnColor);
  }

  public isCheckmate(): boolean {
    return this.inCheck() && this.generateLegalMoves().length === 0;
  }

  public isStalemate(): boolean {
    return !this.inCheck() && this.generateLegalMoves().length === 0;
  }

  public isDraw(): boolean {
    return this.outcome().draw;
  }

  public isThreefoldRepetition(): boolean {
    return (this.repetitionCounts.get(this.repetitionKey()) ?? 0) >= 3;
  }

  public isFivefoldRepetition(): boolean {
    return (this.repetitionCounts.get(this.repetitionKey()) ?? 0) >= 5;
  }

  public isInsufficientMaterial(): boolean {
    const minors: PieceType[] = [];
    const bishops: Square[] = [];
    let knights = 0;

    forEachBoardSquare(index => {
      const piece = this.board[index];
      if (!piece) {
        return;
      }
      const type = pieceType(piece);
      if (type === 'k') {
        return;
      }
      if (type === 'p' || type === 'r' || type === 'q') {
        minors.push(type);
        return;
      }
      if (type === 'b') {
        bishops.push(indexToSquare(index));
      } else if (type === 'n') {
        knights += 1;
      }
      minors.push(type);
    });

    if (minors.length === 0) {
      return true;
    }

    if (minors.some(type => type === 'p' || type === 'r' || type === 'q')) {
      return false;
    }

    if (minors.length === 1) {
      return true;
    }

    if (bishops.length === minors.length) {
      return new Set(bishops.map(square => squareColor(square))).size === 1;
    }

    if (knights === minors.length) {
      return minors.length <= 2;
    }

    return false;
  }

  public isFiftyMoveRule(): boolean {
    return this.halfmoveClock >= 100;
  }

  public isSeventyFiveMoveRule(): boolean {
    return this.halfmoveClock >= 150;
  }

  public outcome(): GameOutcome {
    const legalMoves = this.generateLegalMoves();
    if (legalMoves.length === 0) {
      if (this.inCheck()) {
        return createDefaultOutcome('checkmate', opposite(this.turnColor));
      }
      return createDefaultOutcome('stalemate');
    }
    if (this.isFivefoldRepetition()) {
      return createDefaultOutcome('fivefold-repetition');
    }
    if (this.isThreefoldRepetition()) {
      return createDefaultOutcome('threefold-repetition');
    }
    if (this.isSeventyFiveMoveRule()) {
      return createDefaultOutcome('seventy-five-move-rule');
    }
    if (this.isFiftyMoveRule()) {
      return createDefaultOutcome('fifty-move-rule');
    }
    if (this.isInsufficientMaterial()) {
      return createDefaultOutcome('insufficient-material');
    }
    return createDefaultOutcome('ongoing');
  }

  public isSquareAttacked(square: Square, byColor: Color): boolean {
    return this.attackersOf(square, byColor).length > 0;
  }

  public attackersOf(square: Square, byColor: Color): Square[] {
    return this.attackersOfIndex(squareToIndex(square), byColor).map(indexToSquare);
  }

  public checkers(): Square[] {
    return this.attackersOf(indexToSquare(this.kings[this.turnColor]), opposite(this.turnColor));
  }

  public pinnedPieces(color: Color): Square[] {
    const pinned: Square[] = [];
    forEachBoardSquare(index => {
      const piece = this.board[index];
      if (!piece || pieceColor(piece) !== color || pieceType(piece) === 'k') {
        return;
      }
      const original = this.board[index];
      this.board[index] = null;
      const isPinned = this.isKingAttacked(color);
      this.board[index] = original;
      if (isPinned) {
        pinned.push(indexToSquare(index));
      }
    });
    return pinned;
  }

  public kingSquare(color: Color): Square | null {
    return this.kings[color] >= 0 ? indexToSquare(this.kings[color]) : null;
  }

  public pgn(): string {
    const result = this.resultToken();
    return formatPgn(this.history({ verbose: false }) as string[], this.initialFen, STANDARD_START_FEN, result);
  }

  public loadPgn(input: string): boolean {
    const fenTag = input.match(/\[FEN "([^"]+)"\]/);
    const setupFen = fenTag?.[1] ?? STANDARD_START_FEN;
    const loadResult = this.loadFen(setupFen);
    if (!loadResult.ok) {
      return false;
    }

    for (const token of tokenizePgn(input)) {
      if (!this.move(token)) {
        return false;
      }
    }

    return true;
  }

  public perft(depth: number): number {
    if (depth <= 0) {
      return 1;
    }

    const moves = this.generateLegalMoves();
    if (depth === 1) {
      return moves.length;
    }

    let total = 0;
    for (const move of moves) {
      const undo = this.applyMove(move, false);
      total += this.perft(depth - 1);
      this.unapplyMove(undo, false);
    }
    return total;
  }

  private static parseFen(fen: string): { ok: true; state: ParsedState } | { ok: false; reason: PositionValidationFailureReason } {
    const parts = fen.trim().split(/\s+/);
    if (parts.length !== 6) {
      return { ok: false, reason: 'invalid-fen' };
    }

    const [placement, activeColor, castling, ep, halfmove, fullmove] = parts;
    const rows = placement.split('/');
    if (rows.length !== 8) {
      return { ok: false, reason: 'invalid-fen' };
    }

    if (activeColor !== 'w' && activeColor !== 'b') {
      return { ok: false, reason: 'invalid-side-to-move' };
    }

    if (!/^(-|[KQkq]+)$/.test(castling)) {
      return { ok: false, reason: 'invalid-castling-rights' };
    }

    if (!/^(-|[a-h][36])$/.test(ep)) {
      return { ok: false, reason: 'invalid-en-passant-square' };
    }

    const halfmoveClock = Number(halfmove);
    const fullmoveNumber = Number(fullmove);
    if (!Number.isInteger(halfmoveClock) || !Number.isInteger(fullmoveNumber) || halfmoveClock < 0 || fullmoveNumber <= 0) {
      return { ok: false, reason: 'invalid-fen' };
    }

    const board = createEmptyBoard();
    const counts: Record<Color, Record<PieceType, number>> = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 }
    };

    for (let rank = 0; rank < 8; rank++) {
      let file = 0;
      for (const char of rows[rank]) {
        if (/\d/.test(char)) {
          file += Number(char);
          continue;
        }
        if (!/[prnbqkPRNBQK]/.test(char) || file > 7) {
          return { ok: false, reason: 'invalid-fen' };
        }
        const index = rank * 16 + file;
        const piece = char as InternalPiece;
        board[index] = piece;
        counts[pieceColor(piece)][pieceType(piece)] += 1;
        if (pieceType(piece) === 'p' && (rank === 0 || rank === 7)) {
          return { ok: false, reason: 'illegal-pawn-placement' };
        }
        file += 1;
      }
      if (file !== 8) {
        return { ok: false, reason: 'invalid-fen' };
      }
    }

    if (counts.w.k + counts.b.k < 2) {
      return { ok: false, reason: 'missing-king' };
    }
    if (counts.w.k > 1 || counts.b.k > 1) {
      return { ok: false, reason: 'too-many-kings' };
    }

    let totalPieces = 0;
    for (const color of ['w', 'b'] as const) {
      const pieceCount = Object.values(counts[color]).reduce((sum, value) => sum + value, 0);
      totalPieces += pieceCount;
      if (counts[color].p > 8) {
        return { ok: false, reason: 'too-many-pieces' };
      }
      if (pieceCount > 16) {
        return { ok: false, reason: 'too-many-pieces' };
      }
    }
    if (totalPieces > 32) {
      return { ok: false, reason: 'too-many-pieces' };
    }

    return {
      ok: true,
      state: {
        board,
        turn: activeColor,
        castling: castlingFromString(castling),
        epSquare: ep === '-' ? null : squareToIndex(ep as Square),
        halfmoveClock,
        fullmoveNumber
      }
    };
  }

  private static fromState(state: ParsedState): RZero {
    const chess = Object.create(RZero.prototype) as RZero;
    chess.board = createEmptyBoard();
    chess.turnColor = state.turn;
    chess.castling = state.castling;
    chess.epSquare = state.epSquare;
    chess.halfmoveClock = state.halfmoveClock;
    chess.fullmoveNumber = state.fullmoveNumber;
    chess.kings = { w: -1, b: -1 };
    chess.historyStack = [];
    chess.redoStack = [];
    chess.repetitionCounts = new Map<string, number>();
    chess.initialFen = STANDARD_START_FEN;
    chess.applyState(state, false);
    return chess;
  }

  private applyState(state: ParsedState, preserveCounts: boolean): void {
    this.board = state.board.slice();
    this.turnColor = state.turn;
    this.castling = state.castling;
    this.epSquare = state.epSquare;
    this.halfmoveClock = state.halfmoveClock;
    this.fullmoveNumber = state.fullmoveNumber;
    this.kings = { w: -1, b: -1 };
    forEachBoardSquare(index => {
      const piece = this.board[index];
      if (piece && pieceType(piece) === 'k') {
        this.kings[pieceColor(piece)] = index;
      }
    });
    if (!preserveCounts) {
      this.repetitionCounts.clear();
    }
  }

  private clearHistory(): void {
    this.historyStack.length = 0;
    this.redoStack.length = 0;
  }

  private validateCurrentPosition(): PositionValidationResult {
    if (this.kings.w < 0 || this.kings.b < 0) {
      return { ok: false, reason: 'missing-king' };
    }

    if ((this.castling & CASTLE_WHITE_K) && (this.board[squareToIndex('e1')] !== 'K' || this.board[squareToIndex('h1')] !== 'R')) {
      return { ok: false, reason: 'invalid-castling-rights' };
    }
    if ((this.castling & CASTLE_WHITE_Q) && (this.board[squareToIndex('e1')] !== 'K' || this.board[squareToIndex('a1')] !== 'R')) {
      return { ok: false, reason: 'invalid-castling-rights' };
    }
    if ((this.castling & CASTLE_BLACK_K) && (this.board[squareToIndex('e8')] !== 'k' || this.board[squareToIndex('h8')] !== 'r')) {
      return { ok: false, reason: 'invalid-castling-rights' };
    }
    if ((this.castling & CASTLE_BLACK_Q) && (this.board[squareToIndex('e8')] !== 'k' || this.board[squareToIndex('a8')] !== 'r')) {
      return { ok: false, reason: 'invalid-castling-rights' };
    }

    if (this.epSquare != null) {
      const rank = rankOf(this.epSquare);
      if (!([3, 6] as number[]).includes(rank)) {
        return { ok: false, reason: 'invalid-en-passant-square' };
      }

      if (rank === 3) {
        if (this.board[this.epSquare - 16] !== 'P' || this.turnColor !== 'b') {
          return { ok: false, reason: 'invalid-en-passant-square' };
        }
      } else {
        if (this.board[this.epSquare + 16] !== 'p' || this.turnColor !== 'w') {
          return { ok: false, reason: 'invalid-en-passant-square' };
        }
      }
    }

    const activeAttacked = this.isKingAttacked(this.turnColor);
    const inactiveAttacked = this.isKingAttacked(opposite(this.turnColor), this.turnColor);
    if (inactiveAttacked) {
      return { ok: false, reason: 'illegal-check-state' };
    }
    if (activeAttacked && this.attackersOfIndex(this.kings[this.turnColor], opposite(this.turnColor)).length === 0) {
      return { ok: false, reason: 'illegal-check-state' };
    }

    return { ok: true };
  }

  private isTerminalPosition(legalMoves: InternalMove[]): boolean {
    return (
      legalMoves.length === 0 ||
      this.isFivefoldRepetition() ||
      this.isSeventyFiveMoveRule() ||
      this.isInsufficientMaterial()
    );
  }

  private resolveMove(input: string | MoveInput): { ok: true; move: InternalMove; legalMove: LegalMove } | { ok: false; reason: MoveValidationFailureReason } {
    if (typeof input === 'string') {
      return this.resolveStringMove(input);
    }

    return this.resolveObjectMove(input);
  }

  private resolveStringMove(input: string): { ok: true; move: InternalMove; legalMove: LegalMove } | { ok: false; reason: MoveValidationFailureReason } {
    const normalized = input.trim();
    const uciMove = parseUci(normalized);
    const legalMoves = this.generateLegalMoves();
    if (this.isTerminalPosition(legalMoves)) {
      return { ok: false, reason: 'game-over' };
    }

    if (uciMove) {
      return this.resolveObjectMove(uciMove, legalMoves);
    }

    for (const move of legalMoves) {
      const legalMove = this.toLegalMove(move, legalMoves);
      if (normalizeSan(legalMove.san) === normalizeSan(normalized)) {
        return { ok: true, move, legalMove };
      }
    }

    return { ok: false, reason: 'invalid-format' };
  }

  private resolveObjectMove(
    input: MoveInput,
    legalMoves: InternalMove[] = this.generateLegalMoves()
  ): { ok: true; move: InternalMove; legalMove: LegalMove } | { ok: false; reason: MoveValidationFailureReason } {
    if (this.isTerminalPosition(legalMoves)) {
      return { ok: false, reason: 'game-over' };
    }

    if (!isValidSquare(input.from)) {
      return { ok: false, reason: 'invalid-source-square' };
    }
    if (!isValidSquare(input.to)) {
      return { ok: false, reason: 'invalid-target-square' };
    }
    if (!isValidPromotionPiece(input.promotion)) {
      return { ok: false, reason: 'illegal-promotion' };
    }

    const from = squareToIndex(input.from);
    const to = squareToIndex(input.to);
    const pieceAtFrom = this.board[from];

    if (!pieceAtFrom) {
      return { ok: false, reason: 'no-piece' };
    }
    if (pieceColor(pieceAtFrom) !== this.turnColor) {
      return { ok: false, reason: 'wrong-turn' };
    }

    const match = legalMoves.find(move =>
      move.from === from &&
      move.to === to &&
      move.promotion === input.promotion
    );
    if (!match) {
      return { ok: false, reason: this.diagnoseMoveFailure(from, to, input.promotion) };
    }

    return { ok: true, move: match, legalMove: this.toLegalMove(match, legalMoves) };
  }

  private diagnoseMoveFailure(from: number, to: number, promotion?: PromotionPiece): MoveValidationFailureReason {
    const pieceAtFrom = this.board[from];
    if (!pieceAtFrom) {
      return 'no-piece';
    }

    const type = pieceType(pieceAtFrom);
    const color = pieceColor(pieceAtFrom);
    const target = this.board[to];
    if (promotion && type !== 'p') {
      return 'illegal-promotion';
    }
    if (target && pieceColor(target) === color) {
      return 'illegal-piece-move';
    }

    if (type === 'p') {
      const direction = color === 'w' ? -16 : 16;
      const startRank = color === 'w' ? 2 : 7;
      const promotionRank = color === 'w' ? 8 : 1;
      const destinationRank = rankOf(to);
      const fileDelta = Math.abs(fileOf(from) - fileOf(to));
      const distance = to - from;

      if (promotion && destinationRank !== promotionRank) {
        return 'illegal-promotion';
      }

      if (distance === direction && !target) {
        if (destinationRank === promotionRank && !promotion) {
          return 'illegal-promotion';
        }
        return 'king-in-check';
      }

      if (distance === direction * 2 && rankOf(from) === startRank) {
        if (target || this.board[from + direction]) {
          return 'path-blocked';
        }
        return 'king-in-check';
      }

      if (fileDelta === 1 && (distance === direction - 1 || distance === direction + 1)) {
        if (target) {
          if (destinationRank === promotionRank && !promotion) {
            return 'illegal-promotion';
          }
          return 'king-in-check';
        }
        if (this.epSquare === to) {
          return 'king-in-check';
        }
        return 'illegal-en-passant';
      }

      return 'illegal-piece-move';
    }

    if (type === 'n') {
      if (!KNIGHT_OFFSETS.includes(to - from)) {
        return 'illegal-piece-move';
      }
      return 'king-in-check';
    }

    if (type === 'k') {
      const delta = to - from;
      if (delta === 2 || delta === -2) {
        return this.validateCastling(from, to, color) ?? 'king-in-check';
      }
      if (!KING_OFFSETS.includes(delta)) {
        return 'illegal-piece-move';
      }
      return 'king-in-check';
    }

    const offsets = type === 'b' ? BISHOP_OFFSETS : type === 'r' ? ROOK_OFFSETS : QUEEN_OFFSETS;
    const step = offsets.find(offset => this.rayReaches(from, to, offset));
    if (!step) {
      return 'illegal-piece-move';
    }
    if (this.pathBlocked(from, to, step)) {
      return 'path-blocked';
    }
    return 'king-in-check';
  }

  private validateCastling(from: number, to: number, color: Color): MoveValidationFailureReason | null {
    const isKingside = to > from;
    const rights = color === 'w'
      ? (isKingside ? CASTLE_WHITE_K : CASTLE_WHITE_Q)
      : (isKingside ? CASTLE_BLACK_K : CASTLE_BLACK_Q);

    if ((this.castling & rights) === 0) {
      return 'illegal-castling';
    }

    const rookSquare = color === 'w'
      ? squareToIndex(isKingside ? 'h1' : 'a1')
      : squareToIndex(isKingside ? 'h8' : 'a8');
    const rook = this.board[rookSquare];
    if (!rook || pieceType(rook) !== 'r' || pieceColor(rook) !== color) {
      return 'illegal-castling';
    }

    const step = isKingside ? 1 : -1;
    for (let square = from + step; square !== rookSquare; square += step) {
      if (this.board[square]) {
        return 'path-blocked';
      }
    }

    if (this.isKingAttacked(color)) {
      return 'illegal-castling';
    }

    for (let square = from + step; square !== to + step; square += step) {
      if (this.isSquareAttackedByIndex(square, opposite(color))) {
        return 'illegal-castling';
      }
    }

    return null;
  }

  private generateLegalMoves(filterFrom: number | null = null): InternalMove[] {
    const legal: InternalMove[] = [];
    const pseudo = this.generatePseudoMoves(filterFrom);
    for (const move of pseudo) {
      const undo = this.applyMove(move, false);
      const kingSafe = !this.isKingAttacked(opposite(this.turnColor));
      this.unapplyMove(undo, false);
      if (kingSafe) {
        legal.push(move);
      }
    }
    return legal;
  }

  private generatePseudoMoves(filterFrom: number | null = null): InternalMove[] {
    const moves: InternalMove[] = [];

    forEachBoardSquare(from => {
      if (filterFrom != null && from !== filterFrom) {
        return;
      }
      const piece = this.board[from];
      if (!piece || pieceColor(piece) !== this.turnColor) {
        return;
      }

      switch (pieceType(piece)) {
        case 'p':
          this.generatePawnMoves(from, moves);
          break;
        case 'n':
          this.generateLeaperMoves(from, KNIGHT_OFFSETS, moves);
          break;
        case 'b':
          this.generateSliderMoves(from, BISHOP_OFFSETS, moves);
          break;
        case 'r':
          this.generateSliderMoves(from, ROOK_OFFSETS, moves);
          break;
        case 'q':
          this.generateSliderMoves(from, QUEEN_OFFSETS, moves);
          break;
        case 'k':
          this.generateLeaperMoves(from, KING_OFFSETS, moves);
          this.generateCastlingMoves(from, moves);
          break;
      }
    });

    return moves;
  }

  private generatePawnMoves(from: number, moves: InternalMove[]): void {
    const color = this.turnColor;
    const direction = color === 'w' ? -16 : 16;
    const startRank = color === 'w' ? 2 : 7;
    const promotionRank = color === 'w' ? 8 : 1;
    const oneForward = from + direction;

    if (isBoardIndex(oneForward) && !this.board[oneForward]) {
      if (rankOf(oneForward) === promotionRank) {
        for (const promotion of ['q', 'r', 'b', 'n'] as PromotionPiece[]) {
          moves.push(this.createInternalMove(from, oneForward, { promotion }));
        }
      } else {
        moves.push(this.createInternalMove(from, oneForward));
        const twoForward = oneForward + direction;
        if (rankOf(from) === startRank && isBoardIndex(twoForward) && !this.board[twoForward]) {
          moves.push(this.createInternalMove(from, twoForward));
        }
      }
    }

    for (const captureOffset of [direction - 1, direction + 1]) {
      const to = from + captureOffset;
      if (!isBoardIndex(to)) {
        continue;
      }
      const target = this.board[to];
      if (target && pieceColor(target) !== color) {
        if (rankOf(to) === promotionRank) {
          for (const promotion of ['q', 'r', 'b', 'n'] as PromotionPiece[]) {
            moves.push(this.createInternalMove(from, to, { promotion, captured: pieceType(target) }));
          }
        } else {
          moves.push(this.createInternalMove(from, to, { captured: pieceType(target) }));
        }
      } else if (this.epSquare === to) {
        const captureSquare = to + (color === 'w' ? 16 : -16);
        const capturedPiece = this.board[captureSquare];
        if (capturedPiece && pieceType(capturedPiece) === 'p' && pieceColor(capturedPiece) !== color) {
          moves.push(this.createInternalMove(from, to, { captured: 'p', enPassant: true }));
        }
      }
    }
  }

  private generateLeaperMoves(from: number, offsets: number[], moves: InternalMove[]): void {
    for (const offset of offsets) {
      const to = from + offset;
      if (!isBoardIndex(to)) {
        continue;
      }
      const target = this.board[to];
      if (target && pieceColor(target) === this.turnColor) {
        continue;
      }
      moves.push(this.createInternalMove(from, to, target ? { captured: pieceType(target) } : undefined));
    }
  }

  private generateSliderMoves(from: number, offsets: number[], moves: InternalMove[]): void {
    for (const offset of offsets) {
      let to = from + offset;
      while (isBoardIndex(to)) {
        const target = this.board[to];
        if (target) {
          if (pieceColor(target) !== this.turnColor) {
            moves.push(this.createInternalMove(from, to, { captured: pieceType(target) }));
          }
          break;
        }
        moves.push(this.createInternalMove(from, to));
        to += offset;
      }
    }
  }

  private generateCastlingMoves(from: number, moves: InternalMove[]): void {
    const color = this.turnColor;
    if (this.validateCastling(from, from + 2, color) == null) {
      moves.push(this.createInternalMove(from, from + 2, { castle: 'k' }));
    }
    if (this.validateCastling(from, from - 2, color) == null) {
      moves.push(this.createInternalMove(from, from - 2, { castle: 'q' }));
    }
  }

  private createInternalMove(
    from: number,
    to: number,
    options?: {
      captured?: PieceType;
      promotion?: PromotionPiece;
      enPassant?: boolean;
      castle?: 'k' | 'q';
    }
  ): InternalMove {
    const piece = pieceType(this.board[from]!);
    const color = this.turnColor;
    const isCastle = Boolean(options?.castle);
    return {
      from,
      to,
      piece,
      color,
      captured: options?.captured,
      promotion: options?.promotion,
      isCapture: Boolean(options?.captured),
      isCastle,
      isKingsideCastle: options?.castle === 'k',
      isQueensideCastle: options?.castle === 'q',
      isEnPassant: Boolean(options?.enPassant),
      isPromotion: Boolean(options?.promotion)
    };
  }

  private commitMove(move: InternalMove, precomputed?: LegalMove): LegalMove {
    const legalMove = precomputed ?? this.toLegalMove(move);
    const undo = this.applyMove(move, true);
    undo.legalMove = legalMove;
    this.historyStack.push(undo);
    this.redoStack.length = 0;
    return legalMove;
  }

  private applyMove(move: InternalMove, trackRepetition: boolean): UndoState {
    const movedPiece = this.board[move.from]!;
    const undo: UndoState = {
      move,
      movedPiece,
      capturedPiece: null,
      captureSquare: null,
      rookFrom: null,
      rookTo: null,
      previousCastling: this.castling,
      previousEpSquare: this.epSquare,
      previousHalfmoveClock: this.halfmoveClock,
      previousFullmoveNumber: this.fullmoveNumber,
      previousTurn: this.turnColor,
      previousKings: cloneKings(this.kings)
    };

    this.board[move.from] = null;

    if (move.isEnPassant) {
      undo.captureSquare = move.to + (move.color === 'w' ? 16 : -16);
      undo.capturedPiece = this.board[undo.captureSquare];
      this.board[undo.captureSquare] = null;
    } else {
      undo.captureSquare = move.to;
      undo.capturedPiece = this.board[move.to];
    }

    if (move.isCastle) {
      undo.rookFrom = move.isKingsideCastle
        ? (move.color === 'w' ? squareToIndex('h1') : squareToIndex('h8'))
        : (move.color === 'w' ? squareToIndex('a1') : squareToIndex('a8'));
      undo.rookTo = move.isKingsideCastle ? move.to - 1 : move.to + 1;
      this.board[undo.rookTo] = this.board[undo.rookFrom];
      this.board[undo.rookFrom] = null;
    }

    const placedPiece = move.isPromotion
      ? toInternalPiece(move.color, move.promotion!)
      : movedPiece;
    this.board[move.to] = placedPiece;

    if (move.piece === 'k') {
      this.kings[move.color] = move.to;
    }

    this.updateCastlingRights(move, undo.capturedPiece);
    this.epSquare = null;
    if (move.piece === 'p' && Math.abs(move.to - move.from) === 32) {
      this.epSquare = move.from + (move.color === 'w' ? -16 : 16);
    }

    if (move.piece === 'p' || move.isCapture) {
      this.halfmoveClock = 0;
    } else {
      this.halfmoveClock += 1;
    }

    if (this.turnColor === 'b') {
      this.fullmoveNumber += 1;
    }
    this.turnColor = opposite(this.turnColor);

    if (trackRepetition) {
      const key = this.repetitionKey();
      this.repetitionCounts.set(key, (this.repetitionCounts.get(key) ?? 0) + 1);
    }

    return undo;
  }

  private unapplyMove(undo: UndoState, trackRepetition: boolean): void {
    if (trackRepetition) {
      const key = this.repetitionKey();
      const count = this.repetitionCounts.get(key) ?? 0;
      if (count <= 1) {
        this.repetitionCounts.delete(key);
      } else {
        this.repetitionCounts.set(key, count - 1);
      }
    }

    this.turnColor = undo.previousTurn;
    this.castling = undo.previousCastling;
    this.epSquare = undo.previousEpSquare;
    this.halfmoveClock = undo.previousHalfmoveClock;
    this.fullmoveNumber = undo.previousFullmoveNumber;
    this.kings = cloneKings(undo.previousKings);

    if (undo.rookFrom != null && undo.rookTo != null) {
      this.board[undo.rookFrom] = this.board[undo.rookTo];
      this.board[undo.rookTo] = null;
    }

    this.board[undo.move.from] = undo.movedPiece;
    if (undo.move.isEnPassant) {
      this.board[undo.move.to] = null;
      if (undo.captureSquare != null) {
        this.board[undo.captureSquare] = undo.capturedPiece;
      }
    } else {
      this.board[undo.move.to] = undo.capturedPiece;
    }
  }

  private updateCastlingRights(move: InternalMove, capturedPiece: InternalPiece | null): void {
    if (move.piece === 'k') {
      this.castling &= move.color === 'w' ? ~(CASTLE_WHITE_K | CASTLE_WHITE_Q) : ~(CASTLE_BLACK_K | CASTLE_BLACK_Q);
    }

    if (move.piece === 'r') {
      if (move.from === squareToIndex('a1')) {
        this.castling &= ~CASTLE_WHITE_Q;
      } else if (move.from === squareToIndex('h1')) {
        this.castling &= ~CASTLE_WHITE_K;
      } else if (move.from === squareToIndex('a8')) {
        this.castling &= ~CASTLE_BLACK_Q;
      } else if (move.from === squareToIndex('h8')) {
        this.castling &= ~CASTLE_BLACK_K;
      }
    }

    if (!capturedPiece || pieceType(capturedPiece) !== 'r') {
      return;
    }

    const captureSquare = move.isEnPassant ? null : move.to;
    if (captureSquare === squareToIndex('a1')) {
      this.castling &= ~CASTLE_WHITE_Q;
    } else if (captureSquare === squareToIndex('h1')) {
      this.castling &= ~CASTLE_WHITE_K;
    } else if (captureSquare === squareToIndex('a8')) {
      this.castling &= ~CASTLE_BLACK_Q;
    } else if (captureSquare === squareToIndex('h8')) {
      this.castling &= ~CASTLE_BLACK_K;
    }
  }

  private previewFen(move: InternalMove): string {
    const undo = this.applyMove(move, false);
    const fen = this.generateFen();
    this.unapplyMove(undo, false);
    return fen;
  }

  private generatePlacementFen(): string {
    const rows: string[] = [];
    for (let rank = 0; rank < 8; rank++) {
      let row = '';
      let empty = 0;
      for (let file = 0; file < 8; file++) {
        const piece = this.board[rank * 16 + file];
        if (!piece) {
          empty += 1;
          continue;
        }
        if (empty > 0) {
          row += String(empty);
          empty = 0;
        }
        row += piece;
      }
      if (empty > 0) {
        row += String(empty);
      }
      rows.push(row);
    }

    return rows.join('/');
  }

  private generateFen(): string {
    const placement = this.generatePlacementFen();

    return [
      placement,
      this.turnColor,
      castlingToString(this.castling),
      this.epSquare == null ? '-' : indexToSquare(this.epSquare),
      String(this.halfmoveClock),
      String(this.fullmoveNumber)
    ].join(' ');
  }

  private boardFen(): string {
    return [
      this.generatePlacementFen(),
      this.turnColor,
      castlingToString(this.castling),
      this.epSquare == null ? '-' : indexToSquare(this.epSquare)
    ].join(' ');
  }

  private repetitionKey(): string {
    return this.boardFen();
  }

  private resultToken(): string {
    const outcome = this.outcome();
    if (outcome.kind === 'checkmate') {
      return outcome.winner === 'w' ? '1-0' : '0-1';
    }
    if (outcome.draw) {
      return '1/2-1/2';
    }
    return '*';
  }

  private isKingAttacked(color: Color, byColor: Color = opposite(color)): boolean {
    return this.isSquareAttackedByIndex(this.kings[color], byColor);
  }

  private isSquareAttackedByIndex(target: number, byColor: Color): boolean {
    let attacked = false;
    forEachBoardSquare(from => {
      const piece = this.board[from];
      if (!piece || pieceColor(piece) !== byColor) {
        return;
      }
      if (this.pieceAttacksSquare(from, target, pieceType(piece), byColor)) {
        attacked = true;
        return false;
      }
    });
    return attacked;
  }

  private attackersOfIndex(target: number, byColor: Color): number[] {
    const attackers: number[] = [];

    forEachBoardSquare(from => {
      const piece = this.board[from];
      if (!piece || pieceColor(piece) !== byColor) {
        return;
      }
      if (this.pieceAttacksSquare(from, target, pieceType(piece), byColor)) {
        attackers.push(from);
      }
    });

    return attackers;
  }

  private pieceAttacksSquare(from: number, target: number, type: PieceType, color: Color): boolean {
    if (type === 'p') {
      const offsets = color === 'w' ? [-17, -15] : [17, 15];
      return offsets.some(offset => from + offset === target);
    }

    if (type === 'n') {
      return KNIGHT_OFFSETS.includes(target - from);
    }

    if (type === 'k') {
      return KING_OFFSETS.includes(target - from);
    }

    const offsets = type === 'b' ? BISHOP_OFFSETS : type === 'r' ? ROOK_OFFSETS : QUEEN_OFFSETS;
    return offsets.some(offset => this.rayReaches(from, target, offset) && !this.pathBlocked(from, target, offset));
  }

  private rayReaches(from: number, to: number, offset: number): boolean {
    let current = from + offset;
    while (isBoardIndex(current)) {
      if (current === to) {
        return true;
      }
      current += offset;
    }
    return false;
  }

  private pathBlocked(from: number, to: number, offset: number): boolean {
    let current = from + offset;
    while (isBoardIndex(current) && current !== to) {
      if (this.board[current]) {
        return true;
      }
      current += offset;
    }
    return false;
  }

  private analyzeAppliedMove(move: InternalMove): { isCheck: boolean; isCheckmate: boolean } {
    const undo = this.applyMove(move, false);
    const isCheck = this.inCheck();
    const isCheckmate = isCheck && this.generateLegalMoves().length === 0;
    this.unapplyMove(undo, false);
    return { isCheck, isCheckmate };
  }

  private toLegalMove(move: InternalMove, contextMoves?: InternalMove[]): LegalMove {
    const { isCheck, isCheckmate } = this.analyzeAppliedMove(move);
    const san = this.buildSanBase(move, contextMoves) + (isCheckmate ? '#' : isCheck ? '+' : '');

    return {
      from: indexToSquare(move.from),
      to: indexToSquare(move.to),
      san,
      uci: formatUci({
        from: indexToSquare(move.from),
        to: indexToSquare(move.to),
        promotion: move.promotion
      }),
      piece: move.piece,
      color: move.color,
      captured: move.captured,
      promotion: move.promotion,
      isCapture: move.isCapture,
      isCheck,
      isCheckmate,
      isCastle: move.isCastle,
      isKingsideCastle: move.isKingsideCastle,
      isQueensideCastle: move.isQueensideCastle,
      isEnPassant: move.isEnPassant,
      isPromotion: move.isPromotion
    };
  }

  private sanForMove(move: InternalMove, contextMoves?: InternalMove[]): string {
    const { isCheck, isCheckmate } = this.analyzeAppliedMove(move);
    return this.buildSanBase(move, contextMoves) + (isCheckmate ? '#' : isCheck ? '+' : '');
  }

  private buildSanBase(move: InternalMove, contextMoves?: InternalMove[]): string {
    const legalMoves = contextMoves ?? this.generateLegalMoves();
    let san = '';

    if (move.isCastle) {
      san = move.isKingsideCastle ? 'O-O' : 'O-O-O';
    } else {
      const piece = sanPieceLetter(move.piece);
      let disambiguation = '';

      if (move.piece !== 'p') {
        const conflicts = legalMoves.filter(candidate =>
          candidate.piece === move.piece &&
          candidate.to === move.to &&
          !(candidate.from === move.from && candidate.to === move.to && candidate.promotion === move.promotion)
        );
        if (conflicts.length > 0) {
          const sameFileConflict = conflicts.some(candidate => sameFile(candidate.from, move.from));
          const sameRankConflict = conflicts.some(candidate => sameRank(candidate.from, move.from));
          if (!sameFileConflict) {
            disambiguation = fileChar(move.from);
          } else if (!sameRankConflict) {
            disambiguation = String(rankOf(move.from));
          } else {
            disambiguation = indexToSquare(move.from);
          }
        }
      }

      const destination = indexToSquare(move.to);
      const capture = move.isCapture ? 'x' : '';
      const promotion = move.promotion ? `=${move.promotion.toUpperCase()}` : '';

      if (move.piece === 'p' && move.isCapture) {
        san = `${fileChar(move.from)}${capture}${destination}${promotion}`;
      } else {
        san = `${piece}${disambiguation}${capture}${destination}${promotion}`;
      }
    }

    return san;
  }
}

export const DEFAULT_FEN = STANDARD_START_FEN;
