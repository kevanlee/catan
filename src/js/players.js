// src/js/players.js

export const players = {};

const AI_NAMES = [
  "Avery",
  "Diego",
  "Priya",
  "Noah",
  "Sofia",
  "Malik",
  "Harper",
  "Kenji",
  "Lena",
  "Zoe"
];

let aiNameQueue = [];

const DEFAULT_PLAYERS = {
  red: { type: "human" },
  blue: { type: "ai" },
  green: { type: "ai" },
  yellow: { type: "ai" }
};

function refillAINameQueue() {
  aiNameQueue = shuffleArray([...AI_NAMES]);
}

function getNextAIName() {
  if (aiNameQueue.length === 0) {
    refillAINameQueue();
  }

  return aiNameQueue.shift();
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Initializes the player model using player entries from the config.
 * This stub creates empty players with IDs.
 */
export function initPlayersFromConfig(playersConfig, { reset = true } = {}) {
  console.log("initPlayersFromConfig() called with:", playersConfig);

  if (reset) {
    resetPlayers();
  }

  refillAINameQueue();

  const config = playersConfig && Object.keys(playersConfig).length
    ? playersConfig
    : DEFAULT_PLAYERS;

  Object.entries(config).forEach(([id, info]) => {
    const type = info.type || "ai";

    players[id] = {
      id,
      type,
      name: info.name || (type === "human" ? "You" : getNextAIName()),
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
  aiNameQueue = [];
}
