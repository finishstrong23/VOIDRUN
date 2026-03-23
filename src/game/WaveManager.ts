import { ENEMIES } from '../data/enemies';
import { WAVE_CONFIG, WORLD } from '../data/balance';
import { randomRange, randomInt, TWO_PI } from '../utils/math';
import type { Enemy } from '../entities/Enemy';
import type { Game } from './Game';

export class WaveManager {
  private spawnAccumulator = 0;
  private despawnCheckTimer = 0;
  private bossTimer = 0;
  private bossCount = 0;
  gameTime = 0;

  update(dt: number, game: Game): void {
    this.gameTime += dt;
    this.bossTimer += dt;

    // Calculate current spawn rate
    const spawnRate = Math.min(
      WAVE_CONFIG.spawnRateMax,
      WAVE_CONFIG.spawnRateBase + WAVE_CONFIG.spawnRateRamp * this.gameTime
    );

    // Spawn enemies
    const maxEnemies = game.isMobile ? WAVE_CONFIG.maxEnemiesOnScreenMobile : WAVE_CONFIG.maxEnemiesOnScreen;
    this.spawnAccumulator += spawnRate * dt;

    while (this.spawnAccumulator >= 1 && game.activeEnemies.length < maxEnemies) {
      this.spawnAccumulator -= 1;
      this.spawnEnemy(game);
    }

    // Boss spawning
    if (this.bossTimer >= WAVE_CONFIG.bossIntervalSeconds) {
      this.bossTimer -= WAVE_CONFIG.bossIntervalSeconds;
      this.bossCount++;
      this.spawnBoss(game);
    }

    // Despawn check every second
    this.despawnCheckTimer += dt;
    if (this.despawnCheckTimer >= 1) {
      this.despawnCheckTimer = 0;
      this.despawnFarEnemies(game);
    }
  }

  private getAvailableTypes(): string[] {
    let types: string[] = ['grunt'];
    for (const entry of WAVE_CONFIG.unlockSchedule) {
      if (this.gameTime >= entry.time) {
        types = entry.types;
      }
    }
    return types;
  }

  private getScaling(): { hpScale: number; dmgScale: number } {
    const minutes = this.gameTime / 60;
    const scale = Math.pow(WAVE_CONFIG.statScalePerMinute, minutes);
    return { hpScale: scale, dmgScale: scale };
  }

  private spawnEnemy(game: Game): void {
    const types = this.getAvailableTypes();
    const { hpScale, dmgScale } = this.getScaling();

    // Weighted random selection
    const available = types.filter(t => !ENEMIES[t].isBoss);
    if (available.length === 0) return;

    const totalWeight = available.reduce((sum, t) => sum + ENEMIES[t].spawnWeight, 0);
    let roll = Math.random() * totalWeight;
    let selectedType = available[0];
    for (const t of available) {
      roll -= ENEMIES[t].spawnWeight;
      if (roll <= 0) {
        selectedType = t;
        break;
      }
    }

    // Spawn position: random point on circle outside viewport
    const { x, y } = this.getSpawnPosition(game);

    if (selectedType === 'swarmer') {
      // Spawn a pack
      const packSize = randomInt(WAVE_CONFIG.swarmerPackMin, WAVE_CONFIG.swarmerPackMax);
      for (let i = 0; i < packSize && game.activeEnemies.length < (game.isMobile ? WAVE_CONFIG.maxEnemiesOnScreenMobile : WAVE_CONFIG.maxEnemiesOnScreen); i++) {
        const offsetX = randomRange(-30, 30);
        const offsetY = randomRange(-30, 30);
        game.spawnEnemy(ENEMIES[selectedType], x + offsetX, y + offsetY, hpScale, dmgScale);
      }
    } else {
      game.spawnEnemy(ENEMIES[selectedType], x, y, hpScale, dmgScale);
    }
  }

  private spawnBoss(game: Game): void {
    const { hpScale, dmgScale } = this.getScaling();
    const bossHpScale = hpScale * Math.pow(1.5 / WAVE_CONFIG.statScalePerMinute, this.gameTime / 60);
    const bossDmgScale = dmgScale * Math.pow(1.5 / WAVE_CONFIG.statScalePerMinute, this.gameTime / 60);

    const bossType = this.bossCount % 2 === 1 ? 'boss_charger' : 'boss_nova';
    const { x, y } = this.getSpawnPosition(game);

    game.spawnEnemy(ENEMIES[bossType], x, y, bossHpScale, bossDmgScale);

    // Camera shake for boss spawn
    game.camera.shake(8, 0.3);
  }

  private getSpawnPosition(game: Game): { x: number; y: number } {
    const angle = Math.random() * TWO_PI;
    const vw = game.camera.viewportWidth / 2 + WORLD.SPAWN_MARGIN;
    const vh = game.camera.viewportHeight / 2 + WORLD.SPAWN_MARGIN;
    const r = Math.max(vw, vh);
    return {
      x: game.player.x + Math.cos(angle) * r,
      y: game.player.y + Math.sin(angle) * r,
    };
  }

  private despawnFarEnemies(game: Game): void {
    const px = game.player.x;
    const py = game.player.y;
    const maxDist = WORLD.ENEMY_DESPAWN_DISTANCE;
    const maxDistSq = maxDist * maxDist;

    for (let i = game.activeEnemies.length - 1; i >= 0; i--) {
      const enemy = game.activeEnemies[i];
      const dx = enemy.x - px;
      const dy = enemy.y - py;
      if (dx * dx + dy * dy > maxDistSq) {
        game.releaseEnemy(enemy, false); // No XP drop
      }
    }
  }

  reset(): void {
    this.spawnAccumulator = 0;
    this.despawnCheckTimer = 0;
    this.bossTimer = 0;
    this.bossCount = 0;
    this.gameTime = 0;
  }
}
