import { GameState } from '../types';
import { positionMatchCount } from './CoreSystem';

export function scanRoom(s: GameState) {
  const { x, y } = s.playerPos;
  const slot = s.board[y][x];
  if (!slot) return;

  const loc = s.locations[y][x];
  let hadMatch = false;

  for (let i = 0; i < slot.card.code.length; i++) {
    if (slot.card.revealedIndices.includes(i)) continue;
    if (loc.revealedIndices.includes(i)) continue;
    if (slot.card.code[i] === loc.code[i]) {
      hadMatch = true;
      s.crystals[slot.card.code[i]]++;
      slot.card.revealedIndices.push(i);
      loc.revealedIndices.push(i);
    }
  }

  slot.scanned = true;
  s.scanNoMatch = !hadMatch;
}

export function openTrapDoor(s: GameState) {
  const curSlot = s.board[1][1];
  if (curSlot) {
    if (positionMatchCount(curSlot.card.code, s.locations[1][1].code) === 2) {
      s.gameState = 'won';
    } else {
      s.gameState = 'lost';
    }
  }
}

export function rotateCardInHand(s: GameState, cardId: string) {
  const c = s.hand.find(x => x.id === cardId);
  if (c) c.rotation = (c.rotation + 1) % 4;
}

export function placeCard(s: GameState, x: number, y: number) {
  const sourceArr = s.hand;
  const cardIdx = sourceArr.findIndex(c => c.id === s.selectedCardId);
  if (cardIdx !== -1) {
    const card = sourceArr[cardIdx];
    sourceArr.splice(cardIdx, 1);
    s.board[y][x] = { card, scanned: false };
    s.selectedCardId = null;
    s.selectedCardSource = null;
  }
}
