// randomizer.js

const RESOURCES = [
  "sheep", "sheep", "sheep", "sheep",
  "wheat", "wheat", "wheat", "wheat",
  "wood", "wood", "wood", "wood",
  "brick", "brick", "brick",
  "ore", "ore", "ore",
  "desert"
];

const DICE_VALUES = [
  2, 3, 3, 4, 4, 5,
  5, 6, 6, 8, 8, 9, 9, 10, 10, 11, 11, 12
];

export function generateRandomBoard() {
  // Shuffle arrays
  const shuffledResources = shuffle([...RESOURCES]);
  const shuffledDice = shuffle([...DICE_VALUES]);

  const hexes = [];

  for (let i = 0; i < shuffledResources.length; i++) {
    const resource = shuffledResources[i];
    
    if (resource === "desert") {
      hexes.push({
        id: `hex_${i}`,
        resource,
        dice: null,
        cssClass: `h-${i+1}`
      });
    } else {
      hexes.push({
        id: `hex_${i}`,
        resource,
        dice: shuffledDice.pop(),
        cssClass: `h-${i+1}`
      });
    }
  }

  return hexes;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
