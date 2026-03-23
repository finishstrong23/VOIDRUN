import { Graphics } from 'pixi.js';
import { Weapon } from './Weapon';
import { calculateDamage } from '../data/balance';
import { distance, TWO_PI } from '../utils/math';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

const LEVELS = [
  { damage: 8, orbCount: 2, orbitRadius: 50 },
  { damage: 8, orbCount: 3, orbitRadius: 50 },
  { damage: 11, orbCount: 3, orbitRadius: 50 },
  { damage: 11, orbCount: 4, orbitRadius: 65 },
  { damage: 17, orbCount: 4, orbitRadius: 65 },
];

const ORB_RADIUS = 10;
const ORBIT_SPEED = 2.0;
const HIT_COOLDOWN = 0.5;

export class VoidOrbs extends Weapon {
  orbAngle = 0;
  orbGraphics: Graphics[] = [];
  hitCooldowns: Map<string, number> = new Map(); // "orbIndex-enemyId" -> timer

  constructor() {
    super('voidOrbs', 'Void Orbs');
  }

  getCooldown(): number {
    return 0; // Passive
  }

  fire(): void {
    // Passive weapon, handled in update
  }

  update(dt: number, player: Player, enemies: Enemy[], game: Game): void {
    const lvl = LEVELS[this.level - 1];
    this.orbAngle += ORBIT_SPEED * dt;

    // Update hit cooldowns
    for (const [key, timer] of this.hitCooldowns) {
      const newTimer = timer - dt;
      if (newTimer <= 0) {
        this.hitCooldowns.delete(key);
      } else {
        this.hitCooldowns.set(key, newTimer);
      }
    }

    // Ensure correct number of orb graphics
    while (this.orbGraphics.length < lvl.orbCount) {
      const g = new Graphics();
      g.circle(0, 0, ORB_RADIUS);
      g.fill({ color: 0x8b5cf6, alpha: 0.8 });
      const glow = new Graphics();
      glow.circle(0, 0, ORB_RADIUS * 2);
      glow.fill({ color: 0x8b5cf6, alpha: 0.2 });
      game.layers.player.addChild(glow);
      game.layers.player.addChild(g);
      this.orbGraphics.push(g);
      // Store glow reference on the graphics object
      (g as Graphics & { _glow: Graphics })._glow = glow;
    }
    while (this.orbGraphics.length > lvl.orbCount) {
      const g = this.orbGraphics.pop()!;
      const glow = (g as Graphics & { _glow: Graphics })._glow;
      g.removeFromParent();
      if (glow) glow.removeFromParent();
    }

    // Position orbs and check collisions
    for (let i = 0; i < lvl.orbCount; i++) {
      const angle = this.orbAngle + (TWO_PI / lvl.orbCount) * i;
      const ox = player.x + Math.cos(angle) * lvl.orbitRadius;
      const oy = player.y + Math.sin(angle) * lvl.orbitRadius;

      this.orbGraphics[i].position.set(ox, oy);
      const glow = (this.orbGraphics[i] as Graphics & { _glow: Graphics })._glow;
      if (glow) glow.position.set(ox, oy);

      // Check collision with enemies
      const nearby = game.enemyHash.query(ox, oy, ORB_RADIUS + 40);
      for (const entity of nearby) {
        const enemy = entity as Enemy;
        if (!enemy.active) continue;

        const dist = distance(ox, oy, enemy.x, enemy.y);
        if (dist < ORB_RADIUS + enemy.radius) {
          const key = `${i}-${enemy.id}`;
          if (!this.hitCooldowns.has(key)) {
            const isCrit = Math.random() < player.stats.critChance;
            const dmg = calculateDamage(lvl.damage, player.stats.damage, enemy.armor, isCrit, player.stats.critDamage);
            game.damageEnemy(enemy, dmg, isCrit, ox, oy);
            this.hitCooldowns.set(key, HIT_COOLDOWN);
          }
        }
      }
    }
  }

  reset(): void {
    super.reset();
    this.orbAngle = 0;
    for (const g of this.orbGraphics) {
      const glow = (g as Graphics & { _glow: Graphics })._glow;
      g.removeFromParent();
      if (glow) glow.removeFromParent();
    }
    this.orbGraphics = [];
    this.hitCooldowns.clear();
  }
}
