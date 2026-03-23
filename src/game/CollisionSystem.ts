import type { Player } from '../entities/Player';
import type { Enemy } from '../entities/Enemy';
import type { Projectile } from '../entities/Projectile';
import type { XPGem } from '../entities/XPGem';
import { SpatialHash } from '../utils/spatial-hash';

export class CollisionSystem {
  checkPlayerEnemyCollisions(
    player: Player,
    enemyHash: SpatialHash,
    onHit: (damage: number) => void,
  ): void {
    if (!player.isAlive() || player.isInvincible) return;

    const nearby = enemyHash.query(player.x, player.y, player.radius + 60);
    for (let i = 0; i < nearby.length; i++) {
      const enemy = nearby[i] as Enemy;
      if (!enemy.active || enemy.damage === undefined) continue;

      const dx = player.x - enemy.x;
      const dy = player.y - enemy.y;
      const distSq = dx * dx + dy * dy;
      const minDist = player.radius + enemy.radius;

      if (distSq < minDist * minDist) {
        onHit(enemy.damage);
        break;
      }
    }
  }

  checkProjectileEnemyCollisions(
    projectiles: Projectile[],
    enemyHash: SpatialHash,
    player: Player,
    onEnemyHit: (enemy: Enemy, damage: number, isCrit: boolean, fromX: number, fromY: number) => void,
    onProjectileConsumed: (proj: Projectile) => void,
  ): void {
    for (let i = 0; i < projectiles.length; i++) {
      const proj = projectiles[i];
      if (!proj.active || !proj.fromPlayer) continue;

      const nearby = enemyHash.query(proj.x, proj.y, proj.radius + 60);
      for (let j = 0; j < nearby.length; j++) {
        const enemy = nearby[j] as Enemy;
        if (!enemy.active || enemy.damage === undefined) continue;

        const dx = proj.x - enemy.x;
        const dy = proj.y - enemy.y;
        const distSq = dx * dx + dy * dy;
        const minDist = proj.radius + enemy.radius;

        if (distSq < minDist * minDist) {
          const isCrit = Math.random() < (player.stats.critChance ?? 0);
          const damage = isCrit ? proj.damage * (player.stats.critDamage ?? 1.5) : proj.damage;
          onEnemyHit(enemy, damage, isCrit, proj.x, proj.y);

          const destroyed = proj.onHit();
          if (destroyed) {
            onProjectileConsumed(proj);
            break;
          }
        }
      }
    }
  }

  checkEnemyProjectilePlayerCollisions(
    projectiles: Projectile[],
    player: Player,
    onHit: (damage: number) => void,
    onProjectileConsumed: (proj: Projectile) => void,
  ): void {
    if (!player.isAlive() || player.isInvincible) return;

    for (let i = 0; i < projectiles.length; i++) {
      const proj = projectiles[i];
      if (!proj.active || proj.fromPlayer) continue;

      const dx = player.x - proj.x;
      const dy = player.y - proj.y;
      const distSq = dx * dx + dy * dy;
      const minDist = player.radius + proj.radius;

      if (distSq < minDist * minDist) {
        onHit(proj.damage);
        onProjectileConsumed(proj);
        break;
      }
    }
  }

  checkGemPickup(
    player: Player,
    gems: XPGem[],
    onCollect: (gem: XPGem) => void,
  ): void {
    if (!player.isAlive()) return;

    const pickupRadiusSq = player.stats.pickupRadius * player.stats.pickupRadius;
    const collectRadiusSq = (player.radius + 8) * (player.radius + 8);

    for (let i = 0; i < gems.length; i++) {
      const gem = gems[i];
      if (!gem.active) continue;

      const dx = player.x - gem.x;
      const dy = player.y - gem.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < collectRadiusSq) {
        onCollect(gem);
        continue;
      }

      if (distSq < pickupRadiusSq) {
        gem.setMagneticTarget(player.x, player.y);
      }
    }
  }
}
