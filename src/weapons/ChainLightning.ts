import { Graphics } from 'pixi.js';
import { Weapon } from './Weapon';
import { calculateDamage } from '../data/balance';
import { distance } from '../utils/math';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

const LEVELS = [
  { damage: 10, chainCount: 3, cooldown: 1.5, stunDuration: 0, reHit: false },
  { damage: 10, chainCount: 5, cooldown: 1.5, stunDuration: 0, reHit: false },
  { damage: 15, chainCount: 5, cooldown: 1.5, stunDuration: 0, reHit: false },
  { damage: 15, chainCount: 5, cooldown: 1.2, stunDuration: 0, reHit: false },
  { damage: 15, chainCount: 8, cooldown: 1.2, stunDuration: 0.5, reHit: true },
];

export class ChainLightning extends Weapon {
  chainGraphics: Graphics | null = null;
  chainTimer = 0;
  chainDuration = 0.2;

  constructor() {
    super('chainLightning', 'Chain Lightning');
  }

  getCooldown(player: Player): number {
    const lvl = LEVELS[this.level - 1];
    return lvl.cooldown * (1 - player.stats.cooldownReduction);
  }

  fire(player: Player, enemies: Enemy[], game: Game): void {
    const lvl = LEVELS[this.level - 1];
    const chainRange = 120;
    const hitSet = new Set<number>();
    const chainPoints: { x: number; y: number }[] = [{ x: player.x, y: player.y }];

    // Find nearest enemy to start chain
    let currentX = player.x;
    let currentY = player.y;

    for (let chain = 0; chain < lvl.chainCount; chain++) {
      let nearest: Enemy | null = null;
      let nearestDist = chainRange;

      for (const enemy of enemies) {
        if (!enemy.active || hitSet.has(enemy.id)) continue;
        const dist = distance(currentX, currentY, enemy.x, enemy.y);
        if (dist < nearestDist) {
          nearestDist = dist;
          nearest = enemy;
        }
      }

      if (!nearest) break;

      hitSet.add(nearest.id);
      chainPoints.push({ x: nearest.x, y: nearest.y });

      const isCrit = Math.random() < player.stats.critChance;
      const dmg = calculateDamage(lvl.damage, player.stats.damage, nearest.armor, isCrit, player.stats.critDamage);
      game.damageEnemy(nearest, dmg, isCrit, currentX, currentY);

      currentX = nearest.x;
      currentY = nearest.y;
    }

    // L5 re-hit: chain loops back for 50% damage
    if (lvl.reHit && chainPoints.length > 2) {
      for (let i = chainPoints.length - 2; i >= 1; i--) {
        const pt = chainPoints[i];
        // Find the enemy at this position and re-hit
        for (const enemy of enemies) {
          if (!enemy.active) continue;
          if (distance(pt.x, pt.y, enemy.x, enemy.y) < 20) {
            const dmg = calculateDamage(Math.floor(lvl.damage * 0.5), player.stats.damage, enemy.armor, false, 1);
            game.damageEnemy(enemy, dmg, false, pt.x, pt.y);
            break;
          }
        }
      }
    }

    if (chainPoints.length > 1) {
      this.showChain(chainPoints, game);
    }
    playSound('weapon_zap');
  }

  private showChain(points: { x: number; y: number }[], game: Game): void {
    if (this.chainGraphics) {
      this.chainGraphics.removeFromParent();
    }

    const g = new Graphics();
    g.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      // Jagged lightning effect
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      const segments = 3;
      for (let s = 1; s <= segments; s++) {
        const t = s / segments;
        const x = points[i - 1].x + dx * t + (s < segments ? (Math.random() - 0.5) * 20 : 0);
        const y = points[i - 1].y + dy * t + (s < segments ? (Math.random() - 0.5) * 20 : 0);
        g.lineTo(x, y);
      }
    }
    g.stroke({ color: 0x60a5fa, width: 3, alpha: 0.8 });

    game.layers.effects.addChild(g);
    this.chainGraphics = g;
    this.chainTimer = this.chainDuration;
  }

  update(dt: number, player: Player, enemies: Enemy[], game: Game): void {
    super.update(dt, player, enemies, game);

    if (this.chainTimer > 0) {
      this.chainTimer -= dt;
      if (this.chainGraphics) {
        this.chainGraphics.alpha = this.chainTimer / this.chainDuration;
        if (this.chainTimer <= 0) {
          this.chainGraphics.removeFromParent();
          this.chainGraphics = null;
        }
      }
    }
  }

  getLevelDescription(): string {
    const lvl = LEVELS[this.level - 1];
    if (this.level === 5) return 'Storm Nexus: Re-hit + stun';
    return `Dmg:${lvl.damage} Chains:${lvl.chainCount} CD:${lvl.cooldown}s`;
  }
}
