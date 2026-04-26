import { GameState, Card } from '../types';
import { positionMatchCount } from './CoreSystem';

export function getGlobalDoor(card: Card, globalDir: number) {
  const localDir = (globalDir - card.rotation + 4) % 4;
  return card.doors[localDir];
}

export function tryMove(s: GameState, targetX: number, targetY: number): boolean {
  let dir = -1;
  const dx = targetX - s.playerPos.x;
  const dy = targetY - s.playerPos.y;

  if (dy === -1) dir = 0; // N
  else if (dx === 1) dir = 1;  // E
  else if (dy === 1) dir = 2;  // S
  else if (dx === -1) dir = 3; // W

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
    s.scanNoMatch = false;

    const oldSlot = s.board[py][px]!;
    const oldLoc = s.locations[py][px];

    const isCentral = px === 1 && py === 1;
    if (isCentral || positionMatchCount(oldSlot.card.code, oldLoc.code) !== 2) {
      s.board[py][px] = null;
      s.hand.push(oldSlot.card);
    }

    return true;
  }
  return false;
}
