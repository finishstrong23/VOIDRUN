import { Container } from 'pixi.js';
import { PixiRenderer, type RenderLayers } from './PixiRenderer';
import { Camera } from './Camera';
import { InputManager } from './InputManager';
import { TouchJoystick } from './TouchJoystick';
import { World } from './World';
import { WaveManager } from './WaveManager';
import { UpgradeManager } from './UpgradeManager';
import { CollisionSystem } from './CollisionSystem';
import { RunState } from './RunState';
import { AdaptiveQuality } from './AdaptiveQuality';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Projectile } from '../entities/Projectile';
import { XPGem } from '../entities/XPGem';
import { DamageNumber } from '../entities/DamageNumber';
import { SpatialHash } from '../utils/spatial-hash';
import { ObjectPool } from '../utils/object-pool';
import { KNOCKBACK, xpForLevel, calculateScore, WORLD, DASH } from '../data/balance';
import { CLASSES } from '../data/classes';
import { isMobileDevice, getPerformanceTier } from '../utils/device';
import { playSound, haptic } from '../utils/sound';
import { createWeapon } from '../weapons/WeaponRegistry';
import { spriteFactory } from '../sprites/SpriteFactory';
import type { Weapon } from '../weapons/Weapon';
import type { EnemyDef, Upgrade, QualityTier } from '../types';

const TICK_RATE = 60;
const TICK_MS = 1000 / TICK_RATE;
const SYNC_INTERVAL = 100;

export class Game {
  renderer: PixiRenderer;
  camera: Camera;
  input: InputManager;
  joystick!: TouchJoystick;
  world!: World;
  waveManager: WaveManager;
  upgradeManager: UpgradeManager;
  collisionSystem: CollisionSystem;
  runState: RunState;
  quality: AdaptiveQuality;

  player: Player;
  activeEnemies: Enemy[] = [];
  activeProjectiles: Projectile[] = [];
  activeGems: XPGem[] = [];
  activeDamageNumbers: DamageNumber[] = [];
  weapons: Weapon[] = [];

  enemyHash: SpatialHash;
  gemHash: SpatialHash;

  enemyPool: ObjectPool<Enemy>;
  projectilePool: ObjectPool<Projectile>;
  gemPool: ObjectPool<XPGem>;
  damageNumberPool: ObjectPool<DamageNumber>;

  layers!: RenderLayers;
  isMobile: boolean;
  isRunning = false;
  isPaused = false;
  slowMotionTimer = 0;
  slowMotionScale = 1;

  private accumulator = 0;
  private lastTime = 0;
  private animFrameId = 0;
  private syncTimer = 0;
  private onStateSync: ((state: Record<string, unknown>) => void) | null = null;
  private onLevelUp: ((options: Upgrade[]) => void) | null = null;
  private onPlayerDeath: (() => void) | null = null;
  private onBossSpawn: ((name: string, hp: number, maxHP: number) => void) | null = null;
  private onBossUpdate: ((hp: number) => void) | null = null;
  private onBossDeath: (() => void) | null = null;
  private onWaveStateChange: ((state: string, wave: number, remaining: number, progress: number) => void) | null = null;

  constructor() {
    this.isMobile = isMobileDevice();
    this.renderer = new PixiRenderer();
    this.camera = new Camera();
    this.input = new InputManager();
    this.waveManager = new WaveManager({
      onSpawn: (req) => this.spawnEnemy(req.def, req.x, req.y, req.hpScale, req.dmgScale),
      onWaveComplete: (waveNumber) => { this.runState.completeWave(waveNumber); },
      onBossWarning: (_bossType) => { /* handled via onBossSpawn */ },
      onAllWavesComplete: () => { /* endless mode */ },
      onVacuumGems: () => this.vacuumGems(),
      getEnemyCount: () => this.activeEnemies.length,
      getMaxEnemies: () => this.quality.getMaxEnemies(),
    });
    this.upgradeManager = new UpgradeManager();
    this.collisionSystem = new CollisionSystem();
    this.runState = new RunState();
    this.player = new Player();

    const startTier = this.isMobile ? getPerformanceTier() : 'high';
    this.quality = new AdaptiveQuality(startTier as QualityTier);

    this.enemyHash = new SpatialHash();
    this.gemHash = new SpatialHash();

    this.enemyPool = new ObjectPool<Enemy>(() => new Enemy(), (e) => e.reset(), 200);
    this.projectilePool = new ObjectPool<Projectile>(() => new Projectile(), (p) => p.reset(), 100);
    this.gemPool = new ObjectPool<XPGem>(() => new XPGem(), (g) => g.reset(), 300);
    this.damageNumberPool = new ObjectPool<DamageNumber>(() => new DamageNumber(), (d) => d.reset(), 50);
  }

