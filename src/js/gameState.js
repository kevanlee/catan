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
export function initGameState(startingPlayerId = "red", startingPhase = "roll") {
  console.log("initGameState() called");

  game.turn.currentPlayerId = startingPlayerId;
  game.turn.phase = startingPhase;
  game.turn.rollValue = null;
  game.robberHexId = null;

  console.log("Initialized game state:", game);
}

export function setCurrentPlayer(playerId, phase = "roll") {
  game.turn.currentPlayerId = playerId;
  game.turn.phase = phase;
  game.turn.rollValue = null;
}
