import { Howl, Howler } from 'howler';

let audioUnlocked = false;
const sounds: Map<string, Howl> = new Map();
let masterVolume = 1.0;
let sfxEnabled = true;

// Throttle tracking
const throttleCounts: Map<string, { count: number; resetTime: number }> = new Map();
const THROTTLE_LIMITS: Record<string, number> = {
  enemy_hit: 8,
  enemy_death: 10,
};

// XP pickup pitch tracking
let lastXPPickupTime = 0;
let xpPickupRate = 1.0;

export function initAudio(): void {
  const unlock = () => {
    if (audioUnlocked) return;
    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'suspended') {
      ctx.resume();
    }
    audioUnlocked = true;
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });

  generateSounds();
}

function createOscillatorBuffer(
  ctx: AudioContext,
  type: OscillatorType,
  frequency: number,
  duration: number,
  gainEnvelope: [number, number][] = [[0, 0.3], [1, 0]]
): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const tNorm = i / length;
    let sample = 0;
    switch (type) {
      case 'sine': sample = Math.sin(2 * Math.PI * frequency * t); break;
      case 'square': sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1; break;
      case 'sawtooth': sample = 2 * ((frequency * t) % 1) - 1; break;
      case 'triangle': sample = 4 * Math.abs((frequency * t) % 1 - 0.5) - 1; break;
    }
    // Apply gain envelope
    let gain = gainEnvelope[0][1];
    for (let j = 1; j < gainEnvelope.length; j++) {
      const [prevT, prevG] = gainEnvelope[j - 1];
      const [nextT, nextG] = gainEnvelope[j];
      if (tNorm >= prevT && tNorm <= nextT) {
        const envT = (tNorm - prevT) / (nextT - prevT);
        gain = prevG + (nextG - prevG) * envT;
        break;
      }
    }
    data[i] = sample * gain;
  }
  return buffer;
}

function createNoiseBuffer(ctx: AudioContext, duration: number, gainEnvelope: [number, number][]): AudioBuffer {
  const sampleRate = ctx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = ctx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    const tNorm = i / length;
    let gain = gainEnvelope[0][1];
    for (let j = 1; j < gainEnvelope.length; j++) {
      const [prevT, prevG] = gainEnvelope[j - 1];
      const [nextT, nextG] = gainEnvelope[j];
      if (tNorm >= prevT && tNorm <= nextT) {
        gain = prevG + (nextG - prevG) * ((tNorm - prevT) / (nextT - prevT));
        break;
      }
    }
    data[i] = (Math.random() * 2 - 1) * gain;
  }
  return buffer;
}

function bufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitsPerSample = 16;
  const data = buffer.getChannelData(0);
  const byteRate = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign = numChannels * bitsPerSample / 8;
  const dataSize = data.length * numChannels * bitsPerSample / 8;
  const headerSize = 44;
  const ab = new ArrayBuffer(headerSize + dataSize);
  const view = new DataView(ab);
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let i = 0; i < data.length; i++) {
    const sample = Math.max(-1, Math.min(1, data[i]));
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
    offset += 2;
  }
  return new Blob([ab], { type: 'audio/wav' });
}

