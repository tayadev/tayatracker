import { data } from "../app";
import { Button, isPressed, wasPressed } from "../input";
import { Color, drawString } from "../renderer";
import { table, to2DigHex, toNote } from "../util";

/*

PATTERN XX

   N   V  I  FX1   FX2   FX3
00 --- -- -- ----- ----- -----
01 --- -- -- ----- ----- -----
02 --- -- -- ----- ----- -----

*/

let patternScrollOffset = 0;

export default () => {
  // Title (the number)
  drawString(
    8,
    0,
    to2DigHex(data.currentPattern),
    Color.secondary,
    Color.background,
  );

  // input handling
  if (isPressed(Button.Option)) {
    if (wasPressed(Button.Right)) {
      data.currentPattern = (data.currentPattern + 1) % 256;
    }
    if (wasPressed(Button.Left)) {
      data.currentPattern = (data.currentPattern - 1 + 256) % 256;
    }
    if (wasPressed(Button.Up)) {
      data.currentPattern = (data.currentPattern + 16) % 256;
    }
    if (wasPressed(Button.Down)) {
      data.currentPattern = (data.currentPattern - 16 + 256) % 256;
    }
  }

  const pattern = data.patterns[data.currentPattern];

  const { scrollOffset, tabledata } = table({
    columns: [
      { title: "N", width: 3, max: 128, render: (n) => toNote(n) },
      { title: "V", width: 2, max: 256, render: (n) => to2DigHex(n) },
      { title: "I", width: 2, max: 256, render: (n) => to2DigHex(n) },
    ],
    tabledata: pattern,
    rowCount: 256,
    scrollOffset: patternScrollOffset,
  });
  patternScrollOffset = scrollOffset;
  data.patterns[data.currentPattern] = tabledata;
};
