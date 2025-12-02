// gameplay.js

import { generateRandomBoard } from "./randomizer.js";
import { applyHexRendering } from "./renderBoard.js";

window.addEventListener("DOMContentLoaded", () => {
  // 1. Warn on refresh
  setupRefreshWarning();

  // 2. Generate random hex layout
  const randomHexes = generateRandomBoard();

  // 3. Render UI
  applyHexRendering(randomHexes);
});


function setupRefreshWarning() {
  // Warn on reload
  window.onbeforeunload = function () {
    return "Refreshing will generate a brand-new board. Are you sure?";
  };
}