function generateSounds(): void {
  const ctx = Howler.ctx;
  if (!ctx) return;

  const defs: [string, () => AudioBuffer][] = [
    ['weapon_slash', () => createNoiseBuffer(ctx, 0.1, [[0, 0.4], [0.3, 0.3], [1, 0]])],
    ['weapon_orb_hum', () => createOscillatorBuffer(ctx, 'sine', 80, 0.5, [[0, 0.1], [1, 0.1]])],
    ['weapon_laser', () => createOscillatorBuffer(ctx, 'sawtooth', 800, 0.08, [[0, 0.3], [0.5, 0.2], [1, 0]])],
    ['weapon_boom', () => createOscillatorBuffer(ctx, 'sine', 60, 0.3, [[0, 0.5], [0.2, 0.3], [1, 0]])],
    ['weapon_zap', () => createOscillatorBuffer(ctx, 'square', 1200, 0.12, [[0, 0.2], [0.3, 0.3], [1, 0]])],
    ['weapon_drone', () => createOscillatorBuffer(ctx, 'sawtooth', 200, 0.15, [[0, 0.2], [0.5, 0.15], [1, 0]])],
    ['enemy_hit', () => createNoiseBuffer(ctx, 0.05, [[0, 0.2], [1, 0]])],
    ['enemy_death', () => createNoiseBuffer(ctx, 0.08, [[0, 0.3], [0.3, 0.2], [1, 0]])],
    ['player_hit', () => createOscillatorBuffer(ctx, 'square', 150, 0.2, [[0, 0.4], [0.3, 0.3], [1, 0]])],
    ['xp_pickup', () => createOscillatorBuffer(ctx, 'sine', 600, 0.06, [[0, 0.2], [0.5, 0.15], [1, 0]])],
    ['level_up', () => createOscillatorBuffer(ctx, 'sine', 400, 0.6, [[0, 0.1], [0.3, 0.4], [0.7, 0.3], [1, 0]])],
    ['boss_warning', () => createOscillatorBuffer(ctx, 'sine', 80, 1.5, [[0, 0.3], [0.15, 0], [0.3, 0.4], [0.45, 0], [1, 0]])],
    ['boss_death', () => createOscillatorBuffer(ctx, 'sawtooth', 100, 0.5, [[0, 0.5], [0.3, 0.3], [1, 0]])],
    ['upgrade_select', () => createOscillatorBuffer(ctx, 'triangle', 500, 0.1, [[0, 0.3], [0.5, 0.2], [1, 0]])],
  ];

  for (const [name, gen] of defs) {
    try {
      const buffer = gen();
      const blob = bufferToWav(buffer);
      const url = URL.createObjectURL(blob);
      sounds.set(name, new Howl({
        src: [url],
        format: ['wav'],
        volume: 0.5,
        loop: name === 'weapon_orb_hum',
      }));
    } catch {
      // Silently fail if audio generation fails
    }
  }
}

export function playSound(name: string, rateOverride?: number): void {
  if (!sfxEnabled || !audioUnlocked) return;

  // Throttle check
  const limit = THROTTLE_LIMITS[name];
  if (limit) {
    const now = performance.now();
    let throttle = throttleCounts.get(name);
    if (!throttle || now > throttle.resetTime) {
      throttle = { count: 0, resetTime: now + 1000 };
      throttleCounts.set(name, throttle);
    }
    if (throttle.count >= limit) return;
    throttle.count++;
  }

  // XP pickup pitch shifting
  if (name === 'xp_pickup') {
    const now = performance.now();
    if (now - lastXPPickupTime < 400) {
      xpPickupRate = Math.min(1.5, xpPickupRate + 0.05);
    } else {
      xpPickupRate = 1.0;
    }
    lastXPPickupTime = now;
    rateOverride = xpPickupRate;
  }

  const sound = sounds.get(name);
  if (sound) {
    const id = sound.play();
    if (rateOverride !== undefined) {
      sound.rate(rateOverride, id);
    }
    sound.volume(masterVolume * 0.5, id);
  }
}

export function stopSound(name: string): void {
  const sound = sounds.get(name);
  if (sound) sound.stop();
}

export function setMasterVolume(vol: number): void {
  masterVolume = vol;
  Howler.volume(vol);
}

export function setSfxEnabled(enabled: boolean): void {
  sfxEnabled = enabled;
  if (!enabled) {
    sounds.forEach(s => s.stop());
  }
}

export function haptic(style: 'light' | 'medium' | 'heavy'): void {
  if ('vibrate' in navigator) {
    const ms = { light: 10, medium: 25, heavy: 50 };
    navigator.vibrate(ms[style]);
  }
}
