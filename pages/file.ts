import { data, newFile, saveFile } from "../app";
import { Button, wasPressed } from "../input";
import { Color, drawString } from "../renderer";

export default () => {
  const options = ["NEW", "SAVE", "OPTION 3"];

  // input handling
  if (wasPressed(Button.Down)) {
    data.cursor.y = (data.cursor.y + 1) % options.length;
  }
  if (wasPressed(Button.Up)) {
    data.cursor.y = (data.cursor.y - 1 + options.length) % options.length;
  }
  if (wasPressed(Button.Edit)) {
    switch (data.cursor.y) {
      case 0:
        newFile();
        data.currentPage = "SONG";
        break;
      case 1:
        saveFile();
        break;
    }
  }

  for (let i = 0; i < options.length; i++) {
    drawString(
      2,
      2 + i,
      options[i],
      data.cursor.y === i ? Color.primary : Color.foreground,
      Color.background,
    );
  }
};
