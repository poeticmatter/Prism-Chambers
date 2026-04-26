import { GameState } from '../types';
import { DIRS } from './CoreSystem';

export function fireLaser(s: GameState, dir: number) {
  if (!s.laserSelectedColor || s.crystals[s.laserSelectedColor] <= 0) return;

  const color = s.laserSelectedColor;
  s.crystals[color]--;

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
        if (outDoor.color === color) {
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
      if (inDoor.color === color) {
        inDoor.isOpen = true;
      } else {
        break; // Blocked entering
      }
    }
    // If we opened the entering door, the loop continues to exit that room.
  }
  s.laserSelectedColor = null;
}
