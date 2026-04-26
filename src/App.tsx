import React, { useState, useEffect } from 'react';
import { User, Gem, RotateCw, ArrowUp, ArrowRight, ArrowDown, ArrowLeft } from 'lucide-react';
import { cn } from './lib/utils';

type ColorStr = 'R' | 'G' | 'B';
type DoorColor = ColorStr | 'U';

interface DoorState {
  color: DoorColor;
  isOpen: boolean;
}

interface Card {
  id: string;
  code: ColorStr[];
  doors: DoorState[];
  rotation: number;
  revealedIndices: number[];
}

interface BoardSlot {
  card: Card;
  crystalProduced: boolean;
}

interface Location {
  code: ColorStr[];
  revealedIndices: number[];
}

interface GameState {
  locations: Location[][];
  board: (BoardSlot | null)[][];
  hand: Card[];
  playerPos: { x: number; y: number };
  crystals: Record<ColorStr, number>;
  gameState: 'playing' | 'won' | 'lost';
  selectedCardId: string | null;
  selectedCardSource: 'hand' | null;
  laserSelectedColor: ColorStr | null;
}

const COLORS: ColorStr[] = ['R', 'G', 'B'];
const CODE_COMBOS: ColorStr[][] = [
  ['R', 'R', 'R'], ['G', 'G', 'G'], ['B', 'B', 'B'],
  ['R', 'R', 'G'], ['R', 'R', 'B'], ['G', 'G', 'R'],
  ['G', 'G', 'B'], ['B', 'B', 'R'], ['B', 'B', 'G'],
  ['R', 'G', 'B'] // 10 combinations
];

const DIRS = [
  { dx: 0, dy: -1 }, // 0: N
  { dx: 1, dy: 0 },  // 1: E
  { dx: 0, dy: 1 },  // 2: S
  { dx: -1, dy: 0 }  // 3: W
];

function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

function getOverlap(c1: ColorStr[], c2: ColorStr[]) {
  let temp = [...c2];
  let overlap: ColorStr[] = [];
  for (let c of c1) {
    let idx = temp.indexOf(c);
    if (idx !== -1) {
      overlap.push(c);
      temp.splice(idx, 1);
    }
  }
  return overlap;
}

function countMatches(c1: ColorStr[], c2: ColorStr[]) {
  return getOverlap(c1, c2).length;
}

// Generate initial state
function createInitialState(): GameState {
  const pickedCodes = shuffle([...CODE_COMBOS]).slice(0, 9);
  
  const locList = pickedCodes.map(c => ({ code: [...c], revealedIndices: [] }));
  const locations = [
    [locList[0], locList[1], locList[2]],
    [locList[3], locList[4], locList[5]],
    [locList[6], locList[7], locList[8]],
  ];

  const cards: Card[] = pickedCodes.map((code, i) => {
    const baseColors: ColorStr[] = ['R', 'G', 'B'];
    const dupColor = baseColors[Math.floor(Math.random() * 3)];
    const dColors = shuffle([...baseColors, dupColor]);
    return {
      id: `card-${i}`,
      code: [...code],
      doors: dColors.map(d => ({ color: d, isOpen: false })),
      rotation: 0,
      revealedIndices: []
    };
  });

  shuffle(cards);
  const startCard = cards.pop()!;
  
  const board: (BoardSlot | null)[][] = [
    [null, null, null],
    [null, { card: startCard, crystalProduced: true }, null],
    [null, null, null]
  ];

  return {
    locations,
    board,
    hand: cards,
    playerPos: { x: 1, y: 1 },
    crystals: { R: 1, G: 1, B: 1 },
    gameState: 'playing',
    selectedCardId: null,
    selectedCardSource: null,
    laserSelectedColor: null
  };
}

