// src/js/gameState.js

export const game = {
  turn: {
    currentPlayerId: null,
    phase: "roll",
    rollValue: null
  },
  robberHexId: null
};

/**
 * Initializes core mutable game state.
 */
export function initGameState() {
  console.log("initGameState() called");

  game.turn.currentPlayerId = "red";  // default
  game.turn.phase = "roll";
  game.turn.rollValue = null;
  game.robberHexId = null;

  console.log("Initialized game state:", game);
}
