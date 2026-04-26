import React from 'react';
import { useStore } from './engine/store';
import { Board } from './components/board/Board';
import { Header } from './components/hud/Header';
import { Controls } from './components/hud/Controls';
import { Inventory } from './components/hud/Inventory';
import { CardsInHand, HandProgress } from './components/hud/CardsInHand';
import { GameEndOverlay } from './components/overlays/GameEndOverlay';

export default function App() {
  const gameState = useStore(state => state.gameState); // Ensure init happened before rendering much else.

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-sans selection:bg-sky-500/30 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row h-full w-full p-6 lg:space-x-6 max-w-[1200px] mx-auto min-h-screen">
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 space-y-4">
          <Header />
          <Board />
          <Controls />
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-72 bg-slate-900/50 lg:border-l border-slate-700 p-4 shrink-0 flex flex-col space-y-6 lg:h-full lg:overflow-y-auto mt-6 lg:mt-0 rounded-xl lg:rounded-none lg:bg-transparent border border-slate-700 lg:border-y-0 lg:border-r-0">
          <Inventory />
          <CardsInHand />
          <HandProgress />
        </aside>

      </div>

      <GameEndOverlay />
    </div>
  );
}
