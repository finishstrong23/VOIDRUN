import { Howl, Howler } from 'howler';

let audioUnlocked = false;
const sounds: Map<string, Howl> = new Map();
let masterVolume = 1.0;
let sfxEnabled = true;
const throttleCounts: Map<string, { count: number; resetTime: number }> = new Map();
const THROTTLE_LIMITS: Record<string, number> = { enemy_hit: 8, enemy_death: 10 };
let lastXPPickupTime = 0;
let xpPickupRate = 1.0;

export function initAudio(): void {
  const unlock = () => {
    if (audioUnlocked) return;
    const ctx = Howler.ctx;
    if (ctx && ctx.state === 'suspended') ctx.resume();
    audioUnlocked = true;
    document.removeEventListener('touchstart', unlock);
    document.removeEventListener('click', unlock);
  };
  document.addEventListener('touchstart', unlock, { once: true });
  document.addEventListener('click', unlock, { once: true });
  generateSounds();
}

function makeBuffer(ctx: AudioContext, type: OscillatorType, freq: number, dur: number, env: [number, number][]): AudioBuffer {
  const sr = ctx.sampleRate, len = Math.floor(sr * dur);
  const buf = ctx.createBuffer(1, len, sr), data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const t = i / sr, tn = i / len;
    let s = 0;
    switch (type) {
      case 'sine': s = Math.sin(2 * Math.PI * freq * t); break;
      case 'square': s = Math.sin(2 * Math.PI * freq * t) > 0 ? 1 : -1; break;
      case 'sawtooth': s = 2 * ((freq * t) % 1) - 1; break;
      case 'triangle': s = 4 * Math.abs((freq * t) % 1 - 0.5) - 1; break;
    }
    let g = env[0][1];
    for (let j = 1; j < env.length; j++) {
      if (tn >= env[j - 1][0] && tn <= env[j][0]) {
        g = env[j - 1][1] + (env[j][1] - env[j - 1][1]) * ((tn - env[j - 1][0]) / (env[j][0] - env[j - 1][0]));
        break;
      }
    }
    data[i] = s * g;
  }
  return buf;
}

function makeNoise(ctx: AudioContext, dur: number, env: [number, number][]): AudioBuffer {
  const sr = ctx.sampleRate, len = Math.floor(sr * dur);
  const buf = ctx.createBuffer(1, len, sr), data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const tn = i / len;
    let g = env[0][1];
    for (let j = 1; j < env.length; j++) {
      if (tn >= env[j - 1][0] && tn <= env[j][0]) {
        g = env[j - 1][1] + (env[j][1] - env[j - 1][1]) * ((tn - env[j - 1][0]) / (env[j][0] - env[j - 1][0]));
        break;
      }
    }
    data[i] = (Math.random() * 2 - 1) * g;
  }
  return buf;
}

function toWav(buffer: AudioBuffer): Blob {
  const data = buffer.getChannelData(0);
  const sr = buffer.sampleRate;
  const dataSize = data.length * 2;
  const ab = new ArrayBuffer(44 + dataSize);
  const v = new DataView(ab);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o + i, s.charCodeAt(i)); };
  ws(0, 'RIFF'); v.setUint32(4, 36 + dataSize, true); ws(8, 'WAVE'); ws(12, 'fmt ');
  v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
  v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
  ws(36, 'data'); v.setUint32(40, dataSize, true);
  let o = 44;
  for (let i = 0; i < data.length; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true); o += 2;
  }
  return new Blob([ab], { type: 'audio/wav' });
}

