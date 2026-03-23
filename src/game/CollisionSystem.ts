import { SpatialHash } from '../utils/spatial-hash';
import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { XPGem } from '../entities/XPGem';
import type { Projectile } from '../entities/Projectile';
import { distance, angle } from '../utils/math';
import { KNOCKBACK } from '../data/balance';
import { calculateDamage } from '../data/balance';

export class CollisionSystem {
  checkPlayerEnemyCollisions(
    player: Player,
    enemyHash: SpatialHash,
    onPlayerHit: (damage: number) => void
  ): void {
    if (!player.active || player.isInvincible) return;

    const nearby = enemyHash.query(player.x, player.y, player.radius + 40);
    for (const entity of nearby) {
      const enemy = entity as Enemy;
      if (!enemy.active) continue;
      const dist = distance(player.x, player.y, enemy.x, enemy.y);
      if (dist < player.radius + enemy.radius) {
        onPlayerHit(enemy.damage);
        return; // Only take one hit per frame
      }
    }
  }

  checkProjectileEnemyCollisions(
    projectiles: Projectile[],
    enemyHash: SpatialHash,
    player: Player,
    onEnemyHit: (enemy: Enemy, damage: number, isCrit: boolean, fromX: number, fromY: number) => void,
    onProjectileExpired: (projectile: Projectile) => void
  ): void {
    for (const proj of projectiles) {
      if (!proj.active || !proj.isPlayerProjectile) continue;

      const nearby = enemyHash.query(proj.x, proj.y, proj.radius + 40);
      for (const entity of nearby) {
        const enemy = entity as Enemy;
        if (!enemy.active) continue;
        const dist = distance(proj.x, proj.y, enemy.x, enemy.y);
        if (dist < proj.radius + enemy.radius) {
          const isCrit = Math.random() < player.stats.critChance;
          const dmg = calculateDamage(proj.damage, player.stats.damage, enemy.armor, isCrit, player.stats.critDamage);
          onEnemyHit(enemy, dmg, isCrit, proj.x, proj.y);

          if (proj.onHit()) {
            onProjectileExpired(proj);
            break;
          }
        }
      }
    }
  }

  checkEnemyProjectilePlayerCollisions(
    projectiles: Projectile[],
    player: Player,
    onPlayerHit: (damage: number) => void,
    onProjectileExpired: (projectile: Projectile) => void
  ): void {
    if (!player.active || player.isInvincible) return;

    for (const proj of projectiles) {
      if (!proj.active || proj.isPlayerProjectile) continue;
      const dist = distance(proj.x, proj.y, player.x, player.y);
      if (dist < proj.radius + player.radius) {
        onPlayerHit(proj.damage);
        onProjectileExpired(proj);
        return;
      }
    }
  }

  checkGemPickup(
    player: Player,
    gems: XPGem[],
    onGemCollected: (gem: XPGem) => void
  ): void {
    for (const gem of gems) {
      if (!gem.active) continue;
      const dist = distance(player.x, player.y, gem.x, gem.y);

      if (dist < player.stats.pickupRadius) {
        gem.isMagnetized = true;
        // Accelerate toward player
        const a = angle(gem.x, gem.y, player.x, player.y);
        gem.vx = Math.cos(a) * gem.magnetSpeed;
        gem.vy = Math.sin(a) * gem.magnetSpeed;
      }

      if (dist < player.radius + gem.radius + 8) {
        onGemCollected(gem);
      }
    }
  }
}
