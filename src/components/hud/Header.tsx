import React from 'react';
import { useStore } from '../../engine/store';
import { useShallow } from 'zustand/shallow';

export function Header() {
  const restartGame = useStore(state => state.actions.restartGame);
  const playerPos = useStore(useShallow(state => state.playerPos));

  return (
    <header className="flex justify-between items-end mb-4 flex-wrap gap-4 w-full">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold tracking-tight">PRISM CHAMBERS</h1>
        <p className="text-xs text-slate-400">CRYSTAL EXTRACTION & NAVIGATION SYSTEM v.1.04</p>
      </div>
      <div className="flex items-center gap-4">
          <button
            onClick={restartGame}
            className="px-3 py-1.5 bg-red-900/40 text-red-400 border border-red-500/30 rounded text-[10px] font-bold uppercase hover:bg-red-900/60 transition-colors"
          >
            Restart System
          </button>
          <div className="flex space-x-6 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase opacity-50">Current Room</span>
              <span className="font-mono text-sky-400">[{playerPos.x},{playerPos.y}] SECTOR C</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase opacity-50">Room Status</span>
              <span className="font-mono text-green-400">STABLE</span>
            </div>
          </div>
      </div>
    </header>
  );
}
