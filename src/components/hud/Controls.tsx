import React from 'react';
import { useStore } from '../../engine/store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../lib/utils';
import { ColorStr } from '../../engine/types';

export function Controls() {
  const selectedCardId = useStore(state => state.selectedCardId);
  const laserSelectedColor = useStore(state => state.laserSelectedColor);
  const playerPos = useStore(useShallow(state => state.playerPos));
  const hand = useStore(useShallow(state => state.hand));
  const crystals = useStore(useShallow(state => state.crystals));

  const handleCardClick = useStore(state => state.actions.handleCardClick);
  const selectLaserColor = useStore(state => state.actions.selectLaserColor);
  const openTrapDoor = useStore(state => state.actions.openTrapDoor);

  const handlePlayCard = () => {
    if (!selectedCardId && hand.length > 0) {
        handleCardClick(hand[0].id, 'hand');
    }
  };

  const handleActivateLaser = () => {
    const hasCrystals = Object.values(crystals).some(count => (count as number) > 0);
    if (hasCrystals && !laserSelectedColor) {
        const firstColor = (Object.keys(crystals) as ColorStr[]).find(c => crystals[c] > 0);
        if (firstColor) {
            selectLaserColor(firstColor);
        }
    } else if (laserSelectedColor) {
        selectLaserColor(null);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/40 rounded-lg border border-slate-700/50">
        <button
          onClick={handlePlayCard}
          className={cn(
              "flex flex-col items-center justify-center rounded p-2 transition text-center",
              selectedCardId ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]" : "bg-sky-600 hover:bg-sky-500 text-white"
          )}
        >
          <span className="text-[10px] font-bold">PLAY CARD</span>
          <span className="text-[8px] opacity-70">1. Select 2. Tap Space</span>
        </button>
        <div className="flex flex-col items-center justify-center border border-slate-600 bg-slate-800/50 text-white rounded p-2 text-center select-none">
          <span className="text-[10px] font-bold">MOVE</span>
          <span className="text-[8px] opacity-70">Tap adjacent room</span>
        </div>
        <button
          onClick={handleActivateLaser}
          className={cn(
              "flex flex-col items-center justify-center rounded p-2 transition text-center",
              laserSelectedColor ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-red-600/80 hover:bg-red-500 text-white"
          )}
        >
          <span className="text-[10px] font-bold">ACTIVATE LASER</span>
          <span className="text-[8px] opacity-70">Select crystal + Fire</span>
        </button>
        <button
          onClick={openTrapDoor}
          disabled={!(playerPos.x === 1 && playerPos.y === 1)}
          className="flex flex-col items-center justify-center border border-sky-500 text-sky-400 bg-sky-900/20 hover:bg-sky-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded p-2 transition text-center"
        >
          <span className="text-[10px] font-bold">OPEN TRAP DOOR</span>
          <span className="text-[8px] opacity-70">Must be in Central Core</span>
        </button>
    </div>
  );
}
