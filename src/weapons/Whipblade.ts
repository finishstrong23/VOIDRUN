import { Graphics } from 'pixi.js';
import { Weapon } from './Weapon';
import { calculateDamage } from '../data/balance';
import { distance, angleDiff, DEG_TO_RAD } from '../utils/math';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

const LEVELS = [
  { damage: 12, arcAngle: 120, range: 80 },
  { damage: 16, arcAngle: 120, range: 80 },
  { damage: 16, arcAngle: 150, range: 80 },
  { damage: 16, arcAngle: 150, range: 104 },
  { damage: 24, arcAngle: 360, range: 104 },
];

export class Whipblade extends Weapon {
  slashGraphics: Graphics | null = null;
  slashTimer = 0;
  slashDuration = 0.15;

  constructor() {
    super('whipblade', 'Whipblade');
  }

  getCooldown(player: Player): number {
    return 1.2 * (1 - player.stats.cooldownReduction);
  }

  fire(player: Player, enemies: Enemy[], game: Game): void {
    const lvl = LEVELS[this.level - 1];
    const arcRad = lvl.arcAngle * DEG_TO_RAD;
    const halfArc = arcRad / 2;
    const range = lvl.range;
    const hitSet = new Set<number>();

    // Query spatial hash for enemies in range
    const nearby = game.enemyHash.query(player.x, player.y, range);

    for (const entity of nearby) {
      const enemy = entity as Enemy;
      if (!enemy.active || hitSet.has(enemy.id)) continue;

      const dist = distance(player.x, player.y, enemy.x, enemy.y);
      if (dist > range + enemy.radius) continue;

      // Check angle
      if (lvl.arcAngle < 360) {
        const toEnemy = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        const diff = Math.abs(angleDiff(player.facingAngle, toEnemy));
        if (diff > halfArc) continue;
      }

      hitSet.add(enemy.id);

      const isCrit = Math.random() < player.stats.critChance;
      const dmg = calculateDamage(lvl.damage, player.stats.damage, enemy.armor, isCrit, player.stats.critDamage);
      game.damageEnemy(enemy, dmg, isCrit, player.x, player.y);
    }

    // Visual slash
    this.showSlash(player, lvl.arcAngle, range, game);
    playSound('weapon_slash');
  }

  private showSlash(player: Player, arcAngle: number, range: number, game: Game): void {
    if (this.slashGraphics) {
      this.slashGraphics.removeFromParent();
    }

    const g = new Graphics();
    const arcRad = arcAngle * DEG_TO_RAD;
    const startAngle = player.facingAngle - arcRad / 2;

    g.moveTo(0, 0);
    g.arc(0, 0, range, startAngle, startAngle + arcRad);
    g.lineTo(0, 0);
    g.fill({ color: 0xffffff, alpha: 0.3 });
    g.stroke({ color: 0xffffff, width: 2, alpha: 0.5 });

    g.position.set(player.x, player.y);
    game.layers.effects.addChild(g);
    this.slashGraphics = g;
    this.slashTimer = this.slashDuration;
  }

  update(dt: number, player: Player, enemies: Enemy[], game: Game): void {
    super.update(dt, player, enemies, game);

    // Fade out slash
    if (this.slashTimer > 0) {
      this.slashTimer -= dt;
      if (this.slashGraphics) {
        this.slashGraphics.alpha = this.slashTimer / this.slashDuration;
        if (this.slashTimer <= 0) {
          this.slashGraphics.removeFromParent();
          this.slashGraphics = null;
        }
      }
    }
  }

  getLevelDescription(): string {
    const lvl = LEVELS[this.level - 1];
    if (this.level === 5) return 'Void Reaper: 360deg slash';
    return `Dmg:${lvl.damage} Arc:${lvl.arcAngle}deg Range:${lvl.range}`;
  }
}
