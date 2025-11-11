import { data } from "../app";
import { Color, drawString } from "../renderer";
import { table, to2DigHex } from "../util";

let songScrollOffset = 0;

export default () => {
  // Input handling

  const { scrollOffset, tabledata } = table({
    columns: [
      { title: "1", width: 2, max: 256, render: (n) => to2DigHex(n) },
      { title: "2", width: 2, max: 256, render: (n) => to2DigHex(n) },
      { title: "3", width: 2, max: 256, render: (n) => to2DigHex(n) },
      { title: "4", width: 2, max: 256, render: (n) => to2DigHex(n) },
      { title: "5", width: 2, max: 256, render: (n) => to2DigHex(n) },
      { title: "6", width: 2, max: 256, render: (n) => to2DigHex(n) },
      { title: "7", width: 2, max: 256, render: (n) => to2DigHex(n) },
      { title: "8", width: 2, max: 256, render: (n) => to2DigHex(n) },
    ],
    tabledata: data.song,
    rowCount: 256,
    scrollOffset: songScrollOffset,
  });
  songScrollOffset = scrollOffset;
  data.song = tabledata;

  // draw playhead
  drawString(
    2,
    data.playback.position.songPos - songScrollOffset + 3,
    "⏵",
    Color.secondary,
    Color.background,
  );
};
