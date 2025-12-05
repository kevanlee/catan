// src/js/rules/catanRules.js
// A lightweight, human-readable summary of core Settlers of Catan rules.

export const catanRules = {
  title: "Settlers of Catan Core Rules",
  setup: [
    "Each player starts with 2 settlements and 2 roads placed during the setup phase.",
    "Turn order for setup is snake draft style: 1 ➜ 2 ➜ 3 ➜ 4, then 4 ➜ 3 ➜ 2 ➜ 1.",
    "The robber begins on the desert tile; no resources are produced from that hex.",
    "Each player begins with 0 resources until production starts after setup."
  ],
  turns: [
    "On your turn, roll two dice and produce resources for all players with settlements adjacent to matching hex numbers.",
    "You may trade with the bank (4:1), with ports (3:1 or 2:1 matching the port), or with other players by mutual agreement.",
    "You may build roads (1 brick, 1 wood), settlements (1 brick, 1 wood, 1 wheat, 1 sheep), cities (2 wheat, 3 ore), and development cards (1 sheep, 1 wheat, 1 ore).",
    "Upgrading a settlement to a city replaces the settlement and increases resource production to two cards from adjacent hexes.",
    "Development cards are played on your turn except Victory Point cards, which remain hidden until scoring."
  ],
  robber: [
    "If a 7 is rolled, all players with more than seven resource cards must discard half (rounded down).",
    "The current player moves the robber to any hex, blocking its production until moved again.",
    "After moving the robber, the current player steals one random resource card from an opponent with a settlement or city adjacent to the robber's new hex."
  ],
  achievements: [
    "Longest Road (2 victory points) requires a continuous road of at least 5 segments and more than any other player.",
    "Largest Army (2 victory points) requires playing at least 3 knight cards and more than any other player.",
    "First player to reach 10 victory points wins the game."
  ]
};
