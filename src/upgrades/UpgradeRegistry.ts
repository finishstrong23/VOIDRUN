import type { Upgrade } from '../types';
import type { Weapon } from '../weapons/Weapon';
import { STAT_UPGRADES, type StatUpgradeDef } from './StatUpgrades';
import { WEAPON_LEVEL_DESCS } from './WeaponUpgrades';

/** Tracks current stat upgrade levels during a run. */
const statLevels = new Map<string, number>();

export function resetUpgradeState(): void {
  statLevels.clear();
}

export function getStatLevel(id: string): number {
  return statLevels.get(id) ?? 0;
}

export function incrementStatLevel(id: string): void {
  statLevels.set(id, (statLevels.get(id) ?? 0) + 1);
}

export function getStatUpgradeDef(id: string): StatUpgradeDef | undefined {
  return STAT_UPGRADES.find((s) => s.id === id);
}

/**
 * Generate 3 unique upgrade options for a level-up.
 * @param equippedWeapons - weapons the player currently has
 * @param allWeaponIds - all weapon IDs available in the game
 */
export function generateUpgradeOptions(
  equippedWeapons: Weapon[],
  allWeaponIds: string[],
): Upgrade[] {
  const pool: Upgrade[] = [];

  // --- New weapons (40% weight each) ---
  if (equippedWeapons.length < 6) {
    const equippedIds = new Set(equippedWeapons.map((w) => w.id));
    for (const wid of allWeaponIds) {
      if (equippedIds.has(wid)) continue;
      const desc = WEAPON_LEVEL_DESCS.find((d) => d.weaponId === wid);
      const name = desc?.name ?? wid;
      const icon = desc?.icon ?? 'star';
      pool.push({
        id: `new_${wid}`,
        name: `New: ${name}`,
        description: 'Add a new weapon',
        type: 'weapon_new',
        icon,
        iconBg: '#ffd60a',
        weaponId: wid,
      });
    }
  }

  // --- Weapon level-ups ---
  for (const weapon of equippedWeapons) {
    if (weapon.isMaxLevel()) continue;
    const desc = WEAPON_LEVEL_DESCS.find((d) => d.weaponId === weapon.id);
    const levelDesc = desc?.levels[weapon.level - 1] ?? `Lv${weapon.level + 1}`;
    const icon = desc?.icon ?? 'star';
    pool.push({
      id: `lvl_${weapon.id}`,
      name: `${weapon.name} Lv.${weapon.level + 1}`,
      description: levelDesc,
      type: 'weapon_level',
      icon,
      iconBg: '#ff2d55',
      weaponId: weapon.id,
      currentLevel: weapon.level,
      maxLevel: weapon.maxLevel,
    });
  }

  // --- Stat upgrades ---
  for (const stat of STAT_UPGRADES) {
    const currentLvl = getStatLevel(stat.id);
    if (currentLvl >= stat.maxLevel) continue;
    pool.push({
      id: stat.id,
      name: stat.name,
      description: `${stat.description} (${currentLvl + 1}/${stat.maxLevel})`,
      type: 'stat',
      icon: stat.icon,
      iconBg: '#00e5ff',
      currentLevel: currentLvl,
      maxLevel: stat.maxLevel,
    });
  }

  // --- Pick 3 unique options with weighted selection ---
  const chosen: Upgrade[] = [];
  const usedIds = new Set<string>();

  while (chosen.length < 3 && pool.length > 0) {
    // Assign weights: new weapons get 40% bias
    const weights = pool.map((u) => (u.type === 'weapon_new' ? 2.0 : 1.0));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;

    let idx = 0;
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        idx = i;
        break;
      }
    }

    const pick = pool[idx];
    if (!usedIds.has(pick.id)) {
      chosen.push(pick);
      usedIds.add(pick.id);
    }
    pool.splice(idx, 1);
  }

  // --- Fallback: full heal if no upgrades available ---
  while (chosen.length < 3) {
    // Pad with full heal option (only one unique heal entry)
    if (!usedIds.has('full_heal')) {
      chosen.push({
        id: 'full_heal',
        name: 'Full Heal',
        description: 'Restore all HP',
        type: 'stat',
        icon: 'heart',
        iconBg: '#30d158',
      });
      usedIds.add('full_heal');
    } else {
      // Absolute fallback - break to avoid infinite loop
      break;
    }
  }

  return chosen;
}
