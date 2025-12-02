// src/js/players.js

export const players = {};

/**
 * Initializes the player model using player entries from the config.
 * This stub creates empty players with IDs.
 */
export function initPlayersFromConfig(playersConfig) {
  console.log("initPlayersFromConfig() called with:", playersConfig);

  Object.entries(playersConfig).forEach(([id, info]) => {
    players[id] = {
      id,
      type: info.type || "ai",
      resources: { brick: 0, wood: 0, sheep: 0, wheat: 0, ore: 0 },
      buildings: { settlements: [], cities: [], roads: [] },
      developmentCards: [],
      victoryPoints: 0,
      longestRoad: false,
      largestArmy: false,
      state: {
        hasRolled: false,
        mustDiscard: false,
        awaitingRobberChoice: false
      }
    };
  });

  console.log("Initialized players:", players);
}
