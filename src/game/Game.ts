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
import { KNOCKBACK, xpForLevel, calculateScore, WORLD } from '../data/balance';
import { CLASSES } from '../data/classes';
import { isMobileDevice, getPerformanceTier } from '../utils/device';
import { playSound, haptic } from '../utils/sound';
import { createWeapon } from '../weapons/WeaponRegistry';
import type { Weapon } from '../weapons/Weapon';
import type { EnemyDef, Upgrade, QualityTier } from '../types';

const TICK_RATE = 60;
const TICK_MS = 1000 / TICK_RATE;
const SYNC_INTERVAL = 100; // ms

export class Game {
  renderer: PixiRenderer;
  camera: Camera;
  input: InputManager;
  joystick: TouchJoystick;
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

  constructor() {
    this.isMobile = isMobileDevice();
    this.renderer = new PixiRenderer();
    this.camera = new Camera();
    this.input = new InputManager();
    this.joystick = null!; // Set in init
    this.waveManager = new WaveManager();
    this.upgradeManager = new UpgradeManager();
    this.collisionSystem = new CollisionSystem();
    this.runState = new RunState();
    this.player = new Player();

    const startTier = this.isMobile ? getPerformanceTier() : 'high';
    this.quality = new AdaptiveQuality(startTier as QualityTier);

    this.enemyHash = new SpatialHash();
    this.gemHash = new SpatialHash();

    // Object pools
    this.enemyPool = new ObjectPool<Enemy>(
      () => new Enemy(),
      (e) => e.reset(),
      200
    );
    this.projectilePool = new ObjectPool<Projectile>(
      () => new Projectile(),
      (p) => p.reset(),
      100
    );
    this.gemPool = new ObjectPool<XPGem>(
      () => new XPGem(),
      (g) => g.reset(),
      300
    );
    this.damageNumberPool = new ObjectPool<DamageNumber>(
      () => new DamageNumber(),
      (d) => d.reset(),
      50
    );
  }

