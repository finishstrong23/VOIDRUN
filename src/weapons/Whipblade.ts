import { Weapon } from './Weapon';
import { Graphics } from 'pixi.js';
import { distance, angle, angleDiff, DEG_TO_RAD } from '../utils/math';
import { calculateDamage } from '../data/balance';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

interface WhipbladeLevel {
  dmg: number;
  arc: number;
  range: number;
}

const LEVELS: WhipbladeLevel[] = [
  { dmg: 12, arc: 120, range: 80 },
  { dmg: 16, arc: 120, range: 80 },
  { dmg: 16, arc: 150, range: 80 },
  { dmg: 16, arc: 150, range: 104 },
  { dmg: 24, arc: 360, range: 104 },
];

export class Whipblade extends Weapon {
  constructor() {
    super('whipblade', 'Whipblade');
  }

  private get stats(): WhipbladeLevel {
    return LEVELS[this.level - 1];
  }

  getCooldown(player: Player): number {
    return 1.2 * (1 - (player.stats?.cooldownReduction ?? 0));
  }

  fire(player: Player, enemies: Enemy[], game: Game): void {
    const { dmg, arc, range } = this.stats;
    const halfArc = (arc / 2) * DEG_TO_RAD;
    const facing = player.facingAngle ?? 0;

    // Query spatial hash for nearby enemies
    const nearby = game.enemyHash.query(player.x, player.y, range) as Enemy[];
    let hitCount = 0;

    for (const enemy of nearby) {
      if (!enemy.active || !enemy.isAlive()) continue;
      const dist = distance(player.x, player.y, enemy.x, enemy.y);
      if (dist > range + enemy.radius) continue;

      // Check arc (360 = full circle, skip angle check)
      if (arc < 360) {
        const toEnemy = angle(player.x, player.y, enemy.x, enemy.y);
        const diff = Math.abs(angleDiff(facing, toEnemy));
        if (diff > halfArc) continue;
      }

      const isCrit = Math.random() < (player.stats?.critChance ?? 0.05);
      const damage = calculateDamage(dmg, player.stats?.damage ?? 1, enemy.armor ?? 0, isCrit, player.stats?.critDamage ?? 1.5);
      game.damageEnemy(enemy, damage, isCrit, player.x, player.y);
      hitCount++;
    }

    // Visual slash effect
    this.showSlashEffect(player, game, facing, halfArc, range, arc >= 360);

    if (hitCount > 0) {
      playSound('weapon_slash');
    }
  }

  private showSlashEffect(player: Player, game: Game, facing: number, halfArc: number, range: number, fullCircle: boolean): void {
    const gfx = new Graphics();
    gfx.x = player.x;
    gfx.y = player.y;

    if (fullCircle) {
      // Full circle slash
      gfx.circle(0, 0, range);
      gfx.stroke({ width: 4, color: 0x00e5ff, alpha: 0.8 });
      gfx.circle(0, 0, range - 4);
      gfx.stroke({ width: 2, color: 0xffffff, alpha: 0.6 });
    } else {
      // Arc slash
      const startAngle = facing - halfArc;
      const endAngle = facing + halfArc;

      gfx.moveTo(0, 0);
      gfx.arc(0, 0, range, startAngle, endAngle);
      gfx.closePath();
      gfx.fill({ color: 0x00e5ff, alpha: 0.15 });

      gfx.arc(0, 0, range, startAngle, endAngle);
      gfx.stroke({ width: 3, color: 0x00e5ff, alpha: 0.8 });

      gfx.arc(0, 0, range * 0.95, startAngle, endAngle);
      gfx.stroke({ width: 2, color: 0xffffff, alpha: 0.5 });
    }

    game.layers.effects.addChild(gfx);

    // Fade out over 0.15s
    const startTime = performance.now();
    const duration = 150;
    const fade = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      gfx.alpha = 1 - t;
      if (t < 1) {
        requestAnimationFrame(fade);
      } else {
        gfx.removeFromParent();
        gfx.destroy();
      }
    };
    requestAnimationFrame(fade);
  }
}
