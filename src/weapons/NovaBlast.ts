import { Graphics } from 'pixi.js';
import { Weapon } from './Weapon';
import { calculateDamage } from '../data/balance';
import { distance } from '../utils/math';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

const LEVELS = [
  { damage: 25, radius: 100, cooldown: 3.0, burnDPS: 0, burnDuration: 0 },
  { damage: 25, radius: 125, cooldown: 3.0, burnDPS: 0, burnDuration: 0 },
  { damage: 35, radius: 125, cooldown: 3.0, burnDPS: 0, burnDuration: 0 },
  { damage: 35, radius: 125, cooldown: 2.25, burnDPS: 0, burnDuration: 0 },
  { damage: 35, radius: 188, cooldown: 2.25, burnDPS: 5, burnDuration: 3 },
];

export class NovaBlast extends Weapon {
  novaGraphics: Graphics | null = null;
  novaTimer = 0;
  novaDuration = 0.3;

  constructor() {
    super('novaBlast', 'Nova Blast');
  }

  getCooldown(player: Player): number {
    const lvl = LEVELS[this.level - 1];
    return lvl.cooldown * (1 - player.stats.cooldownReduction);
  }

  fire(player: Player, _enemies: Enemy[], game: Game): void {
    const lvl = LEVELS[this.level - 1];
    const hitSet = new Set<number>();

    const nearby = game.enemyHash.query(player.x, player.y, lvl.radius);
    for (const entity of nearby) {
      const enemy = entity as Enemy;
      if (!enemy.active || hitSet.has(enemy.id)) continue;

      const dist = distance(player.x, player.y, enemy.x, enemy.y);
      if (dist > lvl.radius + enemy.radius) continue;

      hitSet.add(enemy.id);

      const isCrit = Math.random() < player.stats.critChance;
      const dmg = calculateDamage(lvl.damage, player.stats.damage, enemy.armor, isCrit, player.stats.critDamage);
      game.damageEnemy(enemy, dmg, isCrit, player.x, player.y);
    }

    this.showNova(player, lvl.radius, game);
    playSound('weapon_boom');
  }

  private showNova(player: Player, radius: number, game: Game): void {
    if (this.novaGraphics) {
      this.novaGraphics.removeFromParent();
    }

    const g = new Graphics();
    g.circle(0, 0, radius);
    g.fill({ color: 0xff6600, alpha: 0.3 });
    g.stroke({ color: 0xff8800, width: 3, alpha: 0.6 });
    g.position.set(player.x, player.y);
    game.layers.effects.addChild(g);
    this.novaGraphics = g;
    this.novaTimer = this.novaDuration;
  }

  update(dt: number, player: Player, enemies: Enemy[], game: Game): void {
    super.update(dt, player, enemies, game);

    if (this.novaTimer > 0) {
      this.novaTimer -= dt;
      if (this.novaGraphics) {
        const progress = 1 - this.novaTimer / this.novaDuration;
        this.novaGraphics.alpha = 1 - progress;
        this.novaGraphics.scale.set(0.5 + progress * 0.5);
        if (this.novaTimer <= 0) {
          this.novaGraphics.removeFromParent();
          this.novaGraphics = null;
        }
      }
    }
  }

  getLevelDescription(): string {
    const lvl = LEVELS[this.level - 1];
    if (this.level === 5) return 'Supernova: Burning zone 5 DPS 3s';
    return `Dmg:${lvl.damage} Radius:${lvl.radius} CD:${lvl.cooldown}s`;
  }
}
