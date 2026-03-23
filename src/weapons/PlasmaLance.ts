import { Weapon } from './Weapon';
import { distance, angle, TWO_PI } from '../utils/math';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

interface PlasmaLanceLevel {
  dmg: number;
  pierce: number;
  cd: number;
  proj: number;
  homing: boolean;
}

const LEVELS: PlasmaLanceLevel[] = [
  { dmg: 15, pierce: 1, cd: 0.8, proj: 1, homing: false },
  { dmg: 15, pierce: 2, cd: 0.8, proj: 1, homing: false },
  { dmg: 15, pierce: 2, cd: 0.64, proj: 1, homing: false },
  { dmg: 23, pierce: 2, cd: 0.64, proj: 1, homing: false },
  { dmg: 23, pierce: 2, cd: 0.64, proj: 3, homing: true },
];

const PROJECTILE_SPEED = 400;
const PROJECTILE_RADIUS = 6;
const TARGET_RANGE = 500;
const PROJECTILE_COLOR = 0x00e5ff;

export class PlasmaLance extends Weapon {
  constructor() {
    super('plasma_lance', 'Plasma Lance');
  }

  private get stats(): PlasmaLanceLevel {
    return LEVELS[this.level - 1];
  }

  getCooldown(player: Player): number {
    return this.stats.cd * (1 - (player.stats?.cooldownReduction ?? 0));
  }

  fire(player: Player, enemies: Enemy[], game: Game): void {
    const { dmg, pierce, proj, homing } = this.stats;

    // Find nearest enemy within range
    let nearest: Enemy | null = null;
    let nearestDist = TARGET_RANGE;

    for (const enemy of enemies) {
      if (!enemy.active || !enemy.isAlive()) continue;
      const dist = distance(player.x, player.y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }

    if (!nearest) return;

    const baseAngle = angle(player.x, player.y, nearest.x, nearest.y);
    const damage = Math.round(dmg * (player.stats?.damage ?? 1));

    if (proj === 1) {
      game.spawnProjectile(
        player.x, player.y, baseAngle, PROJECTILE_SPEED,
        damage, pierce, PROJECTILE_RADIUS, true, PROJECTILE_COLOR, homing
      );
    } else {
      // Spread projectiles evenly
      const spread = 0.2; // radians between projectiles
      const startAngle = baseAngle - spread * (proj - 1) / 2;
      for (let i = 0; i < proj; i++) {
        const a = startAngle + spread * i;
        game.spawnProjectile(
          player.x, player.y, a, PROJECTILE_SPEED,
          damage, pierce, PROJECTILE_RADIUS, true, PROJECTILE_COLOR, homing
        );
      }
    }

    playSound('weapon_laser');
  }
}
