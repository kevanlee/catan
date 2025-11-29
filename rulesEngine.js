// rulesEngine.js
// Classic Catan-style rules engine wired to boardState.js

import { hexes, roads, vertices } from "./boardState.js";

// ---------------------------
// Player model and game state
// ---------------------------

export const RESOURCE_TYPES = ["brick", "wood", "sheep", "wheat", "ore"];

const EMPTY_RESOURCES = {
  brick: 0,
  wood: 0,
  sheep: 0,
  wheat: 0,
  ore: 0
};

function createPlayer(id, type) {
  return {
    id,
    type, // "human" or "ai"
    resources: { ...EMPTY_RESOURCES },
    buildings: {
      settlements: [], // vertex ids
      cities: [],      // vertex ids
      roads: []        // road ids
    },
    developmentCards: [], // not implemented yet
    victoryPoints: 0,
    longestRoad: false,
    largestArmy: false, // not implemented yet
    state: {
      hasRolled: false,
      canTrade: false,
      mustDiscard: false,
      awaitingRobberChoice: false
    }
  };
}

export const players = {
  red: createPlayer("red", "human"),
  blue: createPlayer("blue", "ai"),
  green: createPlayer("green", "ai"),
  yellow: createPlayer("yellow", "ai")
};

export const game = {
  turn: {
    currentPlayerId: "red",
    phase: "roll", // "roll" | "robber" | "action" | "end"
    rollValue: null
  },
  longestRoadOwnerId: null
};

// ---------------------------
// Costs
// ---------------------------

const COSTS = {
  road: { brick: 1, wood: 1 },
  settlement: { brick: 1, wood: 1, sheep: 1, wheat: 1 },
  city: { ore: 3, wheat: 2 }
};

// ---------------------------
// Utility getters
// ---------------------------

function getPlayer(playerId) {
  return players[playerId] || null;
}

function getHex(hexId) {
  return hexes[hexId] || null;
}

function getVertex(vertexId) {
  return vertices[vertexId] || null;
}

function getRoad(roadId) {
  return roads[roadId] || null;
}

function getCurrentPlayer() {
  return getPlayer(game.turn.currentPlayerId);
}

// ---------------------------
// Resource helpers
// ---------------------------

function getTotalResources(player) {
  return RESOURCE_TYPES.reduce((sum, r) => sum + player.resources[r], 0);
}

function hasResourcesFor(player, cost) {
  for (const r of RESOURCE_TYPES) {
    const need = cost[r] || 0;
    if (player.resources[r] < need) return false;
  }
  return true;
}

function spendResourcesFor(player, cost) {
  for (const r of RESOURCE_TYPES) {
    const need = cost[r] || 0;
    if (need > 0) {
      player.resources[r] -= need;
    }
  }
}

export function awardResource(playerId, resource, amount) {
  const p = getPlayer(playerId);
  if (!p || !RESOURCE_TYPES.includes(resource)) return;
  p.resources[resource] += amount;
}

// ---------------------------
// Victory points
// ---------------------------

function recalcVictoryPointsForPlayer(playerId) {
  const p = getPlayer(playerId);
  if (!p) return;

  let vp = 0;

  vp += p.buildings.settlements.length * 1;
  vp += p.buildings.cities.length * 2;

  if (p.longestRoad) vp += 2;
  if (p.largestArmy) vp += 2; // not fully implemented

  p.victoryPoints = vp;
}

// ---------------------------
// Turn management
// ---------------------------

export function startGame(startingPlayerId = "red") {
  if (!players[startingPlayerId]) {
    throw new Error("Invalid starting player id");
  }
  game.turn.currentPlayerId = startingPlayerId;
  game.turn.phase = "roll";
  game.turn.rollValue = null;
  Object.values(players).forEach(p => {
    p.state.hasRolled = false;
    p.state.canTrade = false;
    p.state.mustDiscard = false;
    p.state.awaitingRobberChoice = false;
  });
}

