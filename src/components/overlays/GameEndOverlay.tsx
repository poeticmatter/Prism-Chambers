import React from 'react';
import { useStore } from '../../engine/store';
import { cn } from '../../lib/utils';

export function GameEndOverlay() {
  const gameState = useStore(state => state.gameState);
  const restartGame = useStore(state => state.actions.restartGame);

  if (gameState === 'playing') return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className={cn(
        "flex flex-col items-center gap-6 rounded-2xl border-2 p-10 shadow-2xl max-w-sm w-full mx-4",
        gameState === 'won'
          ? "bg-emerald-950 border-emerald-400 shadow-[0_0_60px_rgba(52,211,153,0.3)]"
          : "bg-red-950 border-red-400 shadow-[0_0_60px_rgba(248,113,113,0.3)]"
      )}>
        <div className={cn(
          "text-5xl font-black tracking-tight",
          gameState === 'won' ? "text-emerald-300" : "text-red-300"
        )}>
          {gameState === 'won' ? 'ESCAPED' : 'TRAPPED'}
        </div>
        <p className={cn(
          "text-sm text-center",
          gameState === 'won' ? "text-emerald-400" : "text-red-400"
        )}>
          {gameState === 'won'
            ? 'The trap door codes matched. You have escaped the Prism Chambers.'
            : 'The trap door codes did not match. The chamber has sealed permanently.'}
        </p>
        <button
          onClick={restartGame}
          className={cn(
            "px-6 py-2 rounded-lg font-bold uppercase text-sm tracking-wider transition-colors",
            gameState === 'won'
              ? "bg-emerald-500 hover:bg-emerald-400 text-emerald-950"
              : "bg-red-500 hover:bg-red-400 text-red-950"
          )}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