  async init(container: HTMLElement): Promise<void> {
    try {
      await this.renderer.init(container);
      this.layers = this.renderer.layers;
    } catch (e) {
      console.error('[Game] Renderer init failed:', e);
      throw e;
    }

    try {
      await spriteFactory.generateAll(this.renderer.app.renderer);
    } catch (e) {
      console.error('[Game] Sprite generation failed:', e);
      throw e;
    }

    this.input.init();
    this.joystick = new TouchJoystick(this.layers.joystick);

    this.world = new World(this.layers.ground, this.layers.props, this.layers.vignette);

    this.camera.viewportWidth = window.innerWidth;
    this.camera.viewportHeight = window.innerHeight;

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', () => setTimeout(this.handleResize, 150));
    console.log('[Game] Init complete');
  }

  private handleResize = (): void => {
    this.camera.viewportWidth = window.innerWidth;
    this.camera.viewportHeight = window.innerHeight;
    this.joystick.resize(window.innerWidth, window.innerHeight);
  };

  setOnStateSync(cb: (state: Record<string, unknown>) => void): void { this.onStateSync = cb; }
  setOnLevelUp(cb: (options: Upgrade[]) => void): void { this.onLevelUp = cb; }
  setOnPlayerDeath(cb: () => void): void { this.onPlayerDeath = cb; }
  setOnBossSpawn(cb: (name: string, hp: number, maxHP: number) => void): void { this.onBossSpawn = cb; }
  setOnBossUpdate(cb: (hp: number) => void): void { this.onBossUpdate = cb; }
  setOnBossDeath(cb: () => void): void { this.onBossDeath = cb; }
  setOnWaveStateChange(cb: (state: string, wave: number, remaining: number, progress: number) => void): void { this.onWaveStateChange = cb; }

  startRun(classId: string): void {
    const classDef = CLASSES.find(c => c.id === classId);
    if (!classDef) return;

    this.cleanupRun();
    this.runState.start(classId);
    this.player.init(classDef);
    this.layers.player.addChild(this.player.sprite!);

    const weapon = createWeapon(classDef.startingWeapon);
    this.weapons.push(weapon);

    this.waveManager.start();
    this.upgradeManager.reset();

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.syncTimer = 0;

    this.startLoop();
  }

  private cleanupRun(): void {
    for (const e of this.activeEnemies) { e.reset(); this.enemyPool.release(e); }
    this.activeEnemies = [];
    for (const p of this.activeProjectiles) { p.reset(); this.projectilePool.release(p); }
    this.activeProjectiles = [];
    for (const g of this.activeGems) { g.reset(); this.gemPool.release(g); }
    this.activeGems = [];
    for (const d of this.activeDamageNumbers) { d.reset(); this.damageNumberPool.release(d); }
    this.activeDamageNumbers = [];
    for (const w of this.weapons) w.reset();
    this.weapons = [];

    this.layers.enemies.removeChildren();
    this.layers.projectiles.removeChildren();
    this.layers.gems.removeChildren();
    this.layers.effects.removeChildren();
    this.layers.damageNumbers.removeChildren();
    this.layers.player.removeChildren();
    this.layers.shadows.removeChildren();
  }

