import React from 'react';
import { useStore } from '../../engine/store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../lib/utils';
import { SlotInfo } from './SlotInfo';
import { RoomCard } from './RoomCard';
import { LaserOverlay } from './LaserOverlay';

export interface RoomCellProps {
  x: number;
  y: number;
}

export function RoomCell({ x, y }: RoomCellProps) {
  const slot = useStore(useShallow(state => state.board[y][x]));
  const isPlayerHere = useStore(state => state.playerPos.x === x && state.playerPos.y === y);
  const playerPos = useStore(useShallow(state => state.playerPos));
  const isAdjacent = Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y) === 1;
  const isCenter = x === 1 && y === 1;

  const hasSelectedCard = useStore(state => state.selectedCardId !== null);
  const scanNoMatch = useStore(state => state.scanNoMatch);
  const loc = useStore(useShallow(state => state.locations[y][x]));

  const handleCellClick = useStore(state => state.actions.handleCellClick);
  const scanRoom = useStore(state => state.actions.scanRoom);

  return (
    <div
      onClick={() => handleCellClick(x, y)}
      className={cn(
        "relative w-full h-full bg-[#1e293b]/50 border-2 border-dashed border-[#334155]/50 rounded-lg overflow-visible flex items-center justify-center",
        (!slot && isAdjacent && hasSelectedCard) && "border-sky-500/50 bg-sky-900/20 hover:bg-sky-900/30 cursor-pointer",
        (isCenter && !slot) && "border-rose-500/30",
      )}
    >
      {!slot && !isCenter && <SlotInfo x={x} y={y} />}
      {!slot && isCenter && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
            <div className="text-xs font-bold text-slate-500 uppercase">CENTRAL CORE</div>
            <div className="flex gap-1 mt-2">
                {[0,1,2].map(i => <div key={i} className="w-3 h-3 rounded-full bg-sky-900/50 border border-sky-500/50" />)}
            </div>
            <div className="mt-4 border border-sky-500/30 text-sky-500 p-1 px-3 text-[10px] uppercase font-bold rounded-full">Trap Door Locked</div>
          </div>
      )}

      {slot && (
          <div className={cn(
            "absolute inset-[2px]", // slightly smaller than cell to show border of cell beneath
            (isAdjacent && !hasSelectedCard) && "cursor-pointer hover:scale-105 transition-transform z-20"
          )}>
              <RoomCard
                card={slot.card}
                isPlayerHere={isPlayerHere}
                isBoard={true}
                onScan={scanRoom}
                canScan={!slot.scanned && !isCenter}
                location={loc}
                scanNoMatch={isPlayerHere ? scanNoMatch : false}
              />
          </div>
      )}

      {isPlayerHere && <LaserOverlay />}
    </div>
  );
}
