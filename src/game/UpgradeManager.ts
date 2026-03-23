import type { Upgrade } from '../types';
import type { Player } from '../entities/Player';
import type { Weapon } from '../weapons/Weapon';
import { createWeapon } from '../weapons/WeaponRegistry';
import { STAT_UPGRADES } from '../upgrades/StatUpgrades';
import { generateUpgradeOptions } from '../upgrades/UpgradeRegistry';

export class UpgradeManager {
  statLevels: Map<string, number> = new Map();

  generateOptions(weapons: Weapon[], playerLevel: number): Upgrade[] {
    return generateUpgradeOptions(weapons, this.statLevels, playerLevel);
  }

  applyUpgrade(upgrade: Upgrade, player: Player, weapons: Weapon[]): Weapon | null {
    switch (upgrade.type) {
      case 'stat': {
        if (upgrade.id === 'full_heal') {
          player.hp = player.maxHP;
          return null;
        }
        const stat = STAT_UPGRADES.find(s => s.id === upgrade.id);
        if (stat) {
          stat.apply(player.stats, player);
          const currentLevel = this.statLevels.get(upgrade.id) || 0;
          this.statLevels.set(upgrade.id, currentLevel + 1);
        }
        return null;
      }
      case 'weapon_level': {
        const weapon = weapons.find(w => w.id === upgrade.weaponId);
        if (weapon) {
          weapon.levelUp();
        }
        return null;
      }
      case 'weapon_new': {
        if (upgrade.weaponId) {
          const weapon = createWeapon(upgrade.weaponId);
          return weapon;
        }
        return null;
      }
    }
    return null;
  }

  reset(): void {
    this.statLevels.clear();
  }
}