  private startLoop(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    this.lastTime = performance.now();
    const loop = (currentTime: number) => {
      this.animFrameId = requestAnimationFrame(loop);
      this.frame(currentTime);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  stopLoop(): void {
    if (this.animFrameId) { cancelAnimationFrame(this.animFrameId); this.animFrameId = 0; }
  }

  private frame(currentTime: number): void {
    let delta = currentTime - this.lastTime;
    this.lastTime = currentTime;
    if (delta > 500) delta = TICK_MS;

    // quality tracking handled in update()

    if (this.isRunning && !this.isPaused) {
      if (this.slowMotionTimer > 0) {
        this.slowMotionTimer -= delta / 1000;
        delta *= this.slowMotionScale;
      }
      this.accumulator += delta;
      while (this.accumulator >= TICK_MS) {
        this.update(TICK_MS / 1000);
        this.accumulator -= TICK_MS;
      }
    }

    const alpha = this.accumulator / TICK_MS;
    this.render(alpha);
  }

  private update(dt: number): void {
    this.input.update();
    this.joystick.update(dt);
    this.input.setJoystickInput(this.joystick.inputX, this.joystick.inputY);

    if (this.input.isEscapePressed()) {
      this.input.consumeEscape();
      this.pause();
      return;
    }

    // Player movement
    if (!this.player.isDashing) {
      this.player.vx = this.input.moveX * this.player.stats.speed;
      this.player.vy = this.input.moveY * this.player.stats.speed;
    }
    this.player.update(dt);

    this.camera.follow(this.player.x, this.player.y);
    this.camera.update(dt);

    // Wave manager
    this.waveManager.setViewport(this.camera.viewportWidth, this.camera.viewportHeight);
    this.waveManager.setPlayerPosition(this.player.x, this.player.y);
    this.waveManager.update(dt);
    this.runState.timeAlive += dt;

    // Enemies
    this.updateEnemies(dt);

    // Weapons
    for (const weapon of this.weapons) {
      weapon.update(dt, this.player, this.activeEnemies, this);
    }

    // Projectiles
    this.updateProjectiles(dt);

    // Spatial hash rebuild
    this.enemyHash.clear();
    for (const e of this.activeEnemies) { if (e.active) this.enemyHash.insert(e); }
    this.gemHash.clear();
    for (const g of this.activeGems) { if (g.active) this.gemHash.insert(g); }

    // Collisions
    this.collisionSystem.checkPlayerEnemyCollisions(this.player, this.enemyHash, (damage) => this.handlePlayerHit(damage));
    this.collisionSystem.checkProjectileEnemyCollisions(this.activeProjectiles, this.enemyHash, this.player,
      (enemy, damage, isCrit, fromX, fromY) => this.damageEnemy(enemy, damage, isCrit, fromX, fromY),
      (proj) => this.releaseProjectile(proj));
    this.collisionSystem.checkEnemyProjectilePlayerCollisions(this.activeProjectiles, this.player,
      (damage) => this.handlePlayerHit(damage), (proj) => this.releaseProjectile(proj));
    this.collisionSystem.checkGemPickup(this.player, this.activeGems, (gem) => this.collectGem(gem));

    this.updateGems(dt);
    this.updateDamageNumbers(dt);
    this.quality.update(dt);

    this.syncTimer += dt * 1000;
    if (this.syncTimer >= SYNC_INTERVAL) {
      this.syncTimer = 0;
      this.syncState();
    }
  }

  private updateEnemies(dt: number): void {
    for (let i = this.activeEnemies.length - 1; i >= 0; i--) {
      const enemy = this.activeEnemies[i];
      if (!enemy.active) continue;
      this.updateEnemyAI(enemy, dt);
      enemy.update(dt);
    }
  }

  private updateEnemyAI(enemy: Enemy, dt: number): void {
    if (enemy.knockbackTimer > 0) return;
    const px = this.player.x, py = this.player.y;
    const dx = px - enemy.x, dy = py - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist, ny = dy / dist;

    switch (enemy.ai) {
      case 'chase':
        enemy.vx = nx * enemy.speed;
        enemy.vy = ny * enemy.speed;
        break;
      case 'swarm': {
        let sepX = 0, sepY = 0;
        for (const other of this.activeEnemies) {
          if (other === enemy || other.ai !== 'swarm' || !other.active) continue;
          const sdx = enemy.x - other.x, sdy = enemy.y - other.y;
          const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
          if (sdist < 30 && sdist > 0) { sepX += sdx / sdist; sepY += sdy / sdist; }
        }
        const dirX = nx * 0.85 + sepX * 0.15, dirY = ny * 0.85 + sepY * 0.15;
        const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        enemy.vx = (dirX / dirLen) * enemy.speed;
        enemy.vy = (dirY / dirLen) * enemy.speed;
        break;
      }
      case 'ranged':
        enemy.rangedCooldown -= dt;
        if (dist > 200) { enemy.vx = nx * enemy.speed; enemy.vy = ny * enemy.speed; }
        else if (dist < 120) { enemy.vx = -nx * enemy.speed * 1.2; enemy.vy = -ny * enemy.speed * 1.2; }
        else {
          enemy.vx = 0; enemy.vy = 0;
          if (enemy.rangedCooldown <= 0) {
            enemy.rangedCooldown = 2;
            this.spawnProjectile(enemy.x, enemy.y, Math.atan2(-dy, -dx), 250, 10, 0, 6, false, 0xff2d55);
          }
        }
        break;
      case 'boss_charge': {
        enemy.aiTimer -= dt;
        if (enemy.aiPhase === 0) {
          enemy.vx = nx * enemy.speed; enemy.vy = ny * enemy.speed;
          if (enemy.aiTimer <= 0) { enemy.aiPhase = 1; enemy.aiTimer = 0.8; enemy.targetX = px; enemy.targetY = py; }
        } else if (enemy.aiPhase === 1) {
          enemy.vx = 0; enemy.vy = 0; enemy.flashTimer = dt * 2;
          if (enemy.aiTimer <= 0) {
            enemy.aiPhase = 2; enemy.aiTimer = 1;
            const cdx = enemy.targetX - enemy.x, cdy = enemy.targetY - enemy.y;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy) || 1;
            enemy.vx = (cdx / cdist) * 500; enemy.vy = (cdy / cdist) * 500;
          }
        } else if (enemy.aiPhase === 2) {
          if (enemy.aiTimer <= 0) { enemy.aiPhase = 3; enemy.aiTimer = 2; enemy.vx = 0; enemy.vy = 0; }
        } else {
          enemy.vx = 0; enemy.vy = 0;
          if (enemy.aiTimer <= 0) { enemy.aiPhase = 0; enemy.aiTimer = 4; }
        }
        break;
      }
      case 'boss_nova': {
        enemy.aiTimer -= dt;
        if (enemy.aiPhase === 0) {
          const spd = enemy.isEnraged ? 100 : enemy.speed;
          enemy.vx = nx * spd; enemy.vy = ny * spd;
          if (enemy.aiTimer <= 0) { enemy.aiPhase = 1; enemy.aiTimer = 0.5; }
        } else if (enemy.aiPhase === 1) {
          enemy.vx = 0; enemy.vy = 0;
          if (enemy.aiTimer <= 0) {
            const count = enemy.isEnraged ? 24 : 12;
            const step = (Math.PI * 2) / count;
            for (let i = 0; i < count; i++) this.spawnProjectile(enemy.x, enemy.y, step * i, 180, 15, 0, 6, false, 0xbf5af2);
            enemy.aiPhase = 2; enemy.aiTimer = 1;
          }
        } else {
          enemy.vx = 0; enemy.vy = 0;
          if (enemy.aiTimer <= 0) { enemy.aiPhase = 0; enemy.aiTimer = 5; }
        }
        break;
      }
    }
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const proj = this.activeProjectiles[i];
      if (!proj.active) continue;

      if (proj.homing && proj.isPlayerProjectile) {
        let nearest: Enemy | null = null, nearestDist = 300;
        for (const enemy of this.activeEnemies) {
          if (!enemy.active) continue;
          const d = Math.sqrt((enemy.x - proj.x) ** 2 + (enemy.y - proj.y) ** 2);
          if (d < nearestDist) { nearestDist = d; nearest = enemy; }
        }
        if (nearest) {
          const ta = Math.atan2(nearest.y - proj.y, nearest.x - proj.x);
          let diff = ta - proj.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          proj.angle += Math.sign(diff) * Math.min(Math.abs(diff), 3 * dt);
          proj.vx = Math.cos(proj.angle) * proj.speed;
          proj.vy = Math.sin(proj.angle) * proj.speed;
        }
      }

      proj.update(dt);
      if (proj.isExpired()) this.releaseProjectile(proj);
      if (proj.sprite) proj.sprite.position.set(proj.x, proj.y);
    }
  }

