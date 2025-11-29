// boardState.js
// Core data model for your Catan-like board on a 2D grid.
// Supports: 11-cell hexes, 1-cell roads, 1-cell vertices.

export const BOARD_ROWS = 13;   // adjust if your actual grid differs
export const BOARD_COLS = 36;

// ---------------------------
// Cell registry (visual layer)
// ---------------------------
//
// Every visual cell on the grid can be looked up by [row][col].
// Each cell knows what logical thing it represents, if any.
//
export const cells = Array.from({ length: BOARD_ROWS }, (_, r) =>
  Array.from({ length: BOARD_COLS }, (_, c) => ({
    row: r,
    col: c,
    type: "empty",   // "empty" | "hex" | "road" | "vertex"
    refId: null      // hexId / roadId / vertexId (string) or null
  }))
);

// ---------------------------
// Logical objects
// ---------------------------

/**
 * Hex tiles: 19 total.
 * Each hex knows:
 *  - id: "hex_0".."hex_18"
 *  - resource: "wood" | "brick" | "sheep" | "wheat" | "ore" | "desert" | null
 *  - dice: number | null
 *  - robber: boolean
 *  - cells: array of { row, col } (11 entries)
 *  - vertices: array of vertex ids (up to 6)
 */
export const hexes = {};

/**
 * Roads: ~72 total.
 * Each road knows:
 *  - id: "road_0".."road_71"
 *  - cell: { row, col } (single cell)
 *  - owner: player id or null
 *  - vertices: [vertexIdA, vertexIdB]  (the two intersections it connects)
 */
export const roads = {};

/**
 * Vertices (nexus points): ~54 total.
 * Each vertex knows:
 *  - id: "v_0".."v_53"
 *  - cell: { row, col } (single cell)
 *  - owner: player id or null
 *  - building: null | "settlement" | "city"
 *  - adjacentHexes: [hexId, ...]  (1–3 hexes)
 *  - adjacentVertices: [vertexId, ...] (used for distance rule)
 *  - adjacentRoads: [roadId, ...] (used for road placement / longest road)
 */
export const vertices = {};

// ---------------------------
// Helper registration functions
// ---------------------------

/**
 * Mark a list of grid cells as belonging to a given logical object.
 */
function attachCellsToBoard(cellsList, type, refId) {
  for (const { row, col } of cellsList) {
    const cell = cells[row][col];
    cell.type = type;
    cell.refId = refId;
  }
}

/**
 * Register a hex tile.
 * `opts` lets you optionally set resource, dice, robber, vertices.
 */
export function registerHex(id, cellsList, opts = {}) {
  hexes[id] = {
    id,
    resource: opts.resource ?? null,
    dice: opts.dice ?? null,
    robber: opts.robber ?? false,
    cells: cellsList,
    vertices: opts.vertices ?? []
  };

  attachCellsToBoard(cellsList, "hex", id);
}

/**
 * Register a road.
 */
export function registerRoad(id, cell, vertexA = null, vertexB = null) {
  roads[id] = {
    id,
    cell,
    owner: null,
    vertices: [vertexA, vertexB].filter(Boolean)
  };

  attachCellsToBoard([cell], "road", id);
}

/**
 * Register a vertex (settlement/city spot).
 */
export function registerVertex(id, cell, adjacentHexes = []) {
  vertices[id] = {
    id,
    cell,
    owner: null,
    building: null,
    adjacentHexes: [...adjacentHexes],
    adjacentVertices: [],
    adjacentRoads: []
  };

  attachCellsToBoard([cell], "vertex", id);
}

/**
 * Wire vertex-to-vertex adjacency (for distance rule).
 */
export function linkVertices(vIdA, vIdB) {
  const a = vertices[vIdA];
  const b = vertices[vIdB];
  if (!a || !b) return;
  if (!a.adjacentVertices.includes(vIdB)) a.adjacentVertices.push(vIdB);
  if (!b.adjacentVertices.includes(vIdA)) b.adjacentVertices.push(vIdA);
}

/**
 * Wire road-to-vertex adjacency.
 */
export function linkRoadToVertices(roadId, vIdA, vIdB) {
  const road = roads[roadId];
  if (!road) return;
  road.vertices = [vIdA, vIdB];

  for (const vId of [vIdA, vIdB]) {
    const v = vertices[vId];
    if (!v) continue;
    if (!v.adjacentRoads.includes(roadId)) v.adjacentRoads.push(roadId);
  }
}

/**
 * Convenience: get logical object from a grid click.
 */
export function getLogicalFromCell(row, col) {
  const cell = cells[row]?.[col];
  if (!cell || !cell.refId) return null;

  if (cell.type === "hex") return hexes[cell.refId];
  if (cell.type === "road") return roads[cell.refId];
  if (cell.type === "vertex") return vertices[cell.refId];
  return null;
}

// ---------------------------
// Example: how to fill it in
// ---------------------------
// Below is a small example for ONE hex, ONE road, and ONE vertex,
// to show you exactly how to wire your real coordinates from the grid.
//
// You will:
//   1) Look at your PNG / layout
//   2) For each hex, list its 11 (row,col) cells
//   3) Call registerHex("hex_0", [...]) for all 19 hexes
//   4) For each V cell, call registerVertex("v_X", {row,col}, [...])
//   5) For each R cell, call registerRoad("road_Y", {row,col}, vA, vB)
//   6) Use linkVertices / linkRoadToVertices to wire adjacency
//
// Once that’s done, the entire rules engine can sit on top of this.

export function initBoardState() {
  // === 1) Example hex (you will replace with real data) ===
  // Suppose your top-left yellow hex’s 11 cells are:
  // (NOTE: these row/col values are placeholders!)
  const exampleHexCells = [
    { row: 3, col: 8 },
    { row: 3, col: 9 },
    { row: 4, col: 7 },
    { row: 4, col: 8 },
    { row: 4, col: 9 },
    { row: 5, col: 7 },
    { row: 5, col: 8 },
    { row: 5, col: 9 },
    { row: 6, col: 8 },
    { row: 6, col: 9 },
    { row: 4, col: 10 }
  ];

  registerHex("hex_0", exampleHexCells, {
    resource: null,   // fill in later: "wheat", "wood", etc.
    dice: null,       // e.g. 6, 8, 3, etc.
    robber: false,
    vertices: ["v_0", "v_1", "v_2", "v_3", "v_4", "v_5"] // fill in real ones
  });

  // === 2) Example vertex ===
  registerVertex("v_0", { row: 2, col: 8 }, ["hex_0"]);
  // You’ll add more adjacentHex ids as needed.

  // === 3) Example road between v_0 and v_1 ===
  registerVertex("v_1", { row: 2, col: 10 }, ["hex_0"]);
  registerRoad("road_0", { row: 2, col: 9 }, "v_0", "v_1");
  linkRoadToVertices("road_0", "v_0", "v_1");

  // === 4) Example vertex-vertex adjacency ===
  linkVertices("v_0", "v_1");

  // Add your real hexes, roads, vertices here…
} // <-- closes initBoardState()

export { initBoardState };
