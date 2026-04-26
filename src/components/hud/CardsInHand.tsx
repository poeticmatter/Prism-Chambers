import React from 'react';
import { useStore } from '../../engine/store';
import { useShallow } from 'zustand/react/shallow';
import { cn } from '../../lib/utils';
import { RotateCw } from 'lucide-react';
import { ColorStr } from '../../engine/types';
import { ColorMap } from '../utils';
import { CardDoors } from '../board/CardDoors';

export function CardsInHand() {
  const hand = useStore(useShallow(state => state.hand));
  const selectedCardId = useStore(state => state.selectedCardId);
  const handleCardClick = useStore(state => state.actions.handleCardClick);
  const rotateCard = useStore(state => state.actions.rotateCard);

  return (
    <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Cards in Hand</h2>
        <div className="flex gap-4 flex-wrap">
          {hand.map((card, idx) => (
              <div key={card.id} className="flex flex-col items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-500">#{idx.toString().padStart(2, '0')}</span>
                  <div
                    onClick={() => handleCardClick(card.id, 'hand')}
                    className={cn(
                        "relative w-16 h-16 bg-[#1e293b]/80 rounded border border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 shrink-0 transform transition-transform hover:scale-105",
                        selectedCardId === card.id && "border-sky-500 ring-2 ring-sky-500 bg-sky-900/20 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                    )}
                  >
                    <CardDoors card={card} sizeMultiplier={0.6} />
                    <div className="flex gap-1 mt-1 mx-1 flex-wrap justify-center pointer-events-none">
                        {card.code.map((c, j) => {
                            const isRevealed = card.revealedIndices.includes(j);
                            return (
                              <div key={j} className={cn("w-2.5 h-2.5 rounded-full border",
                                  isRevealed ? cn(ColorMap[c], "shadow-[0_0_4px_currentColor] border-transparent") : "bg-slate-700 border-slate-600"
                              )} />
                            )
                        })}
                    </div>

                    <button
                        onClick={(e) => {
                          e.stopPropagation();
                          rotateCard(card.id);
                        }}
                        className="absolute bottom-1 right-1 p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                        <RotateCw size={12} />
                    </button>
                  </div>
              </div>
          ))}
          {hand.length === 0 && <div className="text-xs text-slate-500 italic p-2">Hand empty</div>}
        </div>
    </div>
  );
}

export function HandProgress() {
  const handLength = useStore(state => state.hand.length);

  return (
    <div className="mt-auto border-t border-slate-700 pt-4 hidden lg:block">
      <div className="flex justify-between items-center text-[10px] mb-2">
        <span className="text-slate-500 uppercase">Cards in Hand: {handLength}</span>
      </div>
      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
        <div className="bg-sky-500 h-full transition-all" style={{width: `${(handLength / 9) * 100}%`}}></div>
      </div>
    </div>
  );
}
