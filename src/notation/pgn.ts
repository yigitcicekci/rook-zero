export function tokenizePgn(input: string): string[] {
  return input
    .replace(/\{[^}]*\}/g, ' ')
    .replace(/;[^\n]*/g, ' ')
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\$\d+/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length > 0)
    .filter(token => !/^\d+\.(\.\.)?$/.test(token))
    .filter(token => !['1-0', '0-1', '1/2-1/2', '*'].includes(token));
}

export function formatPgn(history: string[], initialFen: string, defaultFen: string, result: string): string {
  const moves: string[] = [];

  for (let i = 0; i < history.length; i++) {
    if (i % 2 === 0) {
      moves.push(`${Math.floor(i / 2) + 1}.`);
    }
    moves.push(history[i]);
  }

  const tags: string[] = [];
  if (initialFen !== defaultFen) {
    tags.push(`[SetUp "1"]`);
    tags.push(`[FEN "${initialFen}"]`);
  }

  const movetext = `${moves.join(' ')}${moves.length > 0 ? ' ' : ''}${result}`.trim();
  if (tags.length === 0) {
    return movetext;
  }

  return `${tags.join('\n')}\n\n${movetext}`;
}
