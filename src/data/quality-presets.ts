import type { QualityPreset } from '../types';

export const QUALITY_PRESETS: Record<string, QualityPreset> = {
  high: {
    maxEnemies: 600, particlesEnabled: true, particleDensity: 1.0,
    damageNumbersEnabled: true, trailEffectsEnabled: true,
    resolution: Math.min(window.devicePixelRatio, 2), shadowsEnabled: true,
  },
  medium: {
    maxEnemies: 400, particlesEnabled: true, particleDensity: 0.5,
    damageNumbersEnabled: true, trailEffectsEnabled: false,
    resolution: Math.min(window.devicePixelRatio, 1.5), shadowsEnabled: false,
  },
  low: {
    maxEnemies: 250, particlesEnabled: false, particleDensity: 0,
    damageNumbersEnabled: false, trailEffectsEnabled: false,
    resolution: 1.0, shadowsEnabled: false,
  },
};
