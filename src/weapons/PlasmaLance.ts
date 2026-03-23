import { Weapon } from './Weapon';
import { distance, angle } from '../utils/math';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

const LEVELS = [
  { damage: 15, pierce: 1, cooldown: 0.8, projectiles: 1, homing: false },
  { damage: 15, pierce: 2, cooldown: 0.8, projectiles: 1, homing: false },
  { damage: 15, pierce: 2, cooldown: 0.64, projectiles: 1, homing: false },
  { damage: 23, pierce: 2, cooldown: 0.64, projectiles: 1, homing: false },
  { damage: 23, pierce: 2, cooldown: 0.64, projectiles: 3, homing: true },
];

export class PlasmaLance extends Weapon {
  constructor() {
    super('plasmaLance', 'Plasma Lance');
  }

  getCooldown(player: Player): number {
    const lvl = LEVELS[this.level - 1];
    return lvl.cooldown * (1 - player.stats.cooldownReduction);
  }

  fire(player: Player, enemies: Enemy[], game: Game): void {
    const lvl = LEVELS[this.level - 1];

    // Find nearest enemy within 500 range
    let nearest: Enemy | null = null;
    let nearestDist = 500;
    for (const enemy of enemies) {
      if (!enemy.active) continue;
      const dist = distance(player.x, player.y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }

    const fireAngle = nearest
      ? angle(player.x, player.y, nearest.x, nearest.y)
      : player.facingAngle;

    for (let i = 0; i < lvl.projectiles; i++) {
      let a = fireAngle;
      if (lvl.projectiles > 1) {
        const spread = 0.2; // radians
        a += (i - (lvl.projectiles - 1) / 2) * spread;
      }
      game.spawnProjectile(
        player.x, player.y, a,
        400, lvl.damage, lvl.pierce,
        5, true, 0x22d3ee, lvl.homing
      );
    }

    playSound('weapon_laser');
  }

  getLevelDescription(): string {
    const lvl = LEVELS[this.level - 1];
    if (this.level === 5) return 'Singularity Cannon: 3 homing bolts';
    return `Dmg:${lvl.damage} Pierce:${lvl.pierce} CD:${lvl.cooldown}s`;
  }
}
