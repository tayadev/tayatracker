export enum Button {
  Up,
  Down,
  Left,
  Right,
  Option,
  Edit,
  Shift,
  Play,
}

export const inputState: { [key in Button]: boolean } = {
  [Button.Up]: false,
  [Button.Down]: false,
  [Button.Left]: false,
  [Button.Right]: false,
  [Button.Option]: false,
  [Button.Edit]: false,
  [Button.Shift]: false,
  [Button.Play]: false,
};

const triggeredThisFrame: { [key in Button]: boolean } = {
  [Button.Up]: false,
  [Button.Down]: false,
  [Button.Left]: false,
  [Button.Right]: false,
  [Button.Option]: false,
  [Button.Edit]: false,
  [Button.Shift]: false,
  [Button.Play]: false,
};

const keyRepeat: {
  active: boolean;
  button: Button | null;
  intervalId: number | null;
} = {
  active: false,
  button: null,
  intervalId: null,
};

const KEY_REPEAT_DELAY = 500; // ms before repeat starts
const KEY_REPEAT_INTERVAL = 100; // ms between repeats

const keyMapping: { [key: string]: Button } = {
  ArrowUp: Button.Up,
  ArrowDown: Button.Down,
  ArrowLeft: Button.Left,
  ArrowRight: Button.Right,
  KeyW: Button.Up,
  KeyS: Button.Down,
  KeyA: Button.Left,
  KeyD: Button.Right,
  ShiftLeft: Button.Shift,
  KeyZ: Button.Option,
  Space: Button.Edit,
  Enter: Button.Play,
};

export function wasPressed(button: Button): boolean {
  return triggeredThisFrame[button];
}

export function isPressed(button: Button): boolean {
  return inputState[button];
}

function triggerButton(button: Button) {
  triggeredThisFrame[button] = true;
}

export function inputEndOfFrame() {
  for (const button in triggeredThisFrame) {
    triggeredThisFrame[button] = false;
  }
}

window.addEventListener("keydown", (e) => {
  const button = keyMapping[e.code];
  if (button !== undefined) {
    // Only trigger on initial press (not key repeat from OS)
    if (!inputState[button]) {
      inputState[button] = true;
      triggerButton(button);

      // Clear previous key repeat
      if (keyRepeat.intervalId) {
        clearInterval(keyRepeat.intervalId);
        clearTimeout(keyRepeat.intervalId);
      }

      // Set up key repeat
      keyRepeat.button = button;
      keyRepeat.intervalId = setTimeout(() => {
        keyRepeat.active = true;
        keyRepeat.intervalId = setInterval(() => {
          if (inputState[button]) {
            triggerButton(button);
          }
        }, KEY_REPEAT_INTERVAL);
      }, KEY_REPEAT_DELAY);
    }

    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  const button = keyMapping[e.code];
  if (button !== undefined) {
    inputState[button] = false;

    // Clear key repeat
    if (keyRepeat.button === button) {
      keyRepeat.active = false;
      keyRepeat.button = null;
      if (keyRepeat.intervalId) {
        clearTimeout(keyRepeat.intervalId);
        clearInterval(keyRepeat.intervalId);
        keyRepeat.intervalId = null;
      }
    }

    e.preventDefault();
  }
});

// Virtual button handling for touch devices
const buttonNameMap: { [key: string]: Button } = {
  up: Button.Up,
  down: Button.Down,
  left: Button.Left,
  right: Button.Right,
  option: Button.Option,
  edit: Button.Edit,
  shift: Button.Shift,
  play: Button.Play,
};

function handleVirtualButtonPress(buttonName: string) {
  const button = buttonNameMap[buttonName];
  if (button !== undefined && !inputState[button]) {
    inputState[button] = true;
    triggerButton(button);

    // Clear previous key repeat
    if (keyRepeat.intervalId) {
      clearInterval(keyRepeat.intervalId);
      clearTimeout(keyRepeat.intervalId);
    }

    // Set up key repeat
    keyRepeat.button = button;
    keyRepeat.intervalId = setTimeout(() => {
      keyRepeat.active = true;
      keyRepeat.intervalId = setInterval(() => {
        if (inputState[button]) {
          triggerButton(button);
        }
      }, KEY_REPEAT_INTERVAL);
    }, KEY_REPEAT_DELAY);
  }
}

function handleVirtualButtonRelease(buttonName: string) {
  const button = buttonNameMap[buttonName];
  if (button !== undefined) {
    inputState[button] = false;

    // Clear key repeat
    if (keyRepeat.button === button) {
      keyRepeat.active = false;
      keyRepeat.button = null;
      if (keyRepeat.intervalId) {
        clearTimeout(keyRepeat.intervalId);
        clearInterval(keyRepeat.intervalId);
        keyRepeat.intervalId = null;
      }
    }
  }
}

// Initialize virtual buttons when DOM is ready
window.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".virtual-btn");

  buttons.forEach((btn) => {
    const buttonName = btn.getAttribute("data-button");
    if (!buttonName) return;

    // Touch events
    btn.addEventListener("touchstart", (e) => {
      e.preventDefault();
      btn.classList.add("active");
      handleVirtualButtonPress(buttonName);
    });

    btn.addEventListener("touchend", (e) => {
      e.preventDefault();
      btn.classList.remove("active");
      handleVirtualButtonRelease(buttonName);
    });

    btn.addEventListener("touchcancel", (e) => {
      e.preventDefault();
      btn.classList.remove("active");
      handleVirtualButtonRelease(buttonName);
    });

    // Mouse events (for testing on desktop)
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      btn.classList.add("active");
      handleVirtualButtonPress(buttonName);
    });

    btn.addEventListener("mouseup", (e) => {
      e.preventDefault();
      btn.classList.remove("active");
      handleVirtualButtonRelease(buttonName);
    });

    btn.addEventListener("mouseleave", (e) => {
      btn.classList.remove("active");
      handleVirtualButtonRelease(buttonName);
    });
  });
});
