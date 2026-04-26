import React from 'react';
import { RoomCell } from './RoomCell';

export function Board() {
  const grid = [0, 1, 2];

  return (
    <div className="flex items-center justify-center flex-1 bg-slate-900/20 rounded-xl p-4 border border-slate-800">
      <div className="grid grid-cols-3 grid-rows-3 gap-3 w-full max-w-[600px] aspect-square relative place-content-center">
        {grid.map(y => grid.map(x => (
          <RoomCell key={`${x}-${y}`} x={x} y={y} />
        )))}
      </div>
    </div>
  );
}
