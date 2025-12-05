// src/js/ui/floatingWindows.js

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function initFloatingWindows({ startMinimized = false } = {}) {
  const windows = document.querySelectorAll(".floating-window");
  const dock = document.getElementById("window-dock");

  windows.forEach(win => {
    const titlebar = win.querySelector(".window-titlebar");
    const minimizeBtn = win.querySelector(".window-control[data-action='minimize']");

    if (titlebar) {
      enableDragging(win, titlebar, windows);
    }

    if (minimizeBtn) {
      minimizeBtn.addEventListener("click", () => minimizeWindow(win, dock));
    }

    win.addEventListener("mousedown", () => setActiveWindow(win, windows));

    if (startMinimized || win.dataset.startMinimized === "true") {
      minimizeWindow(win, dock);
    }
  });
}

function enableDragging(win, handle, windows) {
  let offsetX = 0;
  let offsetY = 0;
  let isDragging = false;

  handle.addEventListener("mousedown", (event) => {
    if (win.dataset.minimized === "true") return;
    setActiveWindow(win, windows);
    isDragging = true;
    const rect = win.getBoundingClientRect();
    offsetX = event.clientX - rect.left;
    offsetY = event.clientY - rect.top;
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", stopDragging);
  });

  function onMouseMove(event) {
    if (!isDragging) return;
    const viewportWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    const bottomBuffer = 90; // keep windows out of the fixed dock/taskbar area
    const newLeft = clamp(event.clientX - offsetX, 0, viewportWidth - win.offsetWidth);
    const maxTop = Math.max(viewportHeight - win.offsetHeight - bottomBuffer, 0);
    const newTop = clamp(event.clientY - offsetY, 0, maxTop);
    win.style.left = `${newLeft}px`;
    win.style.top = `${newTop}px`;
  }

  function stopDragging() {
    isDragging = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", stopDragging);
  }
}

function minimizeWindow(win, dock) {
  if (!dock || win.dataset.minimized === "true") return;
  win.dataset.minimized = "true";
  win.classList.add("is-minimized");

  const dockButton = document.createElement("button");
  dockButton.className = "dock-item";
  dockButton.textContent = win.dataset.windowTitle || "Window";
  dockButton.dataset.target = win.id;
  dockButton.addEventListener("click", () => restoreWindow(win, dockButton));

  dock.appendChild(dockButton);
}

function restoreWindow(win, dockButton) {
  win.dataset.minimized = "false";
  win.classList.remove("is-minimized");
  dockButton.remove();
}

function setActiveWindow(targetWin, windows) {
  windows.forEach(win => win.classList.remove("is-active"));
  targetWin.classList.add("is-active");
}
