import { Sprite } from 'pixi.js';
import { Entity } from './Entity';
import type { EnemyDef, EnemyAI } from '../types';
import { spriteFactory } from '../sprites/SpriteFactory';

export class Enemy extends Entity {
  typeName = '';
  damage = 0;
  speed = 0;
  xpValue = 0;
  armor = 0;
  color = 0xff2d55;
  ai: EnemyAI = 'chase';
  knockbackResist = 0;
  isBoss = false;
  spawnWeight = 1;
  spriteKey = '';
  displaySize = 24;

  // Knockback
  knockbackVx = 0;
  knockbackVy = 0;
  knockbackTimer = 0;

  // AI state
  aiTimer = 0;
  aiPhase = 0;
  targetX = 0;
  targetY = 0;
  isEnraged = false;
  rangedCooldown = 0;

  // Visual
  flashTimer = 0;
  pulsePhase = 0;
  animFrame = 0;
  animTimer = 0;

  init(def: EnemyDef, x: number, y: number, hpScale = 1, dmgScale = 1): void {
    this.typeName = def.name;
    this.hp = Math.round(def.hp * hpScale);
    this.maxHP = this.hp;
    this.damage = Math.round(def.damage * dmgScale);
    this.speed = def.speed;
    this.xpValue = def.xpValue;
    this.armor = def.armor;
    this.radius = def.radius;
    this.color = def.color;
    this.ai = def.ai;
    this.knockbackResist = def.knockbackResist;
    this.isBoss = def.isBoss ?? false;
    this.spawnWeight = def.spawnWeight;
    this.spriteKey = def.spriteKey;
    this.displaySize = def.displaySize;

    this.x = x; this.y = y;
    this.prevX = x; this.prevY = y;
    this.vx = 0; this.vy = 0;
    this.active = true;

    this.knockbackVx = 0; this.knockbackVy = 0; this.knockbackTimer = 0;
    this.aiTimer = 0; this.aiPhase = 0;
    this.targetX = 0; this.targetY = 0;
    this.isEnraged = false; this.rangedCooldown = 0;
    this.flashTimer = 0; this.pulsePhase = 0;
    this.animFrame = 0; this.animTimer = 0;
  }

  createSprite(): Sprite {
    const tex = spriteFactory.get(`${this.spriteKey}_0`);
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    // drawSize is displaySize * 2 (sprites generated at 2x), so scale = displaySize / drawSize = 0.5
    const drawSize = this.displaySize * 2;
    const scale = this.displaySize / drawSize;
    s.scale.set(scale);
    this.sprite = s;
    return s;
  }

  update(dt: number): void {
    // Knockback handling
    if (this.knockbackTimer > 0) {
      this.knockbackTimer -= dt;
      this.x += this.knockbackVx * dt;
      this.y += this.knockbackVy * dt;
      if (this.knockbackTimer <= 0) {
        this.knockbackVx = 0;
        this.knockbackVy = 0;
      }
    } else {
      super.update(dt);
    }

    // Animation timer
    this.animTimer += dt * 1000;
    if (this.animTimer >= 300) {
      this.animTimer -= 300;
      this.animFrame = (this.animFrame + 1) % 2;
    }

    // Flash timer
    if (this.flashTimer > 0) {
      this.flashTimer -= dt * 1000;
    }

    // Pulse phase
    this.pulsePhase += dt * 3;

    // Ranged cooldown
    if (this.rangedCooldown > 0) {
      this.rangedCooldown -= dt;
    }
  }

  updateVisuals(alpha: number): void {
    if (!this.sprite || !(this.sprite instanceof Sprite)) return;
    const s = this.sprite as Sprite;

    // Interpolated position
    const ix = this.prevX + (this.x - this.prevX) * alpha;
    const iy = this.prevY + (this.y - this.prevY) * alpha;
    s.position.set(ix, iy);

    // Update animation frame texture
    s.texture = spriteFactory.get(`${this.spriteKey}_${this.animFrame}`);

    // Pulse animation (subtle scale oscillation)
    const pulse = 1 + Math.sin(this.pulsePhase) * 0.03;
    const baseScale = this.displaySize / (this.displaySize * 2);
    s.scale.set(baseScale * pulse);

    // Boss rotation
    if (this.isBoss) {
      s.rotation += 0.001;
    }

    // Flash white effect (damage feedback)
    if (this.flashTimer > 0) {
      s.tint = 0xffffff;
    } else {
      s.tint = 0xffffff; // reset to no tint
    }
  }

  applyKnockback(forceX: number, forceY: number, duration: number): void {
    const resist = this.knockbackResist;
    if (resist >= 1) return;
    this.knockbackVx = forceX * (1 - resist);
    this.knockbackVy = forceY * (1 - resist);
    this.knockbackTimer = duration;
  }

  flash(): void {
    this.flashTimer = 100;
  }
}
