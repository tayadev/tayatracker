import { data } from "../app";
import { Button, isPressed, wasPressed } from "../input";
import { Color, drawString } from "../renderer";
import { to2DigHex } from "../util";

let songScrollOffset = 0;

export default () => {
  // Input handling

  if (
    wasPressed(Button.Edit) &&
    data.song[data.cursor.x][data.cursor.y + songScrollOffset] == null
  ) {
    // paste or init
    data.song[data.cursor.x][data.cursor.y + songScrollOffset] =
      data.clipboard ?? 0;
  }

  if (isPressed(Button.Option) && wasPressed(Button.Edit)) {
    // cut cell
    data.clipboard = data.song[data.cursor.x][data.cursor.y + songScrollOffset];
    data.song[data.cursor.x][data.cursor.y + songScrollOffset] = null;
  }

  if (isPressed(Button.Edit)) {
    // data entry
    if (wasPressed(Button.Right)) {
      // increment cell value
      const cellValue =
        data.song[data.cursor.x][data.cursor.y + songScrollOffset];
      data.song[data.cursor.x][data.cursor.y + songScrollOffset] =
        ((cellValue ?? 0) + 1) % 256;
    }
    if (wasPressed(Button.Left)) {
      // decrement cell value
      const cellValue =
        data.song[data.cursor.x][data.cursor.y + songScrollOffset];
      data.song[data.cursor.x][data.cursor.y + songScrollOffset] =
        ((cellValue ?? 0) - 1 + 256) % 256;
    }
    if (wasPressed(Button.Up)) {
      // increment by 16
      const cellValue =
        data.song[data.cursor.x][data.cursor.y + songScrollOffset];
      data.song[data.cursor.x][data.cursor.y + songScrollOffset] =
        ((cellValue ?? 0) + 16) % 256;
    }
    if (wasPressed(Button.Down)) {
      // decrement by 16
      const cellValue =
        data.song[data.cursor.x][data.cursor.y + songScrollOffset];
      data.song[data.cursor.x][data.cursor.y + songScrollOffset] =
        ((cellValue ?? 0) - 16 + 256) % 256;
    }
  } else {
    if (wasPressed(Button.Left) && data.cursor.x > 0) {
      data.cursor.x -= 1;
    }
    if (wasPressed(Button.Right) && data.cursor.x < 7) {
      data.cursor.x += 1;
    }
    if (wasPressed(Button.Up)) {
      if (data.cursor.y > 0) {
        data.cursor.y -= 1;
      } else if (songScrollOffset > 0) {
        // At top edge, scroll up
        songScrollOffset -= 1;
      }
    }
    if (wasPressed(Button.Down)) {
      const maxRow = data.song[0].length - 1;
      if (data.cursor.y < 15) {
        data.cursor.y += 1;
      } else if (songScrollOffset + 15 < maxRow) {
        // At bottom edge, scroll down
        songScrollOffset += 1;
      }
    }
  }

  // Channel Headers
  for (let i = 0; i < 8; i++) {
    drawString(
      i * 3 + 3,
      2,
      (i + 1).toString(),
      i === data.cursor.x ? Color.primary : Color.foreground,
      Color.background,
    );
  }

  // Row Header
  for (let j = 0; j < 16; j++) {
    const rowNumber = to2DigHex(j + songScrollOffset);
    drawString(
      0,
      j + 3,
      rowNumber,
      data.cursor.y == j ? Color.primary : Color.foreground,
      Color.background,
    );
  }

  // Cells
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 16; j++) {
      const cellValue = data.song[i][j + songScrollOffset];
      const displayText =
        cellValue === null
          ? "--"
          : cellValue.toString(16).toUpperCase().padStart(2, "0");

      const isCursor = i === data.cursor.x && j === data.cursor.y;
      drawString(
        i * 3 + 3,
        j + 3,
        displayText,
        isCursor
          ? Color.primary
          : cellValue === null
            ? Color.foregroundMuted
            : Color.foreground,
        Color.background,
      );
    }
  }
};
