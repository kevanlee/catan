console.log("main.js is connected ✅");

const board = document.getElementById("board");
const rows = 13;
const cols = 36;

for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    const cell = document.createElement("div");
    cell.classList.add("cell", `cell-${r}-${c}`);
    board.appendChild(cell);
  }
}

import { initBoardState, cells, getLogicalFromCell } from "./boardState.js";

initBoardState();

// Example click handler:
boardElement.addEventListener("click", (e) => {
  const { row, col } = getRowColFromElement(e.target); // however you map DOM → row/col
  const obj = getLogicalFromCell(row, col);
  console.log(obj);
});

import { initBoardState } from "./boardState.js";
import {
  startGame,
  rollDiceForCurrentPlayer,
  applyBuildRoad,
  applyBuildSettlement,
  applyUpgradeCity,
  canMoveRobber,
  applyMoveRobber,
  endTurn,
  players,
  game
} from "./rulesEngine.js";

initBoardState();
startGame("red");

// then hook these up to your UI clicks
// e.g. on road cell click: call applyBuildRoad("red", "road_12"), etc.
