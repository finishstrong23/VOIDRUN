import { Weapon } from './Weapon';
import { Graphics } from 'pixi.js';
import { distance } from '../utils/math';
import { calculateDamage } from '../data/balance';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

interface ChainLightningLevel {
  dmg: number;
  chains: number;
  cd: number;
}

const LEVELS: ChainLightningLevel[] = [
  { dmg: 10, chains: 3, cd: 1.5 },
  { dmg: 10, chains: 5, cd: 1.5 },
  { dmg: 15, chains: 5, cd: 1.5 },
  { dmg: 15, chains: 5, cd: 1.2 },
  { dmg: 15, chains: 8, cd: 1.2 },
];

const CHAIN_RANGE = 150;

export class ChainLightning extends Weapon {
  constructor() {
    super('chain_lightning', 'Chain Lightning');
  }

  private get stats(): ChainLightningLevel {
    return LEVELS[this.level - 1];
  }

  getCooldown(player: Player): number {
    return this.stats.cd * (1 - (player.stats?.cooldownReduction ?? 0));
  }

  fire(player: Player, enemies: Enemy[], game: Game): void {
    const { dmg, chains } = this.stats;

    // Find nearest enemy to start the chain
    let nearest: Enemy | null = null;
    let nearestDist = 400; // initial range

    for (const enemy of enemies) {
      if (!enemy.active || !enemy.isAlive()) continue;
      const dist = distance(player.x, player.y, enemy.x, enemy.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearest = enemy;
      }
    }

    if (!nearest) return;

    // Build chain
    const chainTargets: Enemy[] = [nearest];
    const hitSet = new Set<number>([nearest.id]);

    let current = nearest;
    for (let i = 1; i < chains; i++) {
      let nextEnemy: Enemy | null = null;
      let nextDist = CHAIN_RANGE;

      for (const enemy of enemies) {
        if (!enemy.active || !enemy.isAlive()) continue;
        if (hitSet.has(enemy.id)) continue;
        const dist = distance(current.x, current.y, enemy.x, enemy.y);
        if (dist < nextDist) {
          nextDist = dist;
          nextEnemy = enemy;
        }
      }

      if (!nextEnemy) break;
      chainTargets.push(nextEnemy);
      hitSet.add(nextEnemy.id);
      current = nextEnemy;
    }

    // Damage all chained enemies
    for (const enemy of chainTargets) {
      const isCrit = Math.random() < (player.stats?.critChance ?? 0.05);
      const damage = calculateDamage(dmg, player.stats?.damage ?? 1, enemy.armor ?? 0, isCrit, player.stats?.critDamage ?? 1.5);
      game.damageEnemy(enemy, damage, isCrit, player.x, player.y);
    }

    // Draw lightning visual
    this.showLightningEffect(player, game, chainTargets);

    playSound('weapon_zap');
  }

  private showLightningEffect(player: Player, game: Game, targets: Enemy[]): void {
    const gfx = new Graphics();
    game.layers.effects.addChild(gfx);

    // Draw jagged lightning lines from player to first target, then between targets
    let prevX = player.x;
    let prevY = player.y;

    for (const target of targets) {
      this.drawLightningBolt(gfx, prevX, prevY, target.x, target.y);
      prevX = target.x;
      prevY = target.y;
    }

    // Fade out
    const startTime = performance.now();
    const duration = 200;
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

  private drawLightningBolt(gfx: Graphics, x1: number, y1: number, x2: number, y2: number): void {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const segments = Math.max(3, Math.floor(dist / 15));
    const perpX = -dy / dist;
    const perpY = dx / dist;

    // Bright core
    gfx.moveTo(x1, y1);
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const baseX = x1 + dx * t;
      const baseY = y1 + dy * t;
      const jitter = (Math.random() - 0.5) * 20;
      gfx.lineTo(baseX + perpX * jitter, baseY + perpY * jitter);
    }
    gfx.lineTo(x2, y2);
    gfx.stroke({ width: 3, color: 0xffffff, alpha: 0.9 });

    // Outer glow
    gfx.moveTo(x1, y1);
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const baseX = x1 + dx * t;
      const baseY = y1 + dy * t;
      const jitter = (Math.random() - 0.5) * 25;
      gfx.lineTo(baseX + perpX * jitter, baseY + perpY * jitter);
    }
    gfx.lineTo(x2, y2);
    gfx.stroke({ width: 6, color: 0x00e5ff, alpha: 0.4 });
  }
}
