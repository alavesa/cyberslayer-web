// Retro synthesized sound effects using Web Audio API — no audio files needed.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.15,
  freqEnd?: number,
) {
  const ac = getCtx();
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ac.currentTime);
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + duration);
  }

  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration);
}

function playNoise(duration: number, volume = 0.08) {
  const ac = getCtx();
  const bufferSize = ac.sampleRate * duration;
  const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const source = ac.createBufferSource();
  source.buffer = buffer;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

  source.connect(gain);
  gain.connect(ac.destination);
  source.start();
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function playAttackSound() {
  playTone(440, 0.08, "square", 0.12);
  setTimeout(() => playTone(520, 0.06, "square", 0.08), 40);
}

export function playCritSound() {
  playTone(600, 0.06, "square", 0.15);
  setTimeout(() => playTone(800, 0.06, "square", 0.15), 50);
  setTimeout(() => playTone(1000, 0.1, "sawtooth", 0.12), 100);
}

export function playEnemyDeathSound() {
  playTone(400, 0.08, "square", 0.12);
  setTimeout(() => playTone(300, 0.08, "square", 0.1), 60);
  setTimeout(() => playTone(200, 0.15, "sawtooth", 0.1), 120);
  setTimeout(() => playNoise(0.2, 0.1), 180);
}

export function playPlayerDamageSound() {
  playTone(180, 0.15, "sawtooth", 0.12, 60);
  playNoise(0.08, 0.08);
}

export function playLevelUpSound() {
  playTone(523, 0.1, "square", 0.12);
  setTimeout(() => playTone(659, 0.1, "square", 0.12), 100);
  setTimeout(() => playTone(784, 0.15, "square", 0.15), 200);
}

export function playDefeatSound() {
  playTone(300, 0.15, "sawtooth", 0.12, 100);
  setTimeout(() => playTone(200, 0.2, "sawtooth", 0.1, 60), 200);
  setTimeout(() => playNoise(0.3, 0.08), 400);
}

export function playVictorySound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.15, "square", 0.12), i * 120);
  });
}
