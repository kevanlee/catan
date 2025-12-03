// gameplay.js

import boardConfig from "./boardConfig.json";
import { generateRandomBoard } from "./randomizer.js";
import { applyHexRendering } from "./renderBoard.js";
import { initPlayersFromConfig, players } from "./players.js";
import { initGameState, setCurrentPlayer } from "./gameState.js";
import { initFloatingWindows } from "./ui/floatingWindows.js";

window.addEventListener("DOMContentLoaded", () => {
  setupRefreshWarning();
  startNewGame();
  initFloatingWindows();
});


function setupRefreshWarning() {
  window.onbeforeunload = function () {
    return "Refreshing will generate a brand-new board. Are you sure?";
  };
}

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
    const typeLabel = model?.type === "human" ? "You" : `Computer ${index}`;

    if (nameEl) {
      nameEl.textContent = typeLabel;
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
  logList.appendChild(item);
}
