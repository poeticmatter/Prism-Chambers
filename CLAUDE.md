# Prism Chambers Architecture

## Overview
Prism Chambers uses a strict Data-Oriented Design and unidirectional data flow pattern. The presentation (React) is completely decoupled from the game logic (Engine).

## Core Architecture

### `src/engine/` (Domain Logic)
This directory acts as the ultimate source of truth for the game rules and mechanical outcomes.
- **Store (`store.ts`)**: Uses Zustand to hold application state. The store acts purely as a boundary layer (Command Dispatcher). UI intents map to specific actions which wrap Immer's `produce`.
- **Systems (`systems/`)**: Pure TypeScript functions that mutate the game state draft provided by Immer. Examples include `MovementSystem.ts` and `LaserSystem.ts`. These systems know nothing about the UI or Zustand.
- **Types (`types.ts`)**: The domain definitions (GameState, Card, etc.).

### `src/components/` (Presentation Layer)
A highly cohesive React component hierarchy grouped by feature domain:
- **`board/`**: Components responsible for the grid, room cells, and specific card interactions on the board.
- **`hud/`**: Displays player inventory, cards in hand, controls, and general game info.
- **`overlays/`**: Game end conditions (Win/Loss screens).

### Data Flow (Command/Action Pattern)
1. **UI Intent**: A user clicks a component (e.g., `handleCardClick`).
2. **Dispatch**: The UI calls an action exposed by `useStore.getState().actions`.
3. **Draft/Commit**: The Zustand action creates an Immer draft, determines the intent (e.g., evaluating if a card should be selected vs. rotated), and routes it to the corresponding pure engine system function.
4. **Render**: Components are deeply subscribed to specific state slices via `useStore` and `useShallow` to prevent unpredictable closures, massive prop chains, and unnecessary global re-renders.

## Pitfalls to Avoid
- **Logic Leakage**: Do not implement game rules in the UI layer. Ensure conditionals like "can the player move?" are handled purely within the engine systems.
- **Over-Subscription**: Always use slice subscriptions or `useShallow` when subscribing to objects/arrays from the store to avoid performance bottlenecks.