  private updateGems(dt: number): void {
    while (this.activeGems.length > WORLD.GEM_MAX_ON_SCREEN) this.releaseGem(this.activeGems[0]);

    for (let i = this.activeGems.length - 1; i >= 0; i--) {
      const gem = this.activeGems[i];
      if (!gem.active) continue;
      gem.update(dt);
      if (gem.isExpired()) { this.releaseGem(gem); continue; }
      if (gem.sprite) {
        gem.sprite.position.set(gem.x, gem.y);
        gem.sprite.rotation = Math.sin(gem.sparklePhase) * 0.3;
      }
    }
  }

  private updateDamageNumbers(dt: number): void {
    for (let i = this.activeDamageNumbers.length - 1; i >= 0; i--) {
      const dn = this.activeDamageNumbers[i];
      if (!dn.active) continue;
      dn.update(dt);
      if (dn.isExpired()) { dn.reset(); this.damageNumberPool.release(dn); this.activeDamageNumbers.splice(i, 1); continue; }
      if (dn.sprite) dn.sprite.position.set(dn.x, dn.y);
    }
  }

  private render(alpha: number): void {
    this.renderer.updateCamera(this.camera.x, this.camera.y, this.camera.shakeX, this.camera.shakeY);
    this.world.update(this.camera.left, this.camera.top, this.camera.right, this.camera.bottom);

    // Player visual
    if (this.player.sprite) {
      const rx = this.player.prevX + (this.player.x - this.player.prevX) * alpha;
      const ry = this.player.prevY + (this.player.y - this.player.prevY) * alpha;
      this.player.sprite.position.set(rx, ry);
      this.player.updateSprite();

      const isMoving = this.player.vx !== 0 || this.player.vy !== 0;
      const baseScale = 0.5;
      this.player.sprite.scale.set(isMoving ? baseScale * 1.05 : baseScale);

      if (this.player.isInvincible && !this.player.isDashing) {
        this.player.sprite.visible = Math.floor(performance.now() / 100) % 2 === 0;
      } else {
        this.player.sprite.visible = true;
      }
    }

    // Enemy visuals
    for (const enemy of this.activeEnemies) enemy.updateVisuals(alpha);
  }

