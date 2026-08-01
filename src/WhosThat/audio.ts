let context: AudioContext | null = null;
let muted = false;

function tone(frequency: number, duration: number, delay = 0, type: OscillatorType = 'triangle') {
  if (muted) return;
  context ??= new AudioContext();
  const start = context.currentTime + delay;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start); gain.gain.exponentialRampToValueAtTime(0.06, start + 0.01); gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(context.destination); oscillator.start(start); oscillator.stop(start + duration + 0.02);
}

export const sounds = {
  click: () => tone(420, .055),
  wrong: () => { tone(180, .08, 0, 'sine'); tone(120, .09, .055, 'sine'); },
  right: (first: boolean) => { tone(620, .09); tone(820, .09, .07); if (first) tone(1240, .08, .14); },
  result: () => { tone(520, .11); tone(660, .11, .09); tone(880, .11, .18); },
  toggle: () => { muted = !muted; return muted; },
};
