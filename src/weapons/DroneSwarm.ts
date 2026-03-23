import { Weapon } from './Weapon';
import { Graphics } from 'pixi.js';
import { distance, angle, TWO_PI } from '../utils/math';
import { calculateDamage } from '../data/balance';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

interface DroneSwarmLevel {
  dmg: number;
  drones: number;
  speed: number;
  hits: number;
  permanent?: boolean;
}

const LEVELS: DroneSwarmLevel[] = [
  { dmg: 8, drones: 1, speed: 250, hits: 3 },
  { dmg: 8, drones: 2, speed: 250, hits: 3 },
  { dmg: 12, drones: 2, speed: 250, hits: 4 },
  { dmg: 12, drones: 3, speed: 300, hits: 4 },
  { dmg: 12, drones: 5, speed: 300, hits: 999, permanent: true },
];

const DRONE_RADIUS = 6;
const ORBIT_RADIUS = 70;
const ORBIT_SPEED = 1.5; // radians per second
const ATTACK_RANGE = 300;
const HIT_COOLDOWN = 0.4;

interface DroneState {
  x: number;
  y: number;
  hitsRemaining: number;
  orbitAngle: number;
  graphic: Graphics;
  targetId: number | null;
  hitCooldown: number;
  lastHitEnemy: number;
  lastHitDist: number;
}

export class DroneSwarm extends Weapon {
  private drones: DroneState[] = [];
  private initialized = false;

  constructor() {
    super('drone_swarm', 'Drone Swarm');
  }

  private get stats(): DroneSwarmLevel {
    return LEVELS[this.level - 1];
  }

  getCooldown(_player: Player): number {
    return 0; // Passive, drones managed in update
  }

  update(dt: number, player: Player, enemies: Enemy[], game: Game): void {
    if (!this.initialized) {
      this.rebuildDrones(player, game);
      this.initialized = true;
    }

    const { drones: droneCount, speed, dmg, hits, permanent } = this.stats;

    // Rebuild drones if level changed
    if (this.drones.length !== droneCount) {
      this.rebuildDrones(player, game);
    }

    // Remove expired drones (0 hits remaining) unless permanent
    if (!permanent) {
      for (let i = this.drones.length - 1; i >= 0; i--) {
        if (this.drones[i].hitsRemaining <= 0) {
          this.drones[i].graphic.removeFromParent();
          this.drones[i].graphic.destroy();
          this.drones.splice(i, 1);
        }
      }
    }

    for (const drone of this.drones) {
      // Update hit cooldown
      if (drone.hitCooldown > 0) drone.hitCooldown -= dt;

      // Find target
      let target: Enemy | null = null;
      let targetDist = ATTACK_RANGE;

      for (const enemy of enemies) {
        if (!enemy.active || !enemy.isAlive()) continue;
        const dist = distance(drone.x, drone.y, enemy.x, enemy.y);
        if (dist < targetDist) {
          targetDist = dist;
          target = enemy;
        }
      }

      if (target) {
        // Move toward target
        const a = angle(drone.x, drone.y, target.x, target.y);
        drone.x += Math.cos(a) * speed * dt;
        drone.y += Math.sin(a) * speed * dt;
        drone.targetId = target.id;
        drone.lastHitEnemy = target.id;
        drone.lastHitDist = distance(drone.x, drone.y, target.x, target.y);

        // Check collision
        const dist = distance(drone.x, drone.y, target.x, target.y);
        if (dist < DRONE_RADIUS + target.radius && drone.hitCooldown <= 0) {
          const isCrit = Math.random() < (player.stats?.critChance ?? 0.05);
          const damage = calculateDamage(dmg, player.stats?.damage ?? 1, target.armor ?? 0, isCrit, player.stats?.critDamage ?? 1.5);
          game.damageEnemy(target, damage, isCrit, drone.x, drone.y);
          drone.hitsRemaining--;
          drone.hitCooldown = HIT_COOLDOWN;
          playSound('weapon_drone');
        }
      } else {
        // Orbit player when no target
        drone.orbitAngle += ORBIT_SPEED * dt;
        if (drone.orbitAngle > TWO_PI) drone.orbitAngle -= TWO_PI;
        const targetX = player.x + Math.cos(drone.orbitAngle) * ORBIT_RADIUS;
        const targetY = player.y + Math.sin(drone.orbitAngle) * ORBIT_RADIUS;
        const a = angle(drone.x, drone.y, targetX, targetY);
        const dist = distance(drone.x, drone.y, targetX, targetY);
        const moveSpeed = Math.min(speed * dt, dist);
        drone.x += Math.cos(a) * moveSpeed;
        drone.y += Math.sin(a) * moveSpeed;
        drone.targetId = null;
      }

      // Update graphic position
      drone.graphic.x = drone.x;
      drone.graphic.y = drone.y;
    }
  }

  fire(_player: Player, _enemies: Enemy[], _game: Game): void {
    // Passive weapon - handled in update()
  }

  private rebuildDrones(player: Player, game: Game): void {
    // Remove old drone graphics
    for (const drone of this.drones) {
      drone.graphic.removeFromParent();
      drone.graphic.destroy();
    }
    this.drones = [];

    const { drones: droneCount, hits } = this.stats;
    for (let i = 0; i < droneCount; i++) {
      const gfx = new Graphics();

      // Drone body
      gfx.circle(0, 0, DRONE_RADIUS);
      gfx.fill({ color: 0xffd60a, alpha: 0.8 });

      // Drone glow
      gfx.circle(0, 0, DRONE_RADIUS + 3);
      gfx.fill({ color: 0xffd60a, alpha: 0.2 });

      // Inner dot
      gfx.circle(0, 0, 2);
      gfx.fill({ color: 0xffffff, alpha: 0.9 });

      game.layers.effects.addChild(gfx);

      const orbitAngle = (TWO_PI / droneCount) * i;
      this.drones.push({
        x: player.x + Math.cos(orbitAngle) * ORBIT_RADIUS,
        y: player.y + Math.sin(orbitAngle) * ORBIT_RADIUS,
        hitsRemaining: hits,
        orbitAngle,
        graphic: gfx,
        targetId: null,
        hitCooldown: 0,
        lastHitEnemy: -1,
        lastHitDist: 0,
      });
    }
  }

  reset(): void {
    super.reset();
    for (const drone of this.drones) {
      drone.graphic.removeFromParent();
      drone.graphic.destroy();
    }
    this.drones = [];
    this.initialized = false;
  }
}
