import type { Color, PieceType } from '@yigitcicekci/rook-zero';

interface PieceIconProps {
  color: Color;
  piece: PieceType;
  className?: string;
}

export function PieceIcon({ color, piece, className = '' }: PieceIconProps) {
  // Simple CSS based piece rendering or Unicode for now
  // In a real app we'd use nice SVG assets. Let's use clean SVGs if possible.
  // Actually, we can just use Unicode with proper styling for the demo or simple SVGs.
  
  const getUnicode = () => {
    switch (color) {
      case 'w':
        switch (piece) {
          case 'k': return '♔';
          case 'q': return '♕';
          case 'r': return '♖';
          case 'b': return '♗';
          case 'n': return '♘';
          case 'p': return '♙';
        }
        break;
      case 'b':
        switch (piece) {
          case 'k': return '♚';
          case 'q': return '♛';
          case 'r': return '♜';
          case 'b': return '♝';
          case 'n': return '♞';
          case 'p': return '♟';
        }
    }
  };

  return (
    <span 
      className={`select-none pointer-events-none ${className}`}
      style={{
        fontSize: '2.5em',
        lineHeight: 1,
        color: color === 'w' ? '#fff' : '#000',
        textShadow: color === 'w' ? '0 0 2px #000, 0 0 2px #000' : '0 0 2px #fff',
      }}
    >
      {getUnicode()}
    </span>
  );
}
