interface Cell {
  char: string;
  fg: string;
  bg: string;
}

export enum Color {
  foreground = "#ffffff",
  background = "#000000",
  foregroundMuted = "#808080",
  primary = "#ff00ff",
  secondary = "#00ffff",
}
const fontSize = 40;
const charWidth = fontSize * 0.8;
const charHeight = fontSize;

const canvasWidth = 1152;
const canvasHeight = 864;

// calculate screen size based on canvas size and character dimensions
const screenSize = {
  width: Math.floor(canvasWidth / charWidth),
  height: Math.floor(canvasHeight / charHeight),
};
console.log("Screen size:", screenSize);

const screenBuffer: Cell[][] = Array(screenSize.height)
  .fill(null)
  .map(() =>
    Array(screenSize.width)
      .fill(null)
      .map(() => ({
        char: " ",
        fg: Color.foreground,
        bg: Color.background,
      })),
  );

const terminalCanvas = document.getElementById("terminal");

export function render() {
  if (!terminalCanvas) return;

  // draw to the canvas
  const ctx = (terminalCanvas as HTMLCanvasElement).getContext("2d");
  if (!ctx) return;

  ctx.font = `${fontSize}px Monocraft`;
  ctx.textRendering = "geometricPrecision";

  for (let y = 0; y < screenBuffer.length; y++) {
    for (let x = 0; x < screenBuffer[y].length; x++) {
      const cell = screenBuffer[y][x];
      // draw background
      ctx.fillStyle = cell.bg;
      ctx.fillRect(x * charWidth, y * charHeight, charWidth, charHeight);
      // draw character
      ctx.fillStyle = cell.fg;
      ctx.fillText(cell.char, x * charWidth, (y + 1) * charHeight - 4);
    }
  }
}

export function drawChar(
  x: number,
  y: number,
  char: string,
  fg: Color,
  bg: Color,
) {
  if (x < 0 || x >= screenSize.width || y < 0 || y >= screenSize.height) {
    return;
  }
  screenBuffer[y][x] = { char, fg, bg };
}

export function drawString(
  x: number,
  y: number,
  str: string,
  fg: Color,
  bg: Color,
) {
  for (let i = 0; i < str.length; i++) {
    drawChar(x + i, y, str.charAt(i), fg, bg);
  }
}

export function clearScreen(color: Color = Color.background) {
  for (let y = 0; y < screenBuffer.length; y++) {
    for (let x = 0; x < screenBuffer[y].length; x++) {
      screenBuffer[y][x] = { char: " ", fg: Color.foreground, bg: color };
    }
  }
}
