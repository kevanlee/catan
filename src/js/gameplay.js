// gameplay.js

import boardConfig from "./boardConfig.json";
import { generateRandomBoard } from "./randomizer.js";
import { applyHexRendering } from "./renderBoard.js";
import { initPlayersFromConfig, players } from "./players.js";
import { initGameState, setCurrentPlayer } from "./gameState.js";
import { initFloatingWindows } from "./ui/floatingWindows.js";

const SETUP_THINK_TIME_MS = 850;

window.addEventListener("DOMContentLoaded", async () => {
  prepareSetupModal();
  showSetupModal("Setting up the game board…", { loading: true });
  await startNewGame();
  initFloatingWindows({ startMinimized: true });
  disablePrimaryActions();
  setupDiceUI();
});

async function startNewGame() {
  initPlayersFromConfig(boardConfig.players);

  const randomHexes = generateRandomBoard();
  applyHexRendering(randomHexes);

  const humanPlayerId = getHumanPlayerId() || Object.keys(players)[0];
  initGameState(humanPlayerId, "setup");
  updatePlayerBar(humanPlayerId);
  resetLog();
  logEvent("New game started. Hex tiles shuffled and dice assigned.");
  logEvent("Initial settlement and road placements begin (snake order).");

  await runSetupPhase(humanPlayerId);
}

function getHumanPlayerId() {
  return Object.values(players).find(p => p.type === "human")?.id || null;
}

function updatePlayerBar(activePlayerId) {
  const playerEls = document.querySelectorAll(".players .player");

  playerEls.forEach((el, index) => {
    const playerId = el.dataset.playerId;
    const model = players[playerId];
    const nameEl = el.querySelector(".player-name");
    const pointsEl = el.querySelector(".player-points");
    const displayName = model?.type === "human"
      ? (model?.name || "You")
      : (model?.name || `Computer ${index + 1}`);

    if (nameEl) {
      nameEl.textContent = displayName;
    }

    if (pointsEl && model) {
      pointsEl.textContent = model.victoryPoints ?? 0;
    }

    if (playerId === activePlayerId) {
      el.classList.add("is-active");
    } else {
      el.classList.remove("is-active");
    }
  });

  if (activePlayerId) {
    setCurrentPlayer(activePlayerId, "setup");
  }
}

function resetLog() {
  const logList = document.querySelector("#game-log ul");
  if (logList) {
    logList.innerHTML = "";
  }
}

function logEvent(message) {
  const logList = document.querySelector("#game-log ul");
  if (!logList) return;

  const item = document.createElement("li");
  item.textContent = message;
  logList.prepend(item);
}

function setupDiceUI() {
  const rollButton = document.getElementById("roll-dice-btn");
  const leftDieEl = document.getElementById("left-die");
  const rightDieEl = document.getElementById("right-die");
  const totalEl = document.getElementById("dice-total");

  if (!rollButton || !leftDieEl || !rightDieEl || !totalEl) return;

  rollButton.addEventListener("click", () => {
    animateDiceRoll({ rollButton, leftDieEl, rightDieEl, totalEl });
  });
}

function animateDiceRoll({ rollButton, leftDieEl, rightDieEl, totalEl }) {
  if (rollButton.disabled) return;

  rollButton.disabled = true;
  totalEl.textContent = "";

  const interval = setInterval(() => {
    leftDieEl.textContent = getRandomDieValue();
    rightDieEl.textContent = getRandomDieValue();
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    const leftValue = getRandomDieValue();
    const rightValue = getRandomDieValue();
    leftDieEl.textContent = leftValue;
    rightDieEl.textContent = rightValue;
    totalEl.textContent = leftValue + rightValue;
    rollButton.disabled = false;
  }, 1000);
}

function getRandomDieValue() {
  return Math.floor(Math.random() * 6) + 1;
}

function disablePrimaryActions() {
  const primaryButtons = document.querySelectorAll(".action-buttons .btn");
  primaryButtons.forEach(btn => {
    btn.disabled = true;
  });
}

function getSetupOrder(humanPlayerId) {
  const ids = Object.keys(players);
  const startIdx = ids.indexOf(humanPlayerId);

  if (startIdx === -1) {
    return ids;
  }

  return [...ids.slice(startIdx), ...ids.slice(0, startIdx)];
}

async function runSetupPhase(humanPlayerId) {
  const orderedPlayers = getSetupOrder(humanPlayerId);
  const placements = [
    ...orderedPlayers.map(id => ({ playerId: id, placement: 1 })),
    ...[...orderedPlayers].reverse().map(id => ({ playerId: id, placement: 2 }))
  ];

  for (const action of placements) {
    await handleSetupTurn(action);
  }

  logEvent("All starting settlements and roads have been placed.");
  setCurrentPlayer(humanPlayerId, "roll");
  updatePlayerBar(humanPlayerId);
  showSetupModal("Setup complete! Your normal turn will begin.", { loading: false });
  setTimeout(hideSetupModal, 1600);
}

async function handleSetupTurn({ playerId, placement }) {
  const player = players[playerId];
  const isHuman = player?.type === "human";
  const ordinal = placement === 1 ? "first" : "second";

  updatePlayerBar(playerId);

  if (isHuman) {
    showSetupModal(`It's your turn to place your ${ordinal} settlement and road.`, { loading: false });
    await delay(400);
  } else {
    showSetupModal(`${player?.name || "Computer"} is thinking…`, { loading: true });
    await delay(SETUP_THINK_TIME_MS);
  }

  recordSetupPlacement(playerId, placement);
  logEvent(`${player?.name || playerId} placed their ${ordinal} settlement and road.`);
}

function recordSetupPlacement(playerId, placementNumber) {
  const player = players[playerId];
  if (!player) return;

  const settlementId = `setup_settlement_${placementNumber}_${playerId}`;
  const roadId = `setup_road_${placementNumber}_${playerId}`;

  if (!player.buildings.settlements.find(s => s.id === settlementId)) {
    player.buildings.settlements.push({ id: settlementId, phase: "setup" });
  }

  if (!player.buildings.roads.find(r => r.id === roadId)) {
    player.buildings.roads.push({ id: roadId, phase: "setup" });
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function prepareSetupModal() {
  const modal = document.getElementById("setup-modal");
  if (!modal) return;

  modal.classList.add("is-visible");
}

function showSetupModal(message, { loading = false } = {}) {
  const modal = document.getElementById("setup-modal");
  const messageEl = document.getElementById("setup-modal-message");
  const spinner = document.getElementById("setup-modal-spinner");

  if (!modal || !messageEl || !spinner) return;

  messageEl.textContent = message;
  modal.classList.add("is-visible");
  spinner.classList.toggle("is-hidden", !loading);
}

function hideSetupModal() {
  const modal = document.getElementById("setup-modal");
  if (!modal) return;

  modal.classList.remove("is-visible");
}
