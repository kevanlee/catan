// src/js/rulesEngine.js

import { catanRules } from "./rules/catanRules.js";

/**
 * Central place to expose game rules and rule helpers.
 */
export const rules = {
  summary: catanRules,

  initialize() {
    console.log("rules.initialize() called");
    return catanRules;
  },

  canBuildRoad() {
    console.warn("rules.canBuildRoad() is not implemented");
    return { valid: false, reason: "Not implemented" };
  }
};
