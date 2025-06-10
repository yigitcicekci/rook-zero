import { Board, Move, MoveValidationResult, Piece, PieceColor, PieceType, Position, GameState, PIECE_VALIDATORS } from './types';
import { parseFEN, validateFEN, generateFEN } from './fen';
import { findPiece } from './utils';

interface FlaggedMove {
  move: Move;
  riskScore: number;
}

export class ChessEngine {
  private board: Board;
  private gameState: GameState;
  private moveHistory: Move[] = [];
  private flaggedMoves: FlaggedMove[] = [];
  
  private static readonly DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
  private static readonly RISK_THRESHOLD = 0.3;

  constructor(fen?: string) {
    const fenString = (fen && validateFEN(fen)) ? fen : ChessEngine.DEFAULT_FEN;
    const { board, gameState } = parseFEN(fenString);
    
    this.board = board;
    this.board.enPassant = gameState.enPassant;
    this.gameState = gameState;
  }

  public isMoveValid(move: Move): MoveValidationResult {
    const basicCheck = this.basicMoveCheck(move);
    if (!basicCheck.valid) {
      return basicCheck;
    }

    const piece = findPiece(this.board, move.from)!;
    
    const pieceCheck = this.checkPieceMove(piece, move);
    if (!pieceCheck.valid) {
      return pieceCheck;
    }

  
    const pinCheck = this.checkForPinAfterMove(move);
    if (!pinCheck.valid) {
      return pinCheck;
    }

    const riskScore = this.getMoveRiskScore(piece, move);
    pieceCheck.riskScore = riskScore;

    if (riskScore > ChessEngine.RISK_THRESHOLD) {
      this.flaggedMoves.push({ move, riskScore });
    }

    return pieceCheck;
  }

  public makeMove(move: Move): boolean {
    console.log(`DEBUG: makeMove called for ${move.from.row},${move.from.col} -> ${move.to.row},${move.to.col}`);
    
    const validationResult = this.isMoveValid(move);
    console.log(`DEBUG: Validation result: ${validationResult.valid}, Error: ${validationResult.error || 'None'}`);
    
    if (!validationResult.valid) {
      return false;
    }

    const piece = findPiece(this.board, move.from)!;
    const isCapture = this.applyMove(move, piece);
    
    this.updateStateAfterMove(move, piece, isCapture);
    this.moveHistory.push(move);

    return true;
  }

  public getBoard(): Board {
    console.log(`DEBUG: getBoard called - internal board.fen: "${this.board.fen}"`);
    const result = { ...this.board, pieces: [...this.board.pieces] };
    console.log(`DEBUG: getBoard returning - result.fen: "${result.fen}"`);
    return result;
  }

  public getMoveHistory(): Move[] {
    return [...this.moveHistory];
  }

  public getFEN(): string {
    const currentGameState = { ...this.gameState };

    if (this.moveHistory.length > 0) {
      const lastMove = this.moveHistory[this.moveHistory.length - 1];
      currentGameState.moveCoords = 
        `${lastMove.from.col}${lastMove.from.row}${lastMove.to.col}${lastMove.to.row}`;
    }

    return generateFEN(this.board, currentGameState);
  }

  public getFlaggedMoves(): FlaggedMove[] {
    return [...this.flaggedMoves];
  }

  public getCurrentPlayer(): PieceColor {
    return this.gameState.activeColor;
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public isInCheck(color?: PieceColor): boolean {
    const checkColor = color || this.gameState.activeColor;
    const king = this.board.pieces.find(p => 
      p.type === PieceType.KING && p.color === checkColor
    );
    
    if (!king) return false;
    
    return this.isKingUnderAttack(this.board, king.position, king.color);
  }

  public isCheckmate(color?: PieceColor): boolean {
    const checkColor = color || this.gameState.activeColor;
    
    if (!this.isInCheck(checkColor)) {
      return false;
    }
    
    return !this.hasLegalMoves(checkColor);
  }

  public isStalemate(color?: PieceColor): boolean {
    const checkColor = color || this.gameState.activeColor;
    
    if (this.isInCheck(checkColor)) {
      return false;
    }
    
    return !this.hasLegalMoves(checkColor);
  }

  public isGameOver(): { gameOver: boolean; result?: string; reason?: string } {
    const activeColor = this.gameState.activeColor;
    
    if (this.isCheckmate(activeColor)) {
      const winner = activeColor === PieceColor.WHITE ? 'Black' : 'White';
      return { 
        gameOver: true, 
        result: `${winner} wins by checkmate!`,
        reason: 'checkmate'
      };
    }
    
    if (this.isStalemate(activeColor)) {
      return { 
        gameOver: true, 
        result: 'Draw by stalemate',
        reason: 'stalemate'
      };
    }
    
    if (this.gameState.halfMoves >= 100) {
      return { 
        gameOver: true, 
        result: 'Draw by 50-move rule',
        reason: 'fifty-move-rule'
      };
    }
    
    return { gameOver: false };
  }

  private hasLegalMoves(color: PieceColor): boolean {
    const pieces = this.board.pieces.filter(p => p.color === color);
    
    for (const piece of pieces) {
      const possibleMoves = this.generatePossibleMoves(piece);
      
      for (const move of possibleMoves) {
        if (this.isMoveValid(move).valid) {
          return true;
        }
      }
    }
    
    return false;
  }

  private generatePossibleMoves(piece: Piece): Move[] {
    const moves: Move[] = [];
    
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const to = { row, col };
        if (to.row === piece.position.row && to.col === piece.position.col) {
          continue;
        }
        
        const targetPiece = this.board.pieces.find(p => 
          p.position.row === row && p.position.col === col
        );
        
        const move: Move = {
          from: piece.position,
          to,
          piece,
          isCapture: targetPiece ? targetPiece.color !== piece.color : false
        };
        
        moves.push(move);
      }
    }
    
