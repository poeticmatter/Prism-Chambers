import React from 'react';
import { useStore } from '../../engine/store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../lib/utils';
import { ColorMap } from '../utils';

export function SlotInfo({ x, y }: { x: number, y: number }) {
  const loc = useStore(useShallow(state => state.locations[y][x]));

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-3 opacity-30">
        <div className="text-[10px] uppercase tracking-wider mb-1 text-slate-400">Location</div>
        <div className="flex gap-1 mb-4">
            {loc.code.map((c, i) => {
                const isRevealed = loc.revealedIndices.includes(i);
                return (
                  <div key={i} className={cn("w-3 h-3 rounded-full border",
                      isRevealed ? cn(ColorMap[c], "shadow-[0_0_8px_currentColor] border-transparent") : "bg-slate-700 border-slate-600"
                  )} />
                )
            })}
        </div>
        <div className="p-2 bg-slate-800/50 rounded text-[10px] text-center w-full">Empty Slot</div>
    </div>
  );
}
