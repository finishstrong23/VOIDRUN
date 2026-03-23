import { Weapon } from './Weapon';
import { Graphics } from 'pixi.js';
import { distance, TWO_PI } from '../utils/math';
import { calculateDamage } from '../data/balance';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

interface VoidOrbsLevel {
  dmg: number;
  orbs: number;
  radius: number;
}

const LEVELS: VoidOrbsLevel[] = [
  { dmg: 8, orbs: 2, radius: 50 },
  { dmg: 8, orbs: 3, radius: 50 },
  { dmg: 11, orbs: 3, radius: 50 },
  { dmg: 11, orbs: 4, radius: 65 },
  { dmg: 17, orbs: 4, radius: 65 },
];

const ORB_SPEED = 2; // radians per second
const ORB_HIT_COOLDOWN = 0.5; // seconds
const ORB_VISUAL_RADIUS = 8;

export class VoidOrbs extends Weapon {
  private orbAngle = 0;
  private orbGraphics: Graphics[] = [];
  private hitCooldowns: Map<number, number> = new Map(); // enemy.id -> remaining cooldown
  private initialized = false;

  constructor() {
    super('void_orbs', 'Void Orbs');
  }

  private get stats(): VoidOrbsLevel {
    return LEVELS[this.level - 1];
  }

  getCooldown(_player: Player): number {
    return 0; // Passive weapon, no cooldown
  }

  update(dt: number, player: Player, enemies: Enemy[], game: Game): void {
    // Initialize orb graphics if needed
    if (!this.initialized) {
      this.rebuildOrbs(game);
      this.initialized = true;
    }

    // Rebuild orbs if level changed (orb count mismatch)
    if (this.orbGraphics.length !== this.stats.orbs) {
      this.rebuildOrbs(game);
    }

    const { dmg, orbs, radius } = this.stats;

    // Rotate orbs
    this.orbAngle += ORB_SPEED * dt;
    if (this.orbAngle > TWO_PI) this.orbAngle -= TWO_PI;

    // Update hit cooldowns
    for (const [id, cd] of this.hitCooldowns) {
      const remaining = cd - dt;
      if (remaining <= 0) {
        this.hitCooldowns.delete(id);
      } else {
        this.hitCooldowns.set(id, remaining);
      }
    }

    // Position orbs and check collisions
    for (let i = 0; i < orbs; i++) {
      const orbA = this.orbAngle + (TWO_PI / orbs) * i;
      const orbX = player.x + Math.cos(orbA) * radius;
      const orbY = player.y + Math.sin(orbA) * radius;

      // Update visual position
      if (this.orbGraphics[i]) {
        this.orbGraphics[i].x = orbX;
        this.orbGraphics[i].y = orbY;
      }

      // Check collision with enemies
      const nearby = game.enemyHash.query(orbX, orbY, ORB_VISUAL_RADIUS + 20) as Enemy[];
      for (const enemy of nearby) {
        if (!enemy.active || !enemy.isAlive()) continue;
        if (this.hitCooldowns.has(enemy.id)) continue;

        const dist = distance(orbX, orbY, enemy.x, enemy.y);
        if (dist < ORB_VISUAL_RADIUS + enemy.radius) {
          const isCrit = Math.random() < (player.stats?.critChance ?? 0.05);
          const damage = calculateDamage(dmg, player.stats?.damage ?? 1, enemy.armor ?? 0, isCrit, player.stats?.critDamage ?? 1.5);
          game.damageEnemy(enemy, damage, isCrit, orbX, orbY);
          this.hitCooldowns.set(enemy.id, ORB_HIT_COOLDOWN);
        }
      }
    }
  }

  fire(_player: Player, _enemies: Enemy[], _game: Game): void {
    // Passive weapon - damage is handled in update()
  }

  private rebuildOrbs(game: Game): void {
    // Remove old orb graphics
    for (const gfx of this.orbGraphics) {
      gfx.removeFromParent();
      gfx.destroy();
    }
    this.orbGraphics = [];

    // Create new orb graphics
    const { orbs } = this.stats;
    for (let i = 0; i < orbs; i++) {
      const gfx = new Graphics();

      // Outer glow
      gfx.circle(0, 0, ORB_VISUAL_RADIUS + 4);
      gfx.fill({ color: 0xbf5af2, alpha: 0.2 });

      // Core orb
      gfx.circle(0, 0, ORB_VISUAL_RADIUS);
      gfx.fill({ color: 0xbf5af2, alpha: 0.7 });

      // Inner bright spot
      gfx.circle(0, 0, ORB_VISUAL_RADIUS * 0.5);
      gfx.fill({ color: 0xe0aaff, alpha: 0.9 });

      game.layers.player.addChild(gfx);
      this.orbGraphics.push(gfx);
    }
  }

  reset(): void {
    super.reset();
    this.orbAngle = 0;
    this.hitCooldowns.clear();
    for (const gfx of this.orbGraphics) {
      gfx.removeFromParent();
      gfx.destroy();
    }
    this.orbGraphics = [];
    this.initialized = false;
  }
}