function generateSounds(): void {
  const ctx = Howler.ctx;
  if (!ctx) return;
  const defs: [string, () => AudioBuffer][] = [
    ['weapon_slash', () => makeNoise(ctx, 0.1, [[0, 0.4], [0.3, 0.3], [1, 0]])],
    ['weapon_orb_hum', () => makeBuffer(ctx, 'sine', 80, 0.5, [[0, 0.08], [1, 0.08]])],
    ['weapon_laser', () => makeBuffer(ctx, 'sawtooth', 800, 0.08, [[0, 0.3], [0.5, 0.2], [1, 0]])],
    ['weapon_boom', () => makeBuffer(ctx, 'sine', 60, 0.3, [[0, 0.5], [0.2, 0.3], [1, 0]])],
    ['weapon_zap', () => makeBuffer(ctx, 'square', 1200, 0.12, [[0, 0.2], [0.3, 0.3], [1, 0]])],
    ['weapon_drone', () => makeBuffer(ctx, 'sawtooth', 200, 0.15, [[0, 0.2], [0.5, 0.15], [1, 0]])],
    ['enemy_hit', () => makeNoise(ctx, 0.05, [[0, 0.2], [1, 0]])],
    ['enemy_death', () => makeNoise(ctx, 0.08, [[0, 0.3], [0.3, 0.2], [1, 0]])],
    ['player_hit', () => makeBuffer(ctx, 'square', 150, 0.2, [[0, 0.4], [0.3, 0.3], [1, 0]])],
    ['xp_pickup', () => makeBuffer(ctx, 'sine', 600, 0.06, [[0, 0.2], [0.5, 0.15], [1, 0]])],
    ['level_up', () => makeBuffer(ctx, 'sine', 400, 0.6, [[0, 0.1], [0.3, 0.4], [0.7, 0.3], [1, 0]])],
    ['boss_warning', () => makeBuffer(ctx, 'sine', 80, 1.5, [[0, 0.3], [0.15, 0], [0.3, 0.4], [0.45, 0], [1, 0]])],
    ['boss_death', () => makeBuffer(ctx, 'sawtooth', 100, 0.5, [[0, 0.5], [0.3, 0.3], [1, 0]])],
    ['upgrade_select', () => makeBuffer(ctx, 'triangle', 500, 0.1, [[0, 0.3], [0.5, 0.2], [1, 0]])],
    ['dash_swoosh', () => makeNoise(ctx, 0.1, [[0, 0.3], [0.5, 0.2], [1, 0]])],
  ];
  for (const [name, gen] of defs) {
    try {
      const blob = toWav(gen());
      sounds.set(name, new Howl({ src: [URL.createObjectURL(blob)], format: ['wav'], volume: 0.5, loop: name === 'weapon_orb_hum' }));
    } catch { /* silent */ }
  }
}

export function playSound(name: string, rateOverride?: number): void {
  if (!sfxEnabled || !audioUnlocked) return;
  const limit = THROTTLE_LIMITS[name];
  if (limit) {
    const now = performance.now();
    let t = throttleCounts.get(name);
    if (!t || now > t.resetTime) { t = { count: 0, resetTime: now + 1000 }; throttleCounts.set(name, t); }
    if (t.count >= limit) return;
    t.count++;
  }
  if (name === 'xp_pickup') {
    const now = performance.now();
    xpPickupRate = now - lastXPPickupTime < 400 ? Math.min(1.5, xpPickupRate + 0.05) : 1.0;
    lastXPPickupTime = now;
    rateOverride = xpPickupRate;
  }
  const s = sounds.get(name);
  if (s) { const id = s.play(); if (rateOverride !== undefined) s.rate(rateOverride, id); s.volume(masterVolume * 0.5, id); }
}

export function stopSound(name: string): void { sounds.get(name)?.stop(); }
export function setMasterVolume(vol: number): void { masterVolume = vol; Howler.volume(vol); }
export function setSfxEnabled(e: boolean): void { sfxEnabled = e; if (!e) sounds.forEach(s => s.stop()); }

export function haptic(style: 'light' | 'medium' | 'heavy'): void {
  if ('vibrate' in navigator) navigator.vibrate({ light: 10, medium: 25, heavy: 50 }[style]);
}
