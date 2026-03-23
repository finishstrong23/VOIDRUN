import type { Upgrade } from '../types';
import type { Weapon } from '../weapons/Weapon';
import { WEAPON_DEFS, ALL_WEAPON_IDS } from '../weapons/WeaponRegistry';
import { STAT_UPGRADES } from './StatUpgrades';
import { WEAPON_LEVEL_DESCRIPTIONS } from './WeaponUpgrades';

export function generateUpgradeOptions(
  equippedWeapons: Weapon[],
  statLevels: Map<string, number>,
  playerLevel: number
): Upgrade[] {
  const options: Upgrade[] = [];
  const maxWeapons = 6;

  // Collect candidate pools
  const weaponLevelUps: Upgrade[] = [];
  const newWeapons: Upgrade[] = [];
  const statUpgrades: Upgrade[] = [];

  // Weapon level-ups
  for (const weapon of equippedWeapons) {
    if (weapon.level < weapon.maxLevel) {
      const desc = WEAPON_LEVEL_DESCRIPTIONS[weapon.id];
      weaponLevelUps.push({
        id: `weapon_level_${weapon.id}`,
        name: WEAPON_DEFS[weapon.id].name,
        description: desc ? desc[weapon.level - 1] : `Level ${weapon.level + 1}`,
        type: 'weapon_level',
        icon: 'weapon',
        weaponId: weapon.id,
        currentLevel: weapon.level,
        maxLevel: weapon.maxLevel,
      });
    }
  }

  // New weapons
  if (equippedWeapons.length < maxWeapons) {
    const equippedIds = new Set(equippedWeapons.map(w => w.id));
    for (const id of ALL_WEAPON_IDS) {
      if (!equippedIds.has(id)) {
        const def = WEAPON_DEFS[id];
        newWeapons.push({
          id: `weapon_new_${id}`,
          name: def.name,
          description: def.description,
          type: 'weapon_new',
          icon: 'weapon_new',
          weaponId: id,
        });
      }
    }
  }

  // Stat upgrades
  for (const stat of STAT_UPGRADES) {
    const currentLevel = statLevels.get(stat.id) || 0;
    if (currentLevel < stat.maxLevel) {
      statUpgrades.push({
        id: stat.id,
        name: stat.name,
        description: stat.description,
        type: 'stat',
        icon: stat.icon,
        currentLevel,
        maxLevel: stat.maxLevel,
      });
    }
  }

  // Selection logic: pick 3 options
  const allCandidates = [...weaponLevelUps, ...newWeapons, ...statUpgrades];
  if (allCandidates.length === 0) {
    // All maxed - offer full heal
    return [{
      id: 'full_heal',
      name: 'Full Heal',
      description: 'Restore to max HP',
      type: 'stat',
      icon: 'heart',
    }];
  }

  // Slot 1: 40% chance for new weapon if available
  if (newWeapons.length > 0 && Math.random() < 0.4) {
    const idx = Math.floor(Math.random() * newWeapons.length);
    options.push(newWeapons[idx]);
    newWeapons.splice(idx, 1);
  }

  // Fill remaining slots
  const remaining = [...weaponLevelUps, ...newWeapons, ...statUpgrades]
    .filter(u => !options.find(o => o.id === u.id));

  shuffle(remaining);

  while (options.length < 3 && remaining.length > 0) {
    options.push(remaining.pop()!);
  }

  // If we still don't have 3, pad with full heal
  while (options.length < 3) {
    if (!options.find(o => o.id === 'full_heal')) {
      options.push({
        id: 'full_heal',
        name: 'Full Heal',
        description: 'Restore to max HP',
        type: 'stat',
        icon: 'heart',
      });
    } else {
      break;
    }
  }

  return options.slice(0, 3);
}

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}
