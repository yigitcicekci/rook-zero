import { RZero } from '../core/chess';
import type { PositionValidationResult } from '../types';

export function validateFen(fen: string): PositionValidationResult {
  return RZero.validateFen(fen);
}
