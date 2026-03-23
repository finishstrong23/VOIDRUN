import type { PlayerStats } from '../types';

export const PLAYER_BASE: PlayerStats = {
  maxHP: 100, speed: 200, damage: 1.0, armor: 0,
  pickupRadius: 80, xpMultiplier: 1.0, cooldownReduction: 0,
  critChance: 0.05, critDamage: 1.5, hitboxRadius: 14, iFrameDuration: 500,
};

export const WORLD = {
  GRID_SIZE: 64,
  ENEMY_DESPAWN_DISTANCE: 1200,
  GEM_DESPAWN_TIME: 30,
  GEM_MAX_ON_SCREEN: 300,
  SPAWN_MARGIN: 150,
  PROP_CELL_SIZE: 256,
  PROP_CHANCE: 0.4,
};

export const KNOCKBACK = { baseForce: 80, duration: 0.15 };

export const DASH = {
  distance: 150,
  duration: 0.15,
  cooldown: 3.0,
  invincible: true,
};

export function xpForLevel(level: number): number {
  return Math.floor(10 * Math.pow(level, 1.5));
}

export function calculateDamage(baseDamage: number, playerDamage: number, enemyArmor: number = 0, isCrit: boolean = false, playerCritDamage: number = 1.5): number {
  let d = baseDamage * playerDamage;
  if (isCrit) d *= playerCritDamage;
  return Math.max(1, Math.round(d) - enemyArmor);
}

export function calculateScore(run: { timeAlive: number; killCount: number; bossKills: number; wavesCompleted: number; playerLevel: number }): number {
  return Math.floor(run.timeAlive) + run.killCount * 2 + run.bossKills * 500 + run.wavesCompleted * 100 + run.playerLevel * 10;
}

// Color palette
export const COLORS = {
  BG: 0x0f1923,
  BG_LIGHT: 0x162130,
  ACCENT: 0x00e5ff,
  DANGER: 0xff2d55,
  ENERGY: 0xbf5af2,
  GOLD: 0xffd60a,
  HEALTH: 0x30d158,
  WARNING: 0xff9f0a,
  UI_PANEL: 0x1c2a3a,
  UI_BORDER: 0x2d4a5e,
  TEXT_PRIMARY: 0xe8edf2,
  TEXT_SECONDARY: 0x7a8fa0,
};