export function nextPlayer() {
  const order = ["red", "blue", "green", "yellow"];
  const currentIndex = order.indexOf(game.turn.currentPlayerId);
  const nextIndex = (currentIndex + 1) % order.length;
  game.turn.currentPlayerId = order[nextIndex];
  game.turn.phase = "roll";
  game.turn.rollValue = null;

  const p = getCurrentPlayer();
  if (p) {
    p.state.hasRolled = false;
    p.state.canTrade = false;
    p.state.awaitingRobberChoice = false;
  }
}

// ---------------------------
// Dice and robber
// ---------------------------

export function rollDice() {
  const d1 = Math.floor(Math.random() * 6) + 1;
  const d2 = Math.floor(Math.random() * 6) + 1;
  return d1 + d2;
}

export function rollDiceForCurrentPlayer() {
  const p = getCurrentPlayer();
  if (!p) return { valid: false, reason: "No current player" };
  if (game.turn.phase !== "roll") {
    return { valid: false, reason: "Not in roll phase" };
  }
  if (p.state.hasRolled) {
    return { valid: false, reason: "Player has already rolled" };
  }

  const value = rollDice();
  game.turn.rollValue = value;
  p.state.hasRolled = true;

  if (value === 7) {
    enforceRobberDiscards();
    game.turn.phase = "robber";
    p.state.awaitingRobberChoice = true;
  } else {
    applyDiceRoll(value);
    game.turn.phase = "action";
    p.state.canTrade = true;
  }

  return { valid: true, value };
}

export function applyDiceRoll(value) {
  // For each hex with matching dice and robber not present,
  // award resources to adjacent settlements/cities.
  Object.values(hexes).forEach(hex => {
    if (!hex) return;
    if (hex.dice !== value) return;
    if (hex.robber) return;
    if (!hex.resource) return;

    if (!hex.vertices || !Array.isArray(hex.vertices)) return;

    hex.vertices.forEach(vId => {
      const v = getVertex(vId);
      if (!v || !v.owner) return;

      const playerId = v.owner;
      const amount = v.building === "city" ? 2 : 1;
      awardResource(playerId, hex.resource, amount);
    });
  });
}

function enforceRobberDiscards() {
  // Simple implementation: any player with more than 7 total cards
  // discards half (rounded down) at random.
  Object.values(players).forEach(player => {
    const total = getTotalResources(player);
    if (total > 7) {
      player.state.mustDiscard = true;
      let toDiscard = Math.floor(total / 2);

      while (toDiscard > 0) {
        const available = RESOURCE_TYPES.filter(
          r => player.resources[r] > 0
        );
        if (!available.length) break;
        const r =
          available[Math.floor(Math.random() * available.length)];
        player.resources[r] -= 1;
        toDiscard -= 1;
      }

      player.state.mustDiscard = false;
    }
  });
}

export function canMoveRobber(playerId, hexId) {
  const p = getPlayer(playerId);
  if (!p) return { valid: false, reason: "Invalid player" };
  if (game.turn.phase !== "robber") {
    return { valid: false, reason: "Not robber phase" };
  }

  const hex = getHex(hexId);
  if (!hex) return { valid: false, reason: "Invalid hex" };
  if (hex.robber) return { valid: false, reason: "Robber already here" };

  return { valid: true };
}

export function applyMoveRobber(playerId, hexId, stealFromPlayerId = null) {
  const can = canMoveRobber(playerId, hexId);
  if (!can.valid) return can;

  // Clear robber from all hexes and set on new one
  Object.values(hexes).forEach(h => {
    if (!h) return;
    h.robber = false;
  });
  const hex = getHex(hexId);
  hex.robber = true;

  // Find possible victims (players with adjacent buildings)
  const victims = new Set();
  if (hex.vertices) {
    hex.vertices.forEach(vId => {
      const v = getVertex(vId);
      if (v && v.owner && v.owner !== playerId) {
        victims.add(v.owner);
      }
    });
  }

  const victimList = Array.from(victims);
  let victimId = stealFromPlayerId;

  if (!victimId || !victims.has(victimId)) {
    // If no valid victim specified, just pick one at random if available
    if (victimList.length > 0) {
      victimId =
        victimList[Math.floor(Math.random() * victimList.length)];
    }
  }

  if (victimId) {
    stealRandomResource(playerId, victimId);
  }

  const p = getPlayer(playerId);
  if (p) {
    p.state.awaitingRobberChoice = false;
  }
  game.turn.phase = "action";

  return { valid: true };
}

