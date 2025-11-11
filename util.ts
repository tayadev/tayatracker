import { Color, drawString } from "./renderer";
import { data } from "./app";
import { Button, isPressed, wasPressed } from "./input";

export function toHex(n: number): string {
  return n.toString(16).toUpperCase();
}

export function to2DigHex(n: number): string {
  return n.toString(16).toUpperCase().padStart(2, "0");
}

export function toNote(n: number): string {
  const notes = [
    "C-",
    "C#",
    "D-",
    "D#",
    "E-",
    "F-",
    "F#",
    "G-",
    "G#",
    "A-",
    "A#",
    "B-",
  ];
  const octave = Math.floor(n / 12);
  const note = notes[n % 12];
  return note + octave.toString(16).toUpperCase();
}

export function table({
  columns,
  tabledata,
  rowCount = 255,
  scrollOffset = 0,
}: {
  columns: {
    title: string;
    width: number;
    max: number;
    editIncrements?: { small: number; big: number };
    render: (n: number) => string;
  }[];
  tabledata: (number | null)[][];
  rowCount: number;
  scrollOffset?: number;
}) {
  // Input handling
  if (
    wasPressed(Button.Edit) &&
    tabledata[data.cursor.x][data.cursor.y + scrollOffset] == null
  ) {
    // paste or init
    tabledata[data.cursor.x][data.cursor.y + scrollOffset] =
      data.clipboard ?? 0;
  }

  if (isPressed(Button.Option) && wasPressed(Button.Edit)) {
    // cut cell
    console.log("cut");
    data.clipboard = tabledata[data.cursor.x][data.cursor.y + scrollOffset];
    tabledata[data.cursor.x][data.cursor.y + scrollOffset] = null;
  }

  if (isPressed(Button.Edit)) {
    // data entry
    const cellValue = tabledata[data.cursor.x][data.cursor.y + scrollOffset];
    const max = columns[data.cursor.x].max;

    if (wasPressed(Button.Right)) {
      // increment cell value
      tabledata[data.cursor.x][data.cursor.y + scrollOffset] =
        ((cellValue ?? 0) +
          (columns[data.cursor.x].editIncrements?.small || 1)) %
        max;
    }
    if (wasPressed(Button.Left)) {
      // decrement cell value
      tabledata[data.cursor.x][data.cursor.y + scrollOffset] =
        ((cellValue ?? 0) -
          (columns[data.cursor.x].editIncrements?.small || 1) +
          max) %
        max;
    }
    if (wasPressed(Button.Up)) {
      // increment by 16
      tabledata[data.cursor.x][data.cursor.y + scrollOffset] =
        ((cellValue ?? 0) +
          (columns[data.cursor.x].editIncrements?.big || 16)) %
        max;
    }
    if (wasPressed(Button.Down)) {
      // decrement by 16
      tabledata[data.cursor.x][data.cursor.y + scrollOffset] =
        ((cellValue ?? 0) -
          (columns[data.cursor.x].editIncrements?.big || 16) +
          max) %
        max;
    }
  } else if (!isPressed(Button.Option)) {
    if (wasPressed(Button.Left) && data.cursor.x > 0) {
      data.cursor.x -= 1;
    }
    if (wasPressed(Button.Right) && data.cursor.x < columns.length - 1) {
      data.cursor.x += 1;
    }
    if (wasPressed(Button.Up)) {
      if (data.cursor.y > 0) {
        data.cursor.y -= 1;
      } else if (scrollOffset > 0) {
        // At top edge, scroll up
        scrollOffset -= 1;
      }
    }
    if (wasPressed(Button.Down)) {
      const maxRow = rowCount - 1;
      if (data.cursor.y < 15) {
        data.cursor.y += 1;
      } else if (scrollOffset + 15 < maxRow) {
        // At bottom edge, scroll down
        scrollOffset += 1;
      }
    }
  }

  // Column Headers
  let xOffset = rowCount <= 16 ? 2 : 3;
  for (let i = 0; i < columns.length; i++) {
    const col = columns[i];
    drawString(
      xOffset,
      2,
      col.title.padEnd(col.width, " "),
      data.cursor.x == i ? Color.primary : Color.foreground,
      Color.background,
    );
    xOffset += col.width + 1; // Add spacing between columns
  }

  // Row Headers
  for (let j = 0; j < 16; j++) {
    const rowNumber =
      rowCount <= 16 ? toHex(j + scrollOffset) : to2DigHex(j + scrollOffset);
    drawString(
      0,
      j + 3,
      rowNumber,
      data.cursor.y == j ? Color.primary : Color.foreground,
      Color.background,
    );
  }

  // Table Data
  for (let row = 0; row < 16; row++) {
    let xOffset = rowCount <= 16 ? 2 : 3;
    for (let col = 0; col < columns.length; col++) {
      const cellValue = tabledata[col][row + scrollOffset];
      const displayValue =
        cellValue != null
          ? columns[col].render(cellValue)
          : "-".repeat(columns[col].width);
      drawString(
        xOffset,
        row + 3,
        displayValue.padEnd(columns[col].width, " "),
        data.cursor.x == col && data.cursor.y == row
          ? Color.primary
          : cellValue != null
            ? Color.foreground
            : Color.foregroundMuted,
        Color.background,
      );
      xOffset += columns[col].width + 1; // Add spacing between columns
    }
  }

  return { scrollOffset, tabledata };
}

export function channelNoteMonitor() {
  for (let i = 0; i < 8; i++) {
    const note = data.playback.channels[i];
    const displayNote = note != null ? toNote(note) : "---";
    drawString(
      30,
      2 + i,
      `${i + 1} ${displayNote}`,
      Color.foreground,
      Color.background,
    );
  }
}

export function playbackIndicator() {
  if (data.playback.isPlaying) {
    drawString(30, 0, "⏵", Color.primary, Color.background);
  } else {
    drawString(30, 0, "⏹", Color.foreground, Color.background);
  }
  drawString(
    32,
    0,
    to2DigHex(data.playback.position.songPos),
    Color.foreground,
    Color.background,
  );
  drawString(
    34,
    0,
    toHex(data.playback.position.patternRow),
    Color.foregroundMuted,
    Color.background,
  );
}
