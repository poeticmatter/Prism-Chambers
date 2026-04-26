# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server at http://localhost:3000
npm run build      # Production build
npm run lint       # Type-check with tsc --noEmit (no test runner configured)
npm run clean      # Remove dist/
```

## Architecture

The entire application lives in a single file: `src/App.tsx`. There is no routing, no API layer, and no backend. All game state is managed with a single `useState<GameState>` hook.

### State model

`GameState` holds:
- `board: (BoardSlot | null)[][]` — 3×3 grid of placed cards (center `[1][1]` is the starting room / trap door)
- `locations: Location[][]` — parallel 3×3 grid of hidden codes the player is trying to match
- `hand: Card[]` — cards not yet placed on the board
- `crystals: Record<ColorStr, number>` — player's R/G/B crystal inventory
- `playerPos`, `gameState`, `selectedCardId`, `laserSelectedColor` — interaction flags

### Core types

- `ColorStr = 'R' | 'G' | 'B'`
- `DoorColor = ColorStr | 'U'` (`'U'` = unlocked/opened door)
- `Card` — has a 3-color `code[]`, four `doors: DoorState[]` (indexed N/E/S/W in local space), a `rotation` (0–3), and `revealedIndices`
- `BoardSlot` — wraps a `Card` with a `crystalProduced` flag (crystals awarded once per room entry)

### Door rotation convention

Doors are stored in **local card space** (index 0 = North, 1 = East, 2 = South, 3 = West). The helper `getGlobalDoor(card, globalDir)` converts a world-space direction to a local door index using `(globalDir - card.rotation + 4) % 4`. Always use this function when checking passage between cells.

### Key interactions

| Action | Handler |
|---|---|
| Click hand card | `handleCardClick` — first click selects, second click (same card) rotates |
| Click board cell | `handleCellClick` — places selected card if empty + adjacent, or moves player if occupied + adjacent + doors open |
| Laser fire | `handleLaserClick(dir)` — spends one crystal, opens matching-color doors along a ray |
| Open trap door | `openTrapDoor` — checks if the center card's code fully matches location code; win or lose |

### Crystal production

When a player enters a new room (`tryMove`), matching colors between `card.code` and `location.code` are counted. Each match grants one crystal of that color, and both the card's and location's `revealedIndices` are updated. This only fires once per room (`crystalProduced` flag).

### State updates

All mutations go through `updateState(updater)`, which deep-clones state via `JSON.parse(JSON.stringify(...))` before calling the mutator. Never mutate `state` directly.

## Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin (no `tailwind.config.js` needed). The `cn()` utility in `src/lib/utils.ts` combines `clsx` + `tailwind-merge` for conditional class merging.
