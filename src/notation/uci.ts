import type { LegalMove, MoveInput, PromotionPiece } from '../types';
import { isValidSquare } from '../utils/squares';

const UCI_PATTERN = /^[a-h][1-8][a-h][1-8][qrbn]?$/;

export function parseUci(input: string): MoveInput | null {
  if (!UCI_PATTERN.test(input)) {
    return null;
  }

  const from = input.slice(0, 2);
  const to = input.slice(2, 4);
  const promotion = input[4] as PromotionPiece | undefined;

  if (!isValidSquare(from) || !isValidSquare(to)) {
    return null;
  }

  if (promotion && !['q', 'r', 'b', 'n'].includes(promotion)) {
    return null;
  }

  return { from, to, promotion };
}

export function formatUci(move: Pick<LegalMove, 'from' | 'to' | 'promotion'>): string {
  return `${move.from}${move.to}${move.promotion ?? ''}`;
}
