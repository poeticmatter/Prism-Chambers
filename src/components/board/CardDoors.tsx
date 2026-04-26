import React from 'react';
import { Card } from '../../engine/types';
import { cn } from '../../lib/utils';
import { BorderColorMap, ColorMap } from '../utils';

interface CardDoorsProps {
  card: Card;
  classNamePrefix?: string;
  sizeMultiplier?: number;
}

export function CardDoors({ card, classNamePrefix = '', sizeMultiplier = 1 }: CardDoorsProps) {
  return (
    <>
      {card.doors.map((door, i) => {
        const transformedDir = (i + card.rotation) % 4; // Visual rotation

        // Base styling for inner doors
        const w1 = `${10 * sizeMultiplier}px`;
        const h1 = `${32 * sizeMultiplier}px`;
        const w2 = `${32 * sizeMultiplier}px`;
        const h2 = `${10 * sizeMultiplier}px`;
        const offset = `-${6 * sizeMultiplier}px`;
        const r = `${3 * sizeMultiplier}px`;

        return (
          <div key={i} className={cn(
              "absolute z-10 transition-all",
              door.isOpen ? cn("bg-transparent border-2 border-dashed shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]", BorderColorMap[door.color]) : cn("border border-white/20 shadow-sm", ColorMap[door.color]),
              transformedDir === 0 && "left-1/2 -translate-x-1/2",
              transformedDir === 1 && "top-1/2 -translate-y-1/2",
              transformedDir === 2 && "left-1/2 -translate-x-1/2",
              transformedDir === 3 && "top-1/2 -translate-y-1/2",
              classNamePrefix
          )} style={{
              ...(transformedDir === 0 ? { top: offset, width: w2, height: h2, borderRadius: r } : {}),
              ...(transformedDir === 1 ? { right: offset, width: w1, height: h1, borderRadius: r } : {}),
              ...(transformedDir === 2 ? { bottom: offset, width: w2, height: h2, borderRadius: r } : {}),
              ...(transformedDir === 3 ? { left: offset, width: w1, height: h1, borderRadius: r } : {}),
          }}/>
        )
      })}
    </>
  );
}
