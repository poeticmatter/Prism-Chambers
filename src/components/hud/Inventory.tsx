import React from 'react';
import { useStore } from '../../engine/store';
import { useShallow } from 'zustand/shallow';
import { cn } from '../../lib/utils';
import { ColorStr } from '../../engine/types';
import { COLORS } from '../../engine/systems/CoreSystem';
import { ColorMap } from '../utils';

export function Inventory() {
  const crystals = useStore(useShallow(state => state.crystals));
  const laserSelectedColor = useStore(state => state.laserSelectedColor);
  const selectLaserColor = useStore(state => state.actions.selectLaserColor);

  const toggleLaserColor = (c: ColorStr) => {
    selectLaserColor(laserSelectedColor === c ? null : c);
  };

  return (
    <div>
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Crystal Inventory</h2>
      <div className="grid grid-cols-3 gap-2">
          {COLORS.map(c => (
            <button
                key={c}
                onClick={() => toggleLaserColor(c)}
                disabled={crystals[c] === 0}
                className={cn(
                  "p-2 rounded flex flex-col items-center transition-all",
                  c === 'R' ? "bg-red-900/20 border border-red-500/30" :
                  c === 'G' ? "bg-green-900/20 border border-green-500/30" :
                  "bg-blue-900/20 border border-blue-500/30",
                  laserSelectedColor === c && "ring-2 ring-yellow-400 bg-yellow-400/10",
                  crystals[c] === 0 && "opacity-30 grayscale cursor-not-allowed"
                )}
            >
                <div className={cn("w-4 h-4 mb-1 blur-[1px] rounded-full", ColorMap[c])}></div>
                <span className="text-xs font-bold text-slate-300">{crystals[c]}</span>
            </button>
          ))}
      </div>
    </div>
  );
}
