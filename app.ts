import { Button, inputEndOfFrame, isPressed, wasPressed } from "./input";
import { render, Color, drawString, clearScreen } from "./renderer";
import filePage from "./pages/file";
import songPage from "./pages/song";
import patternPage from "./pages/pattern";
import instrumentPage from "./pages/instrument";
import tablePage from "./pages/table";
import debugPage from "./pages/debug";
import { channelNoteMonitor, playbackIndicator } from "./util";
import { midiSetNoteOff, midiSetNoteOn } from "./midi";

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
  playback: {
    isPlaying: boolean;
    position: { songPos: number; patternRow: number };
    channels: (number | null)[];
  };
  clipboard?: any;
  bpm: number;
  song: (number | null)[][]; // 8 tracks of pattern ids
  patterns: number | null[][][];
}

export let data: AppData;

// TODO: maybe initialize as empty and create array entries as needed
const defaultAppData: AppData = {
  currentPage: "FILE",
  currentPattern: 0,
  cursor: { x: 0, y: 0 },
  playback: {
    isPlaying: false,
    position: { songPos: 0, patternRow: 0 },
    channels: [null, null, null, null, null, null, null, null],
  },
  bpm: 120,
  song: Array(8)
    .fill(0)
    .map(() => Array(64).fill(null)),
  patterns: Array(256)
    .fill(0)
    .map(() =>
      Array(3)
        .fill(0)
        .map(() => Array(16).fill(null)),
    ),
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

  // Channel Note Monitor
  channelNoteMonitor();

  if (wasPressed(Button.Play)) {
    if (isPressed(Button.Shift)) {
      data.playback.position = { songPos: 0, patternRow: 0 };
      data.playback.isPlaying = true;
    } else {
      data.playback.isPlaying = !data.playback.isPlaying;
      if (!data.playback.isPlaying) {
        // reset channels when stopping playback
        data.playback.channels = Array(8).fill(null);
      }
    }
  }

  // Playback Indicator
  playbackIndicator();

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

let lastPlaybackStep = 0;

function playback() {
  // check if it is time to advance playback
  if (data.playback.isPlaying) {
    const now = performance.now();
    const interval = (60 / data.bpm) * 1000;

    if (now - lastPlaybackStep >= interval) {
      lastPlaybackStep = now;

      // play notes at current position
      // for each track, get the pattern at the current song position
      // then get the note at the current pattern row
      // and play it (for now, just store it in playback.channels)
      for (let track = 0; track < 8; track++) {
        const patternId = data.song[track][data.playback.position.songPos];
        if (patternId !== null) {
          const pattern = data.patterns[patternId];
          const note = pattern[0][data.playback.position.patternRow];
          data.playback.channels[track] = note;

          if (note !== null) {
            midiSetNoteOn(track, note);
          } else {
            midiSetNoteOff(track);
          }
        } else {
          data.playback.channels[track] = null;
        }
      }

      // advance playback position
      data.playback.position.patternRow++;
      if (data.playback.position.patternRow >= 16) {
        data.playback.position.patternRow = 0;
        data.playback.position.songPos++;

        // if at end of song, loop
        // end of song is determined once we reached the last non-null entry in each track
        let atEndOfSong = true;
        for (let track = 0; track < data.song.length; track++) {
          const trackData = data.song[track];
          let lastNonNullIndex = -1;
          for (let i = 0; i < trackData.length; i++) {
            if (trackData[i] !== null) {
              lastNonNullIndex = i;
            }
          }
          if (data.playback.position.songPos <= lastNonNullIndex) {
            atEndOfSong = false;
            break;
          }
        }
        if (atEndOfSong) {
          data.playback.position.songPos = 0;
        }
      }
    }
  }
}

function draw() {
  clearScreen(Color.background);
  playback();
  mainView();
  render();
  inputEndOfFrame();
  requestAnimationFrame(draw);
}

requestAnimationFrame(draw);

setInterval(saveFile, 5000);

// @ts-ignore
if (import.meta.hot) {
  // @ts-ignore
  import.meta.hot.on("bun:beforeUpdate", saveFile);
  // @ts-ignore
  import.meta.hot.on("bun:beforeFullReload", saveFile);
}
