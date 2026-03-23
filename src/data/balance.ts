import type { PlayerStats } from '../types';

export const PLAYER_BASE: PlayerStats = {
  maxHP: 100,
  speed: 200,
  damage: 1.0,
  armor: 0,
  pickupRadius: 80,
  xpMultiplier: 1.0,
  cooldownReduction: 0,
  critChance: 0.05,
  critDamage: 1.5,
  hitboxRadius: 16,
  iFrameDuration: 500,
};

export const WORLD = {
  GRID_SIZE: 64,
  PARALLAX_GRID_SIZE: 256,
  PARALLAX_FACTOR: 0.5,
  ENEMY_DESPAWN_DISTANCE: 1200,
  GEM_DESPAWN_TIME: 30,
  GEM_MAX_ON_SCREEN: 300,
  SPAWN_MARGIN: 150,
};

export const KNOCKBACK = {
  baseForce: 80,
  duration: 0.15,
};

export const WAVE_CONFIG = {
  unlockSchedule: [
    { time: 0, types: ['grunt'] },
    { time: 60, types: ['grunt', 'swarmer'] },
    { time: 120, types: ['grunt', 'swarmer', 'brute'] },
    { time: 180, types: ['grunt', 'swarmer', 'brute', 'ranged'] },
  ] as { time: number; types: string[] }[],
  spawnRateBase: 0.8,
  spawnRateRamp: 0.03,
  spawnRateMax: 25,
  statScalePerMinute: 1.12,
  swarmerPackMin: 8,
  swarmerPackMax: 12,
  bossIntervalSeconds: 300,
  maxEnemiesOnScreen: 600,
  maxEnemiesOnScreenMobile: 400,
};

export function xpForLevel(level: number): number {
  return Math.floor(10 * Math.pow(level, 1.5));
}

export function calculateDamage(
  baseDamage: number,
  playerDamage: number,
  enemyArmor: number = 0,
  isCrit: boolean = false,
  playerCritDamage: number = 1.5
): number {
  let damage = baseDamage * playerDamage;
  if (isCrit) damage *= playerCritDamage;
  damage = Math.max(1, Math.round(damage) - enemyArmor);
  return Math.max(1, damage);
}

export function calculateScore(run: { timeAlive: number; killCount: number; bossKills: number; playerLevel: number }): number {
  const timeScore = Math.floor(run.timeAlive);
  const killScore = run.killCount * 2;
  const bossScore = run.bossKills * 500;
  const levelBonus = run.playerLevel * 10;
  return timeScore + killScore + bossScore + levelBonus;
}
