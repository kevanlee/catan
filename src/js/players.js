// src/js/players.js

export const players = {};

const DEFAULT_PLAYERS = {
  red: { type: "human" },
  blue: { type: "ai" },
  green: { type: "ai" },
  yellow: { type: "ai" }
};

/**
 * Initializes the player model using player entries from the config.
 * This stub creates empty players with IDs.
 */
export function initPlayersFromConfig(playersConfig, { reset = true } = {}) {
  console.log("initPlayersFromConfig() called with:", playersConfig);

  if (reset) {
    resetPlayers();
  }

  const config = playersConfig && Object.keys(playersConfig).length
    ? playersConfig
    : DEFAULT_PLAYERS;

  Object.entries(config).forEach(([id, info]) => {
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

export function resetPlayers() {
  Object.keys(players).forEach(id => delete players[id]);
}
