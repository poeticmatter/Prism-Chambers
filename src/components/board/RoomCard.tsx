import React from 'react';
import { Card, Location } from '../../engine/types';
import { cn } from '../../lib/utils';
import { BorderColorMap, ColorMap } from '../utils';

interface RoomCardProps {
  card: Card;
  isPlayerHere: boolean;
  isBoard: boolean;
  onScan?: () => void;
  canScan?: boolean;
  location?: Location;
  scanNoMatch?: boolean;
  isSelected?: boolean;
}

export function RoomCard({
  card,
  isPlayerHere,
  isBoard,
  onScan,
  canScan,
  location,
  scanNoMatch,
  isSelected
}: RoomCardProps) {
  return (
    <div className={cn(
      "relative w-full h-full bg-[#1e293b] border-2 rounded-lg shrink-0 flex flex-col items-center justify-center transition-all",
      isBoard ? "border-[#334155]" : "border-[#334155] shadow-lg cursor-pointer hover:border-slate-400",
      isSelected && !isBoard && "border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]",
      isPlayerHere && "border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]"
    )}>

      {/* Doors defined in local N E S W */}
      {card.doors.map((door, i) => {
        const transformedDir = (i + card.rotation) % 4; // Visual rotation
        return (
          <div key={i} className={cn(
              "absolute z-10 transition-all",
              door.isOpen ? cn("bg-transparent border-2 border-dashed shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]", BorderColorMap[door.color]) : cn("border border-white/20 shadow-sm", ColorMap[door.color]),
              // Positioning and sizing doors
              transformedDir === 0 && "top-[-6px] left-1/2 -translate-x-1/2 w-[32px] h-[10px] rounded-[3px]",
              transformedDir === 1 && "right-[-6px] top-1/2 -translate-y-1/2 w-[10px] h-[32px] rounded-[3px]",
              transformedDir === 2 && "bottom-[-6px] left-1/2 -translate-x-1/2 w-[32px] h-[10px] rounded-[3px]",
              transformedDir === 3 && "left-[-6px] top-1/2 -translate-y-1/2 w-[10px] h-[32px] rounded-[3px]",
          )} />
        )
      })}

      <div className="absolute inset-0 flex flex-col items-center p-3">
        <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1 pointer-events-none text-slate-300">
          Room Code
        </div>
        <div className="flex gap-1 mb-2">
          {card.code.map((c, i) => {
              const isRevealed = card.revealedIndices.includes(i);
              return (
                <div key={i} className={cn("w-3 h-3 rounded-full border",
                    isRevealed ? cn(ColorMap[c], "shadow-[0_0_8px_currentColor] border-transparent") : "bg-slate-700/50 border-slate-600/50"
                )} />
              )
          })}
        </div>

        {location && (
          <>
            <div className="text-[10px] uppercase tracking-wider opacity-60 mb-1 pointer-events-none text-slate-300">
              Location
            </div>
            <div className="flex gap-1 mb-2">
              {location.code.map((c, i) => {
                const isRevealed = location.revealedIndices.includes(i);
                return (
                  <div key={i} className={cn("w-3 h-3 rounded-full border",
                    isRevealed ? cn(ColorMap[c], "shadow-[0_0_8px_currentColor] border-transparent") : "bg-slate-700 border-slate-600"
                  )} />
                );
              })}
            </div>
          </>
        )}

        {isPlayerHere && (
            <div className="flex flex-col items-center gap-1 p-2 border border-slate-700 bg-slate-900 rounded w-full mt-auto">
              <span className="text-[9px] uppercase font-bold text-sky-400">Player Present</span>
              {onScan && (
                <button
                  onClick={(e) => { e.stopPropagation(); onScan(); }}
                  disabled={!canScan}
                  className="w-full px-1 py-0.5 text-[8px] font-bold uppercase rounded border border-emerald-500/60 text-emerald-400 bg-emerald-900/30 hover:bg-emerald-900/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  {canScan ? 'Scan Room' : 'Scanned'}
                </button>
              )}
              {scanNoMatch && (
                <span className="text-[8px] text-amber-400 font-bold uppercase tracking-wide">No matches found</span>
              )}
            </div>
        )}
      </div>
    </div>
  );
}
