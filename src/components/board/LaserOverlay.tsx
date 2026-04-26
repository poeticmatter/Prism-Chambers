import React from 'react';
import { useStore } from '../../engine/store';
import { cn } from '../../lib/utils';
import { ColorMap } from '../utils';
import { ArrowUp, ArrowRight, ArrowDown, ArrowLeft } from 'lucide-react';

export function LaserOverlay() {
  const laserSelectedColor = useStore(state => state.laserSelectedColor);
  const fireLaser = useStore(state => state.actions.fireLaser);

  if (!laserSelectedColor) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-slate-900/60 rounded-lg backdrop-blur-[2px]">
      <div className="relative w-24 h-24 pointer-events-auto">
          {/* Center Glowing Dot */}
          <div className={cn("absolute inset-0 m-auto w-5 h-5 rounded-full shadow-[0_0_20px_currentColor]", ColorMap[laserSelectedColor])} />

          <button onClick={(e) => { e.stopPropagation(); fireLaser(0); }} className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 border-2 border-white/30 transition-all", ColorMap[laserSelectedColor])}><ArrowUp size={16} className="text-white"/></button>

          <button onClick={(e) => { e.stopPropagation(); fireLaser(1); }} className={cn("absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 border-2 border-white/30 transition-all", ColorMap[laserSelectedColor])}><ArrowRight size={16} className="text-white"/></button>

          <button onClick={(e) => { e.stopPropagation(); fireLaser(2); }} className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 border-2 border-white/30 transition-all", ColorMap[laserSelectedColor])}><ArrowDown size={16} className="text-white"/></button>

          <button onClick={(e) => { e.stopPropagation(); fireLaser(3); }} className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 border-2 border-white/30 transition-all", ColorMap[laserSelectedColor])}><ArrowLeft size={16} className="text-white"/></button>
      </div>
    </div>
  );
}
