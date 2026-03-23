import type { EnemyDef } from '../types';

export const ENEMIES: Record<string, EnemyDef> = {
  grunt: {
    name: 'Grunt',
    hp: 15, damage: 8, speed: 80, xpValue: 3, armor: 0,
    radius: 12, color: 0xef4444, shape: 'circle',
    ai: 'chase', spawnWeight: 10, knockbackResist: 0,
  },
  swarmer: {
    name: 'Swarmer',
    hp: 5, damage: 4, speed: 160, xpValue: 1, armor: 0,
    radius: 8, color: 0xf97316, shape: 'triangle',
    ai: 'swarm', spawnWeight: 8, knockbackResist: 0,
  },
  brute: {
    name: 'Brute',
    hp: 80, damage: 20, speed: 50, xpValue: 12, armor: 0,
    radius: 24, color: 0xa855f7, shape: 'diamond',
    ai: 'chase', spawnWeight: 4, knockbackResist: 0.7,
  },
  ranged: {
    name: 'Ranger',
    hp: 25, damage: 6, speed: 70, xpValue: 6, armor: 0,
    radius: 12, color: 0x22d3ee, shape: 'hexagon',
    ai: 'ranged', spawnWeight: 5, knockbackResist: 0,
  },
  boss_charger: {
    name: 'Void Charger',
    hp: 500, damage: 30, speed: 60, xpValue: 100, armor: 3,
    radius: 40, color: 0xdc2626, shape: 'star',
    ai: 'boss_charge', spawnWeight: 1, knockbackResist: 1.0, isBoss: true,
  },
  boss_nova: {
    name: 'Void Detonator',
    hp: 400, damage: 15, speed: 70, xpValue: 100, armor: 2,
    radius: 36, color: 0xeab308, shape: 'star',
    ai: 'boss_nova', spawnWeight: 1, knockbackResist: 1.0, isBoss: true,
  },
};
