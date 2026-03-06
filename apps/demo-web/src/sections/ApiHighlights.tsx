import { useState } from 'react';
import { cn } from '../lib/utils';
import { t, type Lang } from '../lib/i18n';

const CODES: Record<string, string> = {
  init: `import { RkEngine } from '@yigitcicekci/rook-zero';

const engine = new RkEngine();

// Play moves using standard notation
engine.move('e4');
engine.move('e5');
engine.move('Nf3');

// Check the game state
console.log(engine.isCheck()); // false
console.log(engine.fen()); // Current FEN string
`,
  validate: `import { RkEngine, validateFen } from '@yigitcicekci/rook-zero';

// Validate FEN string directly
const fenResult = validateFen('invalid_fen_string');
if (!fenResult.ok) {
  console.log('Error:', fenResult.reason); // e.g. 'invalid-fen'
}

const engine = new RkEngine();
const moveResult = engine.validateMove('Qxe8');
if (!moveResult.ok) {
  console.log(moveResult.reason); // e.g. 'illegal-piece-move'
}
`,
  elo: `import { 
  calculateExpectedScore, 
  calculateEloChange 
} from '@yigitcicekci/rook-zero';

// Expected score for 1500 vs 1600
const expected = calculateExpectedScore(1500, 1600); // 0.36

// Rating change after a win
const change = calculateEloChange({
  rating: 1500,
  opponentRating: 1600,
  score: 1, // Win
  kFactor: 20
});
console.log(change.newRating); // 1513
`
};

export function ApiHighlights({ lang }: { lang: Lang }) {
  const text = t[lang].api;
  const snippets = text.snippets;
  const [activeId, setActiveId] = useState(snippets[0].id);
  const activeSnippet = snippets.find(s => s.id === activeId);

  return (
    <div id="api" className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">{text.title}</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">{text.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-2">
            {snippets.map(snippet => (
              <button
                key={snippet.id}
                onClick={() => setActiveId(snippet.id)}
                className={cn(
                  "w-full text-left p-4 rounded-xl border transition-all",
                  activeId === snippet.id 
                    ? "bg-slate-900 text-white border-slate-900 dark:bg-indigo-600 dark:border-indigo-500 shadow-md" 
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/50"
                )}
              >
                <div className="font-semibold mb-1">{snippet.title}</div>
                <div className={cn("text-sm", activeId === snippet.id ? "text-slate-300 dark:text-indigo-100" : "text-slate-500 dark:text-slate-400")}>
                  {snippet.desc}
                </div>
              </button>
            ))}
          </div>
          
          <div className="lg:col-span-8">
            <div className="rounded-2xl bg-[#0d1117] dark:bg-[#070b14] overflow-hidden shadow-2xl border border-slate-800 dark:border-slate-800/80 h-full flex flex-col">
              <div className="flex items-center px-4 py-3 border-b border-slate-800 dark:border-slate-800/80 bg-[#0d1117]/80 dark:bg-[#070b14]/80">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
                <div className="ml-4 text-xs font-mono text-slate-400">example.ts</div>
              </div>
              <div className="p-6 overflow-x-auto flex-1">
                <pre className="font-mono text-sm leading-relaxed text-slate-300">
                  <code>
                    {activeSnippet && CODES[activeSnippet.id].split('\n').map((line, i) => (
                      <div key={i} className="table-row">
                        <span className="table-cell select-none text-right pr-4 text-slate-600">{i + 1}</span>
                        <span className="table-cell whitespace-pre">{line}</span>
                      </div>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
