import { WAVES, WAVE_CONFIG } from '../data/waves';
import { ENEMIES } from '../data/enemies';
import type { EnemyDef, WaveDef } from '../types';

export type WaveState = 'spawning' | 'clearing' | 'complete' | 'boss_warning' | 'between_waves';

export interface SpawnRequest {
  def: EnemyDef;
  x: number;
  y: number;
  hpScale: number;
  dmgScale: number;
}

export interface WaveCallbacks {
  onSpawn(request: SpawnRequest): void;
  onWaveComplete(waveNumber: number): void;
  onBossWarning(bossType: string): void;
  onAllWavesComplete(): void;
  onVacuumGems(): void;
  getEnemyCount(): number;
  getMaxEnemies(): number;
}

export class WaveManager {
  state: WaveState = 'between_waves';
  currentWave = 0;
  enemiesRemaining = 0;
  totalEnemiesInWave = 0;
  waveProgress = 0; // 0-1 progress through spawning phase

  private spawnTimer = 0;
  private spawnInterval = 0;
  private spawnQueue: Array<{ type: string; count: number }> = [];
  private spawnedSoFar = 0;
  private totalToSpawn = 0;

  private betweenTimer = 0;
  private bossWarningTimer = 0;

  private bossType: string | null = null;
  private bossSpawned = false;
  private bossKillThreshold = 0;
  private initialEnemiesForBoss = 0;

  private callbacks: WaveCallbacks;
  private viewportWidth = 0;
  private viewportHeight = 0;
  private playerX = 0;
  private playerY = 0;

  private hpScale = 1;
  private dmgScale = 1;

  constructor(callbacks: WaveCallbacks) {
    this.callbacks = callbacks;
  }

  start(): void {
    this.currentWave = 0;
    this.state = 'between_waves';
    this.betweenTimer = 1; // Short initial delay
  }

  setViewport(width: number, height: number): void {
    this.viewportWidth = width;
    this.viewportHeight = height;
  }

  setPlayerPosition(x: number, y: number): void {
    this.playerX = x;
    this.playerY = y;
  }

  update(dt: number): void {
    switch (this.state) {
      case 'between_waves':
        this.updateBetweenWaves(dt);
        break;
      case 'boss_warning':
        this.updateBossWarning(dt);
        break;
      case 'spawning':
        this.updateSpawning(dt);
        break;
      case 'clearing':
        this.updateClearing(dt);
        break;
      case 'complete':
        break;
    }
  }

  private updateBetweenWaves(dt: number): void {
    this.betweenTimer -= dt;
    if (this.betweenTimer <= 0) {
      this.callbacks.onVacuumGems();
      this.startNextWave();
    }
  }

  private updateBossWarning(dt: number): void {
    this.bossWarningTimer -= dt;
    if (this.bossWarningTimer <= 0) {
      // Spawn the boss
      this.spawnBoss();
      this.state = 'clearing';
    }
  }

  private updateSpawning(dt: number): void {
    if (this.spawnQueue.length === 0 && this.spawnedSoFar >= this.totalToSpawn) {
      // All enemies spawned, wait for clearing
      this.state = 'clearing';
      return;
    }

    this.spawnTimer -= dt;

    while (this.spawnTimer <= 0 && this.spawnQueue.length > 0) {
      // Check enemy cap
      if (this.callbacks.getEnemyCount() >= this.callbacks.getMaxEnemies()) {
        this.spawnTimer = 0.1; // Retry shortly
        break;
      }

      const entry = this.spawnQueue[0];
      const typeName = entry.type;
      const def = ENEMIES[typeName];
      if (!def) {
        this.spawnQueue.shift();
        continue;
      }

      // Swarmers spawn in packs of 6-10
      const isSwarmer = typeName === 'swarmer';
      const batchSize = isSwarmer ? Math.min(entry.count, 6 + Math.floor(Math.random() * 5)) : 1;

      for (let i = 0; i < batchSize; i++) {
        const pos = this.getSpawnPosition();
        this.callbacks.onSpawn({
          def,
          x: pos.x,
          y: pos.y,
          hpScale: this.hpScale,
          dmgScale: this.dmgScale,
        });
        this.spawnedSoFar++;
        this.enemiesRemaining++;
        entry.count--;
      }

      if (entry.count <= 0) {
        this.spawnQueue.shift();
      }

      this.spawnTimer += this.spawnInterval;
    }

    this.waveProgress = this.totalToSpawn > 0 ? this.spawnedSoFar / this.totalToSpawn : 1;

    // Check boss wave: spawn boss when 50% minions killed
    this.checkBossSpawnCondition();
  }

