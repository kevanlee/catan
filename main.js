const HEX_SIZE = 60;
const WIDTH = HEX_SIZE * Math.sqrt(3);
const HEIGHT = HEX_SIZE * 2;
const RADIUS = 2; // Catan = 19 tiles

function generateHexes(radius) {
  const hexes = [];
  for (let q = -radius; q <= radius; q++) {
    for (let r = -radius; r <= radius; r++) {
      if (Math.abs(q + r) <= radius) {
        hexes.push({ q, r });
      }
    }
  }
  return hexes;
}

function hexToPixel(q, r) {
  return {
    x: WIDTH * (q + r / 2),
    y: HEIGHT * (3 / 4) * r
  };
}

function hexPolygon(x, y, size) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = Math.PI / 180 * (60 * i - 30);
    pts.push([
      x + size * Math.cos(angle),
      y + size * Math.sin(angle)
    ]);
  }
  return pts.map(p => p.join(",")).join(" ");
}

function drawHexes(svg, hexes) {
  hexes.forEach(h => {
    const { x, y } = hexToPixel(h.q, h.r);

    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", hexPolygon(x, y, HEX_SIZE));
    poly.dataset.q = h.q;
    poly.dataset.r = h.r;
    poly.classList.add("hex");

    svg.appendChild(poly);
  });
}

function drawEdges(svg, hexes) {
  hexes.forEach(h => {
    const { x, y } = hexToPixel(h.q, h.r);

    for (let dir = 0; dir < 6; dir++) {
      const angle = Math.PI / 180 * (60 * dir - 30);
      const ex = x + HEX_SIZE * Math.cos(angle);
      const ey = y + HEX_SIZE * Math.sin(angle);

      const nx = x + HEX_SIZE * Math.cos(angle + Math.PI / 6);
      const ny = y + HEX_SIZE * Math.sin(angle + Math.PI / 6);

      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", ex);
      line.setAttribute("y1", ey);
      line.setAttribute("x2", nx);
      line.setAttribute("y2", ny);

      line.dataset.q = h.q;
      line.dataset.r = h.r;
      line.dataset.direction = dir;
      line.classList.add("edge");

      svg.appendChild(line);
    }
  });
}

function drawVertices(svg, hexes) {
  hexes.forEach(h => {
    const { x, y } = hexToPixel(h.q, h.r);

    for (let corner = 0; corner < 6; corner++) {
      const angle = Math.PI / 180 * (60 * corner - 30);
      const vx = x + HEX_SIZE * Math.cos(angle);
      const vy = y + HEX_SIZE * Math.sin(angle);

      const circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circ.setAttribute("cx", vx);
      circ.setAttribute("cy", vy);
      circ.setAttribute("r", 6);

      circ.dataset.q = h.q;
      circ.dataset.r = h.r;
      circ.dataset.corner = corner;

      circ.classList.add("vertex");

      svg.appendChild(circ);
    }
  });
}

function setupInput(svg) {
  svg.addEventListener("click", e => {
    const el = e.target;

    if (el.classList.contains("hex")) {
      console.log("Clicked hex:", el.dataset.q, el.dataset.r);
      return;
    }

    if (el.classList.contains("edge")) {
      console.log("Clicked edge:", el.dataset.q, el.dataset.r, el.dataset.direction);
      return;
    }

    if (el.classList.contains("vertex")) {
      console.log("Clicked vertex:", el.dataset.q, el.dataset.r, el.dataset.corner);
      return;
    }
  });
}

function sizeBoard(svg) {
  svg.setAttribute("width", window.innerWidth);
  svg.setAttribute("height", window.innerHeight);
}

function computeViewBox(hexes) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  hexes.forEach(h => {
    const { x, y } = hexToPixel(h.q, h.r);

    for (let i = 0; i < 6; i++) {
      const angle = Math.PI / 180 * (60 * i - 30);
      const px = x + HEX_SIZE * Math.cos(angle);
      const py = y + HEX_SIZE * Math.sin(angle);

      minX = Math.min(minX, px);
      maxX = Math.max(maxX, px);
      minY = Math.min(minY, py);
      maxY = Math.max(maxY, py);
    }
  });

  const padding = HEX_SIZE;
  return {
    minX: minX - padding,
    minY: minY - padding,
    width: (maxX - minX) + padding * 2,
    height: (maxY - minY) + padding * 2
  };
}

function init() {
  const svg = document.getElementById("board");

  sizeBoard(svg);
  const hexes = generateHexes(RADIUS);
  const viewBox = computeViewBox(hexes);
  svg.setAttribute("viewBox", `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`);

  drawHexes(svg, hexes);
  drawEdges(svg, hexes);
  drawVertices(svg, hexes);

  setupInput(svg);
}

window.onload = init;
window.addEventListener("resize", () => {
  const svg = document.getElementById("board");
  sizeBoard(svg);
});
