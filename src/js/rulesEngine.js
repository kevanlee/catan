// src/js/rulesEngine.js

/**
 * This will eventually contain your full rules logic.
 */
export const rules = {
  initialize() {
    console.log("rules.initialize() called");
    // In the future:
    // - setup rule checks
    // - preload adjacency
    // - preload resource payout logic
  },

  canBuildRoad() {
    console.warn("rules.canBuildRoad() is not implemented");
    return { valid: false, reason: "Not implemented" };
  }
};
