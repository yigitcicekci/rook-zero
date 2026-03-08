import { useState } from 'react';
import { RZero } from '@yigitcicekci/rook-zero';
import type { Square, MoveInput } from '@yigitcicekci/rook-zero';
import { Chessboard } from '../components/Chessboard';
import { cn } from '../lib/utils';
import { RotateCcw, Undo2, Redo2 } from 'lucide-react';
import { t, type Lang } from '../lib/i18n';

interface Preset {
  nameKey: string;
  fen?: string;
  moves?: string[];
}

const PRESETS: Preset[] = [
  { nameKey: 'Start Position', fen: RZero.DEFAULT_FEN },
  { nameKey: 'Checkmate', fen: 'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4' },
  { nameKey: 'Stalemate', fen: '4k3/4P3/4K3/8/8/8/8/8 b - - 0 1' },
  { nameKey: 'Promotion', fen: '8/P7/8/8/8/8/8/4k2K w - - 0 1' },
  { nameKey: 'En Passant', fen: 'rnbqkbnr/pppp1ppp/8/3Pp3/8/8/PPP1PPPP/RNBQKBNR w KQkq e6 0 3' },
  { nameKey: 'Threefold', moves: ['Nf3', 'Nf6', 'Ng1', 'Ng8', 'Nf3', 'Nf6', 'Ng1', 'Ng8'] },
];