  // ── Public spawn methods ──
  spawnEnemy(def: EnemyDef, x: number, y: number, hpScale = 1, dmgScale = 1): void {
    const enemy = this.enemyPool.acquire();
    enemy.init(def, x, y, hpScale, dmgScale);
    this.layers.enemies.addChild(enemy.sprite!);
    this.activeEnemies.push(enemy);

    if (def.isBoss) {
      playSound('boss_warning');
      haptic('heavy');
      this.camera.shake(8, 0.3);
      this.onBossSpawn?.(def.name, enemy.hp, enemy.maxHP);
    }
  }

  releaseEnemy(enemy: Enemy, dropXP = true): void {
    if (dropXP && enemy.xpValue > 0) this.spawnGem(enemy.x, enemy.y, enemy.xpValue);
    enemy.reset();
    this.enemyPool.release(enemy);
    const idx = this.activeEnemies.indexOf(enemy);
    if (idx >= 0) this.activeEnemies.splice(idx, 1);
  }

  spawnProjectile(x: number, y: number, angle: number, speed: number, damage: number, pierce: number, radius: number, isPlayer: boolean, color = 0xffffff, homing = false): void {
    const proj = this.projectilePool.acquire();
    proj.init(x, y, angle, speed, damage, pierce, radius, isPlayer, color, homing);
    this.layers.projectiles.addChild(proj.sprite!);
    this.activeProjectiles.push(proj);
  }

  releaseProjectile(proj: Projectile): void {
    proj.reset();
    this.projectilePool.release(proj);
    const idx = this.activeProjectiles.indexOf(proj);
    if (idx >= 0) this.activeProjectiles.splice(idx, 1);
  }

  spawnGem(x: number, y: number, xpValue: number): void {
    const gem = this.gemPool.acquire();
    gem.init(x, y, xpValue);
    this.layers.gems.addChild(gem.sprite!);
    this.activeGems.push(gem);
  }

  releaseGem(gem: XPGem): void {
    gem.reset();
    this.gemPool.release(gem);
    const idx = this.activeGems.indexOf(gem);
    if (idx >= 0) this.activeGems.splice(idx, 1);
  }

  spawnDamageNumber(x: number, y: number, damage: number, isCrit: boolean): void {
    if (!this.quality.currentPreset.damageNumbersEnabled) return;
    const dn = this.damageNumberPool.acquire();
    dn.init(x, y, damage, isCrit);
    this.layers.damageNumbers.addChild(dn.sprite!);
    this.activeDamageNumbers.push(dn);
  }

