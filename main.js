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
