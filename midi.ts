export function midiInit() {
  // request midi access
  navigator.requestMIDIAccess().then((midiAccess) => {
    // get the first available output
    const outputs = Array.from(midiAccess.outputs.values());
    if (outputs.length > 0) {
      (window as any).midiOutput = outputs[0];
      console.log("MIDI Output set to:", outputs[0].name);
    } else {
      console.log("No MIDI outputs available");
    }
  });
}

export function midiSetNoteOn(channel: number, note: number) {
  // send midi note on message
  const status = 0x90 + channel; // note on for channel
  const velocity = 0x7f; // max velocity
  (window as any).midiOutput?.send([status, note, velocity]);
}

export function midiSetNoteOff(channel: number) {
  // send midi note off message
  const status = 0x80 + channel; // note off for channel
  const velocity = 0x00;
  (window as any).midiOutput?.send([status, 0, velocity]);
}
