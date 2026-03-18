// Retro synthesized sound effects using Web Audio API — no audio files needed.

let ctx: AudioContext | null = null;
let muted = typeof window !== "undefined" && localStorage.getItem("cyberslayer-muted") === "1";
let noiseBuffer: AudioBuffer | null = null;
const pendingTimers: ReturnType<typeof setTimeout>[] = [];

export function isMuted(): boolean {
  return muted;
}

export function toggleMute(): boolean {
  muted = !muted;
  try {
    localStorage.setItem("cyberslayer-muted", muted ? "1" : "0");
  } catch {
    /* storage unavailable, muted state is still toggled in-memory */
  }
  return muted;
}

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = "square",
  volume = 0.15,
  freqEnd?: number,
) {
  if (muted) return;
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
  osc.addEventListener("ended", () => {
    osc.disconnect();
    gain.disconnect();
  });
  osc.start();
  osc.stop(ac.currentTime + duration);
}

function playNoise(duration: number, volume = 0.08) {
  if (muted) return;
  const ac = getCtx();
  const bufferSize = Math.ceil(ac.sampleRate * duration);

  if (!noiseBuffer || noiseBuffer.sampleRate !== ac.sampleRate || noiseBuffer.length < bufferSize) {
    noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  }

  const source = ac.createBufferSource();
  source.buffer = noiseBuffer;

  const gain = ac.createGain();
  gain.gain.setValueAtTime(volume, ac.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);

  source.connect(gain);
  gain.connect(ac.destination);
  source.start(ac.currentTime, 0, duration);
}

// ─── Public API ──────────────────────────────────────────────────────────────

export function cancelAllSounds(): void {
  pendingTimers.forEach(clearTimeout);
  pendingTimers.length = 0;
}

export function playAttackSound() {
  playTone(440, 0.08, "square", 0.12);
  pendingTimers.push(setTimeout(() => playTone(520, 0.06, "square", 0.08), 40));
}

export function playCritSound() {
  playTone(600, 0.06, "square", 0.15);
  pendingTimers.push(setTimeout(() => playTone(800, 0.06, "square", 0.15), 50));
  pendingTimers.push(setTimeout(() => playTone(1000, 0.1, "sawtooth", 0.12), 100));
}

export function playEnemyDeathSound() {
  playTone(400, 0.08, "square", 0.12);
  pendingTimers.push(setTimeout(() => playTone(300, 0.08, "square", 0.1), 60));
  pendingTimers.push(setTimeout(() => playTone(200, 0.15, "sawtooth", 0.1), 120));
  pendingTimers.push(setTimeout(() => playNoise(0.2, 0.1), 180));
}

export function playPlayerDamageSound() {
  playTone(180, 0.15, "sawtooth", 0.12, 60);
  playNoise(0.08, 0.08);
}

export function playLevelUpSound() {
  playTone(523, 0.1, "square", 0.12);
  pendingTimers.push(setTimeout(() => playTone(659, 0.1, "square", 0.12), 100));
  pendingTimers.push(setTimeout(() => playTone(784, 0.15, "square", 0.15), 200));
}

export function playDefeatSound() {
  playTone(300, 0.15, "sawtooth", 0.12, 100);
  pendingTimers.push(setTimeout(() => playTone(200, 0.2, "sawtooth", 0.1, 60), 200));
  pendingTimers.push(setTimeout(() => playNoise(0.3, 0.08), 400));
}

export function playVictorySound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    pendingTimers.push(setTimeout(() => playTone(freq, 0.15, "square", 0.12), i * 120));
  });
}
