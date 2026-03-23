import type { PlayerStats } from '../types';
import type { Player } from '../entities/Player';

export interface StatUpgradeDef {
  id: string; name: string; description: string; maxLevel: number;
  icon: string; iconBg: string;
  apply: (stats: PlayerStats, player: Player) => void;
}

export const STAT_UPGRADES: StatUpgradeDef[] = [
  { id: 'damage_up', name: 'Void Power', description: '+12% damage', maxLevel: 5, icon: 'sword', iconBg: '#ff2d55',
    apply: (stats) => { stats.damage *= 1.12; } },
  { id: 'max_hp_up', name: 'Fortify', description: '+20 max HP (heals 20)', maxLevel: 5, icon: 'heart', iconBg: '#30d158',
    apply: (stats, player) => { stats.maxHP += 20; player.maxHP += 20; player.heal(20); } },
  { id: 'speed_up', name: 'Phase Shift', description: '+12% move speed', maxLevel: 5, icon: 'bolt', iconBg: '#00e5ff',
    apply: (stats) => { stats.speed *= 1.12; } },
  { id: 'pickup_radius', name: 'Gravity Well', description: '+25% pickup radius', maxLevel: 5, icon: 'target', iconBg: '#5e5ce6',
    apply: (stats) => { stats.pickupRadius *= 1.25; } },
  { id: 'xp_gain', name: 'Data Leech', description: '+20% XP gain', maxLevel: 5, icon: 'star', iconBg: '#ffd60a',
    apply: (stats) => { stats.xpMultiplier *= 1.20; } },
  { id: 'armor_up', name: 'Plating', description: '+2 armor', maxLevel: 5, icon: 'shield', iconBg: '#8e8e93',
    apply: (stats) => { stats.armor += 2; } },
  { id: 'cooldown_down', name: 'Overclock', description: '-8% cooldowns', maxLevel: 5, icon: 'clock', iconBg: '#bf5af2',
    apply: (stats) => { stats.cooldownReduction = Math.min(0.6, 1 - (1 - stats.cooldownReduction) * 0.92); } },
  { id: 'crit_chance', name: 'Precision', description: '+5% crit chance', maxLevel: 4, icon: 'crosshair', iconBg: '#ff9f0a',
    apply: (stats) => { stats.critChance += 0.05; } },
];
