import { Graphics } from 'pixi.js';
import { Weapon } from './Weapon';
import { calculateDamage } from '../data/balance';
import { distance, angle, TWO_PI } from '../utils/math';
import { playSound } from '../utils/sound';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Game } from '../game/Game';

const LEVELS = [
  { damage: 8, droneCount: 1, droneSpeed: 250, hits: 3, permanent: false },
  { damage: 8, droneCount: 2, droneSpeed: 250, hits: 3, permanent: false },
  { damage: 12, droneCount: 2, droneSpeed: 250, hits: 4, permanent: false },
  { damage: 12, droneCount: 3, droneSpeed: 300, hits: 4, permanent: false },
  { damage: 12, droneCount: 5, droneSpeed: 300, hits: 999, permanent: true },
];

interface Drone {
  x: number;
  y: number;
  vx: number;
  vy: number;
  hitsRemaining: number;
  lifetime: number;
  maxLifetime: number;
  graphics: Graphics;
  lastHitDist: number;
  lastHitEnemy: number;
  respawnTimer: number;
  active: boolean;
}

export class DroneSwarm extends Weapon {
  drones: Drone[] = [];
  orbitAngle = 0;

  constructor() {
    super('droneSwarm', 'Drone Swarm');
  }

  getCooldown(player: Player): number {
    return 2.0 * (1 - player.stats.cooldownReduction);
  }

  fire(player: Player, _enemies: Enemy[], game: Game): void {
    const lvl = LEVELS[this.level - 1];

    // Only spawn drones up to the level's drone count
    const activeDrones = this.drones.filter(d => d.active).length;
    if (activeDrones >= lvl.droneCount) return;

    const drone = this.createDrone(player, game);
    this.drones.push(drone);
    playSound('weapon_drone');
  }

  private createDrone(player: Player, game: Game): Drone {
    const lvl = LEVELS[this.level - 1];
    const g = new Graphics();
    g.rect(-4, -4, 8, 8);
    g.fill({ color: 0x60a5fa });
    g.stroke({ color: 0x93c5fd, width: 1 });
    game.layers.projectiles.addChild(g);

    return {
      x: player.x,
      y: player.y,
      vx: 0,
      vy: 0,
      hitsRemaining: lvl.hits,
      lifetime: 0,
      maxLifetime: lvl.permanent ? Infinity : 5,
      graphics: g,
      lastHitDist: 0,
      lastHitEnemy: -1,
      respawnTimer: 0,
      active: true,
    };
  }

  update(dt: number, player: Player, enemies: Enemy[], game: Game): void {
    const lvl = LEVELS[this.level - 1];

    // Handle cooldown-based spawning for non-permanent drones
    if (!lvl.permanent) {
      super.update(dt, player, enemies, game);
    }

    this.orbitAngle += dt * 2;

    // Handle permanent drone respawn
    if (lvl.permanent) {
      const activeDrones = this.drones.filter(d => d.active).length;
      const respawning = this.drones.filter(d => !d.active && d.respawnTimer > 0);
      for (const drone of respawning) {
        drone.respawnTimer -= dt;
        if (drone.respawnTimer <= 0) {
          this.respawnDrone(drone, player, game);
        }
      }
      // Spawn missing drones
      if (activeDrones + respawning.length < lvl.droneCount) {
        const drone = this.createDrone(player, game);
        this.drones.push(drone);
      }
    }

    // Update active drones
    for (const drone of this.drones) {
      if (!drone.active) continue;

      drone.lifetime += dt;

      // Find nearest enemy
      let target: Enemy | null = null;
      let targetDist = 400;
      for (const enemy of enemies) {
        if (!enemy.active) continue;
        const dist = distance(drone.x, drone.y, enemy.x, enemy.y);
        if (dist < targetDist) {
          targetDist = dist;
          target = enemy;
        }
      }

      if (target) {
        // Seek enemy
        const a = angle(drone.x, drone.y, target.x, target.y);
        drone.vx = Math.cos(a) * lvl.droneSpeed;
        drone.vy = Math.sin(a) * lvl.droneSpeed;
      } else {
        // Orbit player
        const i = this.drones.indexOf(drone);
        const orbAngle = this.orbitAngle + (TWO_PI / Math.max(1, this.drones.filter(d => d.active).length)) * i;
        const targetX = player.x + Math.cos(orbAngle) * 100;
        const targetY = player.y + Math.sin(orbAngle) * 100;
        const a = angle(drone.x, drone.y, targetX, targetY);
        const dist = distance(drone.x, drone.y, targetX, targetY);
        const speed = Math.min(lvl.droneSpeed, dist * 5);
        drone.vx = Math.cos(a) * speed;
        drone.vy = Math.sin(a) * speed;
      }

      drone.x += drone.vx * dt;
      drone.y += drone.vy * dt;
      drone.graphics.position.set(drone.x, drone.y);
      drone.graphics.rotation += dt * 8;

      // Collision with enemies
      if (target && targetDist < 8 + target.radius) {
        // Check travel distance since last hit on same enemy
        if (target.id !== drone.lastHitEnemy || drone.lastHitDist >= 30) {
          const isCrit = Math.random() < player.stats.critChance;
          const dmg = calculateDamage(lvl.damage, player.stats.damage, target.armor, isCrit, player.stats.critDamage);
          game.damageEnemy(target, dmg, isCrit, drone.x, drone.y);
          drone.hitsRemaining--;
          drone.lastHitDist = 0;
          drone.lastHitEnemy = target.id;
        }
      }

      drone.lastHitDist += Math.sqrt(drone.vx * drone.vx + drone.vy * drone.vy) * dt;

      // Check expiry
      if (drone.hitsRemaining <= 0 || drone.lifetime >= drone.maxLifetime) {
        drone.active = false;
        drone.graphics.removeFromParent();
        if (lvl.permanent) {
          drone.respawnTimer = 2;
        }
      }
    }

    // Clean up dead non-permanent drones
    if (!lvl.permanent) {
      this.drones = this.drones.filter(d => d.active);
    }
  }

  private respawnDrone(drone: Drone, player: Player, game: Game): void {
    const lvl = LEVELS[this.level - 1];
    const g = new Graphics();
    g.rect(-4, -4, 8, 8);
    g.fill({ color: 0x60a5fa });
    g.stroke({ color: 0x93c5fd, width: 1 });
    game.layers.projectiles.addChild(g);

    drone.x = player.x;
    drone.y = player.y;
    drone.vx = 0;
    drone.vy = 0;
    drone.hitsRemaining = lvl.hits;
    drone.lifetime = 0;
    drone.graphics = g;
    drone.lastHitDist = 0;
    drone.lastHitEnemy = -1;
    drone.respawnTimer = 0;
    drone.active = true;
  }

  reset(): void {
    super.reset();
    for (const drone of this.drones) {
      drone.graphics.removeFromParent();
    }
    this.drones = [];
    this.orbitAngle = 0;
  }

  getLevelDescription(): string {
    const lvl = LEVELS[this.level - 1];
    if (this.level === 5) return 'Hive Mind: 5 permanent drones';
    return `Dmg:${lvl.damage} Drones:${lvl.droneCount} Hits:${lvl.hits}`;
  }
}