export function Playground({ lang }: { lang: Lang }) {
  const text = t[lang].playground;
  const [engine] = useState(() => new RZero());

  const [gameState, setGameState] = useState(() => ({
    fen: engine.fen(),
    turn: engine.turn(),
    isCheckmate: engine.isCheckmate(),
    isStalemate: engine.isStalemate(),
    isCheck: engine.isCheck(),
    outcome: engine.outcome(),
    history: engine.history() as string[],
    pgn: engine.pgn()
  }));

  const updateGameState = () => {
    setGameState({
      fen: engine.fen(),
      turn: engine.turn(),
      isCheckmate: engine.isCheckmate(),
      isStalemate: engine.isStalemate(),
      isCheck: engine.isCheck(),
      outcome: engine.outcome(),
      history: engine.history() as string[],
      pgn: engine.pgn()
    });
  };

  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Square[]>([]);
  
  const [moveInput, setMoveInput] = useState('');
  const [fenInput, setFenInput] = useState('');
  const [validationMsg, setValidationMsg] = useState<{ text: string, type: 'error'|'success' } | null>(null);

  // Handlers
  const handleSquareClick = (square: Square) => {
    setValidationMsg(null);
    if (selectedSquare === square) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    if (selectedSquare) {
      // Try to move
      const moves = engine.legalMovesFrom(selectedSquare);
      const isLegal = moves.some(m => m.to === square);
      
      if (isLegal) {
        const piece = engine.pieceAt(selectedSquare);
        const moveArg: MoveInput = { from: selectedSquare, to: square };
        
        if (piece?.type === 'p' && (square.includes('8') || square.includes('1'))) {
          moveArg.promotion = 'q';
        }

        const res = engine.move(moveArg);
        if (res) {
          setSelectedSquare(null);
          setLegalMoves([]);
          updateGameState();
          return;
        }
      }
    }

    // Select piece
    const piece = engine.pieceAt(square);
    if (piece && piece.color === gameState.turn) {
      setSelectedSquare(square);
      const moves = engine.legalMovesFrom(square);
      setLegalMoves(moves.map(m => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleManualMove = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moveInput.trim()) return;
    
    const res = engine.move(moveInput.trim());
    if (res) {
      setMoveInput('');
      setValidationMsg({ text: text.msgs.moveApplied, type: 'success' });
      setSelectedSquare(null);
      setLegalMoves([]);
      updateGameState();
    } else {
      const val = engine.validateMove(moveInput.trim());
      setValidationMsg({ text: `${text.msgs.invalidMove} ${val.ok === false ? val.reason : 'Unknown'}`, type: 'error' });
    }
  };

  const handleFenLoad = (e: React.FormEvent) => {
    e.preventDefault();
    const res = engine.loadFen(fenInput);
    if (res.ok) {
      setValidationMsg({ text: text.msgs.fenLoaded, type: 'success' });
      setSelectedSquare(null);
      setLegalMoves([]);
      updateGameState();
    } else {
      setValidationMsg({ text: `${text.msgs.invalidFen} ${res.reason}`, type: 'error' });
    }
  };

  const handleUndo = () => {
    engine.undo();
    setSelectedSquare(null);
    setLegalMoves([]);
    setValidationMsg(null);
    updateGameState();
  };

  const handleRedo = () => {
    engine.redo();
    setSelectedSquare(null);
    setLegalMoves([]);
    setValidationMsg(null);
    updateGameState();
  };

  const handleReset = () => {
    engine.reset();
    setSelectedSquare(null);
    setLegalMoves([]);
    setValidationMsg(null);
    updateGameState();
  };

  const handlePreset = (preset: Preset) => {
    if (preset.fen) {
      engine.loadFen(preset.fen);
      setFenInput(preset.fen);
    } else if (preset.moves) {
      engine.reset();
      for (const m of preset.moves) {
        engine.move(m);
      }
      setFenInput('');
    }
    
    setSelectedSquare(null);
    setLegalMoves([]);
    setValidationMsg(null);
    updateGameState();
  };

  const isGameOver = gameState.outcome.kind !== 'ongoing';
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">{text.title}</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Board */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col items-center">
          <Chessboard
            engine={engine}
            selectedSquare={selectedSquare}
            legalMoves={legalMoves}
            onSquareClick={handleSquareClick}
          />
          
          <div className="flex gap-4 mt-6">
            <button onClick={handleUndo} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-md transition-colors" title="Undo"><Undo2 size={20} /></button>
            <button onClick={handleRedo} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-md transition-colors" title="Redo"><Redo2 size={20} /></button>
            <button onClick={handleReset} className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-md transition-colors" title="Reset"><RotateCcw size={20} /></button>
          </div>
        </div>

        {/* Right: Controls & Info */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6">
          
          {/* Status Panel */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">{text.status}</h3>
            <div className="flex flex-wrap gap-4">
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{text.turn}</span>
                <span className="font-bold text-lg dark:text-white">{gameState.turn === 'w' ? text.white : text.black}</span>
              </div>
              <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">{text.state}</span>
                <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">
                  {gameState.isCheckmate ? text.checkmate 
                    : gameState.isStalemate ? text.stalemate
                    : gameState.isCheck ? text.check
                    : isGameOver ? text.draw : text.normal}
                </span>
              </div>
            </div>
            {isGameOver && (
              <div className="mt-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 p-2 rounded border border-red-100 dark:border-red-900/50">
                {text.gameOver}: {gameState.outcome.kind}
              </div>
            )}
          </div>

          {/* Validation & Input */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{text.validation}</h3>
            
            <form onSubmit={handleManualMove} className="flex gap-2">
              <input 
                value={moveInput}
                onChange={e => setMoveInput(e.target.value)}
                placeholder={text.movePlaceholder}
                className="flex-1 min-w-0 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors">
                {text.moveBtn}
              </button>
            </form>

            <form onSubmit={handleFenLoad} className="flex gap-2">
              <input 
                value={fenInput}
                onChange={e => setFenInput(e.target.value)}
                placeholder={text.fenPlaceholder}
                className="flex-1 min-w-0 px-3 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
              <button type="submit" className="px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-lg font-medium transition-colors">
                {text.fenBtn}
              </button>
            </form>

            {validationMsg && (
              <div className={cn("text-sm p-3 rounded-lg font-medium", validationMsg.type === 'error' ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50" : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50")}>
                {validationMsg.text}
              </div>
            )}
            
            <div className="pt-2">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{text.presets}</p>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(p => (
                  <button key={p.nameKey} onClick={() => handlePreset(p)} className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-slate-700 rounded transition-colors border border-slate-200 dark:border-slate-700">
                    {text.presetNames[p.nameKey as keyof typeof text.presetNames]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Data Tabs (History, PGN, FEN) */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">{text.export}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{text.currentFen}</label>
                <div className="font-mono text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 break-all select-all">
                  {gameState.fen}
                </div>
              </div>
              
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{text.moveHistory}</label>
              <div className="font-mono text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 h-32 overflow-y-auto">
                    {gameState.history.length === 0 ? <span className="text-slate-400 dark:text-slate-500">{text.noMoves}</span> : (
                      <ol className="list-decimal pl-5 space-y-1">
                        {gameState.history.reduce((acc: string[][], move, i) => {
                          if (i % 2 === 0) acc.push([move]);
                          else acc[acc.length - 1].push(move);
                          return acc;
                        }, []).map((pair, i) => (
                          <li key={i}>
                            <span className="inline-block w-12 text-slate-500 dark:text-slate-400">{pair[0]}</span>
                            <span>{pair[1] || ''}</span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">{text.pgn}</label>
                  <div className="font-mono text-xs p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 h-32 overflow-y-auto whitespace-pre-wrap break-all">
                    {gameState.pgn || <span className="text-slate-400 dark:text-slate-500">{text.empty}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