  damageEnemy(enemy: Enemy, damage: number, isCrit: boolean, fromX: number, fromY: number): void {
    const killed = enemy.takeDamage(damage);
    enemy.flash();
    const kbDx = enemy.x - fromX;
    const kbDy = enemy.y - fromY;
    const kbDist = Math.sqrt(kbDx * kbDx + kbDy * kbDy) || 1;
    enemy.applyKnockback((kbDx / kbDist) * KNOCKBACK.baseForce, (kbDy / kbDist) * KNOCKBACK.baseForce, KNOCKBACK.duration);
    this.spawnDamageNumber(enemy.x, enemy.y - enemy.radius, damage, isCrit);
    playSound('enemy_hit');

    if (killed) this.onEnemyKilled(enemy);
    else if (enemy.isBoss) this.onBossUpdate?.(enemy.hp);
  }

  private onEnemyKilled(enemy: Enemy): void {
    playSound('enemy_death');
    if (enemy.isBoss) {
      this.camera.shake(6, 0.2);
      playSound('boss_death');
      haptic('heavy');
      this.runState.bossKills++;
      this.onBossDeath?.();
    }
    this.runState.killCount++;
    this.waveManager.onEnemyKilled();
    this.releaseEnemy(enemy, true);
  }

  private handlePlayerHit(damage: number): void {
    if (this.player.isInvincible) return;
    const dead = this.player.applyDamage(damage);
    playSound('player_hit');
    haptic('medium');
    this.camera.shake(3, 0.1);
    if (dead) this.handlePlayerDeath();
  }

  private collectGem(gem: XPGem): void {
    const xp = Math.round(gem.xpValue * this.player.stats.xpMultiplier);
    this.runState.xp += xp;
    playSound('xp_pickup');

    while (this.runState.xp >= this.runState.xpToNext) {
      this.runState.xp -= this.runState.xpToNext;
      this.runState.playerLevel++;
      this.runState.xpToNext = xpForLevel(this.runState.playerLevel);
      this.triggerLevelUp();
    }
    this.releaseGem(gem);
  }

  // Vacuum all gems to player (between waves)
  vacuumGems(): void {
    for (const gem of this.activeGems) {
      if (gem.active) {
        gem.isMagnetized = true;
        gem.magnetSpeed = 800;
      }
    }
  }

  private triggerLevelUp(): void {
    playSound('level_up');
    haptic('light');
    this.slowMotionTimer = 0.4;
    this.slowMotionScale = 0.3;
    const options = this.upgradeManager.generateOptions(this.weapons, this.runState.playerLevel);
    this.onLevelUp?.(options);
  }

  selectUpgrade(upgrade: Upgrade): void {
    playSound('upgrade_select');
    haptic('light');
    this.upgradeManager.applyUpgrade(upgrade, this.player, this.weapons);
    this.isPaused = false;
    this.slowMotionTimer = 0;
    this.slowMotionScale = 1;
  }

  triggerDash(): void {
    if (this.player.startDash()) {
      playSound('dash_swoosh');
      haptic('light');
    }
  }

  private handlePlayerDeath(): void {
    this.isRunning = false;
    haptic('heavy');
    this.camera.shake(8, 0.3);
    this.runState.isActive = false;
    this.syncState();
    this.onPlayerDeath?.();
  }

  pause(): void { this.isPaused = true; }
  resume(): void { this.isPaused = false; this.lastTime = performance.now(); }

  private syncState(): void {
    if (!this.onStateSync) return;
    const boss = this.activeEnemies.find(e => e.isBoss && e.active);
    this.onStateSync({
      runTime: this.runState.timeAlive,
      killCount: this.runState.killCount,
      bossKills: this.runState.bossKills,
      wavesCompleted: this.runState.wavesCompleted,
      currentWave: this.runState.currentWave,
      waveState: this.waveManager.state,
      enemiesRemaining: this.waveManager.enemiesRemaining,
      waveProgress: this.waveManager.waveProgress,
      playerHP: this.player.hp,
      playerMaxHP: this.player.maxHP,
      playerLevel: this.runState.playerLevel,
      xp: this.runState.xp,
      xpToNext: this.runState.xpToNext,
      equippedWeapons: this.weapons.map(w => ({ id: w.id, level: w.level, name: w.name })),
      score: calculateScore(this.runState),
      activeBoss: boss ? { name: boss.typeName, hp: boss.hp, maxHP: boss.maxHP } : null,
      dashCooldownRemaining: this.player.dashCooldown,
      dashCooldownMax: DASH.cooldown,
    });
  }

  destroy(): void {
    this.stopLoop();
    window.removeEventListener('resize', this.handleResize);
    this.joystick.destroy();
    this.input.destroy();
    this.renderer.destroy();
  }
}
