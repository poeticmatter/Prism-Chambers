import { create } from 'zustand';
import { produce } from 'immer';
import { GameState, ColorStr } from './types';
import { createInitialState } from './systems/CoreSystem';
import { tryMove } from './systems/MovementSystem';
import { fireLaser } from './systems/LaserSystem';
import { scanRoom, openTrapDoor, rotateCardInHand, placeCard } from './systems/InteractionSystem';

interface GameStore extends GameState {
  actions: {
    restartGame: () => void;
    handleCardClick: (cardId: string, source: 'hand') => void;
    handleCellClick: (x: number, y: number) => void;
    fireLaser: (dir: number) => void;
    scanRoom: () => void;
    openTrapDoor: () => void;
    selectLaserColor: (color: ColorStr | null) => void;
  };
}

export const useStore = create<GameStore>((set, get) => ({
  ...createInitialState(),

  actions: {
    restartGame: () => set(createInitialState()),

    handleCardClick: (cardId: string, source: 'hand') =>
      set(produce((draft: GameState) => {
        if (draft.selectedCardId === cardId) {
          rotateCardInHand(draft, cardId);
        } else {
          draft.selectedCardId = cardId;
          draft.selectedCardSource = source;
          draft.laserSelectedColor = null;
        }
      })),

    handleCellClick: (x: number, y: number) =>
      set(produce((draft: GameState) => {
        if (draft.gameState !== 'playing') return;

        const isAdjacent = Math.abs(x - draft.playerPos.x) + Math.abs(y - draft.playerPos.y) === 1;
        const slot = draft.board[y][x];

        // Place card
        if (!slot && isAdjacent && draft.selectedCardId && draft.selectedCardSource) {
          placeCard(draft, x, y);
          return;
        }

        // Move to adjacent cell
        if (slot && isAdjacent && !draft.selectedCardId) {
          tryMove(draft, x, y);
        }
      })),

    fireLaser: (dir: number) =>
      set(produce((draft: GameState) => {
        fireLaser(draft, dir);
      })),

    scanRoom: () =>
      set(produce((draft: GameState) => {
        scanRoom(draft);
      })),

    openTrapDoor: () =>
      set(produce((draft: GameState) => {
        openTrapDoor(draft);
      })),

    selectLaserColor: (color: ColorStr | null) =>
      set(produce((draft: GameState) => {
        draft.laserSelectedColor = color;
        if (color) {
            draft.selectedCardId = null;
            draft.selectedCardSource = null;
        }
      }))
  }
}));