    return moves;
  }

  private basicMoveCheck(move: Move): MoveValidationResult {
    const piece = findPiece(this.board, move.from);
    
    if (!piece) {
      return { valid: false, error: 'There is no piece on the starting square.' };
    }
    
    if (piece.color !== this.gameState.activeColor) {
      return { valid: false, error: 'It is not your turn.' };
    }
    
    const targetPiece = findPiece(this.board, move.to);
    if (targetPiece && targetPiece.color === piece.color) {
      return { valid: false, error: 'You cannot capture your own piece.' };
    }

    return { valid: true };
  }

  private checkPieceMove(piece: Piece, move: Move): MoveValidationResult {
    const validator = PIECE_VALIDATORS[piece.type];
    
    if (!validator) {
      return { valid: false, error: 'This piece type is not supported yet.' };
    }

    return validator.validate(this.board, move);
  }

  private getMoveRiskScore(piece: Piece, move: Move): number {
    const validator = PIECE_VALIDATORS[piece.type];
    return validator?.risk ? validator.risk(this.board, move) : 0;
  }

  private applyMove(move: Move, piece: Piece): boolean {
    const targetPiece = findPiece(this.board, move.to);
    const isCapture = !!targetPiece;
    
    if (isCapture) {
      this.removePiece(move.to);
      move.isCapture = true;
    }

    piece.position = { ...move.to };
    
    console.log(`DEBUG: Before FEN update - board.fen: "${this.board.fen}"`);
    this.board.fen = this.getFEN();
    console.log(`DEBUG: After FEN update - board.fen: "${this.board.fen}"`);
    
    return isCapture;
  }

  private updateStateAfterMove(move: Move, piece: Piece, isCapture: boolean): void {
    this.gameState.activeColor = this.gameState.activeColor === PieceColor.WHITE 
      ? PieceColor.BLACK 
      : PieceColor.WHITE;
    
    if (this.gameState.activeColor === PieceColor.WHITE) {
      this.gameState.fullMoves++;
    }
    
    if (piece.type === PieceType.PAWN || isCapture) {
      this.gameState.halfMoves = 0;
    } else {
      this.gameState.halfMoves++;
    }
  }

  private removePiece(position: Position): void {
    this.board.pieces = this.board.pieces.filter(
      piece => !(piece.position.row === position.row && piece.position.col === position.col)
    );
  }

  private checkForPinAfterMove(move: Move): MoveValidationResult {
    const simulatedBoard = { 
      ...this.board, 
      pieces: this.board.pieces.map(p => ({ ...p, position: { ...p.position } }))
    };

    const movingPieceIndex = simulatedBoard.pieces.findIndex(
      p => p.position.row === move.from.row && p.position.col === move.from.col
    );

    if (movingPieceIndex === -1) {
      return { valid: false, error: 'Piece not found for pin check' };
    }

    const movingPiece = simulatedBoard.pieces[movingPieceIndex];

    const capturedPieceIndex = simulatedBoard.pieces.findIndex(
      p => p.position.row === move.to.row && p.position.col === move.to.col && p !== movingPiece
    );

    if (capturedPieceIndex !== -1) {
      simulatedBoard.pieces.splice(capturedPieceIndex, 1);
    }

    simulatedBoard.pieces[movingPieceIndex].position = { ...move.to };

    const ourKing = simulatedBoard.pieces.find(
      p => p.type === PieceType.KING && p.color === movingPiece.color
    );

    if (!ourKing) {
      return { valid: true };
    }

    if (this.isKingUnderAttack(simulatedBoard, ourKing.position, ourKing.color)) {
      return { valid: false, error: 'This move would expose your king to check' };
    }

    return { valid: true };
  }

  private isKingUnderAttack(board: Board, kingPosition: Position, kingColor: PieceColor): boolean {
    const enemyPieces = board.pieces.filter(p => p.color !== kingColor);
    
    for (const enemyPiece of enemyPieces) {
      if (this.canPieceAttackPosition(board, enemyPiece, kingPosition)) {
        return true;
      }
    }
    
    return false;
  }

  private canPieceAttackPosition(board: Board, piece: Piece, targetPosition: Position): boolean {
    const testMove: Move = {
      from: piece.position,
      to: targetPosition,
      piece: piece,
      isCapture: false
    };

    const validator = PIECE_VALIDATORS[piece.type];
    if (!validator) {
      return false;
    }

    const result = validator.validate(board, testMove);
    return result.valid;
  }
}