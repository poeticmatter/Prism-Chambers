export type ColorStr = 'R' | 'G' | 'B';
export type DoorColor = ColorStr | 'U';

export interface DoorState {
  color: DoorColor;
  isOpen: boolean;
}

export interface Card {
  id: string;
  code: ColorStr[];
  doors: DoorState[];
  rotation: number;
  revealedIndices: number[];
}

export interface BoardSlot {
  card: Card;
  scanned: boolean;
}

export interface Location {
  code: ColorStr[];
  revealedIndices: number[];
}

export interface GameState {
  locations: Location[][];
  board: (BoardSlot | null)[][];
  hand: Card[];
  playerPos: { x: number; y: number };
  crystals: Record<ColorStr, number>;
  gameState: 'playing' | 'won' | 'lost';
  selectedCardId: string | null;
  selectedCardSource: 'hand' | null;
  laserSelectedColor: ColorStr | null;
  scanNoMatch: boolean;
}
