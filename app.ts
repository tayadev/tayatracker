import { Button, inputEndOfFrame, isPressed, wasPressed } from "./input";
import { render, Color, drawString, clearScreen } from "./renderer";
import filePage from "./pages/file";
import songPage from "./pages/song";
import patternPage from "./pages/pattern";
import instrumentPage from "./pages/instrument";
import tablePage from "./pages/table";
import debugPage from "./pages/debug";

let pages = {
  FILE: filePage,
  SONG: songPage,
  PATTERN: patternPage,
  INSTRUMENT: instrumentPage,
  TABLE: tablePage,
  DEBUG: debugPage,
};

interface AppData {
  currentPage: string;
  currentPattern: number;
  cursor: { x: number; y: number };
  clipboard?: any;
  song: (number | null)[][]; // 8 tracks of pattern ids
  patterns: number | null[][][];
}

export let data: AppData;

// TODO: maybe initialize as empty and create array entries as needed
const defaultAppData: AppData = {
  currentPage: "FILE",
  currentPattern: 0,
  cursor: { x: 0, y: 0 },
  song: Array(8)
    .fill(0)
    .map(() => Array(64).fill(null)),
  patterns: Array(256)
    .fill(0)
    .map(() =>
      Array(3)
        .fill(0)
        .map(() => Array(256).fill(null)),
    ), // 256 patterns, each with 3 columns (note, volume, instrument), 256 rows each
};

const savedState = window.localStorage.getItem("state");
if (savedState) {
  try {
    const loadedData = JSON.parse(savedState);
    // Merge loaded data with default data to handle missing properties
    data = { ...defaultAppData, ...loadedData };
  } catch {
    window.localStorage.removeItem("state");
    data = defaultAppData;
  }
} else {
  data = defaultAppData;
}

export function newFile() {
  data = defaultAppData;
  saveFile();
}

function mainView() {
  // Title
  drawString(0, 0, data.currentPage, Color.secondary, Color.background);

  // Render current page
  const page = pages[data.currentPage];
  if (page) {
    page();
  }

  // Minimap
  if (isPressed(Button.Shift) && wasPressed(Button.Right)) {
    const pageKeys = Object.keys(pages);
    const currentIndex = pageKeys.indexOf(data.currentPage);
    const nextIndex = (currentIndex + 1) % pageKeys.length;
    data.currentPage = pageKeys[nextIndex];
    data.cursor = { x: 0, y: 0 };
  }

  if (isPressed(Button.Shift) && wasPressed(Button.Left)) {
    const pageKeys = Object.keys(pages);
    const currentIndex = pageKeys.indexOf(data.currentPage);
    const prevIndex = (currentIndex - 1 + pageKeys.length) % pageKeys.length;
    data.currentPage = pageKeys[prevIndex];
    data.cursor = { x: 0, y: 0 };
  }

  for (let i = 0; i < Object.keys(pages).length; i++) {
    const pageKey = Object.keys(pages)[i];
    const isActive = pageKey === data.currentPage;
    drawString(
      30 + i,
      17,
      pageKey.charAt(0),
      isActive ? Color.primary : Color.foreground,
      Color.background,
    );
  }
}

export function saveFile() {
  window.localStorage.setItem("state", JSON.stringify(data));
}

function draw() {
  clearScreen(Color.background);
  mainView();
  render();
  inputEndOfFrame();
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

setInterval(saveFile, 5000);

if (import.meta.hot) {
  import.meta.hot.on("bun:beforeUpdate", saveFile);
  import.meta.hot.on("bun:beforeFullReload", saveFile);
}