export default function App() {
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    setState(createInitialState());
  }, []);

  if (!state) return <div>Loading...</div>;

  const updateState = (updater: (s: GameState) => void) => {
    setState(prev => {
      if (!prev) return prev;
      const next = JSON.parse(JSON.stringify(prev)) as GameState;
      updater(next);
      return next;
    });
  };

  const isAdjacentToPlayer = (x: number, y: number) => {
    return Math.abs(x - state.playerPos.x) + Math.abs(y - state.playerPos.y) === 1;
  };

  const getGlobalDoor = (card: Card, globalDir: number) => {
    const localDir = (globalDir - card.rotation + 4) % 4;
    return card.doors[localDir];
  };

  const handleCardClick = (card: Card, source: 'hand') => {
    if (state.selectedCardId === card.id) {
      // Rotate
      updateState(s => {
        const c = s.hand.find(x => x.id === card.id);
        if (c) c.rotation = (c.rotation + 1) % 4;
      });
    } else {
      updateState(s => {
        s.selectedCardId = card.id;
        s.selectedCardSource = source;
        s.laserSelectedColor = null; // Clear laser if selecting card
      });
    }
  };

  const handleCellClick = (x: number, y: number) => {
    if (state.gameState !== 'playing') return;
    
    const isAdjacent = isAdjacentToPlayer(x, y);
    const slot = state.board[y][x];

    const tryMove = (s: GameState, targetX: number, targetY: number) => {
      let dir = -1;
      const dx = targetX - s.playerPos.x;
      const dy = targetY - s.playerPos.y;
      if (dy === -1) dir = 0; // N
      if (dx === 1) dir = 1;  // E
      if (dy === 1) dir = 2;  // S
      if (dx === -1) dir = 3; // W
      
      if (dir === -1) return false;

      const px = s.playerPos.x;
      const py = s.playerPos.y;
      const slotOut = s.board[py][px];
      const slotIn = s.board[targetY][targetX];
      
      if (!slotOut || !slotIn) return false;

      const outDoor = getGlobalDoor(slotOut.card, dir);
      const inDoor = getGlobalDoor(slotIn.card, (dir + 2) % 4);

      if (outDoor.isOpen && inDoor.isOpen) {
        s.playerPos = { x: targetX, y: targetY };

        const oldSlot = s.board[py][px]!;
        const oldLoc = s.locations[py][px];
        
        // Discard old card if not perfect match
        if (countMatches(oldSlot.card.code, oldLoc.code) !== 3) {
          s.board[py][px] = null;
          s.hand.push(oldSlot.card);
        }

        const newSlot = s.board[targetY][targetX]!;
        if (!newSlot.crystalProduced) {
          // Not middle room for gems
          if (!(targetX === 1 && targetY === 1)) {
            let locCode = [...s.locations[targetY][targetX].code];
            let cardCode = [...newSlot.card.code];

            for (let cIdx = 0; cIdx < cardCode.length; cIdx++) {
              let c = cardCode[cIdx];
              let lIdx = locCode.indexOf(c);
              if (lIdx !== -1) {
                s.crystals[c]++;
                locCode[lIdx] = 'U' as unknown as ColorStr; // consume it temporarily
                if (!newSlot.card.revealedIndices.includes(cIdx)) newSlot.card.revealedIndices.push(cIdx);
                if (!s.locations[targetY][targetX].revealedIndices.includes(lIdx)) s.locations[targetY][targetX].revealedIndices.push(lIdx);
              }
            }
          }
          newSlot.crystalProduced = true;
        }
        return true;
      }
      return false;
    };

    // Place card
    if (!slot && isAdjacent && state.selectedCardId && state.selectedCardSource) {
      updateState(s => {
        const sourceArr = s.hand;
        const cardIdx = sourceArr.findIndex(c => c.id === s.selectedCardId);
        if (cardIdx !== -1) {
          const card = sourceArr[cardIdx];
          sourceArr.splice(cardIdx, 1);
          s.board[y][x] = { card, crystalProduced: false };
          s.selectedCardId = null;
          s.selectedCardSource = null;

          // Attempt auto-move
          tryMove(s, x, y);
        }
      });
      return;
    }

    // Move to adjacent cell
    if (slot && isAdjacent && !state.selectedCardId) {
      updateState(s => {
        tryMove(s, x, y);
      });
    }
  };

  const handleLaserClick = (dir: number) => {
    if (!state.laserSelectedColor || state.crystals[state.laserSelectedColor] <= 0) return;

    updateState(s => {
      if (!s.laserSelectedColor) return;
      s.crystals[s.laserSelectedColor]--;

      let cx = s.playerPos.x;
      let cy = s.playerPos.y;

      let hitNextRoom = false;

      while (true) {
        let slot = s.board[cy][cx];
        if (!slot) break; // In empty space

        // Only process exiting door if we are inside a room
        if (!hitNextRoom || slot) {
          const localDirOut = (dir - slot.card.rotation + 4) % 4;
          const outDoor = slot.card.doors[localDirOut];

          if (!outDoor.isOpen) {
            if (outDoor.color === s.laserSelectedColor) {
              outDoor.isOpen = true; // Opens!
            } else {
              break; // Blocked
            }
          }
        }

        // Proceed to next cell
        hitNextRoom = false;
        while (!hitNextRoom) {
          cx += DIRS[dir].dx;
          cy += DIRS[dir].dy;
          if (cx < 0 || cx > 2 || cy < 0 || cy > 2) break;
          
          let nextSlot = s.board[cy][cx];
          if (nextSlot) {
            hitNextRoom = true;
            break;
          }
        }
        
        if (!hitNextRoom) break; // Exited board

        let nextSlot = s.board[cy][cx]!;
        let inDir = (dir + 2) % 4;
        let localDirIn = (inDir - nextSlot.card.rotation + 4) % 4;
        let inDoor = nextSlot.card.doors[localDirIn];

        if (!inDoor.isOpen) {
          if (inDoor.color === s.laserSelectedColor) {
            inDoor.isOpen = true;
          } else {
            break; // Blocked entering
          }
        }
        // If we opened the entering door, the loop continues to exit that room.
      }
      s.laserSelectedColor = null;
    });
  };

  const openTrapDoor = () => {
    updateState(s => {
      const curSlot = s.board[1][1];
      if (curSlot) {
        if (countMatches(curSlot.card.code, s.locations[1][1].code) === 3) {
          s.gameState = 'won';
        } else {
          s.gameState = 'lost';
        }
      }
    });
  };

  const BorderColorMap: Record<ColorStr | 'U', string> = {
    'R': 'border-red-500',
    'G': 'border-green-500',
    'B': 'border-blue-500',
    'U': 'border-slate-500',
  };

  const ColorMap: Record<ColorStr | 'U', string> = {
    'R': 'bg-red-500',
    'G': 'bg-green-500',
    'B': 'bg-blue-500',
    'U': 'bg-slate-500', // Unlocked door color
  };

  const TextColorMap: Record<ColorStr, string> = {
    'R': 'text-red-500',
    'G': 'text-green-500',
    'B': 'text-blue-500',
  };

  const renderCard = (card: Card, isPlayerHere: boolean, isBoard: boolean) => {
    return (
      <div className={cn(
        "relative w-full h-full bg-[#1e293b] border-2 rounded-lg shrink-0 flex flex-col items-center justify-center transition-all",
        isBoard ? "border-[#334155]" : "border-[#334155] shadow-lg cursor-pointer hover:border-slate-400",
        state.selectedCardId === card.id && !isBoard && "border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.4)]",
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
          
          {isPlayerHere && (
             <div className="flex flex-col items-center p-2 border border-slate-700 bg-slate-900 rounded w-full mt-auto">
               <span className="text-[9px] uppercase font-bold text-sky-400">Player Present</span>
             </div>
          )}
        </div>
      </div>
    );
  };

  const renderSlotInfo = (x: number, y: number, loc: Location) => {
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
    )
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-[#e2e8f0] font-sans selection:bg-sky-500/30 overflow-x-hidden">
      <div className="flex flex-col lg:flex-row h-full w-full p-6 lg:space-x-6 max-w-[1200px] mx-auto min-h-screen">
        
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 space-y-4">
          <header className="flex justify-between items-end mb-4 flex-wrap gap-4 w-full">
            <div className="flex flex-col">
              <h1 className="text-2xl font-bold tracking-tight">PRISM CHAMBERS</h1>
              <p className="text-xs text-slate-400">CRYSTAL EXTRACTION & NAVIGATION SYSTEM v.1.04</p>
            </div>
            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setState(createInitialState())}
                  className="px-3 py-1.5 bg-red-900/40 text-red-400 border border-red-500/30 rounded text-[10px] font-bold uppercase hover:bg-red-900/60 transition-colors"
               >
                  Restart System
               </button>
               <div className="flex space-x-6 text-sm bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                 <div className="flex flex-col items-center">
                   <span className="text-[10px] uppercase opacity-50">Current Room</span>
                   <span className="font-mono text-sky-400">[{state.playerPos.x},{state.playerPos.y}] SECTOR C</span>
                 </div>
                 <div className="flex flex-col items-center">
                   <span className="text-[10px] uppercase opacity-50">Room Status</span>
                   <span className="font-mono text-green-400">STABLE</span>
                 </div>
               </div>
            </div>
          </header>

          <div className="flex items-center justify-center flex-1 bg-slate-900/20 rounded-xl p-4 border border-slate-800">
             {/* Board Grid */}
            <div className="grid grid-cols-3 grid-rows-3 gap-3 w-full max-w-[600px] aspect-square relative place-content-center">
              {state.board.map((row, y) => row.map((slot, x) => {
                const isPlayerHere = state.playerPos.x === x && state.playerPos.y === y;
                const isAdjacent = isAdjacentToPlayer(x, y);
                const isCenter = x === 1 && y === 1;
                const loc = state.locations[y][x];

                return (
                  <div 
                    key={`${x}-${y}`}
                    onClick={() => handleCellClick(x, y)}
                    className={cn(
                      "relative w-full h-full bg-[#1e293b]/50 border-2 border-dashed border-[#334155]/50 rounded-lg overflow-visible flex items-center justify-center",
                      (!slot && isAdjacent && state.selectedCardId) && "border-sky-500/50 bg-sky-900/20 hover:bg-sky-900/30 cursor-pointer",
                      (isCenter && !slot) && "border-rose-500/30",
                    )}
                  >
                    {!slot && !isCenter && renderSlotInfo(x,y,loc)}
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
                          (isAdjacent && !state.selectedCardId) && "cursor-pointer hover:scale-105 transition-transform z-20"
                        )}>
                            {renderCard(slot.card, isPlayerHere, true)}
                        </div>
                    )}

                    {/* Laser Direction Overlay */}
                    {isPlayerHere && state.laserSelectedColor && (
                      <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center bg-slate-900/60 rounded-lg backdrop-blur-[2px]">
                        <div className="relative w-24 h-24 pointer-events-auto">
                           {/* Center Glowing Dot */}
                           <div className={cn("absolute inset-0 m-auto w-5 h-5 rounded-full shadow-[0_0_20px_currentColor]", ColorMap[state.laserSelectedColor])} />
                           
                           <button onClick={(e) => { e.stopPropagation(); handleLaserClick(0); }} className={cn("absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 border-2 border-white/30 transition-all", ColorMap[state.laserSelectedColor])}><ArrowUp size={16} className="text-white"/></button>
                           
                           <button onClick={(e) => { e.stopPropagation(); handleLaserClick(1); }} className={cn("absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 border-2 border-white/30 transition-all", ColorMap[state.laserSelectedColor])}><ArrowRight size={16} className="text-white"/></button>
                           
                           <button onClick={(e) => { e.stopPropagation(); handleLaserClick(2); }} className={cn("absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 border-2 border-white/30 transition-all", ColorMap[state.laserSelectedColor])}><ArrowDown size={16} className="text-white"/></button>
                           
                           <button onClick={(e) => { e.stopPropagation(); handleLaserClick(3); }} className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 border-2 border-white/30 transition-all", ColorMap[state.laserSelectedColor])}><ArrowLeft size={16} className="text-white"/></button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-800/40 rounded-lg border border-slate-700/50">
             <button 
                onClick={() => {
                   if (!state.selectedCardId && state.hand.length > 0) {
                      updateState(s => {
                         s.selectedCardId = s.hand[0].id;
                         s.selectedCardSource = 'hand';
                         s.laserSelectedColor = null;
                      });
                   }
                }}
                className={cn(
                   "flex flex-col items-center justify-center rounded p-2 transition text-center",
                   state.selectedCardId ? "bg-sky-500 text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]" : "bg-sky-600 hover:bg-sky-500 text-white"
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
                onClick={() => {
                   const hasCrystals = Object.values(state.crystals).some(count => (count as number) > 0);
                   if (hasCrystals && !state.laserSelectedColor) {
                      const firstColor = (Object.keys(state.crystals) as ColorStr[]).find(c => state.crystals[c] > 0);
                      if (firstColor) {
                         updateState(s => {
                            s.laserSelectedColor = firstColor;
                            s.selectedCardId = null;
                         });
                      }
                   } else if (state.laserSelectedColor) {
                      updateState(s => { s.laserSelectedColor = null; });
                   }
                }}
                className={cn(
                   "flex flex-col items-center justify-center rounded p-2 transition text-center",
                   state.laserSelectedColor ? "bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-red-600/80 hover:bg-red-500 text-white"
                )}
             >
                <span className="text-[10px] font-bold">ACTIVATE LASER</span>
                <span className="text-[8px] opacity-70">Select crystal + Fire</span>
             </button>
             <button 
                onClick={openTrapDoor}
                disabled={!(state.playerPos.x === 1 && state.playerPos.y === 1)}
                className="flex flex-col items-center justify-center border border-sky-500 text-sky-400 bg-sky-900/20 hover:bg-sky-900/40 disabled:opacity-50 disabled:cursor-not-allowed rounded p-2 transition text-center"
             >
                <span className="text-[10px] font-bold">OPEN TRAP DOOR</span>
                <span className="text-[8px] opacity-70">Must be in Central Core</span>
             </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-full lg:w-72 bg-slate-900/50 lg:border-l border-slate-700 p-4 shrink-0 flex flex-col space-y-6 lg:h-full lg:overflow-y-auto mt-6 lg:mt-0 rounded-xl lg:rounded-none lg:bg-transparent border border-slate-700 lg:border-y-0 lg:border-r-0">
          
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Crystal Inventory</h2>
            <div className="grid grid-cols-3 gap-2">
               {COLORS.map(c => (
                  <button 
                     key={c}
                     onClick={() => updateState(s => { 
                        s.laserSelectedColor = s.laserSelectedColor === c ? null : c; 
                        s.selectedCardId = null;
                     })}
                     disabled={state.crystals[c] === 0}
                     className={cn(
                        "p-2 rounded flex flex-col items-center transition-all",
                        c === 'R' ? "bg-red-900/20 border border-red-500/30" : 
                        c === 'G' ? "bg-green-900/20 border border-green-500/30" : 
                        "bg-blue-900/20 border border-blue-500/30",
                        state.laserSelectedColor === c && "ring-2 ring-yellow-400 bg-yellow-400/10",
                        state.crystals[c] === 0 && "opacity-30 grayscale cursor-not-allowed"
                     )}
                  >
                     <div className={cn("w-4 h-4 mb-1 blur-[1px] rounded-full", ColorMap[c])}></div>
                     <span className="text-xs font-bold text-slate-300">{state.crystals[c]}</span>
                  </button>
               ))}
            </div>
          </div>

          <div>
             <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Cards in Hand</h2>
             <div className="flex gap-4 flex-wrap">
                {state.hand.map((card, idx) => (
                   <div key={card.id} className="flex flex-col items-center gap-2">
                       <span className="text-[10px] font-mono text-slate-500">#{idx.toString().padStart(2, '0')}</span>
                       <div 
                          onClick={() => handleCardClick(card, 'hand')}
                          className={cn(
                             "relative w-16 h-16 bg-[#1e293b]/80 rounded border border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 shrink-0 transform transition-transform hover:scale-105",
                             state.selectedCardId === card.id && "border-sky-500 ring-2 ring-sky-500 bg-sky-900/20 shadow-[0_0_15px_rgba(56,189,248,0.3)]"
                          )}
                       >
                          {card.doors.map((d, j) => {
                             const td = (j + card.rotation) % 4;
                             return (
                                <div key={j} className={cn(
                                   "absolute rounded-[1px]",
                                   d.isOpen ? cn("border border-dashed border-opacity-50 shadow-[inset_0_0_8px_rgba(0,0,0,0.5)]", BorderColorMap[d.color]) : cn("border border-white/20 shadow-sm", ColorMap[d.color]),
                                   td === 0 && "top-[-4px] left-[22px] w-5 h-[5px] rounded-[2px]",
                                   td === 1 && "right-[-4px] top-[22px] w-[5px] h-5 rounded-[2px]",
                                   td === 2 && "bottom-[-4px] left-[22px] w-5 h-[5px] rounded-[2px]",
                                   td === 3 && "left-[-4px] top-[22px] w-[5px] h-5 rounded-[2px]",
                                )} />
                             )
                          })}
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
                                updateState(s => {
                                   const c = s.hand.find(x => x.id === card.id);
                                   if (c) c.rotation = (c.rotation + 1) % 4;
                                });
                             }}
                             className="absolute bottom-1 right-1 p-0.5 rounded hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                             <RotateCw size={12} />
                          </button>
                       </div>
                   </div>
                ))}
                {state.hand.length === 0 && <div className="text-xs text-slate-500 italic p-2">Hand empty</div>}
             </div>
          </div>

          <div className="mt-auto border-t border-slate-700 pt-4 hidden lg:block">
            <div className="flex justify-between items-center text-[10px] mb-2">
              <span className="text-slate-500 uppercase">Cards in Hand: {state.hand.length}</span>
            </div>
            <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
              <div className="bg-sky-500 h-full transition-all" style={{width: `${(state.hand.length / 9) * 100}%`}}></div>
            </div>
          </div>

        </aside>

      </div>
    </div>
  );
}


