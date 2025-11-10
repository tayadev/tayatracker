import { Button, isPressed } from "../input";
import { Color, drawString } from "../renderer";

export default () => {
  drawString(2, 2, "DEBUG VIEW", Color.primary, Color.background);

  // show display rulers
  for (let x = 0; x < 50; x++) {
    const label = (x % 10).toString();
    drawString(x, 0, label, Color.foregroundMuted, Color.background);
  }
  for (let y = 0; y < 50; y++) {
    const label = (y % 10).toString();
    drawString(0, y, label, Color.foregroundMuted, Color.background);
  }

  // Display input state
  const map: [string, Button, number, number][] = [
    ["W", Button.Up, 4, 6],
    ["S", Button.Down, 4, 7],
    ["A", Button.Left, 3, 7],
    ["D", Button.Right, 5, 7],
    ["S", Button.Shift, 7, 7],
    ["P", Button.Play, 8, 7],
    ["O", Button.Option, 7, 6],
    ["E", Button.Edit, 8, 6],
  ];

  for (const [label, button, x, y] of map) {
    drawString(
      x,
      y,
      label,
      isPressed[button] ? Color.primary : Color.foregroundMuted,
      Color.background,
    );
  }
};