  private updateClearing(_dt: number): void {
    // Check if all enemies are dead
    const remaining = this.callbacks.getEnemyCount();
    this.enemiesRemaining = remaining;

    if (remaining <= 0) {
      this.callbacks.onWaveComplete(this.currentWave);

      // Check if all predefined waves done
      if (this.currentWave >= WAVES.length && !this.isProceduralWave()) {
        // Continue with procedural waves
      }

      this.state = 'between_waves';
      this.betweenTimer = WAVE_CONFIG.betweenWavesPause;
    }
  }

  private startNextWave(): void {
    this.currentWave++;
    const waveDef = this.getWaveDef(this.currentWave);

    this.bossType = waveDef.bossType ?? null;
    this.bossSpawned = false;
    this.spawnedSoFar = 0;

    // Build spawn queue
    this.spawnQueue = [];
    let total = 0;
    for (const [type, count] of Object.entries(waveDef.enemies)) {
      this.spawnQueue.push({ type, count });
      total += count;
    }
    this.totalToSpawn = total;
    this.totalEnemiesInWave = total + (this.bossType ? 1 : 0);
    this.enemiesRemaining = 0;

    // Calculate spawn interval to spread enemies over spawnDuration
    this.spawnInterval = waveDef.spawnDuration / Math.max(total, 1);
    this.spawnTimer = 0;

    // Procedural scaling
    if (this.currentWave > WAVES.length) {
      const extra = this.currentWave - WAVES.length;
      this.hpScale = Math.pow(WAVE_CONFIG.proceduralStatScalePerWave, extra);
      this.dmgScale = Math.pow(WAVE_CONFIG.proceduralStatScalePerWave, extra);
    } else {
      this.hpScale = 1;
      this.dmgScale = 1;
    }

    // Boss threshold: track initial enemies so we know when 50% are killed
    if (this.bossType) {
      this.initialEnemiesForBoss = total;
      this.bossKillThreshold = Math.floor(total * WAVE_CONFIG.bossSpawnAtPercent);
    }

    this.waveProgress = 0;
    this.state = 'spawning';
  }

  private getWaveDef(waveNum: number): WaveDef {
    if (waveNum <= WAVES.length) {
      return WAVES[waveNum - 1];
    }

    // Procedural wave generation after wave 10
    const baseWave = WAVES[WAVES.length - 1];
    const extraWaves = waveNum - WAVES.length;
    const scale = Math.pow(WAVE_CONFIG.proceduralScalePerWave, extraWaves);

    const enemies: Record<string, number> = {};
    for (const [type, count] of Object.entries(baseWave.enemies)) {
      enemies[type] = Math.ceil(count * scale);
    }

    // Every 3rd procedural wave is a boss wave
    const isBoss = extraWaves % 3 === 0;

    return {
      wave: waveNum,
      enemies,
      spawnDuration: baseWave.spawnDuration + extraWaves * 2,
      bossWave: isBoss,
      bossType: isBoss ? (extraWaves % 6 === 0 ? 'boss_nova' : 'boss_charger') : undefined,
    };
  }

  private isProceduralWave(): boolean {
    return this.currentWave > WAVES.length;
  }

  private checkBossSpawnCondition(): void {
    if (!this.bossType || this.bossSpawned) return;

    const killed = this.spawnedSoFar - this.callbacks.getEnemyCount();
    if (killed >= this.bossKillThreshold) {
      // Trigger boss warning
      this.callbacks.onBossWarning(this.bossType);
      this.bossWarningTimer = WAVE_CONFIG.bossWarningTime;
      this.bossSpawned = true;
      this.state = 'boss_warning';
    }
  }

  private spawnBoss(): void {
    if (!this.bossType) return;

    const def = ENEMIES[this.bossType];
    if (!def) return;

    const pos = this.getSpawnPosition();
    this.callbacks.onSpawn({
      def,
      x: pos.x,
      y: pos.y,
      hpScale: this.hpScale,
      dmgScale: this.dmgScale,
    });
    this.enemiesRemaining++;

    // Resume spawning remaining enemies
    if (this.spawnQueue.length > 0) {
      this.state = 'spawning';
    } else {
      this.state = 'clearing';
    }
  }

  private getSpawnPosition(): { x: number; y: number } {
    const margin = 150; // SPAWN_MARGIN from balance WORLD
    const halfW = this.viewportWidth * 0.5 + margin;
    const halfH = this.viewportHeight * 0.5 + margin;

    // Spawn on a circle beyond viewport edge
    const angle = Math.random() * Math.PI * 2;
    const rx = halfW;
    const ry = halfH;

    return {
      x: this.playerX + Math.cos(angle) * rx,
      y: this.playerY + Math.sin(angle) * ry,
    };
  }

  onEnemyKilled(): void {
    this.enemiesRemaining = Math.max(0, this.enemiesRemaining - 1);
  }

  getWaveNumber(): number {
    return this.currentWave;
  }

  isComplete(): boolean {
    return this.state === 'complete';
  }
}
