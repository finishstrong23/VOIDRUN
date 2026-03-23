import { Weapon } from './Weapon';
import { Graphics } from 'pixi.js';
import { distance } from '../utils/math';
import { calculateDamage } from '../data/balance';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

interface NovaBlastLevel {
  dmg: number;
  radius: number;
  cd: number;
}

const LEVELS: NovaBlastLevel[] = [
  { dmg: 25, radius: 100, cd: 3.0 },
  { dmg: 25, radius: 125, cd: 3.0 },
  { dmg: 35, radius: 125, cd: 3.0 },
  { dmg: 35, radius: 125, cd: 2.25 },
  { dmg: 35, radius: 188, cd: 2.25 },
];

export class NovaBlast extends Weapon {
  constructor() {
    super('nova_blast', 'Nova Blast');
  }

  private get stats(): NovaBlastLevel {
    return LEVELS[this.level - 1];
  }

  getCooldown(player: Player): number {
    return this.stats.cd * (1 - (player.stats?.cooldownReduction ?? 0));
  }

  fire(player: Player, enemies: Enemy[], game: Game): void {
    const { dmg, radius } = this.stats;

    // Hit all enemies in radius
    const nearby = game.enemyHash.query(player.x, player.y, radius) as Enemy[];
    let hitCount = 0;

    for (const enemy of nearby) {
      if (!enemy.active || !enemy.isAlive()) continue;
      const dist = distance(player.x, player.y, enemy.x, enemy.y);
      if (dist > radius + enemy.radius) continue;

      const isCrit = Math.random() < (player.stats?.critChance ?? 0.05);
      const damage = calculateDamage(dmg, player.stats?.damage ?? 1, enemy.armor ?? 0, isCrit, player.stats?.critDamage ?? 1.5);
      game.damageEnemy(enemy, damage, isCrit, player.x, player.y);
      hitCount++;
    }

    // Expanding ring visual
    this.showNovaEffect(player, game, radius);

    playSound('weapon_boom');
  }

  private showNovaEffect(player: Player, game: Game, maxRadius: number): void {
    const gfx = new Graphics();
    gfx.x = player.x;
    gfx.y = player.y;
    game.layers.effects.addChild(gfx);

    const startTime = performance.now();
    const duration = 300;

    const animate = () => {
      const elapsed = performance.now() - startTime;
      const t = Math.min(1, elapsed / duration);
      const currentRadius = maxRadius * t;
      const alpha = 1 - t;

      gfx.clear();

      // Expanding fill
      gfx.circle(0, 0, currentRadius);
      gfx.fill({ color: 0xff2d55, alpha: alpha * 0.15 });

      // Expanding ring
      gfx.circle(0, 0, currentRadius);
      gfx.stroke({ width: 3, color: 0xff2d55, alpha: alpha * 0.8 });

      // Inner bright ring
      gfx.circle(0, 0, currentRadius * 0.9);
      gfx.stroke({ width: 2, color: 0xff6b8a, alpha: alpha * 0.5 });

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        gfx.removeFromParent();
        gfx.destroy();
      }
    };
    requestAnimationFrame(animate);
  }
}
