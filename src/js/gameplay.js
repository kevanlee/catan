// gameplay.js

import boardConfig from "./boardConfig.json";
import { generateRandomBoard } from "./randomizer.js";
import { applyHexRendering } from "./renderBoard.js";
import { initPlayersFromConfig, players } from "./players.js";
import { initGameState, setCurrentPlayer } from "./gameState.js";
import { initFloatingWindows } from "./ui/floatingWindows.js";

window.addEventListener("DOMContentLoaded", () => {
  startNewGame();
  initFloatingWindows();
  disablePrimaryActions();
  setupDiceUI();
});

function startNewGame() {
  initPlayersFromConfig(boardConfig.players);

  const randomHexes = generateRandomBoard();
  applyHexRendering(randomHexes);

  const humanPlayerId = getHumanPlayerId() || Object.keys(players)[0];
  initGameState(humanPlayerId, "setup");
  updatePlayerBar(humanPlayerId);
  resetLog();
  logEvent("New game started. Hex tiles shuffled and dice assigned.");
  logEvent("Your turn to place the first village and road.");
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
