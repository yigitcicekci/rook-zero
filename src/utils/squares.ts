import { SQUARES } from '../types';
import type { Color, Square } from '../types';

const SQUARE_SET = new Set<string>(SQUARES);

export const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

export function isValidSquare(value: string): value is Square {
  return SQUARE_SET.has(value);
}

export function squareToIndex(square: Square): number {
  const file = square.charCodeAt(0) - 97;
  const rank = Number(square[1]);
  return (8 - rank) * 16 + file;
}

export function indexToSquare(index: number): Square {
  const file = index & 7;
  const rank = 8 - (index >> 4);
  return `${String.fromCharCode(97 + file)}${rank}` as Square;
}

export function fileOf(index: number): number {
  return index & 7;
}

export function rankOf(index: number): number {
  return 8 - (index >> 4);
}

export function fileChar(index: number): string {
  return String.fromCharCode(97 + fileOf(index));
}

export function squareColor(square: Square): Color {
  const index = squareToIndex(square);
  return ((fileOf(index) + rankOf(index)) & 1) === 0 ? 'b' : 'w';
}

export function sameFile(a: number, b: number): boolean {
  return fileOf(a) === fileOf(b);
}

export function sameRank(a: number, b: number): boolean {
  return (a >> 4) === (b >> 4);
}

export function forEachBoardSquare(callback: (index: number) => boolean | void): boolean {
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      if (callback(rank * 16 + file) === false) {
        return false;
      }
    }
  }
  return true;
}