  async init(container: HTMLElement): Promise<void> {
    await this.renderer.init(container);
    this.layers = this.renderer.layers;

    this.input.init();
    this.joystick = new TouchJoystick(this.layers.joystick, this.isMobile);
    this.joystick.init(this.renderer.app.canvas as HTMLCanvasElement);

    this.world = new World(this.layers.background);

    this.camera.viewportWidth = window.innerWidth;
    this.camera.viewportHeight = window.innerHeight;

    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', () => {
      setTimeout(this.handleResize, 150);
    });
  }

  private handleResize = (): void => {
    this.renderer.resize();
    this.camera.viewportWidth = window.innerWidth;
    this.camera.viewportHeight = window.innerHeight;
    this.joystick.updateBounds(window.innerWidth, window.innerHeight);
  };

  // Callbacks
  setOnStateSync(cb: (state: Record<string, unknown>) => void): void { this.onStateSync = cb; }
  setOnLevelUp(cb: (options: Upgrade[]) => void): void { this.onLevelUp = cb; }
  setOnPlayerDeath(cb: () => void): void { this.onPlayerDeath = cb; }
  setOnBossSpawn(cb: (name: string, hp: number, maxHP: number) => void): void { this.onBossSpawn = cb; }
  setOnBossUpdate(cb: (hp: number) => void): void { this.onBossUpdate = cb; }
  setOnBossDeath(cb: () => void): void { this.onBossDeath = cb; }

  startRun(classId: string): void {
    const classDef = CLASSES.find(c => c.id === classId);
    if (!classDef) return;

    // Reset everything
    this.cleanupRun();

    this.runState.start(classId);
    this.player.init(classDef);
    this.layers.player.addChild(this.player.sprite!);

    // Starting weapon
    const weapon = createWeapon(classDef.startingWeapon);
    this.weapons.push(weapon);

    this.waveManager.reset();
    this.upgradeManager.reset();

    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    this.accumulator = 0;
    this.syncTimer = 0;

    this.startLoop();
  }

  private cleanupRun(): void {
    // Release all entities
    for (const e of this.activeEnemies) {
      e.reset();
      this.enemyPool.release(e);
    }
    this.activeEnemies = [];

    for (const p of this.activeProjectiles) {
      p.reset();
      this.projectilePool.release(p);
    }
    this.activeProjectiles = [];

    for (const g of this.activeGems) {
      g.reset();
      this.gemPool.release(g);
    }
    this.activeGems = [];

    for (const d of this.activeDamageNumbers) {
      d.reset();
      this.damageNumberPool.release(d);
    }
    this.activeDamageNumbers = [];

    // Reset weapons
    for (const w of this.weapons) {
      w.reset();
    }
    this.weapons = [];

    // Clear layers
    this.layers.enemies.removeChildren();
    this.layers.projectiles.removeChildren();
    this.layers.gems.removeChildren();
    this.layers.effects.removeChildren();
    this.layers.damageNumbers.removeChildren();
    this.layers.player.removeChildren();
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
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = 0;
    }
  }

  private frame(currentTime: number): void {
    let delta = currentTime - this.lastTime;
    this.lastTime = currentTime;

    // Cap to prevent spiral of death
    if (delta > 500) delta = TICK_MS;

    this.quality.recordFrame();

    if (this.isRunning && !this.isPaused) {
      // Apply slow motion
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
    // Input
    this.input.update();
    this.joystick.update(dt);
    this.input.setJoystickInput(this.joystick.inputX, this.joystick.inputY);

    // Pause check
    if (this.input.isEscapePressed()) {
      this.input.consumeEscape();
      this.pause();
      return;
    }

    // Player movement
    this.player.vx = this.input.moveX * this.player.stats.speed;
    this.player.vy = this.input.moveY * this.player.stats.speed;
    this.player.update(dt);

    // Camera
    this.camera.follow(this.player.x, this.player.y);
    this.camera.update(dt);

    // Wave spawning
    this.waveManager.update(dt, this);
    this.runState.timeAlive += dt;

    // Update enemies + AI
    this.updateEnemies(dt);

    // Update weapons
    for (const weapon of this.weapons) {
      weapon.update(dt, this.player, this.activeEnemies, this);
    }

    // Update projectiles
    this.updateProjectiles(dt);

    // Spatial hash rebuild
    this.enemyHash.clear();
    for (const e of this.activeEnemies) {
      if (e.active) this.enemyHash.insert(e);
    }

    this.gemHash.clear();
    for (const g of this.activeGems) {
      if (g.active) this.gemHash.insert(g);
    }

    // Collisions
    this.collisionSystem.checkPlayerEnemyCollisions(
      this.player, this.enemyHash,
      (damage) => this.handlePlayerHit(damage)
    );

    this.collisionSystem.checkProjectileEnemyCollisions(
      this.activeProjectiles, this.enemyHash, this.player,
      (enemy, damage, isCrit, fromX, fromY) => this.damageEnemy(enemy, damage, isCrit, fromX, fromY),
      (proj) => this.releaseProjectile(proj)
    );

    this.collisionSystem.checkEnemyProjectilePlayerCollisions(
      this.activeProjectiles, this.player,
      (damage) => this.handlePlayerHit(damage),
      (proj) => this.releaseProjectile(proj)
    );

    this.collisionSystem.checkGemPickup(
      this.player, this.activeGems,
      (gem) => this.collectGem(gem)
    );

    // Update gems
    this.updateGems(dt);

    // Update damage numbers
    this.updateDamageNumbers(dt);

    // Quality system
    this.quality.update(dt);

    // Sync state to React
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

      // AI
      this.updateEnemyAI(enemy, dt);
      enemy.update(dt);
    }
  }

  private updateEnemyAI(enemy: Enemy, dt: number): void {
    if (enemy.knockbackTimer > 0) return;

    const px = this.player.x;
    const py = this.player.y;
    const dx = px - enemy.x;
    const dy = py - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / dist;
    const ny = dy / dist;

    switch (enemy.ai) {
      case 'chase':
        enemy.vx = nx * enemy.speed;
        enemy.vy = ny * enemy.speed;
        break;

      case 'swarm': {
        // Flocking with separation
        let sepX = 0, sepY = 0;
        for (const other of this.activeEnemies) {
          if (other === enemy || other.ai !== 'swarm' || !other.active) continue;
          const sdx = enemy.x - other.x;
          const sdy = enemy.y - other.y;
          const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
          if (sdist < 30 && sdist > 0) {
            sepX += sdx / sdist;
            sepY += sdy / sdist;
          }
        }
        const dirX = nx * 0.85 + sepX * 0.15;
        const dirY = ny * 0.85 + sepY * 0.15;
        const dirLen = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
        enemy.vx = (dirX / dirLen) * enemy.speed;
        enemy.vy = (dirY / dirLen) * enemy.speed;
        break;
      }

      case 'ranged':
        enemy.rangedCooldown -= dt;
        if (dist > 200) {
          enemy.vx = nx * enemy.speed;
          enemy.vy = ny * enemy.speed;
        } else if (dist < 120) {
          // Flee
          enemy.vx = -nx * enemy.speed * 1.2;
          enemy.vy = -ny * enemy.speed * 1.2;
        } else {
          enemy.vx = 0;
          enemy.vy = 0;
          // Shoot
          if (enemy.rangedCooldown <= 0) {
            enemy.rangedCooldown = 2;
            const angle = Math.atan2(dy, dx);
            this.spawnProjectile(enemy.x, enemy.y, angle + Math.PI, 250, 10, 0, 6, false, 0x22d3ee);
          }
        }
        break;

      case 'boss_charge': {
        enemy.aiTimer -= dt;
        if (enemy.aiPhase === 0) {
          // Chase
          enemy.vx = nx * enemy.speed;
          enemy.vy = ny * enemy.speed;
          if (enemy.aiTimer <= 0) {
            enemy.aiPhase = 1;
            enemy.aiTimer = 0.8;
            enemy.targetX = px;
            enemy.targetY = py;
          }
        } else if (enemy.aiPhase === 1) {
          // Telegraph (flash)
          enemy.vx = 0;
          enemy.vy = 0;
          enemy.flashTimer = dt * 2;
          if (enemy.aiTimer <= 0) {
            enemy.aiPhase = 2;
            enemy.aiTimer = 1;
            const cdx = enemy.targetX - enemy.x;
            const cdy = enemy.targetY - enemy.y;
            const cdist = Math.sqrt(cdx * cdx + cdy * cdy) || 1;
            enemy.vx = (cdx / cdist) * 500;
            enemy.vy = (cdy / cdist) * 500;
          }
        } else if (enemy.aiPhase === 2) {
          // Charging
          if (enemy.aiTimer <= 0) {
            enemy.aiPhase = 3;
            enemy.aiTimer = 2;
            enemy.vx = 0;
            enemy.vy = 0;
          }
        } else {
          // Recovery
          enemy.vx = 0;
          enemy.vy = 0;
          if (enemy.aiTimer <= 0) {
            enemy.aiPhase = 0;
            enemy.aiTimer = 4;
          }
        }
        break;
      }

      case 'boss_nova': {
        enemy.aiTimer -= dt;
        if (enemy.aiPhase === 0) {
          // Chase
          const chaseSpeed = enemy.isEnraged ? 100 : enemy.speed;
          enemy.vx = nx * chaseSpeed;
          enemy.vy = ny * chaseSpeed;
          if (enemy.aiTimer <= 0) {
            enemy.aiPhase = 1;
            enemy.aiTimer = 0.5;
          }
        } else if (enemy.aiPhase === 1) {
          // Telegraph + nova
          enemy.vx = 0;
          enemy.vy = 0;
          if (enemy.aiTimer <= 0) {
            // Fire radial projectiles
            const count = enemy.isEnraged ? 24 : 12;
            const angleStep = (Math.PI * 2) / count;
            for (let i = 0; i < count; i++) {
              const a = angleStep * i;
              this.spawnProjectile(enemy.x, enemy.y, a, 180, 15, 0, 6, false, 0xeab308);
            }
            enemy.aiPhase = 2;
            enemy.aiTimer = 1;
          }
        } else {
          // Pause
          enemy.vx = 0;
          enemy.vy = 0;
          if (enemy.aiTimer <= 0) {
            enemy.aiPhase = 0;
            enemy.aiTimer = 5;
          }
        }
        break;
      }
    }
  }

  private updateProjectiles(dt: number): void {
    for (let i = this.activeProjectiles.length - 1; i >= 0; i--) {
      const proj = this.activeProjectiles[i];
      if (!proj.active) continue;

      // Homing
      if (proj.homing && proj.isPlayerProjectile) {
        let nearest: Enemy | null = null;
        let nearestDist = 300;
        for (const enemy of this.activeEnemies) {
          if (!enemy.active) continue;
          const dx = enemy.x - proj.x;
          const dy = enemy.y - proj.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < nearestDist) {
            nearestDist = d;
            nearest = enemy;
          }
        }
        if (nearest) {
          const targetAngle = Math.atan2(nearest.y - proj.y, nearest.x - proj.x);
          let diff = targetAngle - proj.angle;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          proj.angle += Math.sign(diff) * Math.min(Math.abs(diff), 3 * dt);
          proj.vx = Math.cos(proj.angle) * proj.speed;
          proj.vy = Math.sin(proj.angle) * proj.speed;
        }
      }

      proj.update(dt);

      if (proj.isExpired()) {
        this.releaseProjectile(proj);
      }

      // Update visual position
      if (proj.sprite) {
        proj.sprite.position.set(proj.x, proj.y);
      }
    }
  }

  private updateGems(dt: number): void {
    // Cap gems
    while (this.activeGems.length > WORLD.GEM_MAX_ON_SCREEN) {
      const oldest = this.activeGems[0];
      this.releaseGem(oldest);
    }

    for (let i = this.activeGems.length - 1; i >= 0; i--) {
      const gem = this.activeGems[i];
      if (!gem.active) continue;

      gem.update(dt);

      if (gem.isExpired()) {
        this.releaseGem(gem);
        continue;
      }

      if (gem.sprite) {
        gem.sprite.position.set(gem.x, gem.y);
        // Sparkle rotation
        gem.sprite.rotation = Math.sin(gem.sparklePhase) * 0.3;
      }
    }
  }

  private updateDamageNumbers(dt: number): void {
    for (let i = this.activeDamageNumbers.length - 1; i >= 0; i--) {
      const dmgNum = this.activeDamageNumbers[i];
      if (!dmgNum.active) continue;

      dmgNum.update(dt);

      if (dmgNum.isExpired()) {
        dmgNum.reset();
        this.damageNumberPool.release(dmgNum);
        this.activeDamageNumbers.splice(i, 1);
        continue;
      }

      if (dmgNum.sprite) {
        dmgNum.sprite.position.set(dmgNum.x, dmgNum.y);
      }
    }
  }

  private render(alpha: number): void {
    // Update camera transform
    this.renderer.updateCamera(this.camera.x, this.camera.y, this.camera.shakeX, this.camera.shakeY);

    // Draw world grid
    this.world.render(this.camera);

    // Update player visual
    if (this.player.sprite) {
      const rx = this.player.prevX + (this.player.x - this.player.prevX) * alpha;
      const ry = this.player.prevY + (this.player.y - this.player.prevY) * alpha;
      this.player.sprite.position.set(rx, ry);

      // Moving scale
      const isMoving = this.player.vx !== 0 || this.player.vy !== 0;
      this.player.sprite.scale.set(isMoving ? 1.1 : 1.0);

      // i-frame flash
      if (this.player.isInvincible) {
        this.player.sprite.visible = Math.floor(performance.now() / 100) % 2 === 0;
      } else {
        this.player.sprite.visible = true;
      }
    }

    // Update enemy visuals
    for (const enemy of this.activeEnemies) {
      enemy.updateVisuals(alpha);
    }
  }

  // Public methods for spawning
  spawnEnemy(def: EnemyDef, x: number, y: number, hpScale: number = 1, dmgScale: number = 1): void {
    const enemy = this.enemyPool.acquire();
    enemy.init(def, x, y, hpScale, dmgScale);
    this.layers.enemies.addChild(enemy.sprite!);
    this.activeEnemies.push(enemy);

    if (def.isBoss) {
      playSound('boss_warning');
      haptic('heavy');
      this.onBossSpawn?.(def.name, enemy.hp, enemy.maxHP);
    }
  }

  releaseEnemy(enemy: Enemy, dropXP: boolean = true): void {
    if (dropXP && enemy.xpValue > 0) {
      this.spawnGem(enemy.x, enemy.y, enemy.xpValue);
    }
    enemy.reset();
    this.enemyPool.release(enemy);
    const idx = this.activeEnemies.indexOf(enemy);
    if (idx >= 0) this.activeEnemies.splice(idx, 1);
  }

  spawnProjectile(
    x: number, y: number, angle: number,
    speed: number, damage: number, pierce: number,
    radius: number, isPlayer: boolean, color: number = 0xffffff,
    homing: boolean = false
  ): void {
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
    if (!this.quality.preset.damageNumbersEnabled) return;

    const dmgNum = this.damageNumberPool.acquire();
    dmgNum.init(x, y, damage, isCrit);
    this.layers.damageNumbers.addChild(dmgNum.sprite!);
    this.activeDamageNumbers.push(dmgNum);
  }

  damageEnemy(enemy: Enemy, damage: number, isCrit: boolean, fromX: number, fromY: number): void {
    const killed = enemy.takeDamage(damage);
    enemy.flash();

    // Knockback
    enemy.applyKnockback(fromX, fromY, KNOCKBACK.baseForce, KNOCKBACK.duration);

    // Damage number
    this.spawnDamageNumber(enemy.x, enemy.y - enemy.radius, damage, isCrit);

    playSound('enemy_hit');

    if (killed) {
      this.onEnemyKilled(enemy);
    } else if (enemy.isBoss) {
      this.onBossUpdate?.(enemy.hp);
    }
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
    this.releaseEnemy(enemy, true);
  }

  private handlePlayerHit(damage: number): void {
    const actualDamage = this.player.applyDamage(damage);
    if (actualDamage === 0) return;

    playSound('player_hit');
    haptic('medium');
    this.camera.shake(3, 0.1);

    if (this.player.isDead()) {
      this.handlePlayerDeath();
    }
  }

  private collectGem(gem: XPGem): void {
    const xp = Math.round(gem.xpValue * this.player.stats.xpMultiplier);
    this.runState.xp += xp;
    playSound('xp_pickup');

    // Check level up
    while (this.runState.xp >= this.runState.xpToNext) {
      this.runState.xp -= this.runState.xpToNext;
      this.runState.playerLevel++;
      this.runState.xpToNext = xpForLevel(this.runState.playerLevel);
      this.triggerLevelUp();
    }

    this.releaseGem(gem);
  }

  private triggerLevelUp(): void {
    playSound('level_up');
    haptic('light');

    // Slow motion effect
    this.slowMotionTimer = 0.4;
    this.slowMotionScale = 0.3;

    // Generate upgrade options
    const options = this.upgradeManager.generateOptions(this.weapons, this.runState.playerLevel);
    this.onLevelUp?.(options);
  }

  selectUpgrade(upgrade: Upgrade): void {
    playSound('upgrade_select');
    haptic('light');

    const newWeapon = this.upgradeManager.applyUpgrade(upgrade, this.player, this.weapons);
    if (newWeapon) {
      this.weapons.push(newWeapon);
    }

    this.isPaused = false;
    this.slowMotionTimer = 0;
    this.slowMotionScale = 1;
  }

  private handlePlayerDeath(): void {
    this.isRunning = false;
    haptic('heavy');
    this.camera.shake(8, 0.3);

    this.runState.isActive = false;

    // Final sync
    this.syncState();
    this.onPlayerDeath?.();
  }

  pause(): void {
    this.isPaused = true;
  }

  resume(): void {
    this.isPaused = false;
    this.lastTime = performance.now();
  }

  private syncState(): void {
    if (!this.onStateSync) return;

    const boss = this.activeEnemies.find(e => e.isBoss && e.active);

    this.onStateSync({
      runTime: this.runState.timeAlive,
      killCount: this.runState.killCount,
      bossKills: this.runState.bossKills,
      playerHP: this.player.hp,
      playerMaxHP: this.player.maxHP,
      playerLevel: this.runState.playerLevel,
      xp: this.runState.xp,
      xpToNext: this.runState.xpToNext,
      equippedWeapons: this.weapons.map(w => ({ id: w.id, level: w.level, name: w.name })),
      score: calculateScore(this.runState),
      activeBoss: boss ? { name: boss.typeName, hp: boss.hp, maxHP: boss.maxHP } : null,
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
