import { GameState, ColorStr, Card, BoardSlot } from '../types';

export const COLORS: ColorStr[] = ['R', 'G', 'B'];
export const CODE_COMBOS: ColorStr[][] = [
  ['R', 'R', 'R'], ['G', 'G', 'G'], ['B', 'B', 'B'],
  ['R', 'R', 'G'], ['R', 'R', 'B'], ['G', 'G', 'R'],
  ['G', 'G', 'B'], ['B', 'B', 'R'], ['B', 'B', 'G'],
  ['R', 'G', 'B'] // 10 combinations
];

export const DIRS = [
  { dx: 0, dy: -1 }, // 0: N
  { dx: 1, dy: 0 },  // 1: E
  { dx: 0, dy: 1 },  // 2: S
  { dx: -1, dy: 0 }  // 3: W
];

export function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

export function getOverlap(c1: ColorStr[], c2: ColorStr[]) {
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

export function countMatches(c1: ColorStr[], c2: ColorStr[]) {
  return getOverlap(c1, c2).length;
}

export function createInitialState(): GameState {
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
    [null, { card: startCard, scanned: false }, null],
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
    laserSelectedColor: null,
    scanNoMatch: false
  };
}
