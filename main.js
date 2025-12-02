import boardConfig from "./src/js/boardConfig.json";

import { initBoardStateFromConfig } from "./src/js/boardState.js";
import { initPlayersFromConfig }     from "./src/js/players.js";
import { initGameState }             from "./src/js/gameState.js";
import { rules }                     from "./src/js/rulesEngine.js";

import { attachEventHandlers }       from "./src/js/ui/events.js";
import { initAnimations }            from "./src/js/ui/animations.js";

initBoardStateFromConfig(boardConfig);
initPlayersFromConfig(boardConfig.players);
initGameState();

rules.initialize();

attachEventHandlers();
initAnimations();

console.log("Catan engine loaded.");



console.log("main.js is connected ✅");