function stealRandomResource(toPlayerId, fromPlayerId) {
  const from = getPlayer(fromPlayerId);
  const to = getPlayer(toPlayerId);
  if (!from || !to) return;

  const total = getTotalResources(from);
  if (total === 0) return;

  const pool = [];
  RESOURCE_TYPES.forEach(r => {
    for (let i = 0; i < from.resources[r]; i++) {
      pool.push(r);
    }
  });

  if (!pool.length) return;
  const res = pool[Math.floor(Math.random() * pool.length)];

  from.resources[res] -= 1;
  to.resources[res] += 1;
}

// ---------------------------
// Placement rules
// ---------------------------

export function canBuildRoad(playerId, roadId) {
  const player = getPlayer(playerId);
  if (!player) return { valid: false, reason: "Invalid player" };

  const road = getRoad(roadId);
  if (!road) return { valid: false, reason: "Invalid road" };
  if (road.owner) return { valid: false, reason: "Road already owned" };

  if (!hasResourcesFor(player, COSTS.road)) {
    return { valid: false, reason: "Not enough resources" };
  }

  // Must connect to existing road or building of the same player
  if (!road.vertices || road.vertices.length !== 2) {
    return { valid: false, reason: "Road vertices not wired" };
  }

  const [vAId, vBId] = road.vertices;
  const vA = getVertex(vAId);
  const vB = getVertex(vBId);
  if (!vA || !vB) {
    return { valid: false, reason: "Invalid road endpoints" };
  }

  const connectsToBuilding =
    (vA.owner === playerId) || (vB.owner === playerId);

  const connectsToRoad =
    vertexHasPlayerRoad(vAId, playerId) ||
    vertexHasPlayerRoad(vBId, playerId);

  if (!connectsToBuilding && !connectsToRoad) {
    return {
      valid: false,
      reason: "Road must connect to your road or building"
    };
  }

  return { valid: true };
}

function vertexHasPlayerRoad(vertexId, playerId) {
  const v = getVertex(vertexId);
  if (!v || !Array.isArray(v.adjacentRoads)) return false;
  return v.adjacentRoads.some(rId => {
    const r = getRoad(rId);
    return r && r.owner === playerId;
  });
}

export function applyBuildRoad(playerId, roadId) {
  const can = canBuildRoad(playerId, roadId);
  if (!can.valid) return can;

  const player = getPlayer(playerId);
  const road = getRoad(roadId);

  spendResourcesFor(player, COSTS.road);
  road.owner = playerId;
  player.buildings.roads.push(roadId);

  recalcLongestRoad();
  recalcVictoryPointsForPlayer(playerId);

  return { valid: true };
}

export function canBuildSettlement(playerId, vertexId) {
  const player = getPlayer(playerId);
  if (!player) return { valid: false, reason: "Invalid player" };

  const v = getVertex(vertexId);
  if (!v) return { valid: false, reason: "Invalid vertex" };

  if (v.owner) {
    return { valid: false, reason: "Vertex already occupied" };
  }

  if (!hasResourcesFor(player, COSTS.settlement)) {
    return { valid: false, reason: "Not enough resources" };
  }

  // Distance rule: no adjacent vertex can have any building
  if (Array.isArray(v.adjacentVertices)) {
    for (const nId of v.adjacentVertices) {
      const n = getVertex(nId);
      if (n && n.owner) {
        return {
          valid: false,
          reason: "Settlements must be at least 2 vertices apart"
        };
      }
    }
  }

  // Must be connected to player's road
  const connectedToRoad = vertexHasPlayerRoad(vertexId, playerId);
  if (!connectedToRoad) {
    return {
      valid: false,
      reason: "Settlement must connect to one of your roads"
    };
  }

  return { valid: true };
}

export function applyBuildSettlement(playerId, vertexId) {
  const can = canBuildSettlement(playerId, vertexId);
  if (!can.valid) return can;

  const player = getPlayer(playerId);
  const v = getVertex(vertexId);

  spendResourcesFor(player, COSTS.settlement);

  v.owner = playerId;
  v.building = "settlement";

  player.buildings.settlements.push(vertexId);
  recalcVictoryPointsForPlayer(playerId);

  return { valid: true };
}

