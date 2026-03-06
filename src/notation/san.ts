export function normalizeSan(input: string): string {
  return input
    .trim()
    .replace(/0/g, 'O')
    .replace(/[+#]+$/g, '')
    .replace(/[!?]+$/g, '');
}

export function sanPieceLetter(piece: string): string {
  switch (piece) {
    case 'n':
      return 'N';
    case 'b':
      return 'B';
    case 'r':
      return 'R';
    case 'q':
      return 'Q';
    case 'k':
      return 'K';
    default:
      return '';
  }
}
