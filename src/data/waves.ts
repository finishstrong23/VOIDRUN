import type { WaveDef } from '../types';

export const WAVES: WaveDef[] = [
  { wave: 1, enemies: { grunt: 10 }, spawnDuration: 8 },
  { wave: 2, enemies: { grunt: 8, swarmer: 12 }, spawnDuration: 10 },
  { wave: 3, enemies: { grunt: 12, swarmer: 16 }, spawnDuration: 12, bossWave: true, bossType: 'boss_charger' },
  { wave: 4, enemies: { grunt: 10, swarmer: 12, brute: 3 }, spawnDuration: 14 },
  { wave: 5, enemies: { grunt: 12, swarmer: 16, brute: 4 }, spawnDuration: 15 },
  { wave: 6, enemies: { grunt: 8, swarmer: 10, brute: 2 }, spawnDuration: 12, bossWave: true, bossType: 'boss_nova' },
  { wave: 7, enemies: { grunt: 14, swarmer: 18, brute: 4, ranged: 4 }, spawnDuration: 16 },
  { wave: 8, enemies: { grunt: 16, swarmer: 20, brute: 5, ranged: 5 }, spawnDuration: 18 },
  { wave: 9, enemies: { grunt: 10, swarmer: 14, brute: 3, ranged: 6 }, spawnDuration: 14, bossWave: true, bossType: 'boss_charger' },
  { wave: 10, enemies: { grunt: 20, swarmer: 24, brute: 6, ranged: 6 }, spawnDuration: 20 },
];

export const WAVE_CONFIG = {
  betweenWavesPause: 3,
  bossSpawnAtPercent: 0.5,
  bossWarningTime: 3,
  maxEnemiesOnScreen: 600,
  maxEnemiesOnScreenMobile: 400,
  // After wave 10: procedural generation
  proceduralScalePerWave: 1.15,
  proceduralStatScalePerWave: 1.10,
};