export function canUpgradeCity(playerId, vertexId) {
  const player = getPlayer(playerId);
  if (!player) return { valid: false, reason: "Invalid player" };

  const v = getVertex(vertexId);
  if (!v) return { valid: false, reason: "Invalid vertex" };

  if (v.owner !== playerId) {
    return { valid: false, reason: "You do not own this settlement" };
  }

  if (v.building !== "settlement") {
    return { valid: false, reason: "Only settlements can be upgraded" };
  }

  if (!hasResourcesFor(player, COSTS.city)) {
    return { valid: false, reason: "Not enough resources" };
  }

  return { valid: true };
}

export function applyUpgradeCity(playerId, vertexId) {
  const can = canUpgradeCity(playerId, vertexId);
  if (!can.valid) return can;

  const player = getPlayer(playerId);
  const v = getVertex(vertexId);

  spendResourcesFor(player, COSTS.city);

  v.building = "city";

  // Move from settlements to cities list
  player.buildings.settlements = player.buildings.settlements.filter(
    id => id !== vertexId
  );
  if (!player.buildings.cities.includes(vertexId)) {
    player.buildings.cities.push(vertexId);
  }

  recalcVictoryPointsForPlayer(playerId);

  return { valid: true };
}

// ---------------------------
// Longest road calculation
// ---------------------------

function buildRoadAdjacencyForPlayer(playerId) {
  const adj = {};
  const ownedRoadIds = [];

  Object.values(roads).forEach(r => {
    if (r && r.owner === playerId) {
      adj[r.id] = [];
      ownedRoadIds.push(r.id);
    }
  });

  const ownedSet = new Set(ownedRoadIds);

  // For each vertex, connect adjacent roads owned by player,
  // unless blocked by another player's building on that vertex.
  Object.values(vertices).forEach(v => {
    if (!v || !Array.isArray(v.adjacentRoads)) return;

    // Blocked if vertex has building owned by someone else
    if (v.owner && v.owner !== playerId) return;

    const localRoads = v.adjacentRoads.filter(rId => ownedSet.has(rId));
    for (let i = 0; i < localRoads.length; i++) {
      for (let j = i + 1; j < localRoads.length; j++) {
        const rA = localRoads[i];
        const rB = localRoads[j];
        if (!adj[rA].includes(rB)) adj[rA].push(rB);
        if (!adj[rB].includes(rA)) adj[rB].push(rA);
      }
    }
  });

  return adj;
}

function longestPathInRoadGraph(adj) {
  const roadIds = Object.keys(adj);
  let best = 0;

  function dfs(currentId, visited) {
    const length = visited.size;
    if (length > best) best = length;

    const neighbors = adj[currentId] || [];
    for (const nId of neighbors) {
      if (!visited.has(nId)) {
        visited.add(nId);
        dfs(nId, visited);
        visited.delete(nId);
      }
    }
  }

  roadIds.forEach(startId => {
    const visited = new Set([startId]);
    dfs(startId, visited);
  });

  return best;
}

function recalcLongestRoad() {
  let bestPlayerId = null;
  let bestLength = 0;

  Object.values(players).forEach(p => {
    const adj = buildRoadAdjacencyForPlayer(p.id);
    const length = longestPathInRoadGraph(adj);
    // Longest road must be at least 5 segments
    if (length >= 5 && length > bestLength) {
      bestLength = length;
      bestPlayerId = p.id;
    }
  });

  // Reset flags
  Object.values(players).forEach(p => {
    p.longestRoad = false;
  });

  if (bestPlayerId) {
    players[bestPlayerId].longestRoad = true;
  }

  game.longestRoadOwnerId = bestPlayerId;

  // Recalc victory points because longest road changed
  Object.values(players).forEach(p => {
    recalcVictoryPointsForPlayer(p.id);
  });
}

// ---------------------------
// Convenience action wrappers
// ---------------------------

export function endTurn() {
  if (game.turn.phase !== "action") {
    return { valid: false, reason: "You must finish action phase first" };
  }
  game.turn.phase = "end";
  nextPlayer();
  return { valid: true };
}
