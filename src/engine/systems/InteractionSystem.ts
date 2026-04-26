import { GameState, ColorStr } from '../types';
import { countMatches } from './CoreSystem';

export function scanRoom(s: GameState) {
  const { x, y } = s.playerPos;
  const slot = s.board[y][x];
  if (!slot) return;

  const loc = s.locations[y][x];
  const locCode = [...loc.code];
  loc.revealedIndices.forEach(i => { locCode[i] = 'U' as unknown as ColorStr; });

  let hadMatch = false;
  for (let cIdx = 0; cIdx < slot.card.code.length; cIdx++) {
    if (slot.card.revealedIndices.includes(cIdx)) continue;
    const c = slot.card.code[cIdx];
    const lIdx = locCode.indexOf(c);
    if (lIdx !== -1) {
      hadMatch = true;
      s.crystals[c]++;
      locCode[lIdx] = 'U' as unknown as ColorStr;
      slot.card.revealedIndices.push(cIdx);
      loc.revealedIndices.push(lIdx);
    }
  }

  slot.scanned = true;
  s.scanNoMatch = !hadMatch;
}

export function openTrapDoor(s: GameState) {
  const curSlot = s.board[1][1];
  if (curSlot) {
    if (countMatches(curSlot.card.code, s.locations[1][1].code) === 3) {
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
