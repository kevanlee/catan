// src/js/boardState.js

export const hexes = {};
export const vertices = {};
export const roads = {};

/**
 * Initializes board geometry/state using boardConfig.json.
 * This stub simply logs the config and returns.
 */
export function initBoardStateFromConfig(config) {
  config.hexes.forEach(hexCfg => {
    // Store logical hex
    hexes[hexCfg.id] = {
      ...hexCfg,
      elements: [...document.querySelectorAll(`.${hexCfg.cssClass}`)]
    };

    // Apply UI styles immediately
    applyHexUI(hexes[hexCfg.id]);
  });

  console.log("Board hexes:", hexes);
}

function applyHexUI(hex) {
  hex.elements.forEach(el => {
    el.classList.add(`resource-${hex.resource}`);
    el.dataset.dice = hex.dice;

    // Optional: show dice number only on center cells if you tag them
    if (el.classList.contains("top") || el.classList.contains("bottom")) {
      // skip printing number
    } else if (el.classList.contains("center")) {
      el.textContent = hex.dice;  
    }
  });
}
