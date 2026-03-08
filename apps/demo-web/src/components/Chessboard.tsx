import { RZero } from '@yigitcicekci/rook-zero';
import type { Square } from '@yigitcicekci/rook-zero';
import { cn } from '../lib/utils';
import { PieceIcon } from './PieceIcon';

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

interface ChessboardProps {
  engine: RZero;
  selectedSquare: Square | null;
  legalMoves: Square[];
  onSquareClick: (square: Square) => void;
  flipped?: boolean;
}

export function Chessboard({ engine, selectedSquare, legalMoves, onSquareClick, flipped = false }: ChessboardProps) {
  const ranks = flipped ? [...RANKS].reverse() : RANKS;
  const files = flipped ? [...FILES].reverse() : FILES;

  return (
    <div className="w-full max-w-[500px] aspect-square flex flex-col border-4 border-[var(--color-brand-dark)] dark:border-slate-800 shadow-xl rounded-sm overflow-hidden">
      {ranks.map((rank, rankIndex) => (
        <div key={rank} className="flex flex-1">
          {files.map((file, fileIndex) => {
            const square = `${file}${rank}` as Square;
            const piece = engine.pieceAt(square);
            const isLight = (rankIndex + fileIndex) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isLegalMove = legalMoves.includes(square);
            
            return (
              <div
                key={square}
                onClick={() => onSquareClick(square)}
                className={cn(
                  "flex-1 relative flex items-center justify-center cursor-pointer",
                  isLight ? "bg-[var(--color-board-light)] text-[var(--color-board-dark)]" : "bg-[var(--color-board-dark)] text-[var(--color-board-light)]",
                  isSelected && "ring-inset ring-4 ring-blue-500",
                )}
              >
                {/* Coordinates (bottom/left edges) */}
                {fileIndex === 0 && (
                  <span className="absolute top-1 left-1 text-[10px] font-bold opacity-70">
                    {rank}
                  </span>
                )}
                {rankIndex === 7 && (
                  <span className="absolute bottom-1 right-1 text-[10px] font-bold opacity-70">
                    {file}
                  </span>
                )}

                {/* Legal move indicator */}
                {isLegalMove && (
                  <div className={cn(
                    "absolute rounded-full",
                    piece ? "w-full h-full border-4 border-black/20" : "w-1/3 h-1/3 bg-black/20"
                  )} />
                )}

                {/* Piece */}
                {piece && (
                  <PieceIcon color={piece.color} piece={piece.type} className="relative z-10 w-full h-full flex items-center justify-center" />
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
