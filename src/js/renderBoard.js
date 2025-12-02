// renderBoard.js

export function applyHexRendering(hexes) {
  hexes.forEach(hex => {
    const elements = document.querySelectorAll(`.${hex.cssClass}`);

    elements.forEach(el => {
      el.classList.remove(
        "resource-sheep",
        "resource-wheat",
        "resource-wood",
        "resource-brick",
        "resource-ore",
        "resource-desert"
      );

      el.classList.add(`resource-${hex.resource}`);

      if (hex.resource === "desert") {
        el.textContent = "R"; // robber starts here
      } else {
        if (el.classList.contains("center")) {
          el.textContent = hex.dice;
        }
      }
    });
  });
}
