import type { Upgrade, PlayerStats } from '../types';
import type { Player } from '../entities/Player';
import type { Weapon } from '../weapons/Weapon';

/** Stat upgrade definitions for the UpgradeRegistry */
interface StatUpgrade {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconBg: string;
  stat: keyof PlayerStats;
  amount: number;
  maxLevel: number;
}

const STAT_UPGRADES: StatUpgrade[] = [
  { id: 'max_hp', name: 'Vitality', description: '+20 Max HP', icon: '\u2764', iconBg: '#30d158', stat: 'maxHP', amount: 20, maxLevel: 10 },
  { id: 'speed', name: 'Swiftness', description: '+15% Move Speed', icon: '\u26A1', iconBg: '#ffd60a', stat: 'speed', amount: 30, maxLevel: 5 },
  { id: 'damage', name: 'Might', description: '+10% Damage', icon: '\u2694', iconBg: '#ff2d55', stat: 'damage', amount: 0.1, maxLevel: 10 },
  { id: 'armor', name: 'Fortitude', description: '+1 Armor', icon: '\uD83D\uDEE1', iconBg: '#5e5ce6', stat: 'armor', amount: 1, maxLevel: 5 },
  { id: 'pickup_radius', name: 'Magnetism', description: '+25% Pickup Radius', icon: '\uD83E\uDDF2', iconBg: '#00e5ff', stat: 'pickupRadius', amount: 20, maxLevel: 5 },
  { id: 'xp_mult', name: 'Wisdom', description: '+10% XP Gain', icon: '\u2728', iconBg: '#bf5af2', stat: 'xpMultiplier', amount: 0.1, maxLevel: 5 },
  { id: 'cdr', name: 'Haste', description: '+8% Cooldown Reduction', icon: '\u231B', iconBg: '#ff9f0a', stat: 'cooldownReduction', amount: 0.08, maxLevel: 5 },
  { id: 'crit_chance', name: 'Precision', description: '+5% Crit Chance', icon: '\uD83C\uDFAF', iconBg: '#ff2d55', stat: 'critChance', amount: 0.05, maxLevel: 5 },
  { id: 'crit_damage', name: 'Lethality', description: '+25% Crit Damage', icon: '\uD83D\uDCA5', iconBg: '#ffd60a', stat: 'critDamage', amount: 0.25, maxLevel: 5 },
];

export class UpgradeManager {
  /** Tracks how many times each stat upgrade has been taken */
  statLevels: Map<string, number> = new Map();

  reset(): void {
    this.statLevels.clear();
  }

  /**
   * Generate 3 upgrade options for the player to choose from.
   * Mixes stat upgrades and weapon upgrades, favoring things the player hasn't maxed.
   */
  generateOptions(weapons: Weapon[], playerLevel: number): Upgrade[] {
    const pool: Upgrade[] = [];

    // Add available stat upgrades
    for (const su of STAT_UPGRADES) {
      const currentLevel = this.statLevels.get(su.id) || 0;
      if (currentLevel >= su.maxLevel) continue;

      pool.push({
        id: su.id,
        name: su.name,
        description: su.description,
        type: 'stat',
        icon: su.icon,
        iconBg: su.iconBg,
        currentLevel,
        maxLevel: su.maxLevel,
      });
    }

    // Add weapon level-up options for owned weapons that aren't maxed
    for (const weapon of weapons) {
      if (weapon.isMaxLevel()) continue;

      pool.push({
        id: `weapon_${weapon.id}`,
        name: weapon.name,
        description: `Level ${weapon.level} \u2192 ${weapon.level + 1}`,
        type: 'weapon_level',
        icon: '\u2694',
        iconBg: '#00e5ff',
        weaponId: weapon.id,
        currentLevel: weapon.level,
        maxLevel: weapon.maxLevel,
      });
    }

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Higher player levels slightly bias toward rarer upgrades (later in the list)
    // Simple approach: just take the first 3 from shuffled pool
    return pool.slice(0, Math.min(3, pool.length));
  }

  /**
   * Apply a chosen upgrade to the player and/or weapons.
   */
  applyUpgrade(upgrade: Upgrade, player: Player, weapons: Weapon[]): void {
    switch (upgrade.type) {
      case 'stat': {
        const su = STAT_UPGRADES.find(s => s.id === upgrade.id);
        if (!su) return;

        const currentLevel = this.statLevels.get(su.id) || 0;
        this.statLevels.set(su.id, currentLevel + 1);

        // Apply the stat change
        (player.stats as any)[su.stat] += su.amount;

        // Special handling: maxHP increase should also heal the amount
        if (su.stat === 'maxHP') {
          player.maxHP = player.stats.maxHP;
          player.heal(su.amount);
        }
        break;
      }

      case 'weapon_level': {
        const weapon = weapons.find(w => w.id === upgrade.weaponId);
        if (weapon) {
          weapon.levelUp();
        }
        break;
      }

      case 'weapon_new': {
        // New weapon acquisition - handled externally by the game loop
        // which should create the weapon and add it to the weapons array
        break;
      }
    }
  }
}
