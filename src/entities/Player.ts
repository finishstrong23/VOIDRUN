import { Sprite } from 'pixi.js';
import { Entity } from './Entity';
import type { PlayerStats, ClassDef } from '../types';
import { PLAYER_BASE, DASH } from '../data/balance';
import { spriteFactory } from '../sprites/SpriteFactory';

export class Player extends Entity {
  facingAngle = 0;
  stats: PlayerStats = { ...PLAYER_BASE };
  iFrameTimer = 0;
  isInvincible = false;
  classColor = 0x00e5ff;
  classId = 'voidwalker';

  // Dash state
  isDashing = false;
  dashTimer = 0;
  dashCooldown = 0;
  dashDirection = { x: 0, y: 0 };

  // Animation state
  animFrame = 0;
  animTimer = 0;
  isMoving = false;

  init(classDef: ClassDef): void {
    this.stats = { ...PLAYER_BASE };
    const bonuses = classDef.bonusStats;
    for (const key of Object.keys(bonuses) as (keyof PlayerStats)[]) {
      (this.stats as any)[key] = bonuses[key] as number;
    }
    this.classId = classDef.id;
    this.classColor = classDef.color;
    this.hp = this.stats.maxHP;
    this.maxHP = this.stats.maxHP;
    this.radius = this.stats.hitboxRadius;
    this.active = true;

    this.facingAngle = 0;
    this.iFrameTimer = 0;
    this.isInvincible = false;
    this.isDashing = false;
    this.dashTimer = 0;
    this.dashCooldown = 0;
    this.animFrame = 0;
    this.animTimer = 0;
    this.isMoving = false;
    this.vx = 0;
    this.vy = 0;

    // Create or recreate sprite
    if (this.sprite) this.sprite.removeFromParent();
    this.createSprite();
  }

  createSprite(): Sprite {
    const tex = spriteFactory.get(`player_${this.classId}_idle_0`);
    const s = new Sprite(tex);
    s.anchor.set(0.5);
    s.scale.set(0.5); // sprites drawn at 2x
    this.sprite = s;
    return s;
  }

  update(dt: number): void {
    super.update(dt);

    // Facing angle from velocity
    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    this.isMoving = speed > 10;
    if (this.isMoving) {
      this.facingAngle = Math.atan2(this.vy, this.vx);
    }

    // I-frames
    if (this.iFrameTimer > 0) {
      this.iFrameTimer -= dt * 1000;
      if (this.iFrameTimer <= 0) {
        this.iFrameTimer = 0;
        this.isInvincible = false;
      }
    }

    // Dash
    if (this.dashCooldown > 0) {
      this.dashCooldown -= dt;
    }
    if (this.isDashing) {
      this.dashTimer -= dt;
      const dashSpeed = DASH.distance / DASH.duration;
      this.x += this.dashDirection.x * dashSpeed * dt;
      this.y += this.dashDirection.y * dashSpeed * dt;
      if (DASH.invincible) this.isInvincible = true;
      if (this.dashTimer <= 0) {
        this.isDashing = false;
        if (!this.iFrameTimer) this.isInvincible = false;
      }
    }

    // Animation timer
    this.animTimer += dt * 1000;
    const frameInterval = this.isMoving ? 150 : 500;
    if (this.animTimer >= frameInterval) {
      this.animTimer -= frameInterval;
      this.animFrame = (this.animFrame + 1) % 2;
    }
  }

  updateSprite(): void {
    if (!this.sprite || !(this.sprite instanceof Sprite)) return;
    const s = this.sprite as Sprite;

    // Determine texture key
    let texKey: string;
    if (this.iFrameTimer > 0 && Math.floor(this.iFrameTimer / 60) % 2 === 0) {
      texKey = `player_${this.classId}_hurt`;
    } else if (this.isMoving) {
      texKey = `player_${this.classId}_walk_${this.animFrame}`;
    } else {
      texKey = `player_${this.classId}_idle_${this.animFrame}`;
    }

    s.texture = spriteFactory.get(texKey);

    // Flip sprite for left-facing
    const facingLeft = Math.abs(this.facingAngle) > Math.PI * 0.5;
    s.scale.x = facingLeft ? -0.5 : 0.5;

    s.position.set(this.x, this.y);
  }

  applyDamage(amount: number): boolean {
    if (this.isInvincible) return false;
    const reduced = Math.max(1, amount - this.stats.armor);
    const dead = this.takeDamage(reduced);
    // Trigger i-frames
    this.iFrameTimer = this.stats.iFrameDuration;
    this.isInvincible = true;
    return dead;
  }

  startDash(): boolean {
    if (this.dashCooldown > 0 || this.isDashing) return false;
    this.isDashing = true;
    this.dashTimer = DASH.duration;
    this.dashCooldown = DASH.cooldown;
    // Dash in facing direction
    this.dashDirection.x = Math.cos(this.facingAngle);
    this.dashDirection.y = Math.sin(this.facingAngle);
    return true;
  }

  heal(amount: number): void {
    this.hp = Math.min(this.maxHP, this.hp + amount);
  }
}
